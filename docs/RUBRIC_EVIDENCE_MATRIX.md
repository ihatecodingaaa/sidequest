# Rubric evidence matrix

Delta Challenge 2026, Track B, Crime Prevention.

For each judging criterion: what the product actually does, what a judge can be
shown, what a pilot would measure, what is still missing, and the exact line
between a claim we may make and one we may not.

Written to be argued with. A matrix that scores itself well on every row is a
pitch deck, not an audit.

**Last reviewed:** 27 August 2026.

---

## How to read the last two columns

The distinction between "may claim" and "must not claim" is not caution for its
own sake. Every "must not" below is a sentence that would be easy to say, would
sound good, and would be false. Any one of them, said to a judge who then
checked, would cost more than the criterion was worth.

---

## 1. Problem Definition and Community Relevance

| | |
| - | - |
| **Product evidence** | Every scenario opens **before or at the start of** the risky behaviour, because every risk factor the brief names (peer pressure, impulsive decisions, poor risk awareness, wanting to be accepted, not seeing the consequence) operates before an offence. There is no crime scene, no aftermath and no investigation anywhere in the product. The flagship thread is account lending between friends; the flagship Street Check is a shop floor with a friend watching. Both are taken directly from SPF's published advisory for 13 to 19 year olds. |
| **Demo evidence** | Walk into the minimart, talk to Bea: five things in the basket, three scanned, and she is waiting to see what you do. Thirty seconds, no explanation needed. |
| **Pilot metric** | Recognition: can a participant name what is developing in a situation before it resolves? Measured pre and post. |
| **Remaining gap** | The scenarios were written from published advisories and from reasoning, **not from Singapore youth co-design sessions.** That is the single biggest content weakness and Month 1 of the pilot plan exists to fix it. |
| **May claim** | "Grounded in published SPF guidance for this exact age band, and quoted rather than paraphrased." |
| **Must not claim** | "Co-designed with young people." Not yet true. |

---

## 2. Innovation and Creativity

| | |
| - | - |
| **Product evidence** | The Signal system: four modes that name **the response a situation needs** rather than how serious it is, in a product category that reliably does the opposite. Crew Shift: two private rounds either side of a discussion, which makes peer influence visible in about ninety seconds without a backend. An explorable district where prevention is something you walk into rather than a menu item. District Memory: the block accumulates a record of what you did in it, filed by place, derived entirely from existing state and worth no points at all. Eight stickers that commemorate having been somewhere rather than finishing quotas, with no randomness and no rarity anywhere in the system. Eight things in the world that pay nothing on purpose. All art drawn in code. |
| **Demo evidence** | Point at an amber chevron: "the colour describes what this needs, not who that person is." Then Crew Shift's two distributions. Then walk to the court and open "you have history here". |
| **Pilot metric** | Not a metric. Innovation is judged, not measured, and pretending otherwise would be worse than saying so. |
| **Remaining gap** | The four-mode vocabulary is untested on real young people. It may turn out that three modes are learnable and four are not. Whether District Memory produces attachment is a hypothesis, not a finding: see `docs/LIVING_DISTRICT_2_RESEARCH.md` section 3, where it is labelled Directional and put in the verification queue. Five further hypotheses about continuity, collection, asynchronous crew, theme framing and companion reactions are stated as hypotheses in section 11 of that document and none has been tested. |
| **May claim** | "The marker describes the response, and it is structurally impossible for it to describe a person: there is no risk field on a person anywhere, and a test fails the build if one appears." |
| **Must not claim** | "The first product to do this." Unverified, and unnecessary. Also not: "research shows players get attached to places that remember them." The direction is supported, the transfer to a fictional district on a phone is not, and the research doc says so. Also not: "collectibles increase retention", "Echo improves learning", "District Memory causes people to come back", or "the crew rebuild increases engagement". None of the four is measured and the first is explicitly rejected in the research doc. |

---

## 3. Impact and Measurable Outcomes

**This is the weakest criterion and pretending otherwise helps nobody.**

| | |
| - | - |
| **Product evidence** | Deterministic local state produces honest behavioural traces without a backend: which option was taken at each decision, whether a mission was replayed with a different choice, thread progress, crew participation, drafts written. Every demo figure in the product carries a provenance tag, and a unit test fails the build if `pilot` provenance appears before real pilot data exists. |
| **Demo evidence** | The impact page, labelled demo. The rewards counter, labelled partner concept. Nothing anywhere presents invented numbers as participant evidence. |
| **Pilot metric** | Six proximal outcomes, in `docs/PILOT_MEASUREMENT_PLAN.md`: risk recognition, intervention confidence, knowledge of the correct escalation route, perceived peer norms, willingness to redirect, and behavioural traces. |
| **Remaining gap** | **No data has been collected. Zero participants.** Every number in the product today is invented and labelled as such. There is also no control group in the plan, which caps what a six month pilot can conclude. |
| **May claim** | "A measurement plan built on proximal outcomes, with the limitations written down." |
| **Must not claim** | "SIDEQUEST reduces youth offending." Unmeasurable at this scale and unfalsifiable as stated. Also not: any pre-post change presented as caused by the product. |

---

## 4. Feasibility and Implementation Plan

