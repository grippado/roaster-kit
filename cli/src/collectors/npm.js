// npm collector. Public registry only.

async function jsonGet(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'roaster-kit-cli' },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function collectNpm(username) {
  const search = await jsonGet(
    `https://registry.npmjs.org/-/v1/search?text=maintainer:${encodeURIComponent(
      username
    )}&size=50`
  );
  const packages = [];
  if (!search?.objects) return packages;

  for (const obj of search.objects.slice(0, 20)) {
    const name = obj.package.name;
    const detail = await jsonGet(
      `https://registry.npmjs.org/${encodeURIComponent(name).replace('%2F', '/')}`
    );
    if (!detail) continue;

    const downloads = await jsonGet(
      `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name).replace('%2F', '/')}`
    );

    const latestVersion = detail['dist-tags']?.latest || 'unknown';
    const latest = detail.versions?.[latestVersion] || {};
    const readme = detail.readme || latest.readme || '';

    packages.push({
      name,
      version: latestVersion,
      downloadsLastMonth: downloads?.downloads ?? null,
      created: detail.time?.created || null,
      lastPublished: detail.time?.[latestVersion] || null,
      dependencyCount: Object.keys(latest.dependencies || {}).length,
      description: latest.description || detail.description || null,
      readmeLength: readme.length,
      readmeFirstLine: readme.split('\n').find((l) => l.trim())?.slice(0, 120) || null,
      licenseDeclared: Boolean(latest.license),
      keywords: latest.keywords || [],
    });
  }

  return packages;
}

export function npmTells(packages) {
  const tells = [];
  if (packages.length === 0) return tells;

  // Ghost packages: very low downloads AND old version
  const ghost = packages.filter(
    (p) =>
      p.downloadsLastMonth !== null &&
      p.downloadsLastMonth < 50 &&
      p.version.startsWith('0.')
  );
  if (ghost.length) {
    tells.push({
      category: 'ambition-gap',
      stat: `${ghost.length} published npm package${ghost.length > 1 ? 's' : ''} at v0.x with <50 downloads/month (e.g. \`${ghost[0].name}\`)`,
      description: 'Published-and-forgot npm packages.',
      severity: 'spicy',
    });
  }

  // Hype words in keywords with underperformance
  const hype = packages.filter(
    (p) =>
      p.keywords.some((k) =>
        /blazing|fastest|best|revolutionary|zero.?dep/i.test(k)
      ) &&
      (p.downloadsLastMonth ?? 0) < 200
  );
  if (hype.length) {
    tells.push({
      category: 'ambition-gap',
      stat: `npm package \`${hype[0].name}\` has "blazing/best/zero-dep"-style keywords and <200 downloads/month`,
      description: 'Hype keywords vs actual adoption.',
      severity: 'spicy',
    });
  }

  // Generic names
  const generic = packages.filter((p) =>
    /^(utils?|helpers?|logger|tools?|common|core|lib)$/i.test(
      p.name.replace(/^@[^/]+\//, '')
    )
  );
  if (generic.length) {
    tells.push({
      category: 'naming',
      stat: `npm package named \`${generic[0].name}\` — generic enough to mean nothing`,
      description: 'Generic package naming.',
      severity: 'spicy',
    });
  }

  // Dependency bloat
  const bloated = packages.filter((p) => p.dependencyCount > 30);
  if (bloated.length) {
    tells.push({
      category: 'dependencies',
      stat: `\`${bloated[0].name}\` has ${bloated[0].dependencyCount} dependencies`,
      description: 'Dependency-heavy package.',
      severity: 'spicy',
    });
  }

  // Placeholder READMEs
  const placeholder = packages.filter(
    (p) => p.readmeLength > 0 && p.readmeLength < 200
  );
  if (placeholder.length) {
    tells.push({
      category: 'readme',
      stat: `\`${placeholder[0].name}\` README is under 200 characters: "${placeholder[0].readmeFirstLine || ''}"`,
      description: 'Placeholder README on published package.',
      severity: 'spicy',
    });
  }

  return tells;
}
