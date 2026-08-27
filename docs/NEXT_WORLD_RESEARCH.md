# Next world research and scope decision

Research and scope for the pass that upgraded District 01's graphics, added
landscape play, a minimap, enterable interiors and in-world redemption.

Conducted 27 August 2026 against commit `3d5f078`.

Format: question, finding, confidence, consequence. Confidence is **High**
(verified or primary), **Medium** (transferred or reasoned), **Low** (judgement,
argue with it).

---

## 1. The economy question, answered by reading the code first

**Question.** The brief asks for in-world redemption and raises whether XP
should be spendable, or whether a second token should exist.

**Finding.** SIDEQUEST already has the healthy model and nobody wrote it down.
`claimReward` in `src/store/app-store.ts` checks `profile.xp < reward.xpCost`
and, on success, records a claim **without deducting anything**. XP is a
threshold, not a balance. The comment in the store is explicit: *"Claiming
records recognition. It never spends XP."*

**Consequence.** **No second currency, and XP stays unspendable.** This is the
strongest design decision available and it is a decision to build nothing.

Adding a spendable token would introduce the exact failure the reward
literature warns about: once there is a balance, the scenario becomes the
obstacle between the player and the number, and a player facing a choice starts
optimising for payout rather than rehearsing a decision. A threshold model has
no such pressure. Nothing is ever lost by claiming, so there is no save-versus-
spend tension, no grind incentive, and no reason to replay a mission for
currency (replays already pay nothing).

So the kiosk in the world is an **experiential shell over the same logic**, not
a shop. Walking to a counter to claim something you already qualify for is more
memorable than tapping a row on a profile page, and it changes nothing about
what is granted or how.

**Confidence.** High. Verified in the code, and consistent with the existing
"no fake partnerships, no monetary value" rules.

---

## 2. Serious games: what the world is allowed to claim

**Finding, carried forward.** Wouters et al. (2013, *J. Ed. Psych.* 105(2):
249-265) report a learning effect of d = 0.29, **no** motivational advantage,
and three moderators: supplementing other instruction, multiple sessions, and
group play.

**Consequence for this pass.** The graphics upgrade does not make anybody learn
more. It makes them more likely to arrive. That is worth doing and it is a
different claim, and this document will not confuse the two. Interiors must
therefore attach to things that already exist (missions, Safe, rewards, crew)
rather than becoming content of their own.

**Confidence.** High.

---

## 3. Dual orientation

**Question.** What actually has to change between portrait and landscape?

**Finding.** Not the world. The camera aspect and the control layout. In
portrait the phone is held one-handed and the pad must sit under the thumb; in
landscape both thumbs are at the edges and the middle is dead space, which is
where the world should be and where no control should ever sit.

The failure mode to avoid is a single layout stretched: a portrait pad centred
at the bottom of a landscape screen is unreachable, and a landscape camera
letterboxed into portrait wastes the screen.

**Consequence.** The engine takes its viewport dimensions from the container
rather than from a constant, so the camera reframes rather than scales. Controls
move to the outer edges in landscape, with the pad left and interact right. The
HUD compacts. State and interaction are identical in both.

**Confidence.** High for the layout reasoning. Medium for the specific
breakpoint, which is an aspect-ratio test rather than a width test because a
landscape phone and a portrait tablet are similar widths and want opposite
layouts.

---

## 4. Minimaps and orientation

**Question.** Does a minimap help, or is it developer furniture?

**Finding.** The specific problem observed in the last pass is that a player
can walk past somebody and not know the district continues. A minimap solves
one thing precisely: *what is out there and where am I in it*. It does not solve
*what should I do*, which is the Quest List's job.

The risk is the debug-panel look: a grey rectangle with dots, dense and joyless.

**Consequence.** The minimap draws the real terrain silhouette, landmark dots
in their own sign colours, a pulse on anybody with something available, and the
player. It is small, cornered, and it is never the only way to know something:
every marker it shows is also a row in the Quest List with text.

**Confidence.** Medium-high.

---

## 5. Interiors

**Question.** Do enterable buildings earn their cost?

**Finding.** Only if each has a job that could not be done as well outside. A
room the player walks into and out of is worse than a door that opens a screen.

**Consequence.** Three interiors, each with a job that is genuinely spatial:

| Interior | Job |
| -------- | --- |
| Sunrise Minimart | The self-checkout REWIND and BREAKSAFE both talk about, standing in it |
| Community Post | The calm door to Safe, and the one place the world stops being playful |
| Rewards counter | In-world redemption, at a counter, from a person |

The court stays exterior: its job is group play, which happens fine in the open.

**Changed during the build.** This document originally kept the kopitiam
exterior too and left the rewards counter without an address. Giving it one
meant either inventing a fourth block or putting it somewhere real, and the
corner shop honouring a neighbourhood offer is the most truthful version of
what "participating merchant" would actually mean. So the kopitiam opened, and
the counter is inside it.

**Confidence.** Medium. This is a judgement about which spaces feel worth
entering, and it is the part of the pass most worth arguing with.

---

## 6. Institutional colour, checked again

**Finding.** Re-verified. `police.gov.sg` presents blue, grey and white and
publishes **no hex values and no brand usage rules** publicly. `nyc.gov.sg`
serves its mark as an RGB PNG and publishes **no hex values and no logo usage
rules** on its homepage.

**Consequence.** Unchanged and restated because this pass adds more colour:
palette entries are **SIDEQUEST-owned and institution-inspired**, never called
official. No crest, uniform, chevron, logo or wordmark. No copy implies
endorsement, partnership or "powered by". Civic blue is used most strongly at
the Community Post, because trust matters at that door, and it is a colour
rather than a badge.

**Confidence.** High.

---

## 7. Track B, expressed in the product rather than the pitch

**Question.** The brief asks for judging fit to be visible in the product.

**Finding.** Most of the criteria were already met by the missions but were
invisible from the world: a judge walking around could not see that the thing
scales to a school or a roadshow.

**Consequence.** The district gains a **notice board** at the bus stop carrying
what the neighbourhood is working on this week, and the Rewards counter names
participating-merchant offers as *potential* partners in the existing honest
language. Both are surfaces a judge can look at and imagine a deployment
without reading a document. Neither invents a partner or an endorsement.

**Confidence.** Medium.

---

## Scope decision

Eleven things were requested at P0. Shipping eleven shallow systems would be a
worse product than shipping six good ones, so:

### P0, built this pass

1. **Graphics overhaul.** Depth, shading, outlines, richer terrain, real
   building fronts, better sprites, environmental density.
2. **Landscape as a first-class orientation.**
3. **Minimap.**
4. **Three interiors** with distinct jobs.
5. **In-world redemption** at a counter, over the existing reward logic.
6. **Customisation expansion**, visible in the world.
7. **Text compression** on the world's own surfaces.

### P1, built if P0 stayed green

- Ambient life and richer street furniture.
- Quest routing from the list into the world.

### Changed by contact with the build

Two decisions in this document were wrong and were corrected while building.
Both are recorded rather than quietly amended, because the reasoning is the
useful part.

**The camera framing.** Section 3 said the engine should take its viewport from
the container, which was right, but the first implementation held the visible
*area* constant. That works until the container is very tall: the height hits
its clamp, the width collapses to compensate, and a portrait phone ends up
looking through a nine tile slot. The rule that survived both orientations is
to pick a **scale** from the shorter side and let the viewport decide how much
world fits.

**The interior proportions.** The rooms were first built 18 wide by 12 deep.
A room that shape cannot be shown well on a portrait phone: filling the height
of a 0.59 aspect viewport with a 12 tile deep room shows about seven tiles
across whatever its width is, so the choice is between cropping it and framing
it in a wide band of nothing. Rooms became 14 wide by 18 deep, which faces the
same way the screen does, and a shop with aisles running front to back is what
a shop looks like anyway.

### P2, deliberately not built

| Deferred | Why |
| -------- | --- |
| A second district | The first is not finished. Breadth before polish is how a vertical slice becomes a demo. |
| Mementos and a second collectible layer | Echo already carries identity. A second collection dilutes it. |
| Audio | Silence beats bad sound, and the reading load argument from earlier passes still stands. |
| Emotes and companion behaviours | Fun, and pure scope. |
| A spendable currency | Section 1. Building it would make the product worse. |

---

## What this pass must not break

Carried from previous passes and re-checked at the end:

- The world owns no product state. One bridge.
- The Quest List stays a peer of the map, not a fallback.
- All dialogue stays DOM.
- Safe stays calm: no Echo, no XP, no playfulness, one red element.
- No NPC signals criminality by appearance. No police roleplay.
- All art drawn in code. No third-party asset enters the repository.
