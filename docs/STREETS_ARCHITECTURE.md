# SIDEQUEST Streets architecture

How the world is built, why it is built that way, and the rule that keeps it
from becoming a second product.

---

## The non-negotiable

**The game does not own product state.**

XP, mission completion, Echo unlocks, campaign progress and the Safety Passport
live in the existing Zustand store and stay canonical. The world reads that
state, asks the product to do things, and reflects what came back.

If Streets were deleted tomorrow, every piece of progression a player earned
through it would still be valid, because none of it was ever stored here.

That is enforced by having exactly one crossing point.

---

## The bridge

`src/features/streets/game/quest-bridge.ts` is the entire surface between the
world and SIDEQUEST. Nothing in `features/streets` reads or writes
`localStorage`, and nothing else in the app knows the world exists except the
Home entry.

| Function | What it does |
| -------- | ------------ |
| `equippedEcho` | Reads the equipped variant from the profile |
| `completedMissionIds`, `checksDone`, `xp` | Read-only projections of the profile |
| `isNpcDone(npc)` | Whether the linked experience is finished |
| `open(action)` | Routes to `/play/:id`, `/campaigns/:slug` or `/safe` |
| `completeCheck(id)` | Banks a Street Check through the existing XP engine |

Two action kinds are handled inside the world rather than by a route change:
`check` and `info` open in the dialogue sheet, and `rewards` opens the counter,
which calls the store's existing `claimReward` untouched. **XP is a threshold,
not a balance.** Claiming deducts nothing, so the counter is a place to stand
rather than a second economy. A spendable currency would have made every
scenario an obstacle in front of a number, which is the one thing this product
cannot afford.

**Street Checks keep their own ledger** (`profile.streetChecksDone`) and run
through the same `awardMission` in `src/lib/xp.ts` that every other experience
uses. That is the precedent the Campaign already set with `awardedKeys`, and it
buys two things: the once-only rule is inherited rather than reimplemented, and
a ten-second street encounter does not inflate "played N missions" on You.

---

## Engine: measured, not assumed

The brief named Phaser as the leading candidate and asked for it to be
verified. It was, by building it rather than reasoning about it.

**Phaser 4.2.1, installed and integrated on a `/streets-spike` route:**

| Measurement | Result |
| ----------- | ------ |
| Builds under Next 16.3.2 + Turbopack | Yes, 3.4s |
| SSR / hydration failure | None |
| Console errors | None |
| Canvas renders, keyboard input works | Yes |
| Code splits into its own chunk | Yes, 1,369,980 bytes |
| Loaded on Home | No. Home stayed at 190 KB |
| `phaser.min.js` | **1343 KB raw, 347 KB gzipped** |

Phaser is **technically suitable**. This was never a "could not make it work"
rejection.

**The original renderer, measured the same way:**

| Measurement | Result |
| ----------- | ------ |
| World renderer chunk on `/streets` | **8 KB** |
| Loaded on Home, Safe, Updates | **Not loaded**, verified by scanning response bodies |
| Whole app, before Streets | 1660 KB across 37 chunks |
| Whole app, with the entire district | 1733 KB across 41 chunks |

**+73 KB for the whole feature** versus **+1338 KB for the engine alone.**

The district needs a code-generated tile grid, a four-direction sprite, AABB
against a static grid, a clamped follow camera, and proximity. That is roughly
20% of Phaser's surface, and the parts that would justify the weight are the
parts this design does not use: no tilemap file (the map is generated), no
physics beyond grid AABB, no particle system, no scene graph beyond one scene,
no asset loader because everything is drawn at runtime.

Two further considerations pointed the same way. This product is deployed at
roadshows on venue wifi, which is written into `CLAUDE.md` and
`docs/CAMPAIGN_DEPLOYMENT.md`, and a 347 KB gzip stall between "tap Explore"
and "see the world" is a real cost there. And canvas is inaccessible either way,
so the DOM overlay and the Quest List had to be hand-built regardless: Phaser
does not help with the hardest requirement in the brief.

