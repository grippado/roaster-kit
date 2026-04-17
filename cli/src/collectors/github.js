// GitHub data collector. Public REST API, unauth by default, GITHUB_TOKEN optional.

const GH = 'https://api.github.com';

function headers() {
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'roaster-kit-cli',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function gh(path) {
  const res = await fetch(`${GH}${path}`, { headers: headers() });
  if (res.status === 404) throw new Error(`GitHub user not found (404).`);
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      throw new Error(
        `GitHub rate limit hit. Set GITHUB_TOKEN env var for 5000/hr or wait an hour.`
      );
    }
  }
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function collectGitHub(username) {
  const profile = await gh(`/users/${username}`);

  // Public repos, up to 100, sorted by most recent activity
  const repos = await gh(
    `/users/${username}/repos?per_page=100&sort=updated&type=owner`
  );

  // Public events (last 90 events, covers ~last few weeks for active users)
  let events = [];
  try {
    events = await gh(`/users/${username}/events/public?per_page=100`);
  } catch {
    // Events endpoint sometimes 404s or is empty — non-fatal
    events = [];
  }

  return distill(profile, repos, events);
}

function distill(profile, repos, events) {
  const now = Date.now();
  const yearMs = 365 * 24 * 60 * 60 * 1000;

  const nonFork = repos.filter((r) => !r.fork);
  const forks = repos.filter((r) => r.fork);

  // Language breakdown (by repo size, non-fork only)
  const langTotals = {};
  let totalSize = 0;
  for (const r of nonFork) {
    if (r.language && r.size) {
      langTotals[r.language] = (langTotals[r.language] || 0) + r.size;
      totalSize += r.size;
    }
  }
  const languageBreakdown = Object.entries(langTotals)
    .map(([language, size]) => ({
      language,
      percent: totalSize > 0 ? Math.round((size / totalSize) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);

  const reposWithNoDescription = nonFork.filter((r) => !r.description).length;
  const archivedRepos = nonFork.filter((r) => r.archived).length;
  const reposUntouchedOver2y = nonFork.filter(
    (r) => now - new Date(r.pushed_at).getTime() > 2 * yearMs
  ).length;

  // Commit events analysis
  const pushes = events.filter((e) => e.type === 'PushEvent');
  let nightOwlCount = 0;
  let weekendCount = 0;
  const hourHist = new Array(24).fill(0);
  const dowHist = new Array(7).fill(0);
  const commitMessages = [];

  for (const e of pushes) {
    const d = new Date(e.created_at);
    const h = d.getUTCHours();
    const dow = d.getUTCDay();
    hourHist[h]++;
    dowHist[dow]++;
    if (h >= 22 || h < 4) nightOwlCount++;
    if (dow === 0 || dow === 6) weekendCount++;
    for (const c of e.payload?.commits || []) {
      if (commitMessages.length < 20 && c.message) {
        commitMessages.push(c.message.split('\n')[0].slice(0, 80));
      }
    }
  }

  const mostActiveHour =
    pushes.length > 0 ? hourHist.indexOf(Math.max(...hourHist)) : null;
  const mostActiveDayOfWeek =
    pushes.length > 0 ? dowHist.indexOf(Math.max(...dowHist)) : null;

  // Tells
  const tells = [];

  // --- naming tells ---
  const genericNames = nonFork.filter((r) =>
    /^(test|test\d+|untitled|playground|new-?project|project\d*|app\d*|asdf)$/i.test(
      r.name
    )
  );
  if (genericNames.length >= 1) {
    tells.push({
      category: 'naming',
      stat: `${genericNames.length} repo${genericNames.length > 1 ? 's' : ''} named ${genericNames
        .slice(0, 3)
        .map((r) => `\`${r.name}\``)
        .join(', ')}`,
      description: 'Generic placeholder repo names that never got renamed.',
      severity: 'spicy',
    });
  }

  const dotfilesVariants = nonFork.filter((r) =>
    /^dotfiles(-?\w+)?$/i.test(r.name)
  );
  if (dotfilesVariants.length >= 2) {
    tells.push({
      category: 'naming',
      stat: `${dotfilesVariants.length} dotfiles repos: ${dotfilesVariants
        .map((r) => `\`${r.name}\``)
        .join(', ')}`,
      description: 'Multiple dotfiles repos suggesting restart-instead-of-refactor.',
      severity: 'spicy',
    });
  }

  const hypeTopics = nonFork.filter((r) =>
    /^(super|awesome|cool|amazing|ultimate)-/i.test(r.name)
  );
  if (hypeTopics.length) {
    tells.push({
      category: 'naming',
      stat: `${hypeTopics.length} repo${hypeTopics.length > 1 ? 's' : ''} with hype-adjective names (e.g. \`${hypeTopics[0].name}\`)`,
      description: 'Names that over-promise.',
      severity: 'spicy',
    });
  }

  // --- portfolio tells ---
  if (
    nonFork.length >= 5 &&
    (reposWithNoDescription / nonFork.length >= 0.5 ||
      (nonFork.length >= 8 && reposWithNoDescription >= 4))
  ) {
    tells.push({
      category: 'readme',
      stat: `${reposWithNoDescription} of ${nonFork.length} original repos have no description`,
      description: 'Many repos ship without descriptive field.',
      severity: 'spicy',
    });
  }

  if (reposUntouchedOver2y >= 5) {
    tells.push({
      category: 'abandonment',
      stat: `${reposUntouchedOver2y} repos with no commits in 2+ years`,
      description: 'Widespread abandonment.',
      severity: 'spicy',
    });
  }

  if (forks.length > nonFork.length && repos.length > 5) {
    tells.push({
      category: 'abandonment',
      stat: `${forks.length} forks vs ${nonFork.length} original repos`,
      description: 'More forks than original work.',
      severity: 'spicy',
    });
  }

  // High fork ratio (even when not the majority)
  const forkRatio = repos.length > 0 ? forks.length / repos.length : 0;
  if (forkRatio >= 0.4 && repos.length >= 10) {
    const pct = Math.round(forkRatio * 100);
    tells.push({
      category: 'abandonment',
      stat: `${forks.length} of ${repos.length} repos are forks (${pct}%)`,
      description: 'High fork-to-original ratio.',
      severity: 'spicy',
    });
  }

  // Old account with disproportionately few original repos
  const accountAgeYearsCalc =
    (now - new Date(profile.created_at).getTime()) / yearMs;
  if (accountAgeYearsCalc >= 8 && nonFork.length > 0 && nonFork.length <= 12) {
    const monthsPerRepo = Math.round((accountAgeYearsCalc * 12) / nonFork.length);
    tells.push({
      category: 'abandonment',
      stat: `${Math.round(accountAgeYearsCalc)}-year-old account, ${nonFork.length} original repos — one every ${monthsPerRepo} months`,
      description: 'Low output relative to account age.',
      severity: 'spicy',
    });
  }

  // Publicly archived originals — gave up with a badge on it
  if (archivedRepos >= 2) {
    tells.push({
      category: 'abandonment',
      stat: `${archivedRepos} publicly archived repos`,
      description: 'Abandoned in public, with a badge on them.',
      severity: 'spicy',
    });
  }

  // --- language tells ---
  if (languageBreakdown.length > 0 && languageBreakdown[0].percent >= 85) {
    const stated = (profile.bio || '').toLowerCase();
    const claimsPolyglot = /polyglot|fullstack|full-stack|fluent|multi-lang/.test(
      stated
    );
    if (claimsPolyglot) {
      tells.push({
        category: 'ambition-gap',
        stat: `Bio says "polyglot" but ${languageBreakdown[0].percent}% of shipped code is ${languageBreakdown[0].language}`,
        description: 'Self-advertised breadth vs demonstrated depth mismatch.',
        severity: 'spicy',
      });
    }
  }

  // --- bio tells ---
  if (profile.bio) {
    const emojiCount = (profile.bio.match(/\p{Extended_Pictographic}/gu) || [])
      .length;
    if (emojiCount >= 4) {
      tells.push({
        category: 'bio',
        stat: `Bio contains ${emojiCount} emoji`,
        description: 'Emoji density in profile bio.',
        severity: 'mild',
      });
    }
    const buzzwords = (profile.bio.match(
      /\b(ninja|rockstar|guru|10x|passionate|wizard|evangelist|thought.?leader)\b/gi
    ) || []).length;
    if (buzzwords > 0) {
      tells.push({
        category: 'bio',
        stat: `Bio uses ${buzzwords} buzzword${buzzwords > 1 ? 's' : ''}: "${profile.bio.slice(0, 80)}"`,
        description: 'Buzzword-heavy self-description.',
        severity: 'spicy',
      });
    }

    // Multi-title bio ("X ~ Y ~ Z" or "X | Y | Z" or "X / Y / Z")
    const titleSeparators = (profile.bio.match(/[~|/]/g) || []).length;
    if (titleSeparators >= 2) {
      tells.push({
        category: 'bio',
        stat: `Bio lists multiple job titles: "${profile.bio.slice(0, 100)}"`,
        description: 'Bio reads like a stack of alternative job titles.',
        severity: 'spicy',
      });
    }
  }

  if (profile.hireable) {
    const lastPush =
      nonFork[0] && nonFork[0].pushed_at
        ? new Date(nonFork[0].pushed_at)
        : null;
    if (lastPush && now - lastPush.getTime() > 180 * 24 * 60 * 60 * 1000) {
      tells.push({
        category: 'bio',
        stat: `"Available for hire" is ON but last push was ${Math.round(
          (now - lastPush.getTime()) / (30 * 24 * 60 * 60 * 1000)
        )} months ago`,
        description: 'Stale availability flag.',
        severity: 'spicy',
      });
    }
  }

  // --- cadence tells ---
  if (pushes.length >= 5) {
    const nightOwlPct = Math.round((nightOwlCount / pushes.length) * 100);
    if (nightOwlPct >= 50) {
      tells.push({
        category: 'cadence',
        stat: `${nightOwlPct}% of recent commits happen between 10pm and 4am`,
        description: 'Night-owl commit schedule.',
        severity: 'spicy',
      });
    }
    const weekendPct = Math.round((weekendCount / pushes.length) * 100);
    if (weekendPct >= 60) {
      tells.push({
        category: 'cadence',
        stat: `${weekendPct}% of recent commits are on weekends`,
        description: 'Weekend-heavy commit pattern.',
        severity: 'spicy',
      });
    }
  }

  // --- commit message tells ---
  const lazyMessages = commitMessages.filter((m) =>
    /^(wip|asdf|fix|\.|update|updates|stuff|x|tmp|temp)$/i.test(m.trim())
  );
  if (lazyMessages.length >= 2) {
    tells.push({
      category: 'commit-messages',
      stat: `${lazyMessages.length} recent commit messages are: ${lazyMessages
        .slice(0, 5)
        .map((m) => `"${m}"`)
        .join(', ')}`,
      description: 'Lazy commit message pattern.',
      severity: 'spicy',
    });
  }

  // Soft-roast detection
  const accountAgeYears =
    (now - new Date(profile.created_at).getTime()) / yearMs;
  const tutorialPattern = nonFork.filter((r) =>
    /^(todo|weather|calculator|portfolio|pomodoro|quiz|tic-?tac-?toe|snake|blog)(-?app|-?site|-?v\d+)?$/i.test(
      r.name
    )
  ).length;

  const softRoastFlag =
    nonFork.length < 3 ||
    (accountAgeYears < 1 && repos.length < 10) ||
    /\b(learning|aprendendo|student|bootcamp|week \d+)\b/i.test(
      profile.bio || ''
    ) ||
    (tutorialPattern > 0 && tutorialPattern === nonFork.length);

  return {
    target: {
      username: profile.login,
      displayName: profile.name || null,
      bio: profile.bio || null,
      company: profile.company || null,
      location: profile.location || null,
      blog: profile.blog || null,
      accountAgeYears: Math.round(accountAgeYears * 10) / 10,
      hireable: profile.hireable ?? null,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
    },
    portfolio: {
      totalRepos: repos.length,
      nonForkRepos: nonFork.length,
      forkRepos: forks.length,
      reposWithNoDescription,
      archivedRepos,
      reposUntouchedOver2y,
      languageBreakdown,
    },
    tells,
    commitCadence: {
      mostActiveHour,
      mostActiveDayOfWeek,
      nightOwlPercent:
        pushes.length > 0
          ? Math.round((nightOwlCount / pushes.length) * 100)
          : null,
      weekendPercent:
        pushes.length > 0
          ? Math.round((weekendCount / pushes.length) * 100)
          : null,
      recentCommitMessages: commitMessages,
    },
    meta: {
      collectedAt: new Date().toISOString(),
      sources: ['github'],
      softRoastFlag,
    },
  };
}
