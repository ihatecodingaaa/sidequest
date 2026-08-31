# Interaction-first research

What the evidence actually supports about removing required typing, shortening
what is on screen, and choosing between interaction mechanics. Written for the
pass that made SIDEQUEST choice-first.

**Compiled:** 31 August 2026.

---

## Why this document exists

Real testers said three things:

> "there is too much typing"
>
> "make the tasks MCQ based instead"
>
> "typing answers feels tedious"

The first and third are a report of an experience and they are worth acting on.
The second is a proposed solution, and taking it literally would have been the
wrong change: a product whose every activity is four lettered options is a quiz,
and a quiz about crime prevention is the thing the product thesis refuses to
build.

So the rule adopted is the complaint, not the prescription:

> **Choice first. Action first. Keyboard last.**

Everything below is the evidence for and against that, including the parts that
cut against it.

---

## How to read the confidence and verification labels

Each finding carries a confidence level and its sources carry a verification
state. Those are two different things and both matter.

**Verification.** Sources were fetched and read where possible. Where a figure
could not be confirmed against the primary text it is marked UNVERIFIED here,
and nothing in this document invents a number, a page range or a DOI to fill a
gap.

**An honest gap.** An independent adversarial fact-check pass was run over these
findings. It completed for the two Roblox reports, which came back clean, and it
**did not complete for the learning-science reports** because the checking pool
hit a session limit. So the citations below are researcher-reported rather than
independently re-verified, and the effect sizes in particular should be
re-checked against the primary text before any of them appears in a submission,
a deck or a claim to a partner. That caveat is itself the project's data-honesty
rule applied to its own evidence base.

**Nothing here is a claim about outcomes.** Every study cited measures retention,
recall, intention or self-report. None of it measures whether a young person
behaved differently in a real situation weeks later. The evidence licenses
statements about the *shape of the interaction*, never about crime reduction.

---

## 1. The claim we refuse to make

### Question

Can the "eight second attention span" claim be used to justify shorter chunks?

### Evidence

No. It is traceable and it collapses.

The figure is attributed to a Spring 2015 Microsoft Canada advertising
consumer-insights report. That study surveyed roughly 2,000 Canadians and ran
EEG work with 112, and **it did not measure attention span duration at all**. The
eight-second number appears in a bubble graphic sourced not to Microsoft's own
data but to a commercial website called Statistic Brain. Jon Schwabish
(PolicyViz, 29 January 2016) chased Statistic Brain's two listed sources: a 2008
web-usage paper by Weinreich and colleagues which studied twenty-five
participants' browsing and did not test attention span, and a bare institutional
attribution to "National Center for Biotechnology Information, U.S. National
Library of Medicine, The Associated Press". The National Library of Medicine's
reply to Schwabish:

> "We have had similar requests on this same issue saying it came from various
> sources such as NCBI and cannot verify it."

BBC journalist Simon Maybin reached the same result independently in "Busting
the attention span myth" (2017). There is also no evidence that goldfish have
unusually short attention spans.

The replacement myth fails the same audit. Neil Bradbury reviewed the "students
tune out after 10 to 15 minutes" claim in a peer-reviewed journal and found that
"the available primary data do not support the concept of a 10- to 15-min
attention limit" and that "the most often cited source for a rapid decline in
student attention during a lecture barely discusses student attention at all".

Gemma Briggs, an attention psychologist at the Open University, told the BBC that
average attention span "is not a metric that psychologists would try to measure
and quantify", because attention is task-dependent.

- Schwabish, J. "The Attention Span Statistic Fallacy", PolicyViz, 29 January
  2016. Practitioner data journalism; examined the Microsoft report directly and
  contacted NLM.
- Bradbury, N. A. (2016). "Attention span during lectures: 8 seconds, 10 minutes,
  or more?" *Advances in Physiology Education*, 40(4), 509-513. DOI
  10.1152/advan.00109.2016. Peer-reviewed; abstract confirmed via Crossref.
- Maybin, S. "Busting the attention span myth", BBC News, 2017. Content confirmed
  through secondary sources only; the page could not be fetched.

### Design consequence

The number does not appear anywhere in this repository, this document, the deck
or a code comment. Under the project's own data-honesty rule an unsourceable
third-party statistic is exactly the class of claim `ProvenanceTag` exists to
catch, and there is no label that makes it acceptable, because the honest label
would be "fabricated".

### Confidence

High.

### Rejected interpretation

"The exact figure is shaky but the direction is right, so we can say attention
spans are shrinking." There was never a measurement at either end of the
2000-to-2013 trend line, so the number carries no directional information. It is
not imprecise, it is invented. Edward Vogel, who has measured students for two
decades, reports the opposite: "It's been remarkably stable across decades."

