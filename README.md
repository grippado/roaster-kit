# 🔥 roaster-kit

> Roast any developer's public GitHub in the voice of Linus Torvalds, Steve Jobs, Bill Gates, John Carmack, or six other tech icons. Pure satire. Public data only.

```
$ roaster torvalds --persona=steve-jobs --spice=spicy

  ┌─ROAST────────────────────────────────────────────┐
  │                                                   │
  │  I looked at this GitHub. For a minute.          │
  │  That was enough.                                 │
  │                                                   │
  │  → 1,247 repositories. One. Thousand. Two         │
  │    hundred forty-seven.                           │
  │  → Not one of them has an app icon.               │
  │  → The most-starred repo is literally called      │
  │    "linux". No creativity.                        │
  │                                                   │
  │  Find the one thing worth keeping.                │
  │  Throw everything else away.                      │
  │                                                   │
  └───────────────────────────────────────────────────┘
```

## What is this

A Claude-powered roast generator that turns anyone's public GitHub footprint into shareable comedy in the voice of a chosen tech persona. Ships three ways:

- **Claude Code slash command** — `/roast grippado --persona=jobs`
- **Claude skill** — drop into `~/.claude/skills/` and any Claude agent can call it
- **Standalone CLI** — `npx @grippado/roaster-kit grippado`

All three share the same core skill. The CLI is a thin wrapper that calls the Anthropic API with the skill injected as the system prompt.

