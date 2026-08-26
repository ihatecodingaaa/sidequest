# Signature experience research

Focused research for the upgrade pass that unified SIDEQUEST's reveal moments,
made peer influence visible in Crew Shift, standardised provenance, and added a
post-value install invitation.

Conducted 26 August 2026 against the build at commit `568c095`.

This document does not repeat `docs/UX_RESEARCH.md`. It covers only the
questions this pass had to answer. Every entry states a question, the evidence,
what it implies for SIDEQUEST, the decision taken, and how confident that
decision is.

Confidence is one of:

- **High**: primary source, directly on point, decision follows with little interpretation.
- **Medium**: good evidence, but transferred across a gap (different population, different task, or a design judgement layered on top).
- **Low**: reasoned position, thin or absent direct evidence. Flagged so it can be argued with.

---

## A. Comparison and feedback interfaces

### A1. How should a two-state comparison be encoded?

**Question.** Crew Shift, REWIND, Norm Mirror and BREAKSAFE all show a
before state and an after state. What visual encoding lets someone read the
difference fastest?

**Evidence.** Cleveland and McGill, "Graphical Perception: Theory,
Experimentation, and Application to the Development of Graphical Methods",
*Journal of the American Statistical Association* 79 (1984), 531-554,
doi:10.1080/01621459.1984.10478080. Their ranked list of elementary perceptual
tasks puts **position along a common scale** at the top for accuracy, followed
by position along non-aligned scales, then length, then angle, then area. Area
and colour saturation rank near the bottom.

**SIDEQUEST implication.** Four crew answers must not be a pie, a donut, a
bubble or a heat tint. They should be bars sharing one baseline and one scale,
and the before and after states should use the *same* baseline so the eye can
travel vertically between them.

**Decision.** `ShiftReveal` stacks the before block above the after block with
a shared left-aligned baseline and identical row order. Row order is fixed by
the option order in the data, never re-sorted by count, so a row that moves is
the only thing that moves.

**Confidence.** High.

### A2. Should the change be animated?

**Question.** Does animating the transition help comprehension, or is it decoration?

**Evidence.** The previous pass already established the reduced-motion
requirement (see `docs/UX_RESEARCH.md`). The relevant addition here is that
Cleveland and McGill's ranking is about *static* readability: an encoding that
needs motion to be legible has failed before the motion starts.

**SIDEQUEST implication.** Motion may draw attention to what changed. It must
never be the only thing that communicates the change.

**Decision.** Before and after are both permanently on screen. Nothing is
revealed by animation; nothing is hidden without it. The single transition is a
one-shot width change on the after bars, disabled under
`prefers-reduced-motion`, after which the display is identical either way. A
test asserts the numbers are present with motion disabled.

**Confidence.** High.

### A3. Should a comparison be scored?

**Question.** REWIND's two runs and Crew Shift's two rounds invite a score.
Should either produce one?

**Evidence.** Ryan and Deci's self-determination theory (see C1) holds that
controlling contingencies undermine intrinsic motivation, and that autonomy
support sustains it. A score on a decision about a friend converts a judgement
call into a test with a marking scheme.

**SIDEQUEST implication.** Neither mechanic has a correct answer. Scoring one
would invent an authority the product does not have and does not want.

**Decision.** No scores anywhere in the reveals. REWIND compares two outcomes,
not two marks. Crew Shift reports what the group did, not whether it was right.
The existing rule that XP is paid for completion and never for correctness is
unchanged.

**Confidence.** High.

---

## B. Peer influence visualisation

### B1. Is peer influence on adolescent risk taking real enough to build a mechanic on?

**Question.** Crew Shift exists to make peer influence visible. Is the effect
it visualises actually established?

**Evidence.** Gardner M, Steinberg L. "Peer influence on risk taking, risk
preference, and risky decision making in adolescence and adulthood: an
experimental study." *Developmental Psychology* 2005 Jul;41(4):625-635.
doi:10.1037/0012-1649.41.4.625. PMID 16060809. From the abstract, verbatim:

