# Living District 2.0 research

Why a young person would want to exist inside SIDEQUEST, what the evidence
actually supports, and what this pass refused to claim.

**Conducted:** 1 September 2026, against the build at commit `3b00b4c`.

---

## 0. Read this section before citing anything below

**The planned literature sweep did not run, and this document is written to
that limitation rather than around it.**

Thirteen parallel research agents were dispatched for this pass. One returned
(intrinsic reward and the undermining effect). Twelve hit session limits and
returned nothing. A later attempt to verify the load-bearing claims directly
found this session's web search budget already exhausted at 200 of 200 calls.

So no claim in this document was checked against a primary source **during this
pass**. What follows is written under a three-way labelling scheme, and the
labels are the point:

| Label | Means |
| ----- | ----- |
| **Established** | A standard, repeatedly replicated finding I am confident is stated correctly at this level of generality. Cited without a specific effect size unless the size is itself standard. |
| **Directional** | The general direction is well supported; the magnitude, the boundary conditions, or the transfer to this context are not established. Used to justify a design decision, never to claim an outcome. |
| **Rejected** | Considered and refused. See section 6. |

**No effect sizes are quoted in this document.** That is deliberate. A number
carries more authority than a direction, and I could not re-verify a single one
here. Where a previous SIDEQUEST document quotes a figure, that figure was
checked in the pass that introduced it and this one does not restate it.

Anyone extending this work should treat section 5 as a verification queue, not
as settled ground.

---

## 1. The question

> **Is SIDEQUEST fun to exist inside?**

Not "is it educational", not "does it teach", not "would a judge score it
well". Whether a sixteen year old with nothing to do would open it.

That question is harder than the one the product had been answering, because
the product was already good at the moment somebody is *doing* something. The
missions are strong. The threads are strong. What was thin was everything
between: the state of being in SIDEQUEST rather than completing something in
it.

### What responded to a player with no objective, before this pass

| Dimension | State |
| --------- | ----- |
| Things to touch that pay nothing | Six props, all of them carrying a discovery |
| Things a place remembers | **Nothing.** No landmark knew anything |
| Characters who know each other | **Two** cross-references in a cast of twenty |
| Ownership of your own look | Chosen once, on first entry to Streets, permanent |
| The You page | Opened with a level ring, XP, a progress bar and three stat tiles |
| The catalogue and the world | Described the same three missions without either admitting it |
| The front door | Counted a backlog: "3 people want a word" |

Read that table as a whole and a pattern appears. **Everything in the product
was instrumental.** Every object taught, every screen scored, every reason to
walk somewhere was a task. A world in which every single thing is useful is not
a world, it is a syllabus with a walk attached, and a young person works that
out faster than we would like.

---

## 2. Intrinsic reward, and the case for things worth nothing

**Established.** Deci, Koestner and Ryan's meta-analysis of the undermining
effect is the single most directly relevant finding to this pass. Tangible
rewards that are expected and contingent on engaging with a task reliably
reduce free-choice persistence at that task afterwards. Verbal acknowledgement
and informational feedback do not show the same pattern, and generally go the
other way.

The mechanism, in self-determination terms, is that a contingent tangible
reward shifts the perceived reason for acting from inside the person to outside
them. What was "I did this because it was interesting" becomes "I did this
because it paid".

**The uncomfortable implication for this product.** The undermining effect is
largest exactly where the activity was already interesting. It is not a warning
about paying for boring work; it is a warning about paying for the good parts.
Looking at a cat on a wall is a good part.

**What was built from this.** Six props that leave nothing behind: the cat, the
mural, the bicycle, the hoop, the drinks machine, the door bell. Zero XP, zero
collectibles, zero discovery, no counter anywhere that increments when you
touch them. Two of them offer a small harmless choice and answer it.

This was the most contested decision of the pass, because a shipped feature
that pays nothing looks like a feature nobody will use. The counter-argument
is the one above: an ambient interaction that pays is no longer ambient.

