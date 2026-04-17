# Reference: Format Templates

Exact output shapes per target platform.

## Reddit (default, long-form)

````
**Roasted by {Persona Name}** · *spice: {level}*

> {Cold open — one brutal opening line in persona voice}

{Tell 1 paragraph — 2-3 sentences, ends on a punchline}

{Tell 2 paragraph}

{Tell 3 paragraph}

{Tell 4 paragraph, optional}

{Closer line — persona's verdict}

---

*Stats:* {username} · {totalRepos} repos · {nonForkRepos} original · {languageBreakdown[0].language} {percent}% · account {accountAgeYears}y old · {npmPkgs}npm / {cratesPkgs}crates / {goPkgs}go · most active {mostActiveHour}h {dayOfWeek}

*Generated from public data only. All love, no hate. ❤️ · powered by [roaster-kit](https://github.com/flagbridge/roaster-kit)*
````

Word budget: 250-450 words total.

## Twitter / X

````
{Persona voice, ≤280 chars, one tell + punchline + number}

via roaster-kit
````

Examples:
- "47 repos, 41 no description, pinned one from 2019, last commit 8 months ago. This isn't a GitHub profile, it's a crime scene. — Linus, probably"
- "I looked at your GitHub. For a minute. That was enough. 14 emoji in the README. Design is what you remove. — Jobs energy"

## LinkedIn (ironic motivational)

````
🚀 Humbled to share some reflections on my GitHub this week.

{Tell 1 reframed as a humblebrag that's actually brutal — 1-2 sentences}

{Tell 2 as a "learning"}

{Tell 3 as a "journey insight"}

{Closer line framed as gratitude}

What would YOU add to this list? Drop a comment below. 🙏

#opentowork #buildinginpublic #grindset

---
*Stats: {small footer}*
````

The humor comes from applying genuine LinkedIn voice to brutal facts. Sincere cringe, not sarcastic cringe.

## Terminal (screenshot-ready)

````
$ roaster --target={username} --persona={persona} --spice={level}

  ┌─ROAST────────────────────────────────────────────┐
  │                                                   │
  │  {cold open, wrapped to ~50 chars}               │
  │                                                   │
  │  → {tell 1, one line}                             │
  │  → {tell 2, one line}                             │
  │  → {tell 3, one line}                             │
  │  → {tell 4, one line}                             │
  │                                                   │
  │  {closer line}                                    │
  │                                                   │
  └───────────────────────────────────────────────────┘

  stats: {compact one-liner}
  
  $ _
````

Word budget: keep each tell to one punchy line. This format is for screenshots — width matters more than depth.

## Language variants

For pt-BR delivery:
- Translate persona voice, not literally — e.g. Linus's "this is garbage" becomes "isso aqui é lixo", not the English direct.
- Keep the stats footer in English numbers (universal)
- Disclaimer: `*Gerado a partir de dados públicos. Tudo no amor, nada no ódio. ❤️*`

Other languages: support is best-effort; default to English if the user's prompt mixed languages.
