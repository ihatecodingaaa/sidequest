# Living prevention world: research and design decisions

Research for the pass that turned SIDEQUEST Streets from a district of stationary
quest givers into a neighbourhood where situations develop and a young person
decides what to do about them.

Conducted 27 August 2026 against commit `a4650c5`.

---

## How to read this

Each decision is recorded as:

**Question** / **Evidence** / **SIDEQUEST implication** / **Decision** /
**Confidence** / **What we rejected**.

The last field is the important one. A research document that justifies
everything the brief asked for is not research, it is decoration. Several ideas
in the brief were rejected outright and several were rebuilt into something
safer.

### Verification status of sources

Sources are marked so a reader knows what was checked and what was recalled.

| Mark | Meaning |
| ---- | ------- |
| **[fetched]** | Retrieved from the live official site during this pass, on 27 August 2026 |
| **[known]** | Cited from the literature without being retrieved this pass. Treat the effect sizes as approximate and check before quoting in a submission |

An unfetched citation is not a fabricated one, but it is a weaker one, and the
distinction belongs on the page rather than in somebody's head.

---

## 1. The single most important reframe: the marker describes the response

**Question.** The brief asks for colour-coded diamonds "based on seriousness",
with more XP for more serious incidents. Should SIDEQUEST build that?

**Evidence.** Latane and Darley's bystander decision model **[known]** breaks
helping into five sequential steps: notice the event, interpret it as one that
needs help, assume personal responsibility, **know what form of help to give**,
and then act. Failure at any step stops the behaviour.

Step four is the one interventions most reliably move, and it is the one a
piece of software can actually address. People who want to help frequently do
nothing because they do not know what helping looks like in that specific
moment, and freezing is not indifference.

**SIDEQUEST implication.** A marker over a situation is an opportunity to
pre-answer step four. A marker that encodes *seriousness* answers a question
nobody was stuck on. A marker that encodes *what this situation needs* answers
the question that actually stops people.

**Decision.** Four modes, and each one names a response, not a severity:

| Mode | Means | Not |
| ---- | ----- | --- |
| **Connect** | Someone needs information, a trusted adult, or an official source | "minor" |
| **Prevent** | No harm yet, and there is a way to make the situation safer | "boring" |
| **Redirect** | Pressure is building and it can still be interrupted | "medium" |
| **Protect** | Immediate safety concern. Distance, support, get help | "boss fight" |

**Confidence.** High on the reasoning. Medium on the specific four, which is a
judgement about vocabulary and is worth arguing with.

**What we rejected.** Severity tiers. A severity scale answers "how bad is
this", which turns a prevention product into a triage simulator and makes the
worst thing on the map the most interesting thing on the map.

---

## 2. The marker may never describe a person

**Question.** Can the diamond sit over a person if the person starts the
interaction?

**Evidence.** This is not an empirical question, it is a design ethics one, and
the product's own first rule already answers it: SIDEQUEST does not profile
people. Nothing in the world may encode appearance, position or association as
risk.

There is also a straightforward failure mode. A system that renders a coloured
badge over a human figure teaches, through thousands of repetitions, that
people carry a risk colour and that the colour is knowable by looking. That is
the exact cognitive habit crime prevention education should be dismantling.

**Decision.** The colour belongs to a `WorldSignal`. It never belongs to an
`Npc`. Enforced structurally rather than by convention:

- `WorldSignal` carries `mode`. `Npc` has no mode, no risk field and no score.
- A unit test fails the build if `riskLevel`, `suspicionScore`, `dangerScore`,
  `criminality` or `threatLevel` appears anywhere in `src/`.
- A signal is anchored to a **place or a moment**, and renders near whoever
  raises it only because that is where the situation is.

**Confidence.** High, and not negotiable.

**What we rejected.** `npc.riskLevel`. Red and green people. Any structure in
which a person's identifier is the key that a colour hangs off.

---

## 3. Four colours, and never colour alone

**Question.** How many colours, and can colour carry the meaning?

**Evidence.** Red for immediate action and amber or yellow for caution are
widely established conventions in safety signage and medical alarm standards
**[known]**, so borrowing them costs nothing to learn. Around 8% of men of
northern European descent have a red-green colour vision deficiency
**[known]**, which is precisely the discrimination this system would depend on.
WCAG 2.2 success criterion 1.4.1 requires that colour is never the only visual
means of conveying information.

