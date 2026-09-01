# P1 cohesion spec

Crew, Updates, Echo, returning players, district stickers, and the work of
making SIDEQUEST one product rather than a strong world with older screens
around it.

**Built:** 1 September 2026, on the build at `a411e1e`.

---

## 1. The question

P0 asked whether District 01 remembers the player. P1 asks:

> **Why would somebody come back tomorrow?**

The answer had to come from story continuation, people, identity, world
history, curiosity, crew and ownership. Explicitly not from streaks, timers,
loot, push pressure or voucher grinding. Nothing in this pass reads a clock.

## 2. Each destination, and its one job

| Screen | Its job | What changed |
| ------ | ------- | ------------ |
| Home | What is happening for me | Leads with a continue control for anybody with history; first-time visitors see the discovery order unchanged |
| Streets | Where I explore and play | Echo reacts; tracking arrives from the journal; two more interior microactivities |
| Missions | What stories I am following | Who asks and where, plus "Show me where" into the world |
| Crew | What my people are doing | Rebuilt around what we are doing together; every score removed |
| Updates | What is real, and what I can practise | Theme mapping, and the word fictional on every practice control |
| You | Who I am, what I own, what I remember | District stickers, and one pinned to your corner |
| Safe | Real-world help | Untouched, and a test now fails the build if anything playful reaches it |

---

## 3. Crew

### What it used to answer

The screen opened with a weekly XP total, ranked the player's four friends
against them by XP, showed a challenge whose progress bar was **a hardcoded
number in a data file**, then ranked their crew against two other crews.

Four things were wrong and only one was cosmetic:

- It answered "how are we doing" when the question is "what are we doing".
- The challenge progress was fabricated. `progress: 3` moved for nobody. A
  player could finish BREAKSAFE five times and watch it stay at three.
- It ranked friends against each other by points, in a product about peer
  influence whose argument is that a group sets the norm rather than competing
  inside it.
- The crew owned nothing at all.

### What it answers now

Who we are, what we are doing together, what we have made, who is in it. Then
joining. Members are a list of people, not a table of scores.

### The asynchronous model

Four challenges, in four different shapes, in `src/data/crew-challenges.ts`:

| Challenge | Shape | Your part | Needs everybody at once |
| --------- | ----- | --------- | ----------------------- |
| Split the favour between you | split | Take any one step of The favour | No |
| Three quests, written by us | make | Build one quest of your own | No |
| Everyone changes one thing | change | Finish BREAKSAFE and pick a patch | No |
| One round, same room | together | Play Crew Shift once | **Yes, and that is what it is for** |

Exactly one requires presence, and a test fails the build if a second appears.

### The honesty line

**Your own contribution is real.** `done(profile)` is a pure function of the
profile, exactly like District Memory, and it is as true as your XP.

**The other four members are prototype content, and the screen says so where
they appear**, not in a footnote. There is no crew total anywhere, because
there is no backend and any such number would be invented. The old per-member
points column and the cross-crew league table are both deleted.

### Designed for a backend that does not exist

`yourPart` and `done()` are the entire contract the UI reads. A real
implementation adds other members' contributions from a server and leaves the
type, the functions and every component untouched. A test asserts that no crew
component contains `fetch`, `WebSocket`, `EventSource` or `setInterval`, so
fake synchronisation cannot appear by accident.

### Crew identity

Five emblems, five patterns, five colours, in `crew-banner.tsx`. All original
SVG. The emblem is a distinct shape and the pattern a distinct geometry, so a
crew is identifiable without seeing the colour at all.

Four patterns unlock from the four challenges. That is the **only** thing a
crew challenge pays: no XP, no currency, no voucher eligibility, nothing that
compounds. Locked patterns are drawn, named, and carry the sentence that earns
them, marked with a lock icon and a text label rather than by dimming alone.

The banner is stored on the profile, and the editor says why: there is no
backend, so four phones cannot agree. A real version settles it once for the
crew; this one settles it for you.

---

## 4. Updates

### The problem

Updates already knew which mission related to which story and rendered it as a
button reading **"Play REWIND"** directly beneath a summary of real Singapore
Police Force guidance. Read quickly by a fifteen year old, that offers a
playable version of the news.

Nobody intended it. It happened because the link was made between an *item*
and a *mission*, and an item is a specific piece of reporting.

### Practice themes

The mapping now belongs to a **theme**: the underlying situation both things
are about. The real story is evidence the theme exists; the mission is an
invented situation in the same shape.

Attaching it to the theme is the whole safeguard. No code path connects one
report to one scenario, so "replay this incident" cannot be expressed.

Seven themes in `src/data/practice-themes.ts`, each with a `fiction` sentence
that describes the made-up situation, and each resolved through the mission the
story already named, so the two cannot drift.

### What appears on screen

- The lead card, the detail page and the Home featured story all read
  **"Practise a fictional version"**. A test fails the build if any of the
  three loses the word.
- Every one carries: "Written by SIDEQUEST. Not a recreation of the report
  above, and not based on any real person or incident."
- Compact rows say "Has a fictional version" rather than "Has a quest".
- No theme names a person, a place where something happened, or an outcome
  somebody suffered.

**Provenance is untouched.** A real report does not become official because it
links to a mission, and a test asserts a story's provenance is unchanged by
resolving its practice link.

---

## 5. Echo

A companion rather than a sprite, in about forty lines of engine change.

**Reactions.** Two shapes, `pleased` and `curious`, each a small hop and a
change of eyes for 1.5 seconds. Triggered on meeting a person, finding
something worth keeping, and earning a sticker.

**The rule that lets it exist:** a reaction never carries information. Every
triggering event is already fully described in a sheet opening on screen, so a
player who does not look at Echo, has reduced motion on, or cannot see the
canvas at all misses nothing. A canvas has no semantics, so the only safe
amount of speech is none, and there is none.