> "306 individuals in 3 age groups--adolescents (13-16), youths (18-22), and
> adults (24 and older) [...] Participants in each age group were randomly
> assigned to complete the measures either alone or with 2 same-aged peers.
> Analyses indicated that (a) risk taking and risky decision making decreased
> with age; (b) participants took more risks, focused more on the benefits than
> the costs of risky behavior, and made riskier decisions when in peer groups
> than alone; and (c) peer effects on risk taking and risky decision making were
> stronger among adolescents and youths than adults."

**SIDEQUEST implication.** The effect is experimentally demonstrated, it is
larger in exactly SIDEQUEST's age band, and critically the manipulation was
*mere peer presence*, not persuasion. That is the thing worth making visible:
the group changes the decision without anybody arguing.

**Decision.** Crew Shift captures a private distribution before discussion and
a second private distribution after it, and shows both. The chapter's framing
copy points at group presence rather than at any individual persuader.

**Confidence.** High for the underlying effect. Medium for the claim that
seeing it changes behaviour later, which SIDEQUEST does not assert anywhere in
the UI and which `docs/CAMPAIGN_BEHAVIOUR.md` explicitly disclaims.

### B2. What may the interface truthfully say about a shift?

**Question.** If the distribution changes between rounds, what can be claimed?

**Evidence.** This is a data-availability question, not an empirical one. The
system captures: each round's option per anonymous seat, and nothing else. It
does not capture who spoke, who changed first, or why anybody moved.

**SIDEQUEST implication.** Anything of the form "X persuaded the group" is
unsupported by the captured data and would additionally identify a participant.
Two things *are* supported: how many seats changed answer, and how the totals
differ.

**Decision.** The reveal states only:

- the two distributions, by option, unsorted;
- the number of answers that changed, never which seat;
- one deterministic sentence chosen from four cases (nobody moved, some moved
  and totals changed, some moved but totals matched, solo).

No seat number, name or order appears anywhere in the reveal. Persuasion
direction is never inferred. A test asserts no seat label reaches the summary.

**Confidence.** High.

### B3. Can a group's own answers be shown without shaming?

**Question.** A minority-of-one is visible in a four-person bar chart even
without names, because the group was in the room. Is that a shaming risk?

**Evidence.** No direct study found within this pass's scope. The reasoning
rests on the design distinction between *anonymous aggregate* and
*attributable record*: the app never stores or displays a mapping from seat to
person, and the people in the room already know what they said.

**SIDEQUEST implication.** The risk is real but is created by the room, not by
the app. What the app controls is whether it adds a verdict on top.

**Decision.** No option is coloured as correct or incorrect, no outcome is
framed as success or failure, holding a position is explicitly named as a
legitimate result ("Your crew held its position"), and there is no confetti and
no winner. The tradeoff line under each option stays visible in both states so
every option keeps a defensible reading.

**Confidence.** Low to medium. This is a judgement call, and it is the part of
Crew Shift most worth testing with real teenagers before a pilot.

---

## C. Adolescent engagement

### C1. What actually sustains engagement, and does gamification?

**Question.** SIDEQUEST has XP, a passport and rewards. Is that the engine, or
a decoration on one?

**Evidence.**

Ryan and Deci's self-determination theory identifies **autonomy, competence and
relatedness** as basic psychological needs, and holds that "conditions
supporting the individual's experience of autonomy, competence, and relatedness
are argued to foster the most volitional and high quality forms of motivation"
(selfdeterminationtheory.org, summarising Deci and Ryan 1985 and Ryan and Deci
2000).

Hamari J, Koivisto J, Sarsa H. "Does Gamification Work? A Literature Review of
Empirical Studies on Gamification." *47th Hawaii International Conference on
System Sciences* (2014), 3025-3034, doi:10.1109/hicss.2014.377. From the
abstract, verbatim:

> "The review indicates that gamification provides positive effects, however,
> the effects are greatly dependent on the context in which the gamification is
> being implemented, as well as on the users using it."

**SIDEQUEST implication.** "Gamification works" is not a finding anyone can
lean on. What the evidence supports is that the *needs* are the mechanism and
the points are at best a delivery vehicle. Where a points feature competes with
autonomy, the points should lose.