Alert fatigue is the other constraint: a signal that is always present stops
being a signal. That is the same argument already written into this repo for
the quest marker and for the single red element on Safe.

**Decision.** Four modes, each carrying **four redundant channels**: colour,
icon shape, a text label in the world HUD and the Quest List, and an accessible
name that states the mode and what it needs. The four labels are one word each
(`CONNECT`, `PREVENT`, `REDIRECT`, `PROTECT`) so they fit next to the marker
without a tooltip.

**Confidence.** High.

**What we rejected.** A twelve-colour taxonomy. Colour-only markers. Any state
distinguishable only by hue.

---

## 4. Signal frequency, and why red is rationed

**Question.** How many signals should be live at once?

**Evidence.** Two arguments converge. Alert fatigue says a common alert is
ignored. And there is a representational duty: a district where a risky moment
is visible every ten seconds misrepresents Singapore, and misrepresenting a
place as dangerous is its own kind of harm in a product aimed at young people
who live there.

**Decision.**

- At most **two** signals prominently visible around the player at once.
- **Exactly one** Protect signal exists in the whole district, authored, and it
  is the final step of a thread rather than something that spawns.
- Signals never spawn randomly. Every one is authored and deterministic.
- A completed signal goes out and stays out.

**Confidence.** High.

**What we rejected.** Random spawning, respawning signals, and a "wanted
level". A farmable red is the design that would most efficiently teach a young
person to walk towards danger.

---

## 5. XP must not scale with seriousness

**Question.** Should a Protect signal pay more than a Connect signal?

**Evidence.** Self-determination theory **[known]** holds that behaviour is
sustained by autonomy, competence and relatedness, and that salient extrinsic
rewards can undermine intrinsic motivation for an activity a person already
finds worthwhile. The practical point for this product is narrower and harder
to argue with: **whatever pays most is what people will go and do.**

**SIDEQUEST implication.** If red pays four times, the product has told a
sixteen year old that the most valuable thing they can do is find the most
dangerous situation available. That is the opposite of the lesson, and no
amount of careful dialogue inside the encounter would undo the incentive
sitting on top of it.

**Decision.** `signalMode` **never** enters an XP calculation. XP is banded by
length and structure only:

| Band | XP | What it is |
| ---- | -- | ---------- |
| `touch` | 15 | A single exchange |
| `check` | 25 | An existing Street Check |
| `step` | 30 | One thread step |
| `thread` | 90 | Completing a whole thread |

A Protect thread may be worth more only because it has more steps, and in this
pass it deliberately has **fewer** steps than the amber thread, so it pays
less. A unit test asserts that no XP figure differs by mode.

**Confidence.** High.

**What we rejected.** Severity multipliers. Streak bonuses on signals. Anything
that makes the count of dangerous encounters a number the player watches.

---

## 6. Collective efficacy, and the claim we are not allowed to make

**Question.** The brief proposes a "Community Safety Crew". Is there support
for it, and what may SIDEQUEST claim?

**Evidence.** Sampson, Raudenbush and Earls (1997, *Science* 277: 918-924)
**[known]** define collective efficacy as social cohesion among neighbours
combined with their willingness to intervene for the common good, and report it
as a substantial correlate of lower violence across Chicago neighbourhoods,
mediating much of the association between concentrated disadvantage and
violence.

**SIDEQUEST implication, stated carefully.** That literature describes a
property of real neighbourhoods measured in real neighbourhoods. It is evidence
that *willingness to intervene* is a variable worth moving. It is **not**
evidence that a game which rehearses willingness moves the real-world variable,
and it is certainly not evidence that SIDEQUEST reduces crime.

**Decision.** Build the Crew as an identity and a practice space. Claim only:

> SIDEQUEST gives young people a place to rehearse noticing, supporting,
> connecting, redirecting and redesigning, and measures whether their confidence
> and their knowledge of safe escalation change.

**Confidence.** High on the finding. High on the restriction.

**What we rejected.** "SIDEQUEST builds collective efficacy." "Neighbourhoods
using SIDEQUEST are safer." Any impact figure that crosses from a proximal
outcome to a crime outcome.

---

## 7. The Crew is not a police force

**Question.** The brief's raw idea was "work for an agency to fight crime". How
much of that survives?

**Evidence.** Two constraints. The product's standing rule is that official
services stay official and SIDEQUEST never rebuilds an agency service. And the
Delta Challenge parameter set explicitly asks for work that is
**Complementary** to existing efforts rather than a substitute for them.

