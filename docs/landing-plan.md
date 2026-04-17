# Landing Page Plan — v0.2 (post-launch)

> Don't build this until v0.1 (skill + CLI + slash command) is shipped, announced, and has at least one reasonable spike of attention. The landing is the amplifier, not the origin.

## What it is

`roast.gripp.link` — a single-page site where any dev pastes a GitHub handle, picks a persona + spice, and gets roasted in the browser. Share-as-image at the end.

The landing is the low-friction discovery funnel. CLI + skill are the high-engagement follow-ons. Most people will never install the CLI; they'll share the landing roast.

**Scope for v0.2: GitHub only.** LinkedIn, Twitter, dev.to, Hashnode, Stack Overflow land in v0.3 with a dedicated multi-source UX. Keeps the "public data only" promise absolutely clean and dodges LinkedIn's TOS entirely.

## Stack

- **Framework:** latest Next.js (App Router) on Vercel. Free tier handles the initial spike.
- **Runtime:** Edge runtime for `/api/roast`. Lower latency, no cold starts.
- **Rate limit:** Upstash Redis free tier + `@upstash/ratelimit`. 3 roasts per IP per hour. Non-negotiable — without this, viral = bankrupt.
- **LLM:** Anthropic API directly, `claude-opus-4-7`. Skill SKILL.md + chosen persona file concatenated as system prompt.
- **GitHub data:** GitHub REST API server-side. Use `GITHUB_TOKEN` env var (5000/hr) to absorb traffic.
- **Styling:** Tailwind + shadcn/ui. The roast is the product; the page is the stage.
- **Fonts:** Inter for UI, JetBrains Mono for terminal-style roast display (matches your FlagBridge brand).
- **Hosting:** Vercel + Cloudflare DNS → `roast.gripp.link` (CNAME).
- **Analytics:** Vercel Analytics (free, privacy-friendly).
- **Persistence:** Upstash KV for permalink storage.

## Pages

Just three:

### `/` — the landing

Above-the-fold copy options to A/B test:

> **Get roasted.**
> In the voice of Linus Torvalds. Or Steve Jobs. Or six other tech icons.
> Paste your GitHub. Brace yourself.

or

> **Your GitHub deserves this.**
> Ten years of abandoned repos? We see you. Pick your executioner.

Form layout:

```
┌─────────────────────────────────────────────┐
│  github.com/ [ grippado              ]      │
│                                              │
│  Executioner:                                │
│  [ Linus ] [ Jobs ] [ Gates ] [ Carmack ]   │
│  [ Trump ] [ Maddog ] [ DHH ] [ Terry ]     │
│                                              │
│  Spice: 🌶️ mild  🌶️🌶️ spicy  🌶️🌶️🌶️ nuclear │
│                                              │
│  [  🔥  Roast me  🔥  ]                      │
│                                              │
│  ☑ I'm roasting myself (or have their OK)   │
└─────────────────────────────────────────────┘
```

Below the fold:
- 2-3 pre-rendered example roasts from famously-consenting-by-publicity devs (`torvalds`, `dhh`, `gaearon`) with share links — instant social proof AND demo
- "Run it in your terminal" CTA → copy-to-clipboard for `npx @grippado/roaster-kit yourname`
- GitHub repo link → stars
- Link back to `@grippado` profile
- Small "coming in v0.3: LinkedIn, dev.to, Twitter" teaser for the roadmap

### `/r/<slug>` — permalink for a roast

Every generated roast gets a short slug stored in Upstash KV. Shareable page shows the roast full-screen with:
- Share buttons (Twitter, Reddit, LinkedIn, copy link)
- "Get your own roast" CTA back to `/`
- **Open Graph image auto-generated with `@vercel/og`** — shows the roast in terminal format

**This OG image is THE viral mechanic.** When someone tweets a link, the preview card IS the joke. No click needed to get the punchline. Prioritize getting this right — it's the single highest-leverage piece of the whole landing.

### `/about`

Small page explaining:
- The ethical rules (hard limits, public data only)
- The open-source nature + CLI install
- Brief description of each persona
- Credit to `@grippado` + link to FlagBridge

## The loading experience

This is 50% of the magic. While the roast generates (2-8 seconds), show rotating status lines in persona-flavored voice:

**Generic:**
- "Reading your pinned repos..."
- "Counting abandoned dotfiles..."
- "Tallying 'wip' commit messages..."
- "Checking if you actually know Rust..."

**Linus-mode:**
- "Loading Torvalds..."
- "Sharpening."
- "Reading your diff..."
- "Preparing the mailing list."

**Jobs-mode:**
- "Looking."
- "Still looking."
- "..."
- "Disappointed."

**Trump-mode:**
- "Reviewing. Tremendous profile. Maybe."
- "Many people are saying things."
- "Still looking. Sad!"

Each line shown for ~600ms, random order per persona. Use CSS transitions, not reloads. The wait IS part of the comedy.