And do not swap in the ten-minute figure. Bradbury's whole result is that it has
no primary data behind it either. Replacing one unsourced constant with another
repeats the error with better manners.

---

## 2. The corrective that matters most for a youth app

### Question

Do teenagers find mobile typing hard?

### Evidence

**No. They are the fastest group measured.**

Palin and colleagues ran a web-based transcription study with 37,370 volunteers.
By age band, mobile typing speed was: 10-19 at **39.6 WPM** (SD 14.3), 20-29 at
36.5, 30-39 at 32.2, 40-49 at 28.9, 50-59 at 26.3. Only the under-10 group was
slower. Differences were significant for all groups (adjusted p < 0.001).

The overall mean was 36.17 WPM (SD 13.22) with 2.34% uncorrected errors. The same
group's matched physical-keyboard study (Dhakal et al., CHI 2018, N = 168,000)
found 51.56 WPM with 1.167% uncorrected errors. So mobile runs at roughly 70% of
desktop throughput and leaves about twice the proportion of errors uncorrected,
which the authors attribute to "the higher interaction cost of correcting
mistakes on mobile devices".

- Palin, K., Feit, A. M., Kim, S., Kristensson, P. O., & Oulasvirta, A. (2019).
  "How do People Type on Mobile Devices? Observations from a Study with 37,000
  Volunteers." *MobileHCI '19*. DOI 10.1145/3338286.3340120. Peer-reviewed;
  figures read from the author preprint. Page range UNVERIFIED.

### Design consequence

Delete any argument of the form "teenagers find typing hard" from every SIDEQUEST
artefact. It is contradicted by the best available data and it is the single most
likely error for this project to make. The justification for removing required
typing has to come from somewhere else, and it does: see section 3.

### Confidence

High.

### Rejected interpretation

"Gen Z struggle with typing on small screens, so our app removes typing." This is
an overclaim in the opposite direction from the truth. The measured age gradient
runs the other way and peaks in adolescence.

---

## 3. What actually justifies removing required typing

### Question

If not typing speed, then what?

### Evidence

Four claims survive scrutiny.

**Differential access, not speed.** Palin et al. found a 12+ WPM gap by English
experience: native English users averaged 37.8 WPM, those who reported never
typing in English averaged 25.6, decreasing monotonically across experience
levels. Separately, Pew Research Center analysed 30 open-ended questions across
26 American Trends Panel waves and found that for all three question types,
*including those asking for a single word*, respondents with a high school
diploma or less were much less likely to respond than those with a postgraduate
degree. A required English text box is a filter, not a uniform tax, and for a
product whose reason to exist is reaching young people across school tracks and
home languages, that filter selects out exactly the people conventional
programmes already reach least.

**Composition is a breakoff cost, experimentally.** Hadler (2025) randomised
identical survey questions with and without embedded open-ended probes and found
that embedding the probes produced **higher survey breakoff**, plus increased
backtracking and answer changes to previous questions, while in most cases having
no effect on the closed questions themselves. The prose costs completion of the
thing around it.

**What comes back on a phone is thin anyway.** Revilla, Toninelli and Ochoa
(2016) found no device difference in item nonresponse for open questions, but
significantly fewer characters typed on smartphones: 10.9 to 22.4 fewer
characters per question (all p = 0.00), with longer completion times. Depth
degrades; participation does not.

**Honesty about what a text box promises.** A text field implies somebody will
read it. SIDEQUEST has no backend, no moderation queue and nobody on the other
end. Presenting an input that cannot be answered is the same category of
dishonesty as labelling seeded content "live".

- Hadler, P. (2025). "The Effects of Open-Ended Probes on Closed Survey Questions
  in Web Surveys." *Sociological Methods & Research*, 54(1), 106-139. DOI
  10.1177/00491241231176846. Peer-reviewed, randomised. Sample size and breakoff
  magnitude UNVERIFIED.
- Revilla, M., Toninelli, D., & Ochoa, C. (2016). "PCs versus Smartphones in
  Answering Web Surveys." *Survey Practice*, 9(4). DOI 10.29115/SP-2016-0021.
  Peer-reviewed; figures verified.
- Pew Research Center Decoded, 7 March 2023 and 14 October 2021. **Not
  peer-reviewed**: a research organisation's methods blog reporting its own panel
  data.

### Design consequence

Every required interaction is completable by selection. Free text exists only as
optional enrichment, placed after a mechanic completes rather than inside it, and
never as a gate. This is stated in the docs as an **inclusion and honesty
decision, not a conversion-rate decision**.

### Confidence

