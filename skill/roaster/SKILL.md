---
name: roaster
description: Generate a savage, funny, shareable developer roast based on someone's PUBLIC online presence (GitHub profile/repos/languages/commits, npm packages, crates.io packages, pkg.go.dev packages). Use this skill whenever the user asks to "roast", "torrar", "zoar", "destruir", "detonar", "cozinhar" a developer/programmer profile, or mentions a GitHub username in a clearly humorous/playful context ("roast @username", "/roast someone", "what would Linus say about my GitHub?"). Also trigger when the user wants to generate shareable roast content for Twitter/X, Reddit, or LinkedIn about their own or someone else's public dev profile. Supports multiple personas (Steve Jobs, Linus Torvalds, Bill Gates, Donald Trump, Jon "Maddog" Hall, DHH, Terry Davis, etc.) and spice levels (mild/spicy/nuclear). PUBLIC DATA ONLY — never scrapes private information or non-consensual targets.
---

# Roaster

Generate a savage, funny, and shareable roast of a developer based on their public online footprint, written in the voice of a tech-celebrity persona.

## When this triggers

- `/roast <github-username>` or "roast me on GitHub"
- "zoa aí meu perfil do GitHub"
- "what would Linus Torvalds say about @grippado?"
- "make a Steve Jobs roast of this dev"
- Any request that combines a dev identifier (GitHub handle, npm scope) with humor intent

## Hard rules (read before anything else)

1. **PUBLIC DATA ONLY.** GitHub REST API, public npm registry, crates.io public API, pkg.go.dev. Never scrape private repos, private emails, or logged-in-only views. If data isn't on the public web without auth, it's off-limits.
2. **CONSENT-FIRST for third parties.** If the user wants to roast someone other than themselves, the output must feel like satire/parody aimed at public professional artifacts (code, READMEs, commits), never the person's identity, appearance, nationality, gender, race, religion, sexuality, disability, or mental health. Assume the target may see it.
3. **Punch up or sideways, never down.** Roasts mock *patterns* (500 abandoned repos, 47 "hello-world" forks, a README with 12 emoji in the title), not the human's worth.
4. **No doxxing.** Don't surface real names beyond what's already on the public profile. Don't combine GitHub + LinkedIn + npm to build a dossier. Don't include email, location beyond country, or employer unless the user explicitly lists it on their public GitHub profile.
5. **No protected-class jokes. Period.** Even in "nuclear" mode. Spice level controls edge, not ethics.
6. **If the target has < 3 public repos OR the profile is clearly a learner/kid/bootcamp-week-1 vibe, soften automatically.** Roast the *tools and choices*, not the person. Add an encouraging closer line.

If any of the above would be violated, refuse the specific angle (not the whole roast) and proceed with a cleaner version.

## Workflow

When this skill triggers, follow these steps in order:

### 1. Parse the request

Extract:
- **Target**: GitHub username (required). If missing, ask once.
- **Persona**: default `linus` if not specified. See `personas/` for full list.
- **Spice level**: `mild` | `spicy` | `nuclear`. Default `spicy`.
- **Language**: detect from user's message (pt-BR or en). Default en for shareability.
- **Format**: `reddit` (long-form, markdown) | `twitter` (≤280 chars punch) | `linkedin` (ironic "motivational") | `terminal` (ANSI-ish plain). Default `reddit`.

### 2. Collect data

