# SIDEQUEST Streets research

Research for the explorable district. Conducted 27 August 2026 against the
build at commit `11880de`.

Structure per entry: question, evidence, SIDEQUEST implication, decision,
confidence. Confidence is **High** (primary source, directly on point),
**Medium** (good evidence transferred across a gap), or **Low** (judgement,
argue with it).

---

## A. Do serious games actually teach anything?

**Question.** The premise of Streets is that wrapping SIDEQUEST's missions in
an explorable world makes them more effective, or at least more likely to be
played. Is that supported, or is it the thing everybody assumes?

**Evidence.** Wouters P, van Nimwegen C, van Oostendorp H, van der Spek E, "A
meta-analysis of the cognitive and motivational effects of serious games",
*Journal of Educational Psychology* 105(2) (2013), 249-265,
doi:10.1037/a0031311. From the abstract, verbatim:

> "It is assumed that serious games influences learning in 2 ways, by changing
> cognitive processes and by affecting motivation. However, until now research
> has shown little evidence for these assumptions. [...] serious games were
> found to be more effective in terms of learning (d = 0.29) than conventional
> instruction methods. Additional moderator analyses on the learning effects
> revealed that learners in serious games learned more, relative to those
> taught with conventional instruction methods, **when the game was supplemented
> with other instruction methods, when multiple training sessions were involved,
> and when players worked in groups**."

Two things matter here and the second is the more useful one.

The learning effect is real but **small**: d = 0.29 across 77 comparisons. The
abstract opens by saying research had shown "little evidence" for the
assumptions, and the effect it then reports is on **learning**. It reports no
corresponding motivational advantage. So "games make learning fun" is exactly
the claim this paper declines to support, and this document will not make it.

The moderators are the actionable part, and all three are things SIDEQUEST can
either do or fail to do.

**SIDEQUEST implication.** Streets should not replace the missions. That would
strip out the "supplemented with other instruction methods" moderator, which is
the one the meta-analysis found strengthens the effect. The world should be a
**wrapper and a reason to arrive**, with the existing REWIND, Norm Mirror,
BREAKSAFE and Crew Shift experiences intact behind it.

**Decision.** Three design commitments follow directly:

| Moderator | What Streets does |
| --------- | ----------------- |
| Supplemented with other instruction | NPCs open the **existing** missions and debriefs. Nothing is rewritten inside the world. |
| Multiple training sessions | The world persists progress, the Campaign follow-ups already unlock on a delay, and NPCs change state so returning is visibly different. |
| Players worked in groups | Crew Shift stays the pass-the-phone group mechanic and gets a landmark in the world. |

**Confidence.** High for the finding. Medium for the transfer: the meta-analysis
covers instructional games broadly, not crime-prevention rehearsal for
teenagers.

---

## B. Self-determination theory, mapped concretely

**Question.** Where do autonomy, competence and relatedness actually live in a
walkable district, rather than as three words in a doc?

**Evidence.** Ryan and Deci's framework, used in the two previous passes.
Conditions supporting autonomy, competence and relatedness foster the more
volitional forms of motivation.

**SIDEQUEST implication.** Each need has to be attached to a specific mechanic,
or this is decoration.

**Decision.**

| Need | Where it lives in Streets |
| ---- | ------------------------- |
| Autonomy | Free movement, no forced route, NPC order is the player's, avatar is chosen, Echo is chosen, Street Checks are optional, and the Quest List means walking itself is optional |
| Competence | The world visibly changes as you finish things: markers clear, NPCs say something different, the quest count moves. Feedback is spatial, not a number going up |
| Relatedness | Recurring cast, Crew Shift's landmark, and NPCs who refer to what you did |

**Confidence.** Medium-high. The framework is well established; the mapping is
mine.

---

## C. Avatar customisation

**Question.** How much customisation is worth building?

**Evidence.** Birk, Atkins, Bowey and Mandryk, "Fostering Intrinsic Motivation
through Avatar Identification in Digital Games", *CHI 2016*, 2982-2995,
doi:10.1145/2858036.2858062. The effect runs through **identification**, not
through the number of options.

**SIDEQUEST implication.** A large editor is not where the value is, and it
costs asset explosion in a sprite-based world where every option has to work in
four walking directions.

**Decision.** Four axes, small sets each, layered at runtime rather than
pre-rendered: skin tone, hair silhouette, top colour, and a small accessory
set. Randomise and Skip both present. Nothing labelled by gender. Under thirty
seconds. This is deliberately the same reasoning that kept the Echo collection
at five variants.

