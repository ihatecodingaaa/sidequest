# Living world research

Why SIDEQUEST Streets could still become boring, what the evidence says about
fixing it, and what this pass refused to claim.

**Conducted:** 1 September 2026, against the build at commit `f41742a`.

---

## 0. The observed problem

The product feedback was not that Streets was broken. It was that it becomes
boring, and that the world does not provide enough to enjoy between objectives.

That is a specific and correct diagnosis, and an audit of the build confirms it.
Here is what actually responded to a player walking around with no objective:

| Dimension | State before this pass |
| --------- | ---------------------- |
| Movement | Walk cycle, axis-separated collision, no sound, camera welded to the player |
| Exploration | Six landmarks, three enterable interiors, nothing to find |
| Discovery | **Nothing.** No secrets, no collectibles, no hidden anything |
| Interaction | People and doors only. Benches, planters, trees, tables, shelves, the court and the mirror were drawn and inert |
| Character | Nine residents on routes who pause and turn to face you. This part was already good |
| Feedback | Visual only. XP chips, animate-rise, a signal marker |
| Audio | **None at all.** Zero. Not one sound in the entire product |
| Progression | XP, Echo styles, the passport |
| Social | Crew board, Crew Shift |
| Surprise | Nothing scheduled, nothing random, nothing ambient |
| World consequence | Lines change and a marker disappears. Nothing moves |

**The answer to "what is enjoyable with no Mission objective" was: watching nine
residents walk, and opening doors.** That is the whole list. Everything else on
screen was scenery that had been drawn and then abandoned, which teaches a
player within about a minute that only the people matter.

Two things stand out. Audio was not weak, it was **absent**, despite
`docs/GAME_FEEL_RESEARCH.md` having decided in August to build "short, optional,
synthesised interface sounds" that were never implemented. And the world had no
discovery layer of any kind, so exploring was strictly dominated by using the
Quest List.

---

## 1. What this pass refuses to claim

**Sound does not improve learning, and nothing here says it does.**

This is the most important line in the document. A systematic review of the
audio evidence found **no study showing that sound effects, chimes, stingers or
a music bed improve learning outcomes**. The only sound with solid meta-analytic
support is narration that *replaces* on-screen text beside a visual (the
modality principle, g = 0.38, corrected to g = 0.20 for publication bias,
k = 86), and adding audio on top of text somebody is already reading is a
measured null (g = -0.04, 95% CI [-0.14, 0.06], k = 23).

SIDEQUEST's audio exists for feedback, identity, atmosphere and responsiveness.
It is decoration over a product that must work in silence, and the settings
screen says so to the player.

**There is no research on audio in serious games at the relevant grain.** A
systematic search found no adequately powered experiment isolating sound on
versus off in a serious game with learning outcomes. Every audio decision here
is an extrapolation from narrated animations, reading-comprehension labs,
entertainment games, touchscreen buttons, or storybooks read to 3-to-10 year
olds. That gap is named rather than papered over, and it identifies the cheapest
original evidence this project could generate: an A/B of sound on versus off in
a pilot.

**The eight-second attention span claim is not used.** It has no traceable
primary source. `docs/INTERACTION_FIRST_RESEARCH.md` traces its provenance in
full.

**"Juice improves player experience" is not claimed either.** The controlled
work on exaggerated feedback is mixed, and the largest study found juice trading
measured performance for perceived quality rather than improving both. What is
defensible is narrower and better: feedback should be *contingent* (different
outcomes look different) and *legible* (the player can read what their action
caused). That is the existing ShiftReveal grammar, not an argument for bigger
particles.

---

## 2. Sound: what the evidence actually supports

### The cost of background music is real, small, and one-directional

Vasilev, Kirkby and Angele's Bayesian meta-analysis of 65 studies puts
background sound at **g = -0.21** on reading comprehension. By type: speech
-0.26, music -0.19, noise -0.17. Lyrical music at **-0.35** is statistically
indistinguishable from intelligible speech. Non-lyrical music is close to zero
and not reliably worse than steady noise.

Moreno and Mayer (2000) is sharper on the worst case: background music under a
narrated animation cost roughly a full standard deviation of retention and
transfer (d computed at 1.06 and 0.95 from their published cell means).

It is small on average, large in the worst case, and it is **a pure cost with no
measured learning benefit to trade against it**.

**What this changed.** Two rules, both implemented. No vocals anywhere, ever,
which synthesis makes automatic. And music ducks to **inaudible** whenever a
reading surface is open, not merely down: the first implementation ducked to a
third on taste grounds, and the evidence moved it to six percent.

**What it did not change.** It does not forbid music. Perham and Currie found
instrumental music did not significantly impair comprehension, and the seductive
details literature splits on persistence: a persistent distractor is g = 0.43,
a transient one g = 0.12 with a confidence interval crossing zero. A music bed
is persistent; a 200ms cue is transient. So: no bed on a reading surface, short
discrete cues are within the range where the evidence shows no harm.