Phaser was uninstalled once the custom path was proven. The spike is in the
commit history.

---

## Maps

The district and the three interiors are the same shape of thing: a `WorldMap`
with rows, dimensions, doors, a surround colour and a tint. Entering a shop
swaps the map and repaints. **Nothing else changes**: movement, collision,
dialogue, proximity and the camera have one code path each.

| | |
| - | - |
| Doors | Derived from the landmarks that declare an `interiorId`, so a door can never point at a building that is not there |
| Interior cast | Ordinary NPCs with a `mapId`, so a self checkout and a neighbour are the same thing to the engine, the dialogue overlay and the Quest List |
| Terrain | Cached per map, so stepping back outside is instant |
| Interact | One button. Whichever of the nearest person and the nearest doorway is closer wins |
| Residents | Ambient people on authored loops. No quest, no signal, no dialogue, and they pause when the player comes close |
| Signals | Derived from progress every render and pushed into the engine. The engine draws what it is told and owns none of it |

## Rendering

Two stages, and the first one is what gives the look.

1. **Terrain is painted once per map** into an offscreen canvas at world
   resolution and thereafter copied. A frame costs one camera-cropped blit plus
   a handful of entities.
2. **Everything draws into a buffer** at world resolution, blitted up with
   `imageSmoothingEnabled = false`.

### Leaving, and coming back

Streets is not a destination, it is a place people leave and return to. Two
pieces make that work, and both were added after a real device showed the loop
breaking at the last step.

**Origin aware return.** A mission opened from the world is tagged
`?from=streets`. `src/lib/experience-origin.ts` resolves that **key** through a
table in code, so nothing from the URL is ever navigated to and an unrecognised
value falls back exactly as a missing one does. Every player already went
through `useStandaloneHost`, so one change covered all of them, and the default
is the old behaviour, which is what keeps the missions and direct-link paths
working untouched. Campaigns are unaffected: they pass their own `MissionHost`,
which is the same idea one layer up.

Close and finish are **different destinations**. Abandoning halfway goes back
to where you were; completing goes on. For a direct visit those have always
differed, and collapsing them into one field quietly changed it until a test
caught it.

**Position.** `src/features/streets/game/streets-return.ts` records the map,
tile and facing in `sessionStorage` on every tile the player crosses. It is
transient by design: where somebody was standing is not progress, and restoring
it on a device picked up a week later would be wrong. The engine's `restore`
refuses a map that no longer exists or a tile that is no longer standable, so a
stale record from an earlier build can never strand anybody in a wall.

### The camera picks a scale, not a rectangle

The buffer is not a fixed size. Its scale comes from the shorter side of the
container, clamped, then raised far enough to cover a small map, then capped so
a room never over-zooms. A person is therefore the same physical size on screen
in both orientations, and turning the phone widens the view rather than
resizing anybody.

An earlier version held the visible area constant. That collapses on a very
tall container: the height clamps, the width shrinks to compensate, and a
portrait phone ends up looking through a nine tile slot.

### One measurement, three consumers

The world container, the camera and the HUD all need the same numbers, and
every time they worked them out separately they eventually disagreed.
`useStreetsLayout` observes the element that holds the world and produces one
`ViewportMetrics`. The layout mode, the compact tier and the engine's resize
all read that object.

The root's height is CSS (`100dvh`), never JavaScript. A value read from an
event can be stale and one of them was: reading `visualViewport.height` inside
`orientationchange` captures the pre-rotation height, and portrait stayed
compressed until a refresh. A `ResizeObserver` is self-correcting where an
event listener is not, which is why there is no timer in any of this.

That second stage is what produces a crisp low-resolution look from vector
drawing commands: no sprite sheet to author, no image to download, no licence to
check, and it scales to any viewport without an asset pipeline.

Entities are depth-sorted by world Y each frame, so nearer things overlap
further ones.

### Why the sprite is layered at draw time

Four directions times five skin tones times five hair colours times four hair
styles times six tops is 2400 frames if anything is pre-rendered. Nothing is:
`drawPerson` composes legs, torso, arms, head and a hair silhouette from
primitives, and the avatar system stays free.

