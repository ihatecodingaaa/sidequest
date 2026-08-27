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

## Rendering

Two stages, and the first one is what gives the look.

1. **Terrain is painted once** into an offscreen canvas at world resolution
   (640 x 448) and thereafter copied. A frame costs one camera-cropped blit plus
   a handful of entities.
2. **Everything draws into a small buffer** (320 x 232 world units) which is then
   blitted up with `imageSmoothingEnabled = false`.

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

## What the world deliberately does not have

| Not built | Why |
| --------- | --- |
| A second currency | One XP economy. A thing to farm turns the scenario into an obstacle. |
| Random drops, loot boxes, gacha | Youth product. Exploitative by construction. |
| A leaderboard | Demotivates exactly the people this is for. |
| Combat, chasing, arresting | SIDEQUEST is prevention. The hero action is noticing and redirecting. |
| Appearance signalling risk | The product does not profile people, so the world does not draw offenders. |
| Anything playful in Safe | Unchanged across four passes. |
| Audio | Deferred. See the research doc. |
| A bigger map | A sparse world feels empty and costs more to build. |