**Decision.** The **Community Safety Crew** is a fictional youth prevention
crew, and its verbs are `notice`, `support`, `connect`, `redirect`, `design`,
`create`. It has roles, not ranks. It has no powers.

Five roles, and each is a **view over skill points the profile already
stores**, not a new progression system:

| Role | Existing skill it reads | The behaviour |
| ---- | ----------------------- | ------------- |
| Scout | `decision-making` | Noticing early |
| Ally | `peer-intervention` | Standing with the person affected |
| Connector | `communication` | Bringing in an adult, staff member or official channel |
| Designer | `safety-design` | Changing the situation upstream |
| Creator | `community-action` | Making prevention content other young people will actually watch |

**Confidence.** High.

**What we rejected.** Ranks, badges of authority, case files, clearance rates,
uniforms, an operations room, and any suggestion that a player holds a power a
member of the public does not have.

---

## 8. Prevention Threads, and why continuity is the point

**Question.** Is a multi-step story better than four good single encounters?

**Evidence.** Wouters et al. (2013, *J. Ed. Psych.* 105(2): 249-265)
**[known]**, already cited in this repo, report a learning effect for serious
games of d = 0.29, **no** motivational advantage over conventional instruction,
and three moderators: supplementing other instruction, **multiple sessions**,
and group play.

**SIDEQUEST implication.** Two of the three moderators are structural
properties this pass can build. Multiple sessions is what a thread is: a story
you are part way through is a reason to come back that a completed quiz is not.
Group play is what the Crew mode is.

**Decision.** Build **Prevention Threads**: three to five meaningful steps
across more than one person and more than one place, where different people
know different things. Steps may be world conversations, existing hero
missions, trusted-adult conversations, an environment redesign or a reflection.

**Threads never duplicate mission logic.** A `hero-mission` step hands off to
the existing player through the existing route and resumes on return.

**Confidence.** High for continuity as a retention mechanism. Medium for the
three-to-five length, which is a guess informed by the tap-fatigue work in this
repo rather than by evidence.

**What we rejected.** Ten-step threads. Fully linear threads with no choice.
Threads that reimplement REWIND or BREAKSAFE inside themselves.

---

## 9. Where in the timeline an encounter should sit

**Question.** Should the player arrive before, during, or after the offence?

**Evidence.** The Delta Track B brief names the risk factors as peer pressure,
impulsive decision-making, poor risk awareness, desire for social acceptance
and limited understanding of consequences. Every one of those operates
**before** an offence. None of them is addressed by investigating an aftermath.

**Decision.** Every thread in this pass opens **before or at the very start of**
the risky behaviour. There is no crime scene, no aftermath investigation and no
evidence gathering.

**Confidence.** High. This is the clearest single instruction in the brief.

**What we rejected.** Detective gameplay. Clue collection. Anything where the
harm has already happened and the player's job is to work out who did it.

---

## 10. Official pathways, re-verified

**Question.** What are the current official routes, and did any change?

**Evidence [fetched], police.gov.sg contact page, 27 August 2026.** Verbatim
from the live page:

| Route | Number |
| ----- | ------ |
| Emergency | `999` |
| "Emergency SMS (For immediate police assistance if it is not safe to talk)" | `70999` |
| General crime reporting, non-emergency | `1800 255 0000` |
| ScamShield Helpline | `1799` |

I-Witness and the Police@SG app are listed as the online routes.

**One correction to make.** The emergency SMS number is **70999**. The
repository did not previously carry it at all, and the brief that prompted this
pass referred to it loosely. It is now in `official-links.ts` with the official
wording, because "if it is not safe to talk" is precisely the situation a
Protect thread ends in.

**Confidence.** High, and dated. Re-verify before any submission.

**What we rejected.** Any number recalled rather than read. Autodialling.
Taking a report inside SIDEQUEST.

---

## 11. What SPF already tells 13 to 19 year olds

**Question.** Is the shop theft thread saying something SPF would recognise?

**Evidence [fetched], SPF youth advisory for students aged 13 to 19,
27 August 2026.** Verbatim:

> "Even if you're not the one pocketing goods, being part of a group that's
> shoplifting makes you equally liable."

> "Never share your login details or let others use your accounts, no matter how
> tempting the offer."

> "A moment's poor decision can lead to a criminal record, affecting your
> future."