Medium. The strongest single citation (Hadler) is a randomised experiment with a
breakoff outcome, but it is a survey panel rather than a voluntary youth app.

### Rejected interpretation

"Removing typing increases engagement and completion, and the research proves
it." Nothing in the verified record measures engagement in a voluntary youth app.
Claiming an unmeasured completion lift would violate the same data-honesty rule
the project applies to seeded content.

---

## 4. The form-field statistics that do not exist

### Question

Is there evidence that more form fields cause abandonment?

### Evidence

Overwhelmingly vendor marketing, and much of it circular. The most-repeated
figure, "reducing fields from 11 to 4 raised conversions 120%", traces to a
single uncontrolled Imagescape case study from around 2007-2008, re-reported
until it hardened into a law. A practitioner audit attempting to trace common
form-abandonment statistics found several failed outright: a widely quoted
"FormAssembly 68% completion rate" contradicts FormAssembly's own published 33%,
and "multi-step forms convert 86% higher" had no identifiable source, methodology
or sample size.

Countervailing practitioner evidence exists: CXL documents a case where cutting a
form from nine fields to six **decreased** conversions, because the removed fields
were the ones visitors engaged with most.

Baymard Institute, the most careful practitioner source, publishes checkout
form-field benchmarks (12.7 in 2019, 11.3 in 2024) but attaches **no conversion
figure at all**, presenting the impact qualitatively from user testing.

Nielsen Norman Group's guidance ("Typing on small screens is difficult", the
Eliminate-Automate-Simplify framework) presents no original quantitative data.

No peer-reviewed controlled experiment isolating field count as a cause of
abandonment was found.

### Design consequence

No field-count statistic appears in any SIDEQUEST document. If a reviewer traced
it, it would collapse. Practitioner guidance is cited as practitioner guidance,
with that label attached, the same way `ProvenanceTag` labels seeded data in the
product.

### Confidence

High, on the negative claim.

### Rejected interpretation

"Studies show every extra field costs 4% of users." There is no such study. And
the relationship is not even reliably negative: *which* field is removed matters
more than how many.

---

## 5. Is a tap a real retrieval event?

### Question

Does replacing typed answers with taps cost learning?

### Evidence

**This is a live disagreement and this document cites both halves.**

For taps. Adesope, Trevisan and Sundararajan (2017) meta-analysed practice
testing and reported format as a significant moderator, with multiple-choice
practice producing a **larger** effect (g = 0.70) than short-answer (g = 0.48).
Yang and colleagues (2021) pooled 222 classroom studies covering 48,478 students
and ran the direct theoretical test, collapsing to Recall (k = 157) versus
Recognition (k = 278): **g = 0.520 versus g = 0.518, Q(1) = 0.004, p = .952**, a
null they describe as "inconsistent with the retrieval effort theory". Multiple
choice specifically produced g = 0.567 (k = 270).

Against taps. Rowland (2014) coded every multiple-choice study as recognition and
found initial test type a significant moderator (QB = 13.84): cued recall g = 0.61
(k = 104), free recall g = 0.29 (k = 36), **recognition g = 0.29 (k = 19)**. In
his high-exposure dataset the gap widens. Rowland's recognition cell is the
thinnest in his analysis, and at retention intervals of a day or more the format
moderator was not significant at all (QB = 1.41).

The reconciliation. Little, Bjork, Bjork and Angello (2012) tested the
recognition criticism directly and found multiple choice can be genuine
retrieval, **but only when the alternatives are competitive**: Little and Bjork
(2014) showed the benefit appeared only when incorrect alternatives were
competitive, not when they were noncompetitive.

And the audience argument, which is the strongest one for this product. Rowland's
retrievability analysis: with no feedback and initial test success below 50%, the
testing effect was **g = 0.03, CI [-0.21, 0.27]**, statistically indistinguishable
from zero. Above 75% success it was g = 0.56; with feedback, g = 0.73. SIDEQUEST's
population is youths in a voluntary app with no grade at stake and no prior
instruction, where a typed free-recall prompt would sit well under 50% success,
which is precisely the dead cell.

- Adesope, O. O., Trevisan, D. A., & Sundararajan, N. (2017). *Review of
  Educational Research*, 87(3), 659-701. DOI 10.3102/0034654316689306. Citation
  confirmed; **the g = 0.70 / 0.48 pair is UNVERIFIED against the paywalled
  primary** and corroborated only via Greving & Richter (2018) and secondary
  summaries.
- Yang, C., Luo, L., Vadillo, M. A., Yu, R., & Shanks, D. R. (2021). *Psychological
  Bulletin*, 147(3), 399-460. DOI 10.1037/bul0000309. Figures read from full text.
