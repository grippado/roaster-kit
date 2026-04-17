# Collector: npm

Optional data source. Only run if the GitHub bio, README, or repo descriptions suggest the user publishes npm packages, or if the user explicitly requested npm in the roast scope.

## Public endpoints

### 1. Packages by user/scope
npm doesn't have a clean public "all packages by user" endpoint, but these work:

```
GET https://registry.npmjs.org/-/v1/search?text=maintainer:{username}&size=50
```

For scoped packages (e.g. `@flagbridge/*`):
```
GET https://registry.npmjs.org/-/v1/search?text=scope:{scope}&size=50
```

### 2. Per-package detail
```
GET https://registry.npmjs.org/{package-name}
```
Pull: `description`, `readme` (length + opening line), `versions` (count and latest version), `time.created` vs `time.modified`, `license`, `keywords`, `dependencies` count.

### 3. Download stats
```
GET https://api.npmjs.org/downloads/point/last-month/{package-name}
```

## Tells to extract

- Published 1 package, 3 downloads/month, version `0.0.1` from 2 years ago → classic abandoned-ware
- Package has a README that's literally just the npm init default
- 47 dependencies for a "utility library"
- Package name is generic (`logger`, `utils`, `helpers`) and has 12 downloads
- License missing / `UNLICENSED`
- Keywords include "blazing fast" or "zero-dependencies" (then show dependency count)
- Latest version is `1.0.0` but changelog shows 6 months of `fix typo` commits
- Package description in English but README in a different language
- The `time.modified` is recent but `version` hasn't bumped in years (maintenance theater)

## What to skip

- Don't roast for low download counts alone — indie packages have low downloads by nature. The roast material is the *combination*: e.g. "30 downloads/month AND the README promises it's production-ready AND it's been 2 years".
- Don't expose the maintainer's email if it's in the `maintainers` block — that's public but surfacing it for roast material is creepy. Use username only.