### Collision

Axis-separated. Horizontal and vertical movement are resolved independently, so
brushing a wall slides along it instead of stopping dead. Getting stuck on a
corner is the most common way a walking interface turns hostile, and this world
is for exploring rather than for testing anybody's dexterity. Corridors are three
tiles wide throughout, and the collision box is deliberately narrower than the
sprite.

---

## Route splitting

```
/streets  ->  StreetsEntry (client)
              -> dynamic(StreetsClient, { ssr: false })
                 -> await import("./game/world-engine")   <- 8 KB, on demand
```

Two levels of dynamic import. The outer one keeps the world's React components
out of the shared bundle; the inner one keeps the renderer out until a canvas
actually exists. Verified by scanning response bodies for a symbol unique to the
renderer: absent on `/`, `/safe` and `/pulse`, present only on `/streets`.

---

## Accessibility model

A `<canvas>` exposes no semantics. Anything drawn inside it is invisible to a
screen reader, unreachable by keyboard focus, and unaffected by text sizing.

**The world can be a canvas. The product cannot be.**

| Concern | How it is handled |
| ------- | ----------------- |
| Reading | All dialogue is DOM, in a focused `role="dialog"` with a live region |
| Alternative route | The **Quest List** lists every destination with its state and opens the same experiences, without walking a step |
| Interiors | Listed under their building, not hidden behind a door. A room whose contents could only be reached by walking into it would put the shop floor check out of reach of exactly the people this rule exists for |
| Arrival | "Go there" lands on a standable tile beside the person, inside talking range. Arriving and being told nobody is nearby is not an answer to "take me to this person" |
| Minimap | Decorative. Every marker it draws is also a row in the list, and its accessible name says where you are in words |
| Keyboard | Arrows and WASD move, Enter / Space / E interact, Escape closes |
| Touch | A thumb pad with a dead zone, and a 44px+ interact button |
| Focus theft | Key handling bails out when the event target is a control |
| Motion | Reduced motion stops the marker bob and Echo's float; nothing is carried by animation |
| State | NPC state is never colour-only: markers pair with text in the list |

The Quest List is a **peer of the map**, not a hidden fallback. A prevention
product must never gate its learning behind dexterity.

---

## Testing a canvas

Nothing is asserted against pixels. Outcomes are read through the DOM HUD, the
dialogue overlay, the Quest List and the store.

The one concession is `data-player-tile` on the canvas element, written only
when the tile actually changes. A canvas cannot be asked where anybody is, and
this is the disciplined alternative to screenshot diffing. It also caught a real
bug during development: movement looked broken and the attribute showed the
player walking straight past the person the test was waiting for.

---

## Prevention Signals

A Signal marks a **situation**. The mode names the response it needs, not how
serious it is, and it is drawn near whoever raises it because that is where the
situation is.

**There is no risk field on a person anywhere in this codebase.**
`tests/unit/integrity.test.ts` fails the build if `riskLevel`, `riskScore`,
`suspicionScore`, `dangerScore`, `threatLevel` or `criminality` appears in
`src/`. That is a structural guarantee rather than a convention, because a
product that hangs a colour off a person's identifier teaches, through
thousands of repetitions, that people carry a risk colour.

Signals are **derived, never stored**: a resolved situation cannot leave a
marker behind and a marker cannot exist without a situation to belong to. Two
sources feed them, and neither is a person:

1. A standing encounter, until its linked experience is finished.
2. The currently available step of a Prevention Thread, which is what makes a
   marker travel through a story rather than sit on somebody's head.

Four redundant channels, because colour alone would fail one man in twelve and
WCAG 1.4.1 outright: colour and silhouette on the canvas, label and accessible
name in the DOM.

## Prevention Threads

Three to five steps across more than one person and more than one place, where
different people know different things.