- Rowland, C. A. (2014). *Psychological Bulletin*, 140(6), 1432-1463. DOI
  10.1037/a0037559. Figures read from full text.
- Little, J. L., Bjork, E. L., Bjork, R. A., & Angello, G. (2012). *Psychological
  Science*, 23(11), 1337-1344. DOI 10.1177/0956797612443370.

### Design consequence

Taps are defensible for this audience, and the reason is the success band rather
than a claim that recognition beats recall. Two engineering rules follow:

1. **Every distractor must be competitive.** The writer's test: if a player can
   eliminate an option without retrieving anything about the situation, that
   option is doing no work and must be rewritten. Little and Bjork's own closing
   warning is that "writing good multiple-choice items is very hard work, whereas
   writing poor ones is relatively easy".
2. **Prefer cued generation over bare recognition.** Rowland's cued recall beat
   free recall by more than double in the full dataset. A structured choice among
   labelled options, a prediction before a reveal, a commitment compared against
   an outcome: those are cued, and they are what the product uses.

### Confidence

Medium. The field does not agree, and this document cites the friendly half and
the unfriendly half deliberately.

### Rejected interpretation

Two, pointing opposite ways, and a designer will be tempted by whichever suits
the roadmap.

"Adesope proved multiple choice beats short answer, so we can delete every typed
input." It is a between-study moderator contrast, not a head-to-head; the authors
explicitly warned against choosing format on effect size alone; and Yang et al.
reports the opposite ordering.

"Tapping is just as good as writing, so nothing is lost." Not established either.
Generation beats reading at d = 0.40 (Bertsch et al. 2007) and recognition sits at
the bottom of Rowland's ordering. Replacing text with a *bare quiz* probably does
cost something. Replacing it with cued generation does not.

---

## 6. The safety rule: feedback is not optional

### Question

What is the risk of a tap-based format that a designer would not anticipate?

### Evidence

**Multiple choice without feedback can teach the wrong answer.**

Butler and Roediger (2008) quantified it. On a delayed cued-recall test,
proportion correct was .14 with no test, .31 after multiple choice with no
feedback, .45 with immediate feedback and .56 with delayed feedback. Lure
intrusions were **.16 in the no-test control, .24 with no feedback**, .15 with
immediate feedback and .14 with delayed. The no-feedback condition produced
significantly more intrusions than never testing at all (t(71) = 4.49, d = .65).
More alternatives produced more intrusions (linear trend F(1, 69) = 5.30). The
authors' conclusion is unambiguous: "Educators should provide feedback when using
multiple-choice tests."

The risk is concentrated in the moment of **commitment**, not the moment of
reading. Displaying a plausible bad action in a list is comparatively cheap;
letting a player commit to it and walk away uncorrected is the expensive event.

Immediate and delayed feedback wiped out intrusions roughly equally, so timing
can be chosen for narrative reasons.

- Butler, A. C., & Roediger, H. L. III (2008). "Feedback enhances the positive
  effects and reduces the negative effects of multiple-choice testing." *Memory &
  Cognition*, 36(3), 604-616. DOI 10.3758/MC.36.3.604. Full text read.
- Roediger, H. L. III, & Marsh, E. J. (2005). *JEP: LMC*. **Volume, issue and
  pages UNVERIFIED**; reported from Butler and Roediger's own description.

### Design consequence

For a crime-prevention product this is a safety rule, not a pedagogy preference:

> **No interaction that lets a player commit to a harmful action may terminate
> without a correction that names the safer action.**

That is what `Consequence` is, it is rendered after every selection, and
`tests/unit/integrity.test.ts` fails the build if a riskier option ships without
its `safer` field.

**The option-count tension, stated honestly.** The strict reading of this
evidence is two or three options; three is also the psychometric optimum.
SIDEQUEST uses up to four in a Prevention Thread. That is a deliberate departure,
and the reason is that the measured harm is carried by *unresolved* commitment,
which this product structurally prevents. Four options with a guaranteed
correction is a defensible position. Six with no correction is not, and neither
is four if the correction is ever made optional.

### Confidence

High.

### Rejected interpretation

"Multiple choice implants false beliefs, so it is unsafe for a serious topic."
The same study shows the damage is fully repaired by feedback. The risk is a
property of unfed-back multiple choice, not of the format.

The worse overclaim in the other direction: treating the correction as a nicety
that can be cut for pacing, when it is the specific thing preventing the harm.

---

## 7. What a consequence message must contain

### Question

What should per-option feedback say, and what must it never say?

### Evidence

Hattie and Timperley (2007) identify four levels of feedback: task, process,
self-regulation and self. **Feedback about the self (praise) is the least
effective**, and mixing correction with self-level praise dilutes the correction.

