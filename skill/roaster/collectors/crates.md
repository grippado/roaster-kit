# Collector: crates.io

Optional data source. Run if the target has Rust repos on GitHub or mentions Rust in their bio.

## Public endpoints (no auth required)

### 1. Crates by user
```
GET https://crates.io/api/v1/users/{username}
```
First resolves the username to a user ID, then:
```
GET https://crates.io/api/v1/crates?user_id={id}&per_page=50
```

### 2. Per-crate detail
```
GET https://crates.io/api/v1/crates/{crate-name}
```
Pull: `description`, `downloads`, `recent_downloads`, `max_version`, `created_at`, `updated_at`, `repository`, `documentation`, `keywords`, `categories`.

## Tells to extract

- Published a Rust crate, latest version is `0.1.0`, last updated 3 years ago → "wrote one Rust crate, moved on, still tweets about Rust"
- 2 downloads total (Cargo bots downloading to index count here — low downloads = truly unused)
- Description in ALL CAPS or includes "blazingly fast" unironically
- Repository link is 404 (deleted repo but crate still there)
- `categories` includes "web-programming" for what's clearly a CLI tool
- Crate depends on 40 other crates for something trivial
- No documentation link

## What to skip

- Don't mock low download counts in isolation. Rust ecosystem has lots of narrow-purpose crates. The tell is the *gap between ambition and reception*: big README claims + low downloads = roast material.