| | |
| - | - |
| Ledger | `profile.threadSteps`, keys of `threadId:stepId`, through the same `awardMission` engine as everything else |
| Availability | A step opens when every **required** step before it is banked, so an optional trusted adult and the next required step open together. That is the branch |
| Missions | A `hero-mission` step hands off to the existing player and resumes on return. Nothing is reimplemented |
| XP | Banded by length and structure. `signalMode` never enters the calculation |

### The step is latched when a conversation opens

Banking a step is exactly what makes it stop being available. Reading it live
meant the panel showing the outcome, the XP and the way out was destroyed by
the action that produced them: the sheet snapped back to idle lines the instant
somebody chose something. The conversation belongs to the step it opened with,
and closing the sheet is what ends it.

## District Memory

What the block remembers about you, filed by place. Full spec in
`docs/DISTRICT_MEMORY_SPEC.md`; the architecture-relevant part is where the
state lives.

| | |
| - | - |
| Module | `district-memory.ts`, pure functions over a `UserProfile` |
| New state | **One field: `profile.metNpcs`.** Everything else is derived |
| Derived from | `completedMissionIds`, `streetChecksDone`, `threadSteps`, `districtMoments`, `questDrafts`, `submissions`, `crewId`, `rewardClaims`, `campaigns` |
| Read in the world | The place label becomes a control with a count, opening `HistorySheet` |
| Read on You | `DistrictMemories`, grouped by landmark |
| Pays | Nothing. No XP, no unlock, no cosmetic, ever |

**Why derived and not logged.** A stored event log is a second source of truth
for facts that already have one, and when the two disagree the district is
lying about the player's own life. A derivation cannot drift, cannot
double-count, needs no migration, and is correct for profiles written before it
existed. The cost is that there is no chronology, because nothing records when;
that was accepted, and neither surface implies a timeline.

**Where you can be.** Interiors resolve through the door you came in by.
Outdoors it is the nearest landmark within five tiles, which exists because the
court and the bus stop have no interior and their memory was otherwise
reachable from nowhere.

## Things that pay nothing

Six props (`prop-cat`, `prop-mural`, `prop-bike`, `prop-hoop`, `prop-vending`,
`prop-bell`) carry no discovery, no factor and no reward of any kind. Three of
them offer two or three harmless choices through `WorldProp.choices`, rendered
with the same `ChoiceCards` a mission uses, resolved in component state and
persisted nowhere.

One choice mechanic, not three minigames: a vending machine, a basketball and a
bicycle bell are the same interaction wearing different clothes, and three
bespoke implementations would be three accessibility surfaces for an experience
a player would not distinguish.

`tests/unit/useless-fun.test.ts` fails the build if a prop with choices ever
gains a discovery, which is the one combination that would quietly reintroduce
payment.

## What the world deliberately does not have

| Not built | Why |
| --------- | --- |
| A second currency | One XP economy. A thing to farm turns the scenario into an obstacle. |
| Spendable XP | Same reason, decided again when the rewards counter was built. |
| A second district | The first is not finished. Breadth before polish is how a vertical slice becomes a demo. |
| Random drops, loot boxes, gacha | Youth product. Exploitative by construction. |
| A leaderboard | Demotivates exactly the people this is for. |
| Combat, chasing, arresting | SIDEQUEST is prevention. The hero action is noticing and redirecting. |
| Appearance signalling risk | The product does not profile people, so the world does not draw offenders. |
| Anything playful in Safe | Unchanged across five passes. |
| A risk score on anybody | The product does not profile people, so nothing in it can represent the idea. |
| Severity tiers on signals | A severity scale makes the worst thing on the map the most interesting thing on it. |
| Randomly spawning signals | Every one is authored. A farmable red teaches people to walk towards danger. |
| Police roleplay, ranks, case files | The Crew has roles and no powers. |
| A stored memory log | District Memory derives from existing state. A second source of truth can disagree with the first. |
| A memory timeline | Nothing records when anything happened, and inventing a clock to display would be state that exists only to be shown. |
| XP for ambient interaction | Paying for the parts somebody already finds interesting is the exact case the undermining evidence covers. |
| A bigger map | A sparse world feels empty and costs more to build. |