**SIDEQUEST implication, and a correction.** The existing shop floor Street
Check told the player that if they said nothing, "whether anything comes of it
is decided later by someone reviewing footage". That is soft to the point of
being misleading against the official position. It has been rewritten to state
the group liability point, in plain language, without threatening anybody.

The account advisory is the factual spine of the flagship thread.

**Confidence.** High.

**What we rejected.** Inventing statistics. Softening an official position to
make a scenario feel gentler.

---

## 12. SPF's own age bands, and adaptability

**Question.** The brief requires the product to be adaptable across age groups
and educational levels. What banding should the content use?

**Evidence [fetched], police.gov.sg advisories index, 27 August 2026.** SPF
publishes youth advisories under three bands: **students 12 years old and
under**, **students 13 to 19 years old**, and **youth centric**.

**SIDEQUEST implication.** The product already has a four-band `AgeBand` type
for the consumer profile. Adding a second, differently shaped scheme for
content would be a mess. But SPF's own banding is the one a school or a
facilitator will recognise, and aligning to it costs one field.

**Decision.** Content carries `audienceBand: "secondary" | "post-secondary"`,
which maps onto SPF's 13-to-19 and older-youth split. The same thread declares
variant copy per band; the mechanism, steps and structure are identical. A
facilitator preview switches the band. **The consumer never sees a band
switch.**

**Confidence.** Medium-high. The mapping is a judgement, and a school pilot
would sharpen it in a week.

**What we rejected.** A second engine per age group. Age switches in the normal
player's face. Claiming coverage of under-13s, which this content is not
written for.

---

## 13. Complementary to what, exactly

**Question.** The brief requires complementarity. To what?

**Evidence [fetched], ncpc.org.sg, 27 August 2026.** The **Delta League** is a
youth outreach programme jointly organised by the Singapore Police Force and
the National Crime Prevention Council, run during school holidays, using
football alongside crime awareness activities and mentoring, with the aim of
dissuading youths from involvement in crime by engaging them across the holiday
period.

**SIDEQUEST implication.** That is a periodic, in-person, facilitated
programme. Its structural weakness is the gap between sessions, which is
exactly the gap the Delta brief names as "episodic engagement". SIDEQUEST's
honest role is the layer **between** activations: something a young person can
open on a Tuesday that continues the same conversation.

**Decision.** State complementarity concretely rather than as a slogan:

| Already provided | SIDEQUEST adds |
| ---------------- | -------------- |
| Official advisories | A place to rehearse the decision the advisory describes |
| Facilitated holiday programmes | Continuity between sessions |
| Reporting and help channels | The moment of recognising which channel this is, and a link out |
| Retail prevention work | A design exercise in the same vocabulary |

**Confidence.** Medium-high.

**What we rejected.** Any claim to replace, extend, or act on behalf of SPF or
NCPC. Any implication of endorsement. Both organisations remain sources and
potential partners, never partners.

---

## 14. Moving people, and who is allowed to move

**Question.** Should quest-giving NPCs walk around?

**Evidence.** The brief asks for a world that feels alive, and separately warns:
"Do not let a quest giver walk behind a building while the player searches."
Those two requirements pull in opposite directions, and the second one is the
one that breaks a demo in front of a judge.

**Decision.** Split the cast.

- **Residents** are new, ambient and walk authored deterministic routes. They
  are what makes the district feel like a neighbourhood. They carry no quest,
  no signal and no dialogue.
- **The people who matter to a thread stay where they are.** They gain idle
  motion, not travel.
- A resident **pauses** when the player comes close, so nobody walks through
  anybody, and resumes afterwards. That reads as ordinary social awareness and
  it is deterministic enough to test.

Stated as a rule: **the people you need are where you left them; the people who
make it feel like a neighbourhood are the ones moving.**

**Confidence.** Medium-high. This is the decision most likely to be revisited,
and if it is, the thing to change is a short zone patrol for quest NPCs with
the signal marker pinned to their live position, not free roaming.

**What we rejected.** Pathfinding. Scheduled daily routines. Crowd simulation.
Any NPC whose position is a function of real time. Fifty roaming sprites.

---

## 15. Solo, crew, and the judge with no friends

**Question.** Crew missions need several people. A judge has none. How is that
solved without gutting the mechanic?

**Evidence.** Wouters et al. **[known]** name group play as a moderator of the
learning effect, so genuine crew play is not decoration and must not be
removed. But an experience that cannot be shown is an experience that will not
be understood.

**Decision.** Three-part answer.

