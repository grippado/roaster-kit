# Reference: Data Shape

Structured summary that collectors must return. The roast generator reads THIS, never raw API responses.

## Shape (TypeScript-ish)

```ts
type RoastData = {
  target: {
    username: string;
    displayName: string | null;
    bio: string | null;
    company: string | null;
    location: string | null;   // keep country-level at most
    blog: string | null;
    accountAgeYears: number;
    hireable: boolean | null;
  };

  portfolio: {
    totalRepos: number;
    nonForkRepos: number;
    forkRepos: number;
    reposWithNoDescription: number;
    archivedRepos: number;
    reposUntouchedOver2y: number;
    languageBreakdown: Array<{ language: string; percent: number }>;
  };

  tells: Array<{
    category:
      | 'naming'
      | 'readme'
      | 'abandonment'
      | 'cadence'
      | 'dependencies'
      | 'ambition-gap'
      | 'bio'
      | 'pinning'
      | 'commit-messages';
    stat: string;              // the verifiable number/quote
    description: string;        // short plain-english explanation
    severity: 'mild' | 'spicy' | 'nuclear';  // hint for which spice levels this fits
  }>;

  packages: {
    npm: Array<PackageStat>;
    crates: Array<PackageStat>;
    go: Array<PackageStat>;
  };

  commitCadence: {
    mostActiveHour: number | null;    // 0-23 UTC
    mostActiveDayOfWeek: number | null; // 0=Sun
    nightOwlPercent: number | null;   // % commits between 22:00-04:00
    weekendPercent: number | null;
    recentCommitMessages: string[];   // last 20, trimmed
  };

  meta: {
    collectedAt: string;  // ISO timestamp
    sources: string[];    // e.g. ['github', 'npm']
    softRoastFlag: boolean;  // true if target is clearly a learner -> soft roast required
  };
};

type PackageStat = {
  name: string;
  version: string;
  downloadsLastMonth: number | null;
  lastPublished: string;      // ISO
  dependencyCount: number | null;
  readmeFirstLine: string | null;
  licenseDeclared: boolean;
  ambitionGapScore: number | null;  // 0-1, heuristic of "big claims vs actual usage"
};
```

## Rules for the `tells` array

- **Minimum 6, maximum 15.** Roast generator will pick 3-5 from this.
- **Every tell must include a concrete stat.** "Has lots of abandoned repos" is not a tell. "23 of 47 repos have not received a commit in over 2 years" is a tell.
- **No tell may reference private data.** If you had to guess, you can't cite it.
- **`severity` is a recommendation, not a gate.** The generator filters by spice level but may dip down (e.g. nuclear roast uses some spicy tells for pacing).

## `softRoastFlag` triggers

Set to `true` if ANY of:
- `nonForkRepos` < 3
- `accountAgeYears` < 1 AND `totalRepos` < 10
- Bio contains obvious learner-signal ("learning", "aprendendo", "student", "bootcamp week")
- Every repo name matches tutorial patterns (`todo-app`, `weather-app`, `portfolio-v1`)

When this flag is true, the roast generator:
- Avoids the "abandonment" and "ambition-gap" categories
- Adds an encouraging closer line
- Caps spice at `mild`
- Mentions (in the disclaimer) that the roast was lovingly toned down

## Privacy filter (last pass before returning data)

Strip these fields if present anywhere in the collected data before passing to the roast generator:
- Email addresses
- Phone numbers
- Full street addresses
- Real names NOT already in the public GitHub profile `name` field
- Any URL containing `/private/` or `localhost`
- Partner/family references from bios (some people put them there; the roast doesn't get to touch them)
