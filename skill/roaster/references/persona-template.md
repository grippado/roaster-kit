# Reference: Persona Template

How to add a new persona. Copy this file to `personas/<name>.md` and fill in.

## Required sections

```markdown
# Persona: {Display Name}

{1-2 line pitch of the voice}

## ⚠️ Hard rules specific to this persona
(Optional but recommended if the persona is politically or medically sensitive.
See trump.md and terry-davis.md for examples.)

## Voice rules
- 3-6 bullet points on HOW this persona speaks
- Each rule should be actionable: cadence, vocabulary, structural tics
- Avoid "is sarcastic" — too vague. Use "opens with a question that answers itself", "ends every paragraph with an aphorism", etc.

## Signature moves
- 3-5 bullet points on specific rhetorical moves this persona uses
- These are the things that make the voice recognizable

## Banned moves
- 3-5 bullet points on what this persona NEVER does
- Crucial for preventing drift into generic roast voice
- Also: the ethical boundaries for this specific persona

## Calibration examples
- AT LEAST one Reddit-format example, fully written
- Optionally one Twitter-format and one other format
- Use realistic fake data (47 repos, etc.) — the real roast will interpolate real data

## When in doubt
- One sentence: the default move when the persona is unclear
- Should capture the ESSENCE in a sentence

## Closer line template
- 3 example closers
- These are the "verdict" line at the end
```

## Quality bar for a new persona

Before merging a new persona, check:

1. **Can you tell the voice apart from the other personas?** If the output reads the same as `linus.md` with the name swapped, the persona isn't doing work. Voice rules should force genuinely different sentence shapes.

2. **Is it punching at a consenting target?** Real public figures who are culturally roastable (famous for opinions, books, public statements, tech work) are fine. Private individuals are not. Dead people who struggled (Terry Davis) require the extra-care pattern.

3. **Would this persona's closing line hurt someone's day if said to them in a bar?** If yes, revise. If no, proceed.

4. **Does the banned-moves list include the persona's actual worst historical moments?** This is the honesty check. Every celebrity persona has stuff they've done that we DON'T emulate. Name them explicitly.

## Personas NOT to add

- Anyone whose "voice" is mostly abuse of a specific group
- Anyone currently alive and likely to sue over parody (defamation law varies; default to deceased + clearly-public-figure-style rather than living)
- Any persona that ONLY works via slurs or identity-based punchlines
- Your boss, your ex, your rival engineer — private individuals are off-limits as personas entirely

## Good candidates for future additions

- **Ada Lovelace** (historical, reverent roast in Victorian English)
- **Grace Hopper** ("nanosecond" cadence, military precision)
- **Margaret Hamilton** (moon-landing-era aerospace rigor)
- **Edsger Dijkstra** (letter-writing era, "considered harmful" energy)
- **Guido van Rossum** (BDFL weariness, Pythonic taste)
- **Rob Pike** (go-style terseness, Plan 9 contempt for complexity)
- **Rich Hickey** (conceptual-integrity lecture, "simple vs easy")
- **Corporate-speak "AI-transformation consultant"** (pure satire of the 2025 LinkedIn grift voice)

All should go through the quality bar above.