A **web version** at `roast.gripp.link` is on the way — paste a GitHub handle, pick your executioner, get roasted in the browser. See [Roadmap](#roadmap).

## Install

### CLI

...

By default, roaster uses Claude Sonnet 4.6 for a good balance of quality and cost. You can opt into Opus with `--model=claude-opus-4-7` when you want the premium version.

Works with any Node 20+ package manager. No install needed — run it ephemerally:

```bash
# npm
npx @grippado/roaster-kit <github-username>

# yarn
yarn dlx @grippado/roaster-kit <github-username>

# pnpm
pnpm dlx @grippado/roaster-kit <github-username>
```

Prefer a global install?

```bash
npm install -g @grippado/roaster-kit
yarn global add @grippado/roaster-kit
pnpm add -g @grippado/roaster-kit
```

Then use either `roaster` or `roast` as the command name.

Set `ANTHROPIC_API_KEY` first ([get one here](https://console.anthropic.com)). Optionally set `GITHUB_TOKEN` to raise the GitHub rate limit from 60/hr to 5000/hr.

### Claude Code slash command

```bash
# from the repo root
cp slash-command/roast.md ~/.claude/commands/roast.md
cp -r skill/roaster ~/.claude/skills/roaster
```

Then in any Claude Code session:

```
/roast grippado --persona=linus --spice=spicy
```

### Claude skill (Claude.ai or any agent)

```bash
cp -r skill/roaster ~/.claude/skills/roaster
```

Then just ask:

> "Roast @grippado on GitHub in the style of Steve Jobs"

## Personas

| Persona | Voice |
|---|---|
| `linus` *(default)* | Kernel-dev rigor applied to side-project chaos. Surgical. |
| `steve-jobs` | Taste-based contempt. Cares about naming, not lint. |
| `bill-gates` | Memo-era Gates. Metrics. Implied threats. |
| `trump` | SNL-parody voice. Superlatives and nicknames. No real politics. |
| `maddog` | UNIX greybeard weariness. "Back in my day..." |
| `dhh` | Contrarian manifesto. Dismisses the popular AND the obscure. |
| `carmack` | Terse Twitter-thread voice. Devastating precision. |
| `terry-davis` | Respectful tribute to the philosophical voice only. |

Want to add one? See [`skill/roaster/references/persona-template.md`](./skill/roaster/references/persona-template.md).

## Spice levels

- `mild` — PG-13. Lovingly mocking. Default for anyone flagged as a learner.
- `spicy` *(default)* — Reddit-safe. Real jabs.
- `nuclear` — HBO intensity. Stronger language. **Still no identity jokes, ever.**

## Output formats

- `reddit` *(default)* — long-form markdown, ready to paste into r/programming
- `twitter` — single tweet, ≤280 chars
- `linkedin` — ironic "humbled to share" motivational post
- `terminal` — ASCII box for screenshots

## Data sources

Roast material comes from **public APIs only**:

- **GitHub** *(always, anchor source)* — profile, repos, languages, commit cadence, READMEs
- **npm** *(optional)* — published packages, downloads, dependency counts
- **crates.io** *(optional)* — published Rust crates, versions, downloads
- **pkg.go.dev** *(optional)* — published Go modules, importers

Add sources with `--sources=github,npm,crates,go`.

## Hard ethical rules

The skill and CLI enforce these without exception:

1. **Public data only.** No scraping, no private info, no combining sources to dossier someone.
2. **Punch up or sideways.** Never at identity (race, gender, nationality, religion, sexuality, disability, mental health, appearance).
3. **Consent-first for third parties.** If you roast someone who didn't opt in, the skill auto-softens and adds a "commissioned by X" attribution.
4. **Learners get soft roasts.** If the target has <3 public repos or signals they're learning, the skill downshifts to `mild` and adds an encouraging closer.
5. **No fabricated stats.** Every number, percentage, year, and quoted bio fragment in the roast traces back to fields in the structured data block — enforced in the system prompt with an explicit allowlist of data paths. The stats footer is the credibility anchor.
6. **Nuclear ≠ ethics off.** Nuclear unlocks language intensity. It does NOT unlock slurs, identity jokes, or punching down. Ever.

See [`skill/roaster/references/safety-examples.md`](./skill/roaster/references/safety-examples.md) for concrete before/after examples.

## Example

**Reddit format, Linus, spicy** (real output on a real profile):

> **Roasted by Linus Torvalds** · *spice: spicy*
>
> > Forty-seven repositories. Forty-one with no description. This is not a portfolio. This is a cache of abandoned attempts.
>
> Three separate dotfiles repos: `dotfiles`, `dotfiles-old`, `dotfiles-new`. That's not version control. That's archaeology. And the `dotfiles-new` commits are all named "update". Update what. Update *what*.
>
> 73% of commits happen between 10pm and 4am. I'm not saying don't code at night. I'm saying every one of these late-night commits is followed by a morning commit named "fix". The correlation is doing some work.
>
> Pinned a repo with 412 stars that hasn't been touched since 2021. The README promises "v2 coming soon". *Soon* is doing a lot of load-bearing work in that sentence.
>
> Rewrite. Start over. Or at least delete the ones you're not going to finish.
>
> ---
> *Stats:* @user · 47 repos · 39 original · JavaScript 87% · 8y old · night-owl 73%
>
> *Generated from public data only. All love, no hate. ❤️ · powered by [roaster-kit](https://github.com/grippado/roaster-kit)*

## Roast yourself first

Before you roast anyone else, roast yourself. It's the rule.

```bash
npx @grippado/roaster-kit $(git config github.user) --spice=nuclear
# or
pnpm dlx @grippado/roaster-kit $(git config github.user) --spice=nuclear
```

## Roadmap

- [x] **v0.1** — Skill + CLI + Claude Code slash command, 8 personas, 4 sources
- [ ] **v0.2** — `roast.gripp.link`: web version. Paste a GitHub handle, pick your executioner, get roasted in the browser. Share-as-image. Rate-limited, no-login.
- [ ] **v0.3** — GitHub Action: `grippado/roaster-action` — open a PR, get roasted in the PR comments by the persona of your choice. Opt-in per repo.
- [ ] **v0.4** — More personas (community PRs). Candidates: Ada Lovelace, Grace Hopper, Dijkstra, Guido, Rob Pike, the "AI-transformation consultant" satire.
- [ ] **v0.5** — Team mode: roast a whole GitHub org. For retros that hurt.

## FAQ

**Is this mean?**
It's a roast. By design it's pointed. But the skill is built from the ground up to punch at patterns (abandoned repos, hype names, commit cadence) instead of at people. If you want a "soft" version, pass `--spice=mild`.

**What if the target isn't in on it?**
The skill asks once if the target is third-party and consenting. If not, it keeps the spice low and frames the output as "commissioned by @X" satire. If you want to roast someone who didn't opt in at nuclear spice, the skill will refuse.

**Can I add a persona?**
Yes — drop a markdown file in `skill/roaster/personas/` following the [template](./skill/roaster/references/persona-template.md). PRs welcome.

**Does this work offline?**
No — it calls the Anthropic API and GitHub's public API.

**How much does it cost per roast?**
One Claude API call per roast, usually ~2-4k input tokens and ~500-1k output tokens. Call it a fraction of a cent. The GitHub API calls are free (60/hr unauth, 5000/hr with a token).

**Why Anthropic and not OpenAI?**
Built by a heavy Claude Code user, runs on Claude. You can adapt `cli/src/prompt.js` to any model with a system-prompt API, but the persona calibrations were tuned against Claude.

## Contributing

- **New persona?** Follow [`persona-template.md`](./skill/roaster/references/persona-template.md) and the quality bar in it.
- **New data source?** Add a collector in `cli/src/collectors/` and a matching markdown doc in `skill/roaster/collectors/`. Public-data-only.
- **Fixing a bad roast pattern?** Add a before/after to [`safety-examples.md`](./skill/roaster/references/safety-examples.md).

## License

Apache 2.0. See [LICENSE](./LICENSE).

## Credits

Built by [Gabriel Gripp](https://github.com/grippado) — also the person behind [FlagBridge](https://flagbridge.io), a feature flag platform that takes itself more seriously than this project does.

All roasts are satire. All love, no hate. ❤️