Kluger and DeNisi (1996) found that a substantial share of feedback interventions
*reduced* performance, and their moderator analysis names the features that
matter. Supplying the **correct solution** is what separates a feedback
intervention that works from one that barely does. Comparison against the
learner's own earlier performance works; comparison against other people does
not. Discouraging framing is the single condition where feedback goes negative
outright.

Elaborated feedback outperforms knowledge of the correct response, which
outperforms knowledge of results alone, and the gap is widest exactly where the
learning target is higher-order transfer.

Fong's moderator analysis found that an **instructional detail naming the thing
to do instead** is the single feature that flips negative feedback from
demotivating to motivating.

For teenagers specifically, praise is not merely low-value: an older adolescent
may read "great choice!" as evidence the app expected less of them.

And the ordering rule. A consequence that ends on the harm is fear without an
efficacy component, which is the Scared Straight shape: the one prevention
approach with evidence of making outcomes *worse*.

- Hattie, J., & Timperley, H. (2007). "The power of feedback." *Review of
  Educational Research*, 77(1), 81-112.
- Kluger, A. N., & DeNisi, A. (1996). *Psychological Bulletin*, 119(2), 254-284.
- Shute, V. J. (2008). "Focus on formative feedback." *Review of Educational
  Research*, 78(1), 153-189.

Effect sizes for these were researcher-reported and are **not independently
verified**; the qualitative orderings are well established and the numbers should
be re-checked before quotation.

### Design consequence

The consequence template, enforced by `Consequence` and by a unit test:

> **[what happened, world-facing] + [why this option led there] + [what the other
> move actually does, concrete and performable]**

Encoded in the component as `outcome`, then optionally `safer`, in that order and
never the reverse. There is no `correct` prop, no score, no star, no per-choice
XP and no praise line. The last thing a player reads after a risky choice is what
to do instead.

`ThreadChoice.safer` and `StreetCheckOption.safer` are required on every option
not marked `isSafest`, and the build fails without them.

### Confidence

High on the qualitative rules, medium on the specific effect sizes.

### Rejected interpretation

"Add a reassurance line after every option so nobody feels judged." That turns
into per-choice praise, which is the thing this literature says to avoid. Frame
the standard once, at the top, then keep individual messages purely task-level.

---

## 8. Segmenting: the beat boundary, not the button

### Question

Does breaking content into player-paced chunks help, and is the Continue button
the active ingredient?

### Evidence

Mayer and Pilegard report the segmenting principle "was supported in 10 out of 10
experimental tests, yielding a median effect size of 0.79", every one measured on
a problem-solving transfer test, every lesson a narrated animation about a causal
system, and none involving narrative, teenagers or phones. The independent
meta-analysis is smaller: Rey and colleagues covered 56 investigations and 88
comparisons and found **d = 0.32 to 0.36** for retention and transfer.

The decisive result is the decomposition. Rey et al. separated the two features:

- **System-paced** segmentation: retention d = 0.42 (k = 32, CI 0.21-0.63),
  transfer d = 0.35, cognitive load d = 0.29. All significant.
- **Learner-paced** segmentation: retention d = 0.19 (k = 21, CI -0.04 to 0.45,
  **not significant**), transfer d = 0.45 (significant), cognitive load d = 0.08
  (not significant).

They then tested learner pacing as an explanation directly and it failed:
retention Q = 1.78, p = 0.18; transfer Q = 1.03, p = 0.31. Mayer and Pilegard flag
the same gap and note Spanjers et al.'s proposal that "adding a 'Continue' button
would not be expected to help".

Their segments are defined as "meaningful and coherent" units, not arbitrary
slices.

- Rey, G. D., Beege, M., Nebel, S., Wirzberger, M., Schmitt, T. H., & Schneider,
  S. (2019). "A meta-analysis of the segmenting effect." *Educational Psychology
  Review*, 31(2), 389-419. DOI 10.1007/s10648-018-9456-4. Full PDF read including
  Tables 3 and 4.
- Mayer, R. E., & Pilegard, C. (2014). In *The Cambridge Handbook of Multimedia
  Learning* (2nd ed.), ch. 13, 316-344. DOI 10.1017/CBO9781139547369.016. Chapter
  PDF read. **Do not cite a 3rd-edition figure**: it could not be confirmed.

### Design consequence

**The beat boundary is what carries the effect; the button is not.** So the
existing rule that the unit is one idea and not one sentence is the load-bearing
rule, and "exactly one advance control per screen" is a usability rule rather
than a learning-science one. Effort spent tuning where a scene is cut buys more
than effort spent tuning the advance interaction.