**Honesty about the disagreement.** A 2023 meta-analysis (de la Mora Velasco et
al., 71 effect sizes from 47 studies) reports a small *positive* pooled effect
for background music, d = 0.314, and explicitly claims to refute cognitive load
theory on this point. Its full text could not be obtained and its subgroup
definitions are unverified. It is reported here because a reviewer who knows the
literature will know it exists, and because the design that survives both
readings is the same one.

### Event-locked one-shots are the defensible half

Moreno and Mayer's Experiment 1 is the useful result: seven natural sounds, each
coordinated one-to-one with an on-screen event, played once, **did not
significantly hurt** retention (p = 0.13) or transfer (p = 0.43), and numerically
outscored the silent condition. Experiment 2, where two mechanical sounds
repeated at arbitrary points, **did** hurt.

The mechanism separating them is not volume or taste. It is whether the sound is
coordinated with, and non-redundant to, the thing being learned. Repetition
against unrelated events is the failure mode.

This is the licence for a cue vocabulary, and the constraint on it.

### The one strong positive result applies exactly to this product

Brewster (2002) tested sonified buttons on a handheld with a calculator-style
entry task, indoors and while walking. Significantly more codes entered with
sound at both button sizes, reduced NASA-TLX workload on four subscales, strong
preference, and users rating sonified buttons as **less annoying than silent
ones**.

His desktop study, where visual feedback was adequate, found no throughput or
workload gain at all. The reconciling mechanism: **auditory feedback pays where
the visual channel cannot carry the confirmation**, which on a 390px phone is
every button, because the finger occludes the control at the moment of contact.

The limit is equally clear: sound could not rescue 4x4 pixel targets. It is not
a licence to shrink anything below the 44px rule.

### Latency is a hard requirement, and it decided the architecture

Kaaresoja, Brewster and Lantz (2014) put the point of subjective simultaneity
for audio after touch at about **19ms**, found perceived quality dropping
significantly once audio lags by 70 to 100ms, and found 300ms rated
significantly worse than every shorter condition. Their guideline is 20 to 70ms.

**Late audio is measurably worse than silence.** This is the one place where
"sound helps" flips to "sound hurts" through a purely technical failure.

**What this changed.** It is the strongest argument for full synthesis. There is
no fetch, no decode and no first-play stall, so the budget is met by
construction rather than by hoping a network request lands. A design that
lazy-loaded an mp3 on first tap would fail this on the very first sound a player
ever hears.

### We are not building an earcon vocabulary

Nees and Liebman's meta-analysis (80 studies, 2,713 participants) ranks earcons
**last** of every alert type on accuracy, reaction time and subjective ratings.
Even carefully psychoacoustically-corrected earcons reached only the mid-80s on
recognition, and combining two degraded it further.

SIDEQUEST has about thirty cues, which looks exactly like the thing that
evidence warns against. The difference is the job: **no cue carries
information**. Every one accompanies something already on screen. Nobody has to
learn that a rising minor third means a thread step, because the XP chip says
it. The sound is acknowledgement, not signal.

### Immersion is the wrong claim

Sanders and Cairns found music **significantly lowered** immersion in their
first experiment, and only reversed the sign after pre-testing a better-liked
track. Klimmt and colleagues tested spatial presence and identification as
mediators and failed to establish either. A 121-study scoping review of VR audio
concludes presence is mostly unaffected by audio; what audio does reliably move
is perceived **realism**.

**Design consequence:** fit is everything, and this loop has not been playtested
with real users. That is recorded as the top risk of this pass.

---

## 3. Game feel: what is worth doing

Pichlmair and Johansen's survey separates three domains that are usually
confused, and they fail differently:

- **Tuning physicality**: acceleration, friction, collision shape versus sprite.
- **Juicing amplification**: the feedback layer on events.
- **Streamlining support**: invisible forgiveness, like corner correction.

The survey's ranking of highest-return, lowest-risk work for a top-down phone
game put a **camera that lags and settles rather than being welded to the
avatar** near the top, alongside collision shapes that match what is drawn and
one well-chosen sound per interaction class.

**What this changed.** The camera was hard-locked: computed from the player's
position every frame and clamped. It now approaches its target exponentially,
frame-rate independently, and snaps out the last fraction of a pixel so the
terrain blit stays crisp. Two guards: it is disabled entirely under reduced
motion, and it eases the *view* only. Swink is explicit that easing the
player-controlled avatar's position costs input latency; easing the camera costs
none.

**On latency budgets.** Deber and colleagues put the just-noticeable difference
for discrete tapping at roughly 69ms, against single-digit milliseconds for
dragging a graphic under the finger. SIDEQUEST's core loop is reading, choosing
and walking rather than flick-aiming, so it sits comfortably inside the tapping
budget. This is a reason not to spend effort chasing milliseconds on button
feedback, and a reason to keep frame time consistent, since Swink's third
threshold is about consistency rather than peak speed.

**What makes movement fun with no goal**, per the same survey: give the movement
something to push against, and give it consequence at rest. Objects that respond
to being walked past. That is what the prop layer is.

---

## 4. Making a small world feel inhabited

**Habituation is the governing constraint.** Firing an ambient element more often
does not make it more noticed; it makes it stop being noticed faster. Silence is
a resource: a gap restores the response, so periodic quiet makes the next
one-shot land.