**Decision.** This pass adds no new points, no new streak and no new badge. It
spends its effort on the three needs instead:

| Need | What this pass changed |
| ---- | ---------------------- |
| Autonomy | Install is optional, dismissible, remembered and never gates anything. Crew Shift's final decision comes from the crew's own second vote rather than from whoever was holding the phone. |
| Competence | Every reveal now shows what changed and why, in one shared grammar, so the thing being learned is legible rather than scored. |
| Relatedness | Crew Shift's whole upgrade is about the group seeing itself. |

**Confidence.** High for the direction. Medium for the specific weighting, since
SDT was not developed on prevention products and this is a transfer.

### C2. Does the passport risk becoming an assessment?

**Question.** The previous pass de-assessed the Safety Passport. Do protective
factors reintroduce grading?

**Evidence.** SDT's competence need is about *felt effectiveness*, not about
external evaluation. A debrief that names what worked supports it; a debrief
that scores the player against a rubric does not.

**SIDEQUEST implication.** "What changed the outcome?" must describe the
fictional scenario, not the player.

**Decision.** Factors are attached to *outcomes* in the fixture data, resolved
deterministically from the path taken, and phrased about the story ("The person
was given a way to back out without losing face"), never about the player
("You showed good judgement"). No factor carries a point value.

**Confidence.** High.

---

## D. Trust and provenance UI

### D1. Does labelling some content as synthetic make the rest look verified?

**Question.** SIDEQUEST labels demo aggregates and seeded stories. Does
labelling a subset create a false impression of the unlabelled remainder?

**Evidence.** Pennycook G, Bear A, Collins E, Rand D. "The Implied Truth
Effect: Attaching Warnings to a Subset of Fake News Headlines Increases
Perceived Accuracy of Headlines Without Warnings." *Management Science* 66(11)
(2020), 4944-4957, doi:10.1287/mnsc.2019.3478. The finding is in the title:
warning a subset raises the perceived accuracy of the un-warned items.

**SIDEQUEST implication.** This is the strongest argument in this document, and
it cuts against the previous pass's anti-fatigue rule. If some Pulse cards carry
a provenance tag and others do not, the untagged ones are read as verified. The
previous pass's decision to declare provenance once per dense feed is only safe
if the declaration covers **every** item on that screen, which is why the rule
is written per screen and not per card.

**Decision.**

1. Every provenance-bearing content type declares a status for **every**
   record, with no optional field and no default. `DataProvenance` is now a
   required property on Pulse items, rewards and Norm Mirror question sets.
2. A screen-level declaration is allowed only when it is exhaustive for that
   screen. A test asserts every Pulse item carries a status, so a
   feed-level statement can never become partially true.
3. `reported` was added because CNA-sourced summaries were previously wearing
   the same tag as team-written material, which understated one and overstated
   the other.

**Confidence.** High. The study is on news headlines rather than prototype
labels, which is a transfer, but the direction of the risk is unambiguous and
the fix is cheap.

### D2. What vocabulary should the statuses use?

**Question.** Five statuses were proposed: official, reported, pilot, demo,
prototype. Are all five meaningful here?

**Evidence.** Internal audit of the existing content set. Every Pulse item is
either a team-written summary of public advisories or a summary of external
reporting. Every aggregate in Norm Mirror and every figure on the Campaign
impact page is invented. No pilot has been run.

**SIDEQUEST implication.** Four statuses have real referents today. `pilot` has
none, and a status that cannot be true is a status that will eventually be
used wrongly.

**Decision.** All five exist in the type so the vocabulary is complete and
stable, but `pilot` is guarded: an integrity test fails the build if `pilot`
appears anywhere in `src/data`. It becomes usable the day a real dataset
exists, and not before. `verified` was considered and rejected because the
codebase has no verification procedure that would give it meaning.

**Confidence.** High.

### D3. How prominent should the label be?

**Question.** A label that is ignored fails; a label that dominates turns the
product into a disclaimer.

**Evidence.** No new source. The constraint comes from D1 (labels must be
exhaustive within a class) and from the previous pass's finding that repeated
identical chips on a dense list are tuned out.

**SIDEQUEST implication.** Exhaustive does not mean loud. It means present and
legible wherever the claim is made.

**Decision.** The existing `ProvenanceTag` visual is kept: small caps, a dot, a
tinted border, secondary in the hierarchy but never below AA contrast. What
changed is coverage, not volume. On the Norm Mirror reveal specifically, the
tag sits directly on the aggregate bar rather than in a footnote, because that
is where the claim is made.

**Confidence.** Medium. This is the trade-off most likely to need revisiting
after real users see it.

---

## E. PWA value before install

### E1. Which browsers can actually offer an in-page install?

**Question.** Can SIDEQUEST show a real install button everywhere?

**Evidence.** MDN browser-compat-data for `BeforeInstallPromptEvent`, fetched
26 August 2026 from `mdn/browser-compat-data@main`:

| Browser | Support |
| ------- | ------- |
| Chrome | 44 |
| Chrome Android | mirrors Chrome |
| Edge | mirrors Chrome |
| Opera / Opera Android | mirrors Chrome |
| Samsung Internet | 5.0 |
| Firefox / Firefox Android | **not supported** |
| Safari | **not supported** |
| Safari iOS | **not supported** |

MDN additionally marks the API `experimental: true`, `standard_track: false`,
and states: "This feature is not Baseline because it does not work in some of
the most widely-used browsers."

**SIDEQUEST implication.** On iOS, which is a large share of Singapore
teenagers' phones, there is no API at all. Any UI that looks like a system
install dialog on iOS would be a lie.

**Decision.** Progressive enhancement with two distinct paths.
Chromium-family: capture `beforeinstallprompt`, `preventDefault()`, keep the
event, and expose a real button that calls `prompt()`. Everywhere else: no
button, only a short factual instruction naming the actual Share menu step. The
component never renders a fake dialog and never claims the browser can do
something it cannot.

**Confidence.** High.

### E2. How is "already installed" detected, including on iOS?

**Question.** The invitation must not appear to someone who already installed.

**Evidence.** MDN compat data for the `display-mode` media feature: Chrome 42,
Firefox 47, **Safari 13, Safari on iOS 12.2**. MDN marks it Baseline widely
available since January 2020. web.dev's detection guidance uses
`window.matchMedia('(display-mode: standalone)').matches`.

**SIDEQUEST implication.** The standard media query covers iOS. The legacy
`navigator.standalone` shim is not needed and is not used.

**Decision.** `matchMedia("(display-mode: standalone)")` plus `minimal-ui` and
`fullscreen`, subscribed through `useSyncExternalStore` so the value is
hydration-safe and updates if the display mode changes. In standalone, the
invitation does not render at all.

**Confidence.** High.

### E3. When has a user received enough value to be asked?

**Question.** What is the earliest honest moment to ask?

**Evidence.** No quantitative source found within scope. The reasoning is that
the invitation has to name a concrete reason, and SIDEQUEST has exactly one
real one: the Campaign's follow-up chapters unlock on a delay, so there is
genuinely something to come back to.

**SIDEQUEST implication.** The threshold should be the point at which the
sentence "your next chapter unlocks later" becomes true, not a visit count.

**Decision.** One placement, one condition: the Campaign screen, after the
finale is complete, immediately below the follow-up list whose delayed unlock
is the reason being given. A second placement on mission completion was
considered and dropped, because the copy that makes the invitation honest
("your next chapter unlocks later") is only true of the Campaign, and a weaker
variant elsewhere would be retention for its own sake.

It is dismissible, the dismissal persists in `localStorage` with an in-memory
fallback for browsers that block storage, and it never reappears. It gates
nothing: XP, rewards, follow-ups and the finale all behave identically without
it. Tests assert it is absent before the finale, present after, gone once
dismissed, and gone in standalone.

**Confidence.** Medium-high for the placement, which follows from the copy
being true there and nowhere else. Medium for whether anyone installs.

### E4. Should push notifications be implemented now?

**Question.** iOS gained Web Push. Should the follow-up chapters notify?

**Evidence.** WebKit, "Web Push for Web Apps on iOS and iPadOS" (16.4 beta 1,
announced 16 February 2023). Web Push on iOS is available only to Home Screen
web apps, requires a service worker, and requires the permission request to be
"in response to direct user interaction".

**SIDEQUEST implication.** It is technically possible, and it would need a
push service, subscription persistence, VAPID keys and a server to send from.
SIDEQUEST has no backend by design.

**Decision.** Not implemented. Recorded in the roadmap with its actual
prerequisites so nobody has to rediscover them. The follow-up copy continues to
say the chapter is waiting, which is true, rather than that the phone will
buzz, which would not be.

**Confidence.** High.

---

## F. Offline and roadshow resilience

### F1. What does Next.js already prefetch?

**Question.** Does a Campaign participant need explicit prefetching, or is
`<Link>` enough?

**Evidence.** Next.js 16 `<Link>` documentation: "Prefetching happens when a
`<Link />` component enters the user's viewport (initially or through scroll)
[...] **Prefetching is only enabled in production**." With the default
`prefetch` value of `auto`/`null`, "For static routes, the full route will be
prefetched (including all its data)." Every Campaign route in SIDEQUEST is
prerendered (`●  (SSG)` in the build output).

**SIDEQUEST implication.** Chapter links that are on screen already prefetch
fully in production. The gap is routes that are linked but below the fold, and
the finale, which is not linked until it unlocks.

**Decision.** After the Campaign screen mounts, call `router.prefetch()` once
for the four chapter routes and the finale. This uses the existing App Router
API, adds no dependency, moves no bytes that `<Link>` would not have moved
anyway once scrolled, and is skipped entirely when the device reports
`navigator.connection.saveData`. No new service-worker framework was added.

**Confidence.** High.

### F2. Is the existing service worker adequate?

**Question.** Should caching change for roadshow use?

**Evidence.** Read of `public/sw.js`. Navigations are network-first with a
cache fallback and an `/offline` fallback; `/_next/static/`, `/icons/` and the
manifest are cache-first, which is safe because those paths are
content-hashed or immutable.

**SIDEQUEST implication.** A chapter that has been opened once stays available.
A chapter never opened cannot be opened with no network. Explicit prefetch
(F1) turns "opened once" into "the Campaign screen was opened once", which is
the actual roadshow scenario.

**Decision.** No service-worker change. The prefetch does the work, and
widening the cache would add staleness risk to a build that gets redeployed
between judging sessions.

**Confidence.** High.

### F3. Is "your progress is safe" a true statement offline?

**Question.** The offline copy claims progress is safe. Is it?

**Evidence.** Read of `src/store`. All progression is Zustand with the
`persist` middleware writing synchronously to `localStorage` under
`sidequest.profile.v1`. Nothing is written to a server, so there is nothing to
lose to a dropped connection.

**SIDEQUEST implication.** The claim is true, and it is true precisely because
there is no backend.

**Decision.** Keep the claim, and keep it narrow: the copy says progress is
saved on this device, which is both true and honest about the real limitation,
which is that it does not follow you to another phone.

**Confidence.** High.

---

## Decisions this research argued against

Recorded so they are not silently revisited.

| Idea | Why it was dropped |
| ---- | ------------------ |
| Show "who changed their mind" in Crew Shift | Not captured, and identifying a seat is exactly the profiling this product refuses. B2. |
| Percentage bars for four crew answers | Four people are counts, not percentages. "75%" for three of four overstates precision. A1. |
| A pie or donut for the distribution | Bottom of the perceptual ranking, and useless for a two-state comparison. A1. |
| An install prompt on first launch | Nothing has happened yet, so no honest reason to give. E3. |
| A custom install sheet on iOS styled like the system one | Impersonates a system dialog for an API that does not exist there. E1. |
| Web Push for the follow-ups | Needs a backend. E4. |
| A `verified` provenance status | No verification procedure exists, so the word would be decoration. D2. |
| A new charting dependency | Four bars are two divs each. |