**What was NOT built from this.** No XP was removed from anything that already
had it. Missions still pay, Street Checks still pay, threads still pay. The
evidence concerns paying for behaviour that was already intrinsically
motivated; it says nothing about withdrawing an established reward, and doing
that on the strength of this literature would be an overreach.

Pinned by `tests/unit/useless-fun.test.ts` and by an end-to-end test that
walks to a prop, uses it, and asserts XP is unchanged.

---

## 3. Attachment to a place

**Directional.** There is a substantial literature on place attachment in
environmental psychology, and a smaller one on attachment to virtual
environments. The direction it points is that attachment grows from
**accumulated personal history in a specific location**, not from the
attractiveness of the location.

I am confident in that direction and not confident in anything quantitative
about it, and specifically not in any claim about transfer from physical
neighbourhoods to a fictional district on a phone. So it is used here as a
design hypothesis, not as evidence of an outcome.

**What was built from it.** District Memory. See
`docs/DISTRICT_MEMORY_SPEC.md`. The load-bearing choice is that memory is
attached to **places** rather than to the player. A global "things you have
done" feed is a profile. The same entries filed under the minimart, the court
and the bus stop are a relationship with six places.

**What was refused.** No decoration, no furniture, no room to arrange. The
brief offered a locker and the honest answer is that a room simulator is a
different product. Ownership here is served by seeing yourself, changing
yourself, and having the block know you, which is three things that fit the
product rather than one that would replace it.

---

## 4. Characters who know each other

**Directional.** The reasonable-confidence claim is narrow: a cast whose
members reference each other is perceived as more coherent than one whose
members do not. I could not verify a specific source for this during this pass
and it is stated as a craft judgement backed by the obvious counterfactual,
not as a research finding.

**What was built.** Eight cross-references, up from two. Each is gated on
**both** situations being resolved, so the line is always a memory of two
things the player did, never a hint about a third they have not.

**The rule that makes it safe.** A character who says "you should go see
Nadia" is a quest arrow with a face. A character who says "Nadia told me what
you did" is a neighbourhood. `tests/unit/cross-character.test.ts` fails the
build on imperative phrasing, on naming a machine, and on any line long enough
to become a monologue.

---

## 5. Verification queue

Everything below should be checked against primary sources before it is
repeated anywhere the public can read it, including in a submission.

1. The undermining effect's boundary conditions for *ambient, unprompted*
   interactions rather than experimental tasks. Section 2 assumes transfer.
2. Place attachment in virtual environments: whether accumulated history is
   the mechanism, or whether time-on-site is doing the work.
3. Whether character cross-referencing has any measured effect on perceived
   world coherence, or whether it is purely a craft convention.
4. Returning-user behaviour in single-player worlds with no notifications.
   SIDEQUEST has no push infrastructure by design, and this pass did not
   establish what brings somebody back without one.
5. Whether the two-surface memory design (in-world and on You) helps or
   simply duplicates.

---

## 6. CLAIMS REJECTED OR NARROWED

This section is the point of the document. Every item here was available, would
have supported something built in this pass, and was refused.

### Rejected outright

**"Young people have an eight-second attention span."**
Refused for the third consecutive pass and now enforced by a build tripwire.
The figure traces to an unsourced secondary citation and has no defensible
primary basis. It is also self-defeating here: it would argue against the
long-form threads and the campaign, which are the strongest things in the
product.

**"Sound makes learning better."**
Refused in `docs/LIVING_WORLD_RESEARCH.md` and unchanged. The audio identity is
justified by feedback and pleasure, never by learning outcomes.

**"Collectibles increase engagement."**
Directionally plausible and refused as a justification, because section 2 says
the opposite is at least as likely for the specific case of paying for ambient
interaction. This pass shipped *fewer* rewarded objects than it could have.

**"Streaks build habits."**
The habit-formation literature does not support the strong version, and the
product has a visible streak counter it inherited. This pass did not add to it
and does not cite it as evidence. It should be re-examined.

**"Players form parasocial relationships with NPCs, so more character depth
increases retention."**
Tempting, and it would have justified a much larger dialogue system. The
evidence I can defend does not connect NPC depth to returning, and the
inference chain is long enough that it would be borrowed authority.