**Restraint.** Rate limited in the engine: a second call while a reaction runs
is ignored, so a burst of events produces one hop rather than a jitter. It
expires on its own against a simulated clock advanced by the same `dt` as the
rest of the step, so a reaction cannot burn down while a sheet is open.

**Reduced motion** removes the hop and keeps the expression. Nothing is shown
by motion that is not also shown without it.

**Variants** differ in idle amplitude, speed and phase. A test extracts the
character table and asserts those are the only three fields in it, so a
variant can never become an advantage.

**Echo is absent from Safe and Settings**, and a test fails the build if either
imports the mascot, a sticker, a banner or the reaction call.

---

## 6. Returning players

`src/features/home/continue-state.ts`.

**One continue item, by strict priority:** a half-read campaign chapter, then a
half-finished Prevention Thread, then somebody standing in the district with
something unresolved. Never a list: a home screen offering four ways to resume
is a menu, and the value of a continue control is not having to choose.

**"Returning" means this profile has done things before.** Whether they were
here yesterday is unknowable and the product does not pretend otherwise.

**No daily login system, and none can be built from this module**, because
nothing in it can read a clock. A test asserts the file contains no `Date.now`,
`new Date`, `getTime`, `toISOString` or `setInterval`. That was a constraint
before it was a decision, and it turned out to be the strongest available
guarantee against the entire class of urgency mechanic.

**No "new since you left" section.** The brief offered one and it could not be
made honest: knowing something is new requires a record of what has already
been seen, and inventing that state to power an unread badge is writing data
purely to manufacture a sense of missing out.

**One gentle open loop instead**, true whenever it is read: how many places
still have nothing of yours in them, or how many stickers are still out there.
No countdown, no urgency, nothing that expires.

---

## 7. District stickers

Eight, in `src/data/district-stickers.ts`. Finite, deterministic, cosmetic,
free, and drawn in code.

| Sticker | From |
| ------- | ---- |
| First Light | Meet somebody in the district |
| Sunrise Regular | Four things happen at the Sunrise Minimart |
| Block 118 | Five things happen at Block 118 |
| Court Side | Three things happen at the court |
| Kopitiam Regular | Three things happen at the corner kopitiam |
| Long Way Round | Have history in all six places |
| Sharp Eyes | Notice four things worth keeping |
| Made Something | Build a quest of your own |

Thresholds are set against what each place can actually hold (the void deck can
record twelve things, the bus stop four), so every one is a real visit rather
than a walk past.

### Rules

- **No randomness.** A test asserts the module cannot reach `Math.random`,
  `crypto` or a clock.
- **Legible before earned.** Locked stickers are drawn, named and carry their
  requirement. No silhouettes, no question marks.
- **No rarity, price, expiry or trade.** A test asserts none of those keys can
  appear on the type.
- **No progress bars.** The only standing shown is a phrase like "3 so far".
  A percentage turns "I have been to the court a few times" into "I am 60
  percent through the court".
- **Nothing for danger.** No sticker commemorates a crime spotted, a person
  reported or a threat avoided.

### The P0 rule survived

**The six props that pay nothing still pay nothing.** Sharp Eyes counts against
the set of props that were designed to leave something behind, not against the
raw `districtMoments` array, so the day somebody gives the cat a moment id the
worthless props still cannot start paying. That is structural rather than
incidental, and a test seeds a profile that has touched every worthless prop
and asserts it has earned nothing at all.

### Announced where it happens

Stickers derive, so there is no write to hang an announcement on. The world
watches the derived set and surfaces anything new in a live-region strip over
the map, while the player is still standing where they earned it. It does not
stop the world: they earned it doing something else.

### Pinning

One sticker can go next to your name on You. That is the whole of the
ownership, and deliberately the only version of a locker: the alternative was a
placement grid and a room to decorate, which is a different product.

---

## 8. Tracking

"Show me where" on a signature mission links to `/streets?track=<npcId>`.

- The world draws a ring and crosshair at the person's **live** position
  (`npcSpot`), so it stays correct for the people who relocate once their
  situation resolves.
- It is a **shape**, not a colour, because a colour difference on a
  four-pixel marker is not a difference.
- The name and place are printed in real text over the world, so nothing about
  tracking is map-only.
- It never expires on its own. A marker that disappears while somebody is
  walking towards it is worse than no marker.
- The parameter is read with `useSyncExternalStore`, which avoids both opting
  the route out of static rendering and setting state from an effect.

---

## 9. What was deliberately not built

| Not built | Why |
| --------- | --- |
| District 02 | Forbidden this pass, and the first district is not finished |
| Weather, day/night | Same, plus no product reason has been established |
| A "new since you left" badge | Requires inventing seen-state to manufacture urgency |
| A crew total | No backend, so every such number would be fabricated |
| A crew league table | Ranks friends by points in a product about peer norms |
| A second currency | One XP economy, decided again |
| A locker room to decorate | A room simulator is a different product |
| Rarity tiers | Sells uncertainty rather than the thing |
| Any daily mechanic | Return motivation has to be intrinsic |
| More avatar options | The set is adequate; the defect was that two rows sat below a fold, which was fixed instead |

---

## 10. Measurements

| | Before | After |
| - | ------ | ----- |
| Unit tests | 247 | 300 |
| End-to-end tests | 477 | 507 |
| Client JS | 1,762,334 bytes | about 1,784,000 bytes |
| New dependencies | | **none** |
| New profile fields | | two, both optional: `pinnedSticker`, `crewBanner` |

Everything added is derived from state the product already had, except those
two cosmetic preferences. Old profiles open unchanged.