Keep the player-paced advance anyway, on two grounds that are honest: transfer
does show a learner-paced benefit (d = 0.45), and a phone reader in an
unpredictable context needs control.

### Confidence

High.

### Rejected interpretation

"Mayer proved a Continue button makes people learn more deeply." The
meta-analysis that decomposed the effect found learner pacing was **not** a
significant moderator, and the learner-paced subset failed to show a significant
retention benefit at all. The button is the most visible part of the mechanic and
the least evidenced part of it.

"Segmenting is proven, so make every beat one short sentence." The effect is for
*meaningful, coherent* segments. Splitting a single thought across two taps
reintroduces the split attention that segmenting exists to remove, so maximal
fragmentation reverses the benefit. This project already learned that the
expensive way.

---

## 9. Interaction variety has no learning evidence

### Question

Does using several interaction types rather than one improve learning?

### Evidence

**No, and this is the finding that most constrains what this pass may claim.**

Clark, Tanner-Smith and Killingsworth (2016) is the largest design-focused
meta-analysis in the field, comparing game *design* features rather than games
versus no games. On variety of player actions it found **no significant
differences between levels**. What did moderate outcomes was scaffolding level.
The contextualisation coefficient was negative, which is direct empirical backing
for the existing "no visual without a job" rule.

- Clark, D. B., Tanner-Smith, E. E., & Killingsworth, S. S. (2016). "Digital
  games, design, and learning: A systematic review and meta-analysis." *Review of
  Educational Research*, 86(1), 79-122.

### Design consequence

**Interaction variety in SIDEQUEST is justified by the user complaint, not by
learning science, and this document says so rather than borrowing credibility it
does not have.**

The complaint is real and worth fixing: four steps that all end in the same
four-option list is what testers were describing when they said the tasks felt
like a quiz, and a product nobody opens teaches nothing. That is a product
argument and it is sufficient on its own.

What follows from the evidence is a constraint on *how* variety is added: the
design effort belongs in the specificity of the guidance around a choice, not in
inventing mechanics. So the kit is four primitives, the narrative picks which one
a step uses, and a fifth is not added because the fourth felt repetitive.

### Confidence

High.

### Rejected interpretation

"Varied mechanics improve learning outcomes." Not supported. Anyone writing a
submission should resist the sentence entirely.

---

## 10. Where a hotspot is and is not the right mechanic

### Question

Should a prevention product teach noticing?

### Evidence

Latané and Darley's bystander decision model has five steps: notice, interpret,
take responsibility, know what form of help to give, act. The step prevention
programmes verifiably move is **"I know what to do and I believe I can do it"**,
which is steps 3 to 5.

Bystander programme evaluations show effects significant at 1 to 4 months and
gone by 6 to 12, with the reviewers recommending booster sessions. The one
intervention in this literature that moved real incidents needed five years,
whole schools, in-person facilitation and trained peer opinion leaders, and
showed no effects until Year 3.

### Design consequence

Two consequences, and the first is a correction to how a hotspot should be
framed.

**A hotspot must be interpretation, not visual search.** "Find the warning sign"
is a search task on the step interventions do not move. SIDEQUEST's hotspot step
asks which features of a *place* are making the wrong thing easy, and two of its
five spots are decoys (a camera, a warning poster) that are tappable precisely so
they can be reasoned about and rejected. That is a judgement, and the decoys are
what make it one. It sits on the situational-prevention side, which is steps 3 to
5 shaped: what would you change about this.

**The honest ceiling for the whole product.** SIDEQUEST is a component a school or
agency programme can deploy, not a standalone intervention, and its Crew and
campaign structures should make it plug into facilitated delivery rather than
replace it. That is also the most credible thing to say to a judging panel.

### Confidence

High.

### Rejected interpretation

"A spot-the-risk minigame teaches young people to notice danger." Noticing is not
the step that moves, and a prevention product that trains people to scan for
risky-looking things is one bad design decision away from training them to scan
for risky-looking *people*, which this product forbids. The artwork for the
hotspot scene therefore contains no figure at all, and a unit test fails the
build if a spot label names a person.

---

## 11. The highest-leverage mechanic, and the trap inside it

### Question

If a player chooses well in a scenario, does that transfer?

### Evidence

Choosing in a simulation produces an intention. Webb and Sheeran's meta-analysis
of experimental evidence found that "a medium-to-large-sized change in intentions
led to only a small-to-medium-sized change in behavior (**d+ = .36**)", with the
gap driven mainly by "inclined abstainers": people who intend to act and do not.

The best-validated repair is if-then planning. A meta-analysis of 94 studies
observed a medium-to-large improvement in goal attainment over merely forming an
intention (**d+ = 0.65**), and the mechanism is that the cue becomes highly
accessible, so the person recognises the moment when it arrives and the response
becomes cue-driven rather than deliberative.

