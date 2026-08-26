# Pilot plan

A realistic first deployment, sized so it could actually happen in one term
rather than one that sounds impressive and never starts.

## Shape of the pilot

One school, one community or retail partner, one digital safety mission, one
evaluation, one reward partner. Roughly twelve weeks.

Nothing below is agreed with anybody. It is what we would propose.

## 1. The setting

**One secondary school or post-secondary institution**, one cohort, roughly 120
to 200 students aged 15 to 18.

Why one: a pilot that spans three schools produces three sets of logistics and
no clean comparison. A single cohort with a matched non-participating class is
worth more than a wide rollout with no baseline.

Entry point would be through the school's existing prevention slot, whatever
that is: a CCE lesson, an assembly follow-up, or a CCA. SIDEQUEST is not asking
for new curriculum time. It is asking for what happens after the existing talk.

## 2. The partner

**One retail or community partner** willing to set a real Partner Challenge.

The self-checkout brief in the prototype is the shape of it. What makes it work
is that the constraints are real: no facial recognition, no more than three
seconds added to a normal basket, must work for someone with a reusable bag or
a child, affordable across an existing terminal fleet.

What the partner provides: the brief, the constraints, and someone who will
read the shortlist. What they get: a set of design proposals from the exact
demographic that uses self-checkout most, and a defensible answer to "what are
you doing about this that is not surveillance".

A community partner alternative: a Neighbourhood Committee or an NCPC-linked
programme setting a Field Quest at a real roadshow.

## 3. The mission

**One digital safety mission run properly**, rather than the whole catalogue.

Job scams and money mule recruitment is the strongest candidate: it targets
exactly this age group, the consequences are severe and poorly understood, and
the decision points are clear enough to rehearse.

The pilot would run `$400 a day, work from home` plus Norm Mirror, with the
Norm Mirror questions administered to the cohort first so the aggregate shown
in the app is that cohort's own real data rather than a placeholder. That is
the single highest-value change the pilot makes to the product.

## 3b. The Campaign pathway

Campaigns give the pilot a second, more practical entry point than asking a
school for curriculum time.

**What it looks like.** One session, one hall or one corridor, four printed
station signs, one or two facilitators, and roughly twenty minutes per
participant. Nothing to install, no accounts, and no setup on anybody's
phone. A cohort of 120 can pass through a drop-in format across a lunch
period.

**Why it fits a pilot better than a lesson.** It is repeatable without
curriculum negotiation, it produces a natural comparison group (people who
did three chapters against people who did four), and it generates the
follow-up completion rate, which is the closest thing to a retention measure
any of this can currently produce.

**The single most valuable change the pilot makes to the product.** Running
the Norm Mirror questions with the cohort *before* the event, then dropping
their own answers into the chapter. A social norms intervention works only if
the audience believes the number, and a local number from their own year
group is the only version that earns that. Everything currently in the build
is an invented placeholder and is labelled as one.

**What would have to be agreed first.** The venue, consent for under-18
participants, and a decision about whether the Crew Shift station is
facilitated or left to self-organise. See `docs/CAMPAIGN_DEPLOYMENT.md`.

## 4. Evaluation

Behavioural, modest, and honest about what it can prove.

**Baseline, week 0.** Whole cohort. The Norm Mirror questions as a survey
(perceived peer rate and own stated choice), plus a short scenario-based
measure: given three short situations, what would you do.

**Intervention, weeks 1 to 8.** Participating group uses SIDEQUEST. Matched
group receives the school's existing provision only.

**Follow-up, week 8 and week 12.** Same instruments, both groups.

What we would look for:

| Measure                          | Why it matters                                             |
| -------------------------------- | ---------------------------------------------------------- |
| Gap between perceived and actual peer rate | The direct target of Norm Mirror                   |
| Change in stated intention in scenarios    | Whether rehearsal transfers                        |
| Named strategies, free text                | Do participants produce a plan or a slogan          |
| Completion and return rate                 | Whether the thing is actually used unprompted       |
| Build Quest submission quality             | Whether participation reaches creation              |
| Campaign chapters completed, 3 against 4   | Whether the resilience rule costs engagement        |
| Crew Shift movement rate                   | Whether group discussion moved the decision         |
| Follow-up completion at 1 day and 1 week   | Retention past the event                            |

What we would **not** claim: that this reduces crime. An eight week pilot with
two hundred students cannot show that, and saying otherwise would discredit
everything else in the evaluation. What it can show is whether perceived norms
move, whether stated intentions change, and whether young people keep opening
it. Those are the honest questions at this stage.

We would want the survey instruments reviewed by someone with a psychology or
education research background before week 0, and appropriate consent from the
school and from parents or guardians for under-18 participants.

## 5. Reward partner

**One sponsor funding something small and real.**

The reward curve in the prototype is deliberately weighted so recognition is
cheapest and vouchers cost the most. A pilot sponsor funding S$5 grocery
vouchers at the top of the curve costs very little at this scale and tests the
part of the model we are least sure about: whether tangible rewards add
motivation or crowd out the intrinsic reasons people are participating.

That is worth measuring, not assuming. If completion rates are unchanged with
and without the voucher tier, the honest conclusion is that the vouchers were
not the reason, and the model should say so.

## 6. What the pilot would change in the product

Ordered by how much it matters:

1. **Real norm data** replacing the placeholders, with provenance flipped.
2. **A content pipeline** so advisories reach Pulse without the team writing
   each one by hand. Either an official feed arrangement or a partner
   authoring workflow.
3. **Accounts and persistence**, because a passport that lives in one browser
   is not a passport. This is the first point at which a backend becomes
   genuinely necessary rather than technically interesting.
4. **A moderation and review process** for partner-authored missions, which is
   a policy problem before it is an engineering one.
5. **Age adaptation beyond ordering**, if the cohort data shows the 13 to 15
   band needs materially different content rather than the same content sorted
   differently.

## 7. What we would need from an agency

Nothing exotic:

- Permission to link to official resources in the way we already do, and a
  correction if any of it is wrong.
- Ideally, a feed or a regular export of public advisories.
- A view on whether the Safety Passport could ever map to something recognised.

We are not asking to become a reporting channel, and we would decline if
offered. That boundary is the reason the product is safe to run.