Read the relevant collector file in `collectors/` and follow its instructions. Always run GitHub first (it's the anchor), then optionally npm/crates/pkg.go.dev if the user mentioned them or if the GitHub bio/repos reference publishing packages.

- `collectors/github.md` — profile, top repos, language stats, commit cadence, README tells
- `collectors/npm.md` — published packages under a user/org, download counts
- `collectors/crates.md` — published crates, versions, downloads
- `collectors/pkg-go-dev.md` — published Go modules

Collect a compact structured summary (see `references/data-shape.md`). Do NOT dump raw API responses into the roast prompt — distill to 10-20 "tells".

### 3. Pick the ammo

From the collected data, pick 3-6 **specific, verifiable** tells that will become roast material. Good tells:
- "73% of your commits are on Sundays at 2am"
- "Your most-starred repo is a 2018 fork of awesome-lists that you never touched again"
- "You have 4 different dotfiles repos and none of them has a commit in the last year"
- "You've published 1 npm package and its README is just the word 'soon'"

Bad tells (skip these):
- Anything about follower count as a measure of worth
- Anything about account age ("OK boomer")
- Anything that punches at beginner status

### 4. Load the persona

Read `personas/<persona>.md`. Each persona file contains: voice rules, signature moves, banned moves (stuff that persona would NEVER say), 2-3 example lines for calibration, and a "when in doubt" fallback.

If the requested persona doesn't exist, default to `linus` and mention it to the user.

### 5. Write the roast

Apply the persona voice to the tells, at the requested spice level and format. See `references/format-templates.md` for the exact shape per format.

Structure for `reddit` (default):
1. **Cold open** — one brutal, persona-flavored opening line
2. **The receipts** — 3-5 tells, each a punchy paragraph (2-3 sentences)
3. **The verdict** — persona-style closing line
4. **Stats footer** — small italic line with the objective numbers used, so readers can verify. This is the credibility anchor that makes the joke land.

Structure for `twitter`: one tweet, ≤280 chars, one tell, one punchline.

Structure for `linkedin`: ironic "I'm humbled to share" format mocking LinkedIn-speak, 3-4 short paragraphs.

Structure for `terminal`: monospace-looking plaintext with `$ roast @user` header, fits in a screenshot.

### 6. Present the output

Wrap the roast in a code fence for easy copy-paste. Below it, add:
- A one-line "Share as:" suggestion (Twitter/Reddit title ideas)
- A disclaimer line: `*Generated from public data only. All love, no hate. ❤️*` (or pt-BR equivalent)

If the user asked to roast someone else, add: `*This roast was commissioned by <user>. DM if you want your own.*` style attribution to keep the satire framing visible.

## Spice levels

- **mild** — PG-13, self-deprecating energy, more "lovingly mocking". Good for LinkedIn.
- **spicy** — R-rated, Reddit-safe, real jabs but no curse spam. Default.
- **nuclear** — HBO-level, heavier curses allowed (still no slurs, ever), cuts closer. Only if user explicitly asks.

Nuclear is NOT "racist/sexist/homophobic unlocked". It's "intensity unlocked". The hard rules never bend.

## Personas quick index

See `personas/` directory for full voice specs. Current roster:

- `linus.md` — Linus Torvalds. Technical, acidic, "this is garbage and here's why" energy.
- `steve-jobs.md` — Late-era keynote Jobs. Cuts with taste-based contempt.
- `bill-gates.md` — Memo-era Gates. Cold, metrics-driven, vaguely threatening.
- `maddog.md` — Jon "Maddog" Hall. Old-school UNIX greybeard, weary.
- `trump.md` — Satirical Trump. Superlatives, nicknames, "sad!". Pure parody.
- `dhh.md` — DHH. Contrarian, hot-take, Rails-maxi.
- `terry-davis.md` — Terry Davis (TempleOS). Handle with care — see persona file for the strict rules that apply to this one.
- `carmack.md` — John Carmack. Terse, twitter-thread voice, genuine but devastating.

Adding a persona: drop a new `<name>.md` in `personas/` following the template in `references/persona-template.md`.

## Output contract

Every roast must:
- Be ready to copy-paste into the target platform
- Include the verifiable stats footer (it's the whole bit)
- End with the disclaimer line
- Never exceed 1 screen on the target platform (~500 words reddit, 280 chars twitter)

## Failure modes to avoid

- **Generic roast** — "you write too much JavaScript lol" is not a roast, it's a tweet from 2016. Use specific tells.
- **Just mean** — if there's no joke, it's just bullying. Every tell needs a punchline shape.
- **Wrong persona** — if you can swap the name at the top and the roast reads the same, the persona isn't doing any work. Re-read the persona file.
- **Fabricated stats** — NEVER invent numbers. If the collector didn't return it, you can't cite it. The stats footer is a verification mechanism; poisoning it kills the skill.
- **Outdated data** — GitHub API results are live; always use fresh data, never rely on memory.

## References

- `references/data-shape.md` — the structured summary format collectors must return
- `references/format-templates.md` — exact output shapes per format
- `references/persona-template.md` — how to add a new persona
- `references/safety-examples.md` — concrete before/after examples of rule violations and fixes
