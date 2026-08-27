# Pilot measurement plan

What SIDEQUEST would measure, why each measure is worth taking, and what none
of it can be used to say.

**Status: nothing has been collected. Zero participants.** Every figure in the
product today is invented and labelled as such, and a unit test fails the build
if `pilot` provenance appears before real pilot data exists.

---

## The claim boundary, first

The causal claim, that SIDEQUEST reduces youth offending, is:

- **unmeasurable** at any sample size a six month school pilot can reach, since
  the base rate of the outcome is low and the exposure is brief;
- **unfalsifiable as usually stated**, because "would have offended otherwise"
  has no observable comparison; and
- **unnecessary**, because the brief asks for awareness and participation, not
  for a crime reduction trial.

So the plan measures **proximal outcomes**: the things that plausibly sit
between the product and the behaviour, that can be moved in weeks, and that can
be observed honestly.

Every proximal outcome carries the same caveat, stated once here rather than
hedged in six places: **a change in confidence or knowledge is not a change in
behaviour.** The literature on that gap is not encouraging and the plan does
not pretend otherwise.

---

## Measures

Each row: what, why, when, expected direction, privacy, limitation.

### 1. Risk recognition

| | |
| - | - |
| **What** | Given a short written situation, can the participant name what is developing, before it resolves? Three items, scored by a facilitator against a rubric, not self-reported. |
| **Why** | Step one and two of the bystander decision model: notice, then interpret. If a young person does not read a moment as one that needs anything, nothing downstream matters. |
| **When** | Pre, and again at the end of the pilot. |
| **Expected** | Upward. This is the outcome the product is most directly built to move. |
| **Privacy** | Facilitator-scored on paper, aggregate only, no names. |
| **Limitation** | Recognising a written situation is easier than recognising a live one. This over-reads. |

### 2. Intervention confidence

| | |
| - | - |
| **What** | "How confident are you that you could respond safely if this happened near you?" Five points, three scenarios. |
| **Why** | Step four: knowing what form of help to give. The whole Signal system exists to move this specific number. |
| **When** | Pre and post. Optionally as a one-tap in-product prompt in Pilot Mode. |
| **Expected** | Upward. |
| **Privacy** | Anonymous. In-product answers stay on the device and are read as an aggregate by the facilitator, never transmitted. |
| **Limitation** | Confidence can rise without competence rising, and an overconfident bystander is not obviously a better one. Read alongside measure 3, never alone. |

### 3. Knowledge of the escalation route

| | |
| - | - |
| **What** | "Someone may be in danger and it is not safe to talk. What do you do?" Free text, scored right or wrong against SPF's published channels. |
| **Why** | The most concrete, least arguable thing the product teaches. Either somebody knows 999 and the emergency SMS route or they do not. |
| **When** | Pre and post. |
| **Expected** | Upward, and this is the measure most likely to show a clear effect. |
| **Privacy** | Anonymous. |
| **Limitation** | Knowing a number is a long way from using it under stress. |

### 4. Perceived peer norms

| | |
| - | - |
| **What** | "Out of ten people your age, how many would say something if a friend was about to take something from a shop?" Compared against what the same cohort says **they** would do. |
| **Why** | This is the Norm Mirror mechanic as a measure. The gap between "what I would do" and "what I think everyone else would do" is the misperception peer influence runs on. |
| **When** | Pre and post. |
| **Expected** | The gap narrows. |
| **Privacy** | Anonymous, aggregate. |
| **Limitation** | Self-report about hypothetical others, twice removed from behaviour. Treat as the softest measure here. |

### 5. Willingness to redirect

| | |
| - | - |
| **What** | "In the last two weeks, did you say something to a friend about something risky?" Yes or no, plus an optional sentence. |
| **Why** | The closest thing to a behavioural outcome that a school pilot can ethically and practically collect. |
| **When** | Post only, at two points. |
| **Expected** | Upward, weakly. |
| **Privacy** | Anonymous. **No names of other people are collected, ever.** The optional sentence is prompted with "do not name anybody". |
| **Limitation** | Self-report, socially desirable, and unverifiable. The optional sentences are more useful as qualitative material than as a number. |

### 6. Behavioural traces the product already produces

| | |
| - | - |
| **What** | Thread steps completed, decisions taken at each branch, **replays where a different option was chosen**, return visits, crew participation, drafts written. |
| **Why** | The only measures here that are not self-report. The replay-with-a-different-choice trace is the most interesting: it is a young person choosing to find out what else would have happened. |
| **When** | Continuous, on-device. |
| **Expected** | Replays and returns rise across a multi-session pilot. |
| **Privacy** | Stays in local storage. To read it, a facilitator would need a deliberate export step that does not exist yet and would require consent to build. |
| **Limitation** | Engagement is not learning. Wouters et al. found a learning effect for serious games and **no** motivational advantage, so completion counts prove somebody used the thing and nothing more. |

---

## Pilot Mode

An organiser setting, off by default, that enables the pre and post prompts
inside the product.

- **Consumer mode stays clean.** A young person who is not in a pilot is never
  surveyed. Two prompts across a whole pilot, not one per session.
- Answers stay on the device and are read as a cohort aggregate by the
  facilitator, in the room.
- Every screen produced under Pilot Mode carries the `pilot` provenance tag,
  which is **currently forbidden by a unit test** and stays forbidden until
  real data exists. That test is the tripwire that stops a demo figure
  graduating into an evidence figure by accident.

---

## What a good result would look like, honestly

A successful six month pilot produces:

- A clear rise in measure 3, because it is concrete.
- A modest rise in measures 1 and 2.
- A narrowing of the gap in measure 4, or a persuasive explanation of why not.
- Qualitative material from measure 5 that is more useful than its number.
- Engagement traces that show multi-session use rather than one long first day.

It does **not** produce a crime statistic, and a report that contains one
should be read with suspicion.

---

## What we would need before claiming more

1. A comparison group. Without one, pre-post is a description, not a finding.
2. Enough participants for the difference to mean anything.
3. Independent scoring for measure 1, because the facilitator who ran the
   sessions is not a neutral rater.
4. A follow-up at three months, since a same-day change tells you almost
   nothing about durability.

None of those are in the six month plan. That is a limitation of the plan, not
an oversight in the write-up.