**Confidence.** Medium-high.

---

## D. Rewards, and the shape of the XP economy

**Question.** The world creates many more small completion moments than the
current app. Does XP need to change?

**Evidence.** Mekler, Brühlmann, Opwis and Tuch, "Do points, levels and
leaderboards harm intrinsic motivation?", *Gamification 2013*, 66-73,
doi:10.1145/2583008.2583017. The relevant distinction is informational versus
controlling reward: feedback that tells you how you are doing supports
competence, whereas rewards that become the reason for acting crowd out the
activity.

**SIDEQUEST implication.** More completion moments is fine. A second currency
is not: it would turn a rehearsal environment into an economy, and the moment
there is a thing to farm, the scenario becomes an obstacle between the player
and the number.

**Decision.** One currency, the existing XP, granted once per experience
exactly as now. **No** Street Coins, energy, lives, stamina, gems, streak
multipliers or daily bonuses. Street Checks grant XP once and replays grant
nothing, reusing the existing idempotent award ledger rather than a parallel
one.

**Confidence.** High.

---

## E. Leaderboards inside the world

**Question.** The Crew leaderboard exists. Should Streets surface it?

**Evidence.** Same paper. Comparative displays motivate some people and
demotivate those who read themselves as losing, and the effect is not uniform.

**SIDEQUEST implication.** A district built to make somebody feel able to
intervene is the wrong place to tell them they are fourth.

**Decision.** No leaderboard in Streets. The world communicates *my progress*
and *my crew*, never ranking. The existing Crew screen keeps its leaderboard
unchanged; it is not expanded here.

**Confidence.** Medium-high.

---

## F. Youth UX and the first thirty seconds

**Question.** How much instruction does an explorable world need?

**Evidence.** Carried from `docs/GAME_FEEL_RESEARCH.md`: the honest frame is
extraneous cognitive load, which is "generated by the manner in which
information is presented to learners and is under the control of instructional
designers". This document does not use the eight-second attention span claim,
which has no traceable peer-reviewed origin and is the wrong diagnosis anyway.

A top-down world has one advantage a screen of cards does not: **the affordance
is the world**. A visible marker on a nearby character teaches "go there" with
no words at all.

**SIDEQUEST implication.** No tutorial sequence. Spawn the player next to
something worth walking to, and let the first interaction teach the second.

**Decision.** One line of on-screen guidance on first spawn, which disappears
after the first move. The nearest NPC is within a few seconds' walk and carries
a visible marker. Help lives in the pause panel for anybody who wants it.

**Confidence.** Medium-high.

---

## G. Engine choice: measured, not assumed

**Question.** Phaser is the named candidate. Is it the right one for *this*
repository?

**Evidence.** I built the spike rather than reasoning about it. Phaser 4.2.1,
installed and integrated behind a dynamic import on a `/streets-spike` route.

| Measurement | Result |
| ----------- | ------ |
| Builds under Next 16.3.2 with Turbopack | Yes, compiled in 3.4s |
| SSR or hydration failure | None |
| Console errors | None |
| Canvas renders and input works | Yes, 640x480, keyboard movement working |
| Code splits into its own chunk | Yes, 1,369,980 bytes |
| Requested on Home | **No.** Home stayed at 190 KB of JS |
| `phaser.min.js` | **1343 KB raw, 347 KB gzipped** |

So Phaser is **technically suitable**. This is not a "could not make it work"
rejection, and the spike is preserved in the commit history.

The problem is proportion. For comparison, **the entire existing SIDEQUEST
application across all routes is 1660 KB raw**. Phaser alone is 81% of that, to
deliver a walking simulator with eight NPCs.

What the district actually needs: draw a code-generated tile grid, animate a
four-direction sprite, test axis-aligned boxes against a static grid, follow and
clamp a camera, detect proximity, read keyboard and touch. That is roughly 20%
of Phaser's surface. The parts that would justify the weight are the parts this
design does not use: there is no tilemap file to load because the map is
generated in code, no physics beyond grid AABB, no particle system, no scene
graph beyond one scene, and no asset loader because every asset is drawn at
runtime.

Two further considerations point the same way. This product's deployment story
is a roadshow on venue wifi, which is written into `CLAUDE.md` and
`docs/CAMPAIGN_DEPLOYMENT.md`; a 347 KB gzip stall between "tap Explore" and
"see the world" is a real cost there. And canvas is inaccessible either way, so
the DOM dialogue overlay and the Quest List fallback have to be built by hand
regardless. Phaser does not help with the hardest requirement in the brief.