Progress monitoring is a second supported route: across 138 interventions, a
large increase in monitoring frequency (d+ = 1.98) produced a small-to-medium
behaviour change (d+ = 0.40), larger when progress was physically recorded.

- Sheeran, P., & Webb, T. L. (2016). "The intention-behavior gap." *Social and
  Personality Psychology Compass*, 10(9), 503-518. DOI 10.1111/spc3.12265. Read
  from the author-accepted manuscript. Underlying primaries (Webb & Sheeran 2006;
  Gollwitzer & Sheeran 2006; Harkin et al. 2016) confirmed only through that
  review's text and reference list, **not read individually**.

### Design consequence

Implemented as `PlanReveal`, offered once when a Prevention Thread finishes.

**The trap, and why the mechanic is two taps rather than one.** The same research
names it explicitly: a choice card is *not* an implementation intention. An
implementation intention specifies the **cue and the response and links them**,
whereas a branch supplies only a response, inside a fictional situation the player
will never stand in. So the player picks the cue from candidates drawn from their
own life, the response is the option they already chose in the story, and the two
are shown joined. That extra tap is the entire difference between the mechanic
and a decoration of it.

It promises nothing. There is no reminder, no notification and no follow-up,
because there is no push infrastructure and copy implying one would be a lie.

### Confidence

Medium-high. The d+ = 0.65 figure is quoted from a review rather than read in the
primary meta-analysis.

### Rejected interpretation

"Practising the decision in the app means they will make it for real." Rehearsal
produces an intention, and intentions convert at d+ = .36. Transfer is not
impossible; it is not automatic.

---

## 12. What the refusals are worth

### Question

Is refusing leaderboards, loot boxes, streaks and scarcity defensible on evidence?

### Evidence

Deci, Koestner and Ryan's meta-analysis identifies the most damaging structure as
a **performance-contingent reward delivering less than the maximum**, measured at
**d = -0.88**. A leaderboard is that structure by construction: exactly one person
is at the top and everybody else receives a graded shortfall. For scale, the
whole positive effect of gamification on cognitive learning is around g = 0.49, so
the undermining risk is roughly twice the benefit the gamification is there to
deliver.

For children and adolescents specifically, tangible rewards were worse and verbal
praise did not help.

Informational versus controlling framing of the *same* feedback spans **d = 0.66
to d = -0.44**. Every "keep going", "don't lose your progress" and "you should" is
on the wrong side of that line.

Rewards that did **not** undermine: unexpected, task-noncontingent ones, measured
at approximately zero. Expectation is the variable that turns a neutral reward
into an undermining one.

Sailer and Homner's moderators found narrative framing earning its place for
behavioural outcomes specifically, and any social layer needing to be
collaborative rather than a pure ranking. Wouters et al. found group play the
largest moderator at **d = 0.66**.

Effect sizes here are researcher-reported and **not independently verified**.

### Design consequence

The product should make a positive claim rather than an abstinence claim:

> The mechanics removed are the ones that raise throughput without raising
> motivation and that carry the largest measured undermining effect in the reward
> literature, an effect that is worse for adolescents than for adults. The
> mechanics kept (narrative framing, collaborative crew deliberation, a
> deterministic non-scarce cosmetic, one-time XP that is a record rather than an
> incentive) are the ones the moderator analyses actually support.

Three operational rules: wording is load-bearing; **no reward may be promised in
advance**; and any pilot must measure autonomy, competence and relatedness rather
than time-on-task, past week four to clear the novelty window.

Crew Shift's two private rounds either side of a discussion is the group-play
configuration that carried the largest moderator in the serious-games literature,
which makes it the most evidence-backed mechanic in the product.

### Confidence

Medium. The direction is well supported; the specific numbers are unverified.

### Rejected interpretation

"Research shows leaderboards are bad." Leaderboard response is moderated by trait
competitiveness, so any leaderboard helps some users and demotivates others. The
honest framing is that a product which has deliberately refused to profile its
users **cannot identify which young person is which**, the population is
adolescents where the undermining evidence is strongest, and the harmed tail is
exactly the user the product exists for. That reasoning survives scrutiny; "the
evidence forbids leaderboards" does not.

---

## 13. Prediction, and the norm it must never reveal

### Question

Is "predict then reveal" a supported mechanic?

### Evidence

The pretesting effect is real for **checkable facts** paired with immediate
feedback, and the feedback is load-bearing: Potts, Davies and Shanks (2019) found
no benefit when generation followed the answer. Learners reliably rate guessing as
less useful than reading even where it helps, so preference feedback is a bad
signal for tuning it away.

