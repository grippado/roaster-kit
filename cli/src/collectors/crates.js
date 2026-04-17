// crates.io collector. Public API only.

async function cratesGet(path) {
  const res = await fetch(`https://crates.io/api/v1${path}`, {
    headers: {
      'User-Agent': 'roaster-kit-cli (https://github.com/flagbridge/roaster-kit)',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function collectCrates(username) {
  const user = await cratesGet(`/users/${username}`);
  if (!user?.user?.id) return [];

  const crates = await cratesGet(
    `/crates?user_id=${user.user.id}&per_page=50`
  );
  if (!crates?.crates) return [];

  return crates.crates.map((c) => ({
    name: c.name,
    maxVersion: c.max_version,
    downloads: c.downloads,
    recentDownloads: c.recent_downloads,
    description: c.description,
    repository: c.repository,
    documentation: c.documentation,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    keywords: c.keywords || [],
  }));
}

export function cratesTells(crates) {
  const tells = [];
  if (crates.length === 0) return tells;

  // v0.1.0 for ages
  const stalled = crates.filter((c) => {
    const age = Date.now() - new Date(c.updatedAt).getTime();
    return c.maxVersion.startsWith('0.1.') && age > 365 * 24 * 60 * 60 * 1000;
  });
  if (stalled.length) {
    tells.push({
      category: 'abandonment',
      stat: `Rust crate \`${stalled[0].name}\` has been at v${stalled[0].maxVersion} for over a year`,
      description: 'Stalled Rust crate.',
      severity: 'spicy',
    });
  }

  // Big downloads vs zero maintenance
  const forgotten = crates.filter(
    (c) =>
      c.recentDownloads < 100 &&
      c.downloads > 1000 &&
      Date.now() - new Date(c.updatedAt).getTime() > 2 * 365 * 24 * 60 * 60 * 1000
  );
  if (forgotten.length) {
    tells.push({
      category: 'abandonment',
      stat: `Crate \`${forgotten[0].name}\` has ${forgotten[0].downloads} total downloads but no updates in 2+ years`,
      description: 'Abandoned-but-used crate.',
      severity: 'spicy',
    });
  }

  // Broken repository links would require following — skip, too flaky from CLI

  return tells;
}
