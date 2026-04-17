# Collector: pkg.go.dev

Optional data source. Run if the target has Go repos on GitHub.

## Discovery strategy

pkg.go.dev doesn't have a public JSON API for "all modules by user", so the strategy is:

1. From the GitHub collector, identify Go repos owned by the user (language == "Go" and not a fork).
2. Check if each is indexed by fetching `https://pkg.go.dev/github.com/{username}/{repo}` — a 200 means it's published as a Go module.
3. Parse the page for: module description, imports count ("Imported by"), version, last published date.

## Tells to extract

- Go module with `Imported by: 0` after 2 years of existence
- `go.mod` in repo but no tags published (the "I don't know how Go modules work" tell)
- Module path is `github.com/user/repo` but the repo README markets it as `company.com/product` (namespace mismatch)
- `Imported by: 1` and that 1 is the user's own other repo
- Deprecated indicator on the page but the GitHub README still says "production-ready"
- v0.x.x for 3+ years = "it's not 1.0 because 1.0 would mean commitment"

## What to skip

- Standard library re-exports or small utility modules — fine to have, not roast material
- Private module paths (`internal/`) — they're hidden from pkg.go.dev anyway