## Share flow

After the roast renders:
1. **Download as PNG** — `html2canvas` or server-side `@vercel/og` turns terminal-format roast into image
2. **Copy roast (Markdown)** — for pasting to Reddit
3. **Post to X** — opens tweet intent with pre-filled text + permalink (preview card does the rest)
4. **Permalink** — always visible, copy-able, becomes the canonical shareable URL

## Rate limiting specifics

- **Per IP:** 3 roasts / hour. Show friendly "the roaster needs a break, back in X minutes" message.
- **Per target username:** 10 roasts / day. Prevents someone spam-targeting one person with malicious roasts.
- **Global circuit breaker:** 1000 roasts/hour. If tripped, show "we're getting roasted ourselves — try the CLI" fallback.
- **Cached results:** Same `username + persona + spice + format` combo returns cached result for 1 hour. Cuts API cost on viral shares of the same permalink.

## Architecture

```
User → Vercel Edge (Next.js)
         │
         ├─ /api/roast (Edge runtime)
         │    ├─ Upstash ratelimit check
         │    ├─ Upstash KV cache check (username+persona+spice)
         │    ├─ GitHub REST API (via GITHUB_TOKEN)
         │    ├─ Anthropic API (claude-opus-4-7)
         │    ├─ Upstash KV write (slug → roast)
         │    └─ return { roast, slug }
         │
         ├─ /r/[slug] (SSR)
         │    └─ Upstash KV read → render roast
         │
         └─ /api/og/[slug] (Edge, @vercel/og)
              └─ Render terminal-format roast as PNG
```

## Cost model

At Claude Opus 4.7 pricing (verify current rates):
- ~3000 input tokens per roast (skill + persona + collected data)
- ~800 output tokens per roast
- Cost per roast: a fraction of a cent to a few cents

Traffic projections:
- 100 visitors/day → ~200 roasts → cents per day
- 1000 visitors/day → ~2000 roasts → low single-digit dollars
- Viral spike of 50k visitors/day → rate-limiter absorbs 80%, real generations ~10k → tens of dollars

**Hard API budget cap** in Anthropic console. Add a "liked it? ☕" link to Ko-fi or GitHub Sponsors for cost recovery if it takes off.

## Easter eggs (the "página engraçada" energy)

- **Famous dev handles** trigger pre-cached instant roasts: `torvalds`, `gaearon`, `tj`, `sindresorhus`, `antirez`, `mojombo`, `defunkt`. Load in <100ms. Tiny badge: *"legendary roast, pre-loaded for your enjoyment"*.
- **Type `grippado`** → custom welcome: *"oh. the creator. brave of you."* before the roast.
- **Type `anthropic` or `claude`** → *"we're not roasting our own boss, sorry."* with a lovingly mild auto-roast instead.
- **404 page** → roasts the 404 itself: *"Even this page has more content than half your repos."*
- **Konami code** on homepage → unlock a secret 9th persona (TBD — maybe "the HN top-comment" voice).
- **Twitter share** → pre-filled tweet is itself in the chosen persona's voice. Linus: "I reviewed this GitHub. It's bad. /via roast.gripp.link".

## Launch sequence

1. Ship v0.1 (CLI + skill + slash command). Post on Reddit and Twitter. Measure interest.
2. If there's traction (50+ stars, any meaningful social share activity), start v0.2.
3. Build landing in ~1 weekend. Ship to `roast.gripp.link`.
4. Pre-load 5-10 famous-dev roasts for instant demos.
5. Post the landing to r/programming, r/webdev, HN with a self-roast as the opening example.
6. **The self-roast is the hook** — "I built a thing to roast my own GitHub. Here's what it said about me." That's the Reddit title that performs.

## What NOT to do in v0.2

- **No login.** Lowers friction by 10x. Rate limit is enough.
- **No LinkedIn.** Save for v0.3 with user-pasted-text approach, never scraping.
- **No user accounts, no history, no favorites.** Permalinks are enough. Keep it dumb and disposable.
- **No AI-generated persona images.** Use emoji or monochrome silhouettes. Avoid deepfake territory and rights issues.
- **No monetization in v0.2.** Free to use. Donate link only. Monetization conversation starts at v0.5 if warranted.

## v0.3 preview (multi-source)

When ready to add LinkedIn, Twitter/X, dev.to, Hashnode, Stack Overflow:

- **LinkedIn:** user-pastes their public headline + about text into a textarea. NEVER scrape. Clear UX: *"paste your LinkedIn bio here — we don't scrape LinkedIn."*
- **Twitter/X:** user-provides handle, we read the public bio via their still-working endpoints (or user-pastes if API access gets worse)
- **dev.to / Hashnode:** both have public APIs with reasonable terms
- **Stack Overflow:** public API with reputation, tags, top answers

Each source becomes a checkbox in the form. The roast gets richer the more sources provided. The skill's data-shape.md already anticipates this structure.