| | |
| - | - |
| **Product evidence** | It is built and it runs. No backend, no auth, no realtime, no runtime AI, no database. A phone with a browser and no network after first load is the entire deployment requirement. Campaign routes sit outside the onboarding gate so a QR scan works on a cold device, and station codes exist because QR must never be a single point of failure. |
| **Demo evidence** | Run the whole judging walkthrough on venue wifi, then run it again after a one-tap reset. |
| **Pilot metric** | Session completion rate, and reset-to-reset reliability at a roadshow. |
| **Remaining gap** | Not deployed. Local storage only, so nothing survives a cleared browser or moves between devices, which a school pilot would eventually need. |
| **May claim** | "Implementable in six months by a small team, because the hard part is content and the platform already exists." |
| **Must not claim** | "Production ready." It is a prototype with prototype data. |

---

## 5. Sustainability and Scalability

| | |
| - | - |
| **Product evidence** | The scalable unit is a **content pack**, not an application. The district, the engine, the signal vocabulary, the thread runner and the crew mechanic are all reusable; a new deployment is new threads, new checks and new briefs. Content declares an `audienceBand`, so the same mechanism carries different copy for different ages without a second engine. Youth drafts feed the same pipeline. |
| **Demo evidence** | The Crew board's Build a Quest tab: a young person writes a scenario in the same shape the product consumes. |
| **Pilot metric** | Drafts submitted per cohort, and how many survive facilitator review. |
| **Remaining gap** | The pack architecture is proven by one variant field, not by shipping a second pack. There is no authoring tool for a non-engineer: a new thread is currently a TypeScript file. |
| **May claim** | "Rotating content without rebuilding the app, demonstrated by the audience band split." |
| **Must not claim** | "Anyone can author content." Today that requires a developer. |

---

## 6. Team and Collaboration

| | |
| - | - |
| **Product evidence** | Mostly not a product criterion, and inventing a feature to tick it would be obvious. What the repository does show is a working method: research documents that record what was **rejected** and why, decisions reversed when measurement contradicted them, and tripwire tests that encode the ethical rules so they survive a future contributor who has not read the docs. |
| **Demo evidence** | `docs/LIVING_PREVENTION_RESEARCH.md`, and the two reversals recorded in `docs/NEXT_WORLD_RESEARCH.md`. |
| **Pilot metric** | None. |
| **Remaining gap** | **No behavioural science reviewer, no youth advisory input, and no SPF or NCPC contact has reviewed any of this.** The safety rules are self-imposed. |
| **May claim** | Roles actually held. Nothing else. |
| **Must not claim** | Any advisor, reviewer, partner or collaborator who has not agreed in writing. No named individual appears anywhere in this repository who has not consented. |

---

## 7. Communication and Presentation

| | |
| - | - |
| **Product evidence** | `docs/DEMO_SCRIPT.md` is a timed walkthrough with contingencies for a failing camera, a failing QR and a failing thumb pad. The Quest List means a demo never depends on anybody's dexterity. Copy throughout is short, non-judgemental and free of fearmongering. |
| **Demo evidence** | The rotation moment, and the Solo Preview honesty moment: "this one is built for two to four people, I am alone, so here is the clearly labelled preview that does not pretend these are real answers." |
| **Pilot metric** | None. |
| **Remaining gap** | Landscape currently fails on a real iPhone: the world collapses to a strip and the controls take most of the screen. Reported from a real device on 27 August 2026 and **not yet fixed**, which makes the rotation moment a liability rather than an asset until it is. |
| **May claim** | "One person can demonstrate the entire product, including the group mechanic." |
| **Must not claim** | "Works well in every orientation on every device." It does not, today, and the evidence is a screenshot. |

---

## The parameters, separately

The brief lists six parameters alongside the criteria. They are worth their own
row because they are the ones easiest to assert and hardest to evidence.

| Parameter | Evidence | Honest gap |
| --------- | -------- | ---------- |
| **Youth-Led** | Build a Quest turns a player into an author. Roles are identities rather than ranks. | Youth wrote none of the shipped content. This is the parameter with the largest gap between intent and evidence. |
| **Adaptable** | `audienceBand` on content, with variant copy for the same mechanism, mapped onto SPF's own 13-to-19 and older-youth split. | One variant proven, not a full pack. Nothing written for under 13s. |
| **Grounded** | SPF advisories quoted verbatim, sources cited in every debrief, official channels re-verified on 27 August 2026. | Two academic citations could not be fetched this pass and are marked as such in the research doc. |
| **Sustainable** | Content packs, weekly rotation, crew challenges, youth drafts. | No authoring tool for non-engineers. |
| **Complementary** | The Delta League is a joint SPF and NCPC holiday programme. SIDEQUEST's role is the layer between activations, which addresses the brief's own "episodic engagement" gap. | No contact with either organisation. Complementarity is a design intention, not an arrangement. |
| **Within Scope** | No reports taken, no agency service rebuilt, no profiling, no surveillance, no combat, no police roleplay. Enforced by tests, not by intent. | None known. This is the parameter the product is strongest on. |

---

## The sentences we are never allowed to say

1. "SIDEQUEST reduces crime."
2. "In partnership with the Singapore Police Force." Or NCPC, or any retailer.
3. "Pilot data shows." There is no pilot data.
4. "Co-designed with youth." Not yet.
5. "This person is high risk." The product cannot say it, because nothing in it
   can represent it.
6. "Collectibles increase retention." Rejected in the research, and the sticker
   system is justified by what it commemorates rather than by an effect.
7. "Echo improves learning." Nothing measured, and the companion is justified
   as delight and nothing more.
8. "District Memory causes people to return." A hypothesis, written down as
   one, and untested.
9. "Our crew feature drives engagement." There is no social graph and no
   measurement. What the rebuild did was make the screen honest.
10. "This is what your crew has done this week." There is no backend. Anything
    said about the other four members is prototype content and is labelled as
    such on the screen itself.