Notably, the inverted-U of liking-through-familiarity was found for **visual**
but not auditory stimuli. A repeated visual motif can earn affection; a repeated
sound should be budgeted as a decaying asset from first play.

**What this changed.** Ambience is a bed plus a pool of four one-shots on a
randomised schedule averaging roughly six seconds, rather than a fixed interval,
because a fixed interval is heard as a metronome within about three repetitions.

**Perceived life comes from a population running out of phase**, not from any
individual's reasoning. Prefer many cheap scheduled NPCs to a few smart ones.
SIDEQUEST already had nine residents on routes with pauses and player-yielding,
which is why this pass added none: that part was already right.

**Model only what the player can see and attribute.** Deeper internal NPC state
does not raise perceived believability if it is not legible.

**World change must be announced where and when it happens.** A change discovered
later on a different screen is, in effect, invisible: it is a database write, not
a reward. Legibility needs a before state and an after state both present, and
more than one channel.

**Secrets need a signifier.** Something hidden with no perceivable cue is not a
secret, it is an absence. Curiosity is also transient, so a secret must be
resolvable in the session it is noticed.

**What this changed.** Props draw a small static mark at all times, not only when
in reach. The first implementation had no world marker at all, which would have
meant a player could walk the whole district without learning that objects can be
looked at.

**On causality.** Wegner's three conditions for an action to feel causal are
priority (the effect follows the tap), consistency (it matches what the control
promised) and exclusivity (nothing else looks like a plausible cause). The third
is why ambient one-shots stay quiet and infrequent: a bird calling at the moment
of a tap is a competing candidate cause.

---

## 5. What was built

| Area | Change |
| ---- | ------ |
| Audio engine | One synthesised system, three buses, limiter, dynamic import |
| Cues | About thirty, all generated from oscillators and one noise buffer |
| Music | Two loops, scheduled against the Web Audio clock, ducked to inaudible under reading |
| Ambience | Filtered-noise bed plus four one-shots on a randomised schedule |
| Controls | Three separate switches plus a master, in Streets and in Settings |
| Safe | Silenced by an enforced route rule, published for tests |
| Props | Twelve interactable objects across five maps, with a world marker |
| Discovery | Six district moments, cosmetic, free, worth no XP |
| World consequence | Four NPCs relocate when their situation resolves |
| Camera | Lags and settles, disabled under reduced motion |
| You | District moments collection, above the passport |
| Home | The waiting count now uses the same rule the world does |

---

## 6. What was rejected

| Idea | Why not |
| ---- | ------- |
| Audio files of any kind | Licensing, weight, and a first-play stall that would blow the 70ms latency budget |
| Music on by default | Measured cost under reading, and Sanders and Cairns show a badly-fitting track lands below silence |
| An earcon vocabulary carrying meaning | Ranked last of all alert types; nobody would learn it |
| Easing the player avatar | Costs input latency. The camera gives the same weight for free |
| Screen shake, particles, hit stop | The juice evidence is mixed and the largest study found a performance cost. Not warranted for a walking game |
| A prop on every tile | A world where everything is a button is as dead as one where nothing is |
| XP for discoveries | Scales the reward economy with the number of props, which is the inflation the reward rules forbid |
| More residents | Nine already run out of phase. The gap was inert objects, not too few people |
| Haptics | The Vibration API is unavailable on iOS, and Firefox Android returns true while vibrating nothing |
| Deeper NPC simulation | Believability tracks legibility, not internal state |

---

## 7. Hypotheses this pass should be tested against

Written as falsifiable predictions, so a pilot can disconfirm them.

1. **A player with no objective will stay in the world longer than before.** The
   claim is about the prop layer, not the audio. Measure time in Streets with no
   mission open.
2. **Most players will turn sound on when asked, and a minority will turn music
   off while keeping effects.** If almost nobody enables sound, the prompt is in
   the wrong place. If people turn everything off, the mix is wrong.
3. **Players will report noticing that the district changed** after finishing a
   thread. If they do not, the relocation is too subtle and needs announcing
   in-world rather than only in the panel.
4. **The music will wear out before the ambience does.** Habituation predicts the
   repeated melodic loop decays faster than the randomised one-shots.
5. **Sound will not measurably change recall.** Predicted from the evidence
   above. If a pilot finds it does, that is a genuinely new result and should be
   treated with suspicion first.

The novelty caveat applies to all five: gamification effects dip between weeks
four and ten, so a single-session reaction measures novelty rather than value.

---

## 8. Verification status

The research behind this document was produced by parallel agents and put
through an adversarial fact-check for the highest-risk topics. **The check on
the sound evidence, the Web Audio API claims and the feedback-latency numbers
did not complete before the session limit was reached**, so the citations here
are researcher-reported rather than independently re-verified.

Effect sizes should be re-checked against primary sources before any of them
appears in a submission or a claim to a partner. The API-level claims were
instead verified by implementation: the engine is built, it typechecks, and its
failure paths are covered by unit tests that simulate a missing Web Audio API
and a refused resume.