It does **not** extend from remembering a fact to changing an attitude.

Social norms marketing has a weak and contested record, and campus-wide marketing
campaigns performed no better than other modes. Schultz and colleagues (2007)
demonstrated the boomerang: a descriptive norm moved low consumers *up* toward the
average, and adding an injunctive signal eliminated it.

### Design consequence

Three rules, and the third is the important one.

1. Prediction is warranted for knowledge surfaces (what the law says, what
   happens after a report), always paired with immediate feedback, and a wrong
   guess must cost nothing.
2. Norm Mirror's prediction step is justified on its own terms, that it makes the
   player commit to a belief and thereby makes the following discussion
   substantive, **not** by borrowing the pretesting literature.
3. **A prediction must never resolve to a bare prevalence figure for a risky
   behaviour.** If the true answer is "a lot of people do this", revealing it is
   at best inert and at worst licensing. Ask about things whose true answer is
   protective: how many would step in, how many are uncomfortable, how many would
   say no.

The most defensible norm surface in the product is Crew Shift's second-round
distribution, because it is real data the product actually captured and it carries
the dynamic-norm signal without inventing a population statistic. Norm Mirror's
population percentages are the least defensible, which is why they are labelled
placeholders and say so at every reveal.

### Confidence

Medium. The boomerang is a plausible, unquantified hazard rather than a settled
effect, which argues for cheap structural safeguards rather than either
complacency or elaborate machinery.

### Rejected interpretation

"Norm Mirror corrects misperceptions and therefore reduces offending." The
synthesis evidence does not support a standalone behaviour-change claim, and the
mass-media version of this idea failed to replicate.

---

## 14. What none of this licenses

Every study cited measures retention, recall, intention or self-report. Rowland's
stimulus categories were paired associates, single words and prose. Yang's outcome
was classroom assessment. Pan and Rickard's furthest reliable reach was
application and inference questions (d = 0.32), and their problem-solving category
was **not** statistically significant. The best-powered trial of a branching
prevention narrative found intention and behaviour effects null after 16 hours of
play.

So the licensed claim is:

> Tap-based retrieval with competitive distractors and a guaranteed correction is
> an evidence-backed way to make material stick, and an if-then plan is the
> best-evidenced way to give a rehearsed decision any chance of carrying over.

And the unlicensed claim is anything of the form "SIDEQUEST reduces youth
offending", or any impact figure at all. The Campaign impact page stays labelled
demo data, and that is not merely an honesty policy: it is the only defensible
position.

---

## The input policy, in one place

For standard gameplay, **required keyboard typing is zero**.

Three exceptions, each with a tap path beside it:

| Exception | Where | Tap path |
| --------- | ----- | -------- |
| `code-entry` | Station code, crew code, mission code | QR scan; and the seeded crews are now buttons |
| `settings` | Settings, onboarding display name | Optional, skippable |
| `optional-creator` | Quick Quest Builder, Partner Challenge | Behind a deliberate secondary control; the flow completes without it |

Every `<input>` and `<textarea>` in `src` declares `data-input-role` naming which
exception it is. There is no permitted value meaning "the player must type this",
which is the point: the check cannot be satisfied by declaring the thing it
forbids. `tests/unit/integrity.test.ts` fails the build on an undeclared field,
and `npm run audit:input --against <ref>` prints the difference against any
commit.

A `<textarea>` promises an essay whether or not the label does, so optional
creator fields are single-line inputs. The only textarea left in the product is in
the partner studio, which nothing in the app links to, and a test asserts that
nothing starts.

---

## The measurement

`npm run audit:input --against 571ab1e`, the commit before this pass:

| | Before | After |
| --- | --- | --- |
| Keyboard-opening fields in `src` | 10 | 9 |
| Textareas | 3 | 1 |
| Required on the normal player journey | 6 | **0** |

The "before" row undercounts twice, and both are worth stating. The audit counts
JSX elements rather than rendered instances, and the Crew board's four text areas
were one element in a `field()` helper called four times. And at the compared
commit no field declared a role, so the classification is manual.

The six required fields were: four on the Crew board's "Build a quest", and two in
the Partner Challenge (a title input and a 40-character-minimum, 600-character
textarea).

---

## Sources this document deliberately does not use

- Any form-field conversion statistic. None survived source-tracing.
- The eight-second attention span, and its ten-minute replacement.
- Nielsen Norman Group or Baymard cited as if they were experiments. They are
  practitioner guidance from qualitative testing, and they are labelled as such
  where they appear.
- Any claim that teenagers find typing difficult.
- Any claim that varied interaction improves learning.
