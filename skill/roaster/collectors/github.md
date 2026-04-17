# Collector: GitHub

The anchor data source. Always run this first.

## Public endpoints (no auth required, but rate-limited at 60 req/hour unauthenticated)

For unauthenticated light use, this is fine for one roast at a time. If building a CLI/service, use a `GITHUB_TOKEN` env var for 5000 req/hour.

### 1. Profile
```
GET https://api.github.com/users/{username}
```
Pull: `name`, `bio`, `company`, `location`, `blog`, `public_repos`, `followers`, `following`, `created_at`, `hireable`, `twitter_username`.

**Tells to extract:**
- Bio has a rocket/fire emoji? An overused buzzword ("passionate", "ninja", "10x", "polyglot")?
- `hireable: true` + last activity > 6 months ago = great tell
- `followers` < `following` is a classic "follow-for-follow era" tell
- Account age vs total repos → if account is 10 years old and has 4 repos, that's a tell

### 2. Repos (top 30, sorted by stars)
```
GET https://api.github.com/users/{username}/repos?sort=updated&per_page=100
```
Pull for each: `name`, `description`, `fork`, `stargazers_count`, `language`, `created_at`, `pushed_at`, `archived`, `size`, `open_issues_count`, `license`, `homepage`, `topics`.

**Tells to extract:**
- How many forks vs original repos? (Ratio)
- How many have no description?
- How many have `README.md` vibes of `# Project\n\nComing soon` (check via `GET /repos/{u}/{r}/readme`, decode base64, check length/content — flag if < 200 chars)
- Repos named `test`, `test2`, `untitled`, `playground`, `dotfiles`, `dotfiles-old`, `dotfiles-new`, `dotfiles-v2`
- Last push date — how many repos haven't been touched in > 2 years?
- Any repo with 100+ stars and no commit in 3+ years (the classic "I made one cool thing in 2019" tell)
- Issues open but never answered
- License missing on starred-enough repos
- Topic tags that are just "awesome", "cool", "stuff"

### 3. Language stats (derived)
Sum `size` per `language` across non-fork repos. Get top 5 and their %.

**Tells:**
- 87% JavaScript, 13% "dotfiles shell scripts". 
- Listed as polyglot in bio but 96% one language.
- Heavy Rust % but no published crate (all-talk-no-ship tell — pair with `crates.md` collector).

### 4. Commit cadence (last 90 days)
```
GET https://api.github.com/users/{username}/events/public
```
Pull `PushEvent` entries, group by day-of-week and hour.

**Tells:**
- Most commits between 11pm-3am ("the 'I have a day job' schedule")
- 60%+ commits on weekends
- Giant gap then a burst (the "interview prep" pattern)
- Commits all on one repo this month, nothing else
- Commit messages of last 20 commits — any that are `wip`, `asdf`, `fix`, `.`, `update`, `stuff`, `x`?

### 5. Pinned repos
Fetch via the HTML at `https://github.com/{username}` and parse pinned items, OR via GraphQL if authenticated. For unauth, scrape the public profile HTML is acceptable (it's rendered server-side, public view).

**Tells:**
- Pinned a tutorial fork
- Pinned something with no commits in 4 years
- Pinned 6 things and 3 are the same project in different languages
- Pinned a repo called `personal-website` that 404s on the GitHub Pages URL

## What to return

Return the structured summary per `references/data-shape.md` — don't pass raw JSON to the roast generator. The distillation is what makes the roast sharp.

## Rate limiting / errors

- 403 rate-limited → back off, tell the user to retry in an hour or set `GITHUB_TOKEN`
- 404 on user → "no such GitHub user, check the handle"
- Empty repos → trigger the "< 3 public repos" soft-roast path from SKILL.md rule 6

## What NOT to fetch

- `/user/emails` — requires auth, and is private even when authed
- Private repos — obviously
- Organization members lists where membership is private
- Starred repos lists of others (technically public but creepy to mine for roast material — off-limits)
- Follower lists (same reason)