**Decision.** Build an original renderer. It is measured against the same spike
harness later in this document, and Phaser is uninstalled once the custom path
is proven. If the custom renderer had failed, Phaser was ready and working.

**Confidence.** High on the measurements. Medium on the judgement, which is a
trade of development risk against payload, and a reasonable person optimising
for build speed rather than payload would choose differently.

---

## H. Canvas accessibility

**Question.** A canvas is opaque to assistive technology. How does a
learning product ship one?

**Evidence.** A `<canvas>` exposes no semantics. Whatever is drawn inside it is
invisible to a screen reader, unreachable by keyboard focus, and unaffected by
text sizing.

**SIDEQUEST implication.** The world can be canvas. **The product cannot be.**
Every experience reachable by walking must be reachable without walking, or the
learning is gated behind dexterity, which is the one thing a prevention product
cannot do.

**Decision.** Three commitments.

1. **Dialogue is DOM**, not canvas text. It gets real focus management, real
   text rendering, and works with a screen reader.
2. **A Quest List** lists every destination in the district with its state and
   opens the same experiences. It is a peer of the map, not a hidden fallback.
3. **Keyboard parity**: arrows or WASD to move, Enter or Space or E to
   interact, Escape to pause.

**Confidence.** High.

---

## I. Singapore identity without impersonation

**Question.** How much institutional visual DNA can SIDEQUEST borrow?

**Evidence.** I checked both sources directly rather than assuming.

`police.gov.sg` renders a blue, grey and white interface. It publishes **no hex
values** and **no brand usage guidelines** on the public site.

`nyc.gov.sg` serves its mark as `NYC_2025_Logo_RGB.png` and likewise publishes
**no hex values** and **no logo usage rules** on the homepage.

**SIDEQUEST implication.** Two conclusions, and the second is the important one.

Any hex value I state as "official" would be invented, because neither
organisation publishes one where I could check it. Sampling a logo and calling
the result an official colour would be a fabrication dressed as diligence.

And an absence of published usage rules is not permission. It is an absence.

**Decision.** Colours are **SIDEQUEST-owned and institution-inspired**, named as
such in the palette and in `docs/STREETS_ART_DIRECTION.md`. No crest, no
uniform, no chevron, no logo, no wordmark from either organisation. No copy
anywhere claims or implies endorsement, partnership, official status or
"powered by". Police red stays reserved for urgency and never becomes a generic
call-to-action colour, which also preserves the existing rule that exactly one
element on Safe is red.

**Confidence.** High.

---

## J. What must never appear in the world

Recorded as design law rather than preference.

| Never | Why |
| ----- | --- |
| Appearance signalling criminality: hoodies, skin tone, "shifty" NPCs | The product's first rule is that it does not profile people. A world that draws offenders is a world that teaches profiling. |
| Police roleplay, chasing, arresting, combat | SIDEQUEST is prevention. The hero action is noticing, pausing, redirecting, verifying, redesigning. |
| Loot boxes, gacha, random drops, paid companions | Youth product. Exploitative by construction. |
| A second currency | Section D. |
| Leaderboards in the world | Section E. |
| Echo, XP, music or playfulness inside Safe | Unchanged from three previous passes. |
| Any real map, address or property layout | Fictional district inspired by everyday Singapore. |
| "Spot the deepfake by looking at it" | Current guidance is that sophisticated fabricated media can be hard to identify visually. Teaching people to trust their eye builds false confidence. Street Checks teach verifying the *request*. |

---

## Decisions this research argued against

| Idea | Why |
| ---- | --- |
| Phaser | Technically fine and proven working. 347 KB gzip for roughly 20% use, in a product deployed on venue wifi. Section G. |
| Rebuilding missions inside the world | Removes the strongest moderator in the meta-analysis. Section A. |
| A large avatar editor | Identification carries the effect, not option count, and every option costs four sprite directions. Section C. |
| Street currency or energy | One currency. Section D. |
| Leaderboard in the district | Demotivates exactly the people the product is for. Section E. |
| A tutorial sequence | The world is the affordance. Section F. |
| Claiming official SPF or NYC colours | Neither publishes them. Section I. |
| A large map | Sparse worlds feel empty and cost more to build. A player should meet something within seconds. |