1. **Every mission and thread declares `playMode`** as `solo`, `crew` or
   `either`, visible before opening, with the participant count for crew.
2. **Selected crew experiences offer a Solo Preview**, labelled as a preview,
   which demonstrates the mechanism using clearly declared prototype responses.
3. **A Solo Preview grants no crew progression** and never states or implies
   that other people answered. The copy says the responses are illustrative.

**Confidence.** High.

**What we rejected.** Fabricating peer responses and presenting them as real,
which would be the single worst thing this product could do given that its
whole subject is peer influence. Also rejected: quietly downgrading crew
missions to solo so the demo is easier.

---

## 16. Youth as creators, not only players

**Question.** The Delta parameter set leads with **Youth-Led**. Is the product
youth-led, or merely youth-facing?

**Evidence.** The brief's own gap analysis names "one-directional information"
as a current failure, and its "where youths can help" section names relatable
youth-created content and peer notice-and-redirect. A product where young
people only consume is on the wrong side of the gap it claims to close.

**Decision.** A **Build a Quest** board at the Hub where a young person drafts a
scenario: hook, who is involved, the decision moment, the responses, the
consequence, and the prevention principle. Saved locally as a **draft**.

**Nothing a user writes becomes live content.** Drafts are marked
`DRAFT / REVIEW REQUIRED`. The intended pipeline is facilitator or school
review before anything is published, and that is stated on the screen rather
than only in a document.

**Confidence.** High on the value. High on the moderation constraint.

**What we rejected.** Any path from a text box to live scenario content.
An unmoderated crime-scenario publishing system aimed at teenagers is an
obvious harm, and the fact that it would demo well is not a reason.

---

## 17. Measuring something other than completions

**Question.** "Impact and Measurable Outcomes" is a formal criterion. What can
SIDEQUEST honestly measure?

**Evidence.** The causal claim, that SIDEQUEST reduces youth offending, is
unmeasurable in a six month pilot at plausible sample sizes and would be
unfalsifiable as stated. Proximal outcomes are measurable.

**Decision.** A pilot measurement model built on **proximal** outcomes:
recognition of a developing situation, confidence in responding safely,
knowledge of the correct escalation route, perceived peer norms, willingness to
redirect, and behavioural traces the product already produces (replay with a
changed decision, return rate, crew participation, drafts submitted).

Full model in `docs/PILOT_MEASUREMENT_PLAN.md`.

**Confidence.** High that these are measurable. Medium that they predict
behaviour, which is stated as a limitation in the plan rather than hidden.

**What we rejected.** Any crime-rate claim. Any pre-post comparison presented
as causal without a control. Presenting demo figures as participant evidence,
which the existing provenance rules already forbid and a unit test enforces.

---

## Scope decision

### Built this pass

1. The Signal system: four response modes, attached to situations, never to
   people, with four redundant channels each.
2. Ambient residents on deterministic routes, pausing near the player.
3. **The Favour**, a five step amber Redirect thread across four people and two
   places, with a genuine branch and a trusted adult.
4. **The Shout**, a three step red Protect thread that teaches distance,
   support and getting help, and rewards no confrontation.
5. The Community Safety Crew: hub interior, five roles derived from existing
   skill points, signal board.
6. `playMode` on every mission and thread, plus Solo Preview.
7. Build a Quest draft board.
8. Audience band adaptation with a facilitator preview.
9. XP safeguards and the tests that pin them.
10. Rubric evidence matrix, pilot measurement plan, six month plan.

### Deliberately not built

| Deferred | Why |
| -------- | --- |
| A third and fourth thread | Two threads that are genuinely good beat four that are thin. The architecture takes more without change. |
| Roaming quest NPCs | Section 14. The reachability risk is not worth the motion. |
| More than one red signal | Section 4. Rarity is the design. |
| A second district | Still true from the last pass. |
| Live publishing of user drafts | Section 16. Moderation is not optional. |
| Any backend | Unchanged. Nothing here needs one. |

---

## What this pass must not break

- No profiling. No risk score on a person, structurally prevented and tested.
- No confrontation taught, anywhere, at any signal mode.
- Safe stays outside game logic: no signals, no XP, no roles, no playfulness.
- Official services stay official. SIDEQUEST never takes a report.
- The Quest List stays a peer of the map, and now carries signals and threads.
- All dialogue stays DOM. All art stays drawn in code.
- No confirmed partner. No implied endorsement.
