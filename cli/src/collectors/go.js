// pkg.go.dev collector. No JSON API — we HEAD-check module pages.

export async function collectGo(username, goRepos) {
  const results = [];
  for (const repo of goRepos) {
    const url = `https://pkg.go.dev/github.com/${username}/${repo}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'roaster-kit-cli' },
      });
      if (!res.ok) continue;
      const html = await res.text();

      // Cheap tag extraction — not a full parser, just enough signal.
      const importedByMatch = html.match(/Imported by[^0-9]*([0-9,]+)/i);
      const versionMatch = html.match(/v\d+\.\d+\.\d+(?:-\w+)?/);
      const deprecatedMatch = /deprecated/i.test(html);

      results.push({
        name: repo,
        url,
        importedBy: importedByMatch
          ? parseInt(importedByMatch[1].replace(/,/g, ''), 10)
          : null,
        version: versionMatch ? versionMatch[0] : null,
        deprecated: deprecatedMatch,
      });
    } catch {
      // swallow per-module errors
    }
  }
  return results;
}

export function goTells(goModules) {
  const tells = [];
  if (goModules.length === 0) return tells;

  const orphans = goModules.filter((m) => m.importedBy === 0);
  if (orphans.length) {
    tells.push({
      category: 'ambition-gap',
      stat: `Go module \`${orphans[0].name}\` is indexed on pkg.go.dev with 0 importers`,
      description: 'Unused Go module.',
      severity: 'spicy',
    });
  }

  const stuckZero = goModules.filter((m) => m.version?.startsWith('v0.'));
  if (stuckZero.length >= 2) {
    tells.push({
      category: 'abandonment',
      stat: `${stuckZero.length} Go modules still on v0.x — commitment issues`,
      description: 'Multiple pre-1.0 Go modules.',
      severity: 'spicy',
    });
  }

  return tells;
}