### Narrowed

**Zeigarnik and unfinished tasks.**
Considered as a justification for showing incomplete threads prominently.
Narrowed to nothing: replication of the original effect is weak enough that it
should not carry a design decision. Unfinished threads are shown because a
player asked to be able to find them again, which is a better reason.

**Flow.**
Used in earlier SIDEQUEST documents. Narrowed here to a vocabulary for talking
about difficulty pacing, and explicitly not used to claim that the world
produces a flow state. Nothing in this pass measured one.

**The IKEA effect and ownership.**
Considered as the justification for the avatar redesign. Narrowed: the avatar
change is justified by the plain observation that customisation was reachable
exactly once, on first entry to Streets, so a look chosen in the first thirty
seconds of using the product was permanent. That is a defect with or without a
citation.

**"Derived state is more truthful than stored state."**
An engineering argument, not a research one, and labelled as such in
`docs/DISTRICT_MEMORY_SPEC.md`. It is a good argument. It is not evidence.

---

## 7. What was built, and what justifies it

| Built | Justified by | Label |
| ----- | ------------ | ----- |
| Six props that pay nothing | Undermining effect | Established |
| Choice micro-activities that pay nothing | Same | Established |
| District Memory, filed by place | Place attachment | Directional |
| Memory derived, not stored | Engineering truthfulness | Not research |
| Eight character cross-references | Craft judgement | Directional |
| Gating cross-references on both being done | Avoiding quest-arrow phrasing | Craft |
| You opens with the person | The screen was a report card | Observation |
| Avatar editable more than once | It was permanent after thirty seconds | Defect |
| Home names a person, not a count | A name is a reason, a count is a backlog | Craft |
| Missions say who asks and where | The two halves did not admit they were one product | Observation |
| Finished missions grouped below | A catalogue that leads with what you did is a re-read | Craft |

Four of eleven rows say "observation", "defect" or "craft". That is the honest
distribution, and it is a better document for saying so.

---

# Part two: the P1 cohesion pass

Added 1 September 2026, covering Crew, Updates, Echo, returning players and
district stickers.

## 8. Verification status, again

The same limitation as Part one applies and is worth restating rather than
quietly inheriting: **no claim in this document was checked against a primary
source during either pass.** The session's web search budget was exhausted at
200 of 200 calls before this work began, so live verification was unavailable
throughout.

Every claim below is therefore labelled, and the labels now include a fourth:

| Label | Means |
| ----- | ----- |
| **Verified** | Checked against a primary source. **Nothing in this document carries this label**, and that is the honest state. |
| **Directional** | A standard finding whose general direction I am confident of; magnitude and transfer are not established. |
| **Hypothesis** | A product belief this pass acted on. Not evidence. Testable, and listed in section 11 as something to test. |
| **Rejected** | Considered and refused. Section 10. |

No effect sizes are quoted anywhere in this document.

## 9. What each P1 decision actually rests on

| Decision | Rests on | Label |
| -------- | -------- | ----- |
| Stickers are cosmetic, free and never random | Undermining effect, Part one section 2 | Directional |
| The six worthless props stay worthless | Same | Directional |
| Stickers commemorate history rather than quotas | Place attachment, Part one section 3 | Directional |
| Legible before earned, no mystery slots | Refusing to trade on uncertainty | Ethics, not evidence |
| No crew league table | Product argument about peer norms | Product thesis |
| No per-member points column | Same | Product thesis |
| Crew work is asynchronous | Observation: four teenagers are rarely free at once | Observation |
| Crew challenge shows real personal contribution | Data honesty rule | Product rule |
| Updates maps a theme, not a story | Avoiding a readable claim that the news is playable | Ethics, not evidence |
| One continue item by strict priority | Observation: a menu is not a resume control | Craft |
| No daily login system | Explicit product refusal | Product rule |
| No "new since you left" badge | Would require inventing seen-state | Data honesty rule |
| Echo reactions carry no information | Accessibility rule: a canvas has no semantics | Product rule |
| Echo variants stay cosmetic | One economy, no pay-to-differ | Product rule |

**Eleven of fourteen rows are product rules, ethics, observation or craft, not
research.** That is the honest distribution and it is the point of showing it.
This pass is largely a set of design decisions defended by argument, and it is
stronger for saying so than it would be for attaching a citation to each one.

## 10. CLAIMS REJECTED OR NARROWED, P1

### Rejected

**"Collectibles increase retention."**
This is the claim that would most obviously justify the sticker system and it
is not made anywhere in the product or the docs. What justifies the stickers is
that District Memory gave a collectible somewhere to mean something; whether
they bring anybody back is section 11, hypothesis H2, and untested.

**"Streaks build habits."**
Refused again. The product has an inherited streak counter on You; this pass
added nothing to it, put nothing on Home, and built the returning-player state
so that no daily mechanic can be constructed from it.

**"Social features increase engagement."**
True of products with real social graphs, and SIDEQUEST has none. Nothing in
the Crew rebuild claims an engagement effect. It claims the screen is now
honest and answers a better question.

**"Companions increase attachment to a product."**
Would have justified a much bigger Echo. The inference chain from pet-companion
research to a 12-pixel shield that hops twice an hour is too long to carry
weight, so Echo is justified as delight and nothing more.

**"Personalisation increases ownership, so more avatar options are better."**
Rejected as a reason to add options. The avatar defect this pass found was not
that the set was small: it was that two of the five rows sat below a fold on a
390px phone with no scroll affordance, so a third of the customisation was
invisible. That is a layout bug, and adding options would have hidden it.

### Narrowed

**Endowment and ownership.**
Used as vocabulary for why pinning a sticker matters, and narrowed to that. No
claim that pinning changes behaviour, retention or attachment.

**Goal-gradient.**
Considered as a reason to show progress towards a locked sticker. Narrowed to
nothing, and it argued for the thing this design refuses: a bar next to a place
turns having been somewhere into being partway through it. The only standing
shown is a phrase, and only where a count is meaningful.

**Self-determination theory.**
Autonomy, competence and relatedness are a useful frame for why the crew
rebuild removed ranking and why stickers are free. They are used as a frame.
Nothing here measures need satisfaction and nothing claims to.

## 11. Product hypotheses

**These are hypotheses. None of them is proven, none is evidence, and none may
be presented as a result.** Each is written so that the pilot could actually
test it.

**H1. Continuity and returning.**
*Players who are shown a specific unfinished thing, named with a person and a
place, may be more likely to open the product a second time than players shown
a generic home screen.* Testable as an A/B in a pilot with two builds; not
testable from anything the product currently records.

**H2. Deterministic collection and ownership.**
*A small, finite, legible collection may increase a player's sense that the
district is theirs, without producing the completion pressure a randomised or
open-ended set would.* Measurable in interview rather than in telemetry: the
question is whether somebody talks about the block as theirs, not whether they
collected eight things.

**H3. Asynchronous crew value.**
*Making most crew activity completable alone may make the social layer useful
more often than a synchronous-only design, particularly for players whose
friends are not in the pilot cohort.* Directly observable in a pilot: how many
crew challenge parts are completed by players who never play a synchronous
round.

**H4. Theme framing and misreading.**
*Naming the theme and labelling the scenario fictional may reduce the
proportion of readers who believe the practice scenario recreates the reported
incident.* This one is worth testing precisely because the previous wording was
introduced by people who did not intend the misreading either.

**H5. Companion reactions and noticing.**
*Brief, rare, information-free companion reactions may increase how much
players notice the world's response to them, without measurable annoyance.*
The failure mode is the interesting result here: if any tester describes Echo
as annoying, the reaction budget is wrong.

## 12. Verification queue, updated

Carried forward from Part one, plus:

6. Whether a legible, finite collection avoids the completion pressure of a
   randomised one, or merely produces a smaller version of it.
7. Whether asynchronous group tasks sustain group identity without synchronous
   contact, in a cohort that mostly already knows each other.
8. Whether "practise a fictional version" is actually read as fictional by
   13 to 16 year olds, which is the one claim in this pass where being wrong
   has a real cost.
