# SIDEQUEST product specification

Delta Challenge 2026, Track B: Crime Prevention.

## 1. The problem we are actually solving

Singapore is not short of crime prevention information. There are school talks,
MOE collaborations, Student Learning Space modules, Police Message Boards,
Coffee with a Cop, roadshows, NCPC programmes, retailer collaborations, social
media, games, Police@SG, Community Watch and ScamShield.

The gap is not awareness. The gap is what happens in the ten seconds after
someone reads an advisory. Almost always: nothing. The information arrives, it
is understood, and then it is closed.

SIDEQUEST is the participation layer that sits between knowing and doing.

## 2. Thesis

> We are not building another place for youths to learn about crime prevention.
> We are building a reason for them to participate in it.

The product loop:

**SEE** what is happening, **UNDERSTAND** why it matters, **PLAY** the decision
before it happens for real, **ACT** on it with an official tool or a real
activity, **CREATE** a better version of the system, and see the **IMPACT** in
what you are now able to do.

The breakthrough is not aggregation. It is **information to action**: a safety
story ends with a playable mission about that exact risk, not with a close
button.

## 3. Audience

**Hackathon beachhead:** youth in Singapore, split into 13 to 15, 16 to 18 and
19 to 25. Content carries age band metadata and the feed reorders accordingly.
Nothing is hidden by age; relevance changes the order, never the catalogue.

**Long term:** the same architecture supports children, parents, working adults
and seniors. The MVP stays visibly youth-first because that is the brief, and
because a product that tries to be five products is none of them.

Tone: short, confident, intelligent, non-judgemental. No forced slang. Youth
notice when adults perform youth.

## 4. Pillars and navigation

Five destinations, in this order: **Home**, **Updates**, **Safe**, **Missions**,
**You**.

The second pillar is still called **Pulse** in this document, in the codebase
and at `/pulse`. Its navigation label is "Updates", because a tab label's job
is prediction and an invented word has no information scent for someone who has
not used the app. The route was left alone: renaming URLs for cosmetic
consistency breaks links people have already shared. See `docs/UX_AUDIT.md` H8.

Safe sits in the centre as an elevated, branded tab. That placement buys
recognition and muscle memory rather than speed, since the centre of a
five-item bar is actually the harder spot for a thumb arcing from a bottom
corner. It is compensated for with a taller target. Safe remains a destination
and never an action: tapping it opens a screen and nothing else happens, and it
is exempt from onboarding so a first-time visitor can reach it. The reasoning
and its sources are in `docs/UX_RESEARCH.md`.

**Pulse**, labelled Updates, is the everyday utility layer: safety stories in
plain language, outbound discovery to CNA and official sources, radio discovery
through meLISTEN, and a route into a mission from most items. Outbound
discovery is grouped by who publishes it, official services separately from
news reporting, so every row is labelled by the group it sits in.

### SIDEQUEST Streets

An original top-down explorable district at `/streets`, entered from Home.

The player has an avatar they assembled, the Echo they equipped follows them,
and eight neighbours are standing around District 01 with situations rather
than quiz questions. Talking to one opens an **existing** SIDEQUEST experience:
REWIND at the minimart, Norm Mirror at the kopitiam, BREAKSAFE from the uncle
whose card got charged twice, Crew Shift at the court, ONE BAD MINUTE from Ken
at the void deck, and Safe from the community post.

Two optional Street Checks sit at the sides, sourced to SPF and ScamShield
guidance and worth XP once. They are side content: Track B's hero material is
peer pressure, impulsivity, account misuse and peer intervention, and the four
hero missions carry it.

The world owns no product state. It reads the store, asks the product to act,
and reflects the result. Everything reachable by walking is reachable from the
Quest List without walking a step.

Scope is deliberately one district. Full reasoning in
`docs/STREETS_RESEARCH.md`, `docs/STREETS_ARCHITECTURE.md` and
`docs/STREETS_ART_DIRECTION.md`.

### Echo, and the collection

Echo is SIDEQUEST's mascot: a shield-bodied character with a visor face, six
expressions, and five collectible crest variants. It appears where it has a
reason to (Campaign screens, story interstitials, completion screens, You) and
**never on Safe**.

The collection is five variants, each earned by something the player actually
did, displayed as a grid of tiles rather than a settings list. Locked tiles
state what unlocks them before it is earned. Nothing is random, bought, timed
or scarce, and a style is cosmetic only: it changes Echo's crest and colour and
nothing about XP, missions or progress.

A new variant is announced on the completion screen where it is earned and can
be worn there. An unlock discovered later on another screen is a database
write, not a reward.

Full system in `docs/VISUAL_ART_DIRECTION.md`, reasoning in
`docs/VISUAL_DELIGHT_RESEARCH.md`.

### The reveal grammar

All four signature mechanics end by comparing two states, and since the
signature experience pass they share one visual grammar: a labelled before
state, a connector, a labelled after state, both permanently on screen.

| Mechanic | Before | After |
| -------- | ------ | ----- |
| REWIND | First run | After the rewind |
| Norm Mirror | You predicted | Prototype aggregate |
| BREAKSAFE | Before | After |
| Crew Shift | Before discussion | After discussion |

They stay four different games. What is shared is the grammar, not the layout:
`ShiftReveal` is a frame, renders no card of its own, and each mechanic supplies
its own content. Distributions are bars on one shared baseline in fixed option
order, never re-sorted, because a row that moves is the signal. Nothing is
revealed by motion and nothing is hidden without it.

Selected endings also carry **"What changed the outcome?"**: one to three
protective factors resolved from the path the player took, drawn from a shared
closed vocabulary in `src/data/protective-factors.ts`. They describe the story
rather than grading the player, and the behavioural term each is drawn from is
internal and never rendered.

**Missions** is where prevention becomes participation. Six formats:

| Format      | Length     | What it is                                             |
| ----------- | ---------- | ------------------------------------------------------ |
| Quick Quest | 2 to 5 min | A branching scenario you finish on a bus                |
| Crew Quest  | ~8 min     | A shared goal your crew completes asynchronously        |
| Field Quest | ~25 min    | An activity at a real place, with a check-in            |
| Build Quest | ~15 min    | A design brief you answer                               |
| Service Quest | hours    | Verified volunteering, run by the organisation itself   |
| Boss Quest  | a season   | A long horizon challenge for crews                      |

**Campaigns** is the fourth surface, and the one that reaches into physical
space. A Campaign turns a school activation or a roadshow into a single story
told across four stations: scan an ordinary QR with the phone camera, walk
away, play a short chapter, reach a finale, and receive follow-up chapters a
day and a week later. It reuses the mission mechanics rather than duplicating
them, adds one new peer interaction (Crew Shift), and is designed around the
constraint every roadshow actually has, which is queueing. Full detail in
`docs/CAMPAIGNS_SPEC.md`, deployment notes in `docs/CAMPAIGN_DEPLOYMENT.md`,
and the behavioural rationale per chapter in `docs/CAMPAIGN_BEHAVIOUR.md`.

**Safe** is the plainest screen in the app. Large targets, minimal decoration,
direct handoff to Police emergency, the ScamShield helpline, ScamShield,
I-Witness, Police e-services, SPF advisories and NCPC. SIDEQUEST receives no
reports and rebuilds no service.

## 5. The three signature missions

### REWIND

Four friends, a shop near the interchange, five minutes before anyone has to be
anywhere. One of them makes a decision in about one second. You play it out,
reach an outcome, and then rewind to that second and answer differently.

**Behavioural mechanism: decision rehearsal.** People rarely fail these moments
because they do not know what is right. They fail because they have never said
the sentence before. Replaying the pivot with an alternative response builds a
script that is retrievable at speed.

The option design is the substance. Choices are graded by how much face they
cost the other person, not by moral force:

- Saying it quietly, or suggesting everyone leaves, works.
- Saying it in front of the group turns a decision into a status contest and
  hardens the position. This is modelled honestly as harder, not as wrong.
- Laughing or staying silent sets a group norm, and the escalation arrives two
  weeks later rather than immediately.

No choice ends in an instant arrest, because that is not what usually happens
and pretending otherwise teaches nothing.

### Norm Mirror

Four situations. For each: predict what percentage of your peers would take the
risk, commit to your own choice, then see the aggregate.

**Behavioural mechanism: perceived versus reported norms.** The social norms
literature repeatedly finds that people overestimate how many peers engage in a
risky behaviour, and that the overestimate is itself part of what makes the
behaviour feel normal. Correcting the picture is one of the few prevention
levers that works without telling anyone what to do.

Order is fixed and matters: the prediction comes before the personal choice, so
the prediction cannot be rationalised backwards.

**Every figure is synthetic and labelled.** The direction of the effect is
grounded in published research. The magnitudes are ours, they are placeholders,
and the mission says so on every reveal. Replacing them with real data is a
change to `demoAggregate` in `src/data/norm-mirror.ts` and nothing else.

### BREAKSAFE

A mock self-checkout that quietly pushes people towards the wrong outcome.
Three moves: find what makes the honest action hard, choose what to change, see
the terminal rebuilt.

**Behavioural mechanism: situational crime prevention.** Changing the
environment removes the need for self-control, and does it without profiling
anyone. The findings are all about ambiguity and social cost, which is the
honest description of why unintentional non-scanning happens at scale:

- The scan confirmation is a two-word grey label.
- Only the last few items are visible.
- Asking for help triggers a light and pauses the queue.
- Correcting a mistake needs staff approval, so the honest path is slower than
  doing nothing.
- The weight alarm fires on reusable bags often enough that everyone ignores it.

Two hotspots are decoys and explain why they are not the answer: the overhead
camera (records the problem after the fact) and the shopper (never the thing to
solve).

Patch options are scored on prevention, privacy, experience, cost and fairness.
Facial recognition is offered and scores 1 out of 5 on privacy and fairness,
with the verdict spelled out. Refusing it once you have read the scores is a
stronger lesson than never being offered it.

The reveal: **SAME PERSON. SAME PRODUCT. DIFFERENT ENVIRONMENT.**

## 5b. Campaigns

The flagship Campaign is **ONE BAD MINUTE**: four friends, one ordinary day,
and four small decisions that decide how it ends. Nobody is solving a crime.
The participant is learning to see the moments where a situation can still
change direction.

| Chapter | Mechanic | Behavioural point |
| ------- | -------- | ----------------- |
| The favour | REWIND | Rehearse a low-conflict intervention before it is needed |
| Everyone would do it | Norm Mirror | Separate what people assume from what they report |
| Design the moment | BREAKSAFE | Change the system rather than watch the person |
| Crew Shift | New | Make peer influence visible to the people in it |
| Finale | Themed decision | Connect the four, end on something they chose |

Three design decisions carry the whole thing:

**Scan and Scatter.** The screen after a scan tells the participant to walk
away from the station. The station is occupied for the two seconds a scan
takes, not the four minutes a chapter takes.

**Three of four.** The finale opens after any three chapters, so a torn sign
or a crowded table cannot end somebody's experience.

**Follow-ups.** Two chapters unlock after the event, on elapsed time, with no
backend. The roadshow becomes episode one rather than the whole thing.

## 6. Progression and the Safety Passport

XP comes from completing missions, once per mission id. Replaying is encouraged
and grants nothing, which stops the product becoming a click farm.

XP never comes from reporting a crime, photographing anyone, submitting an
allegation or identifying a person.

The level curve is `20 * (L - 1) * (L + 4)` cumulative, producing gaps of 120,
160, 200, 240 and so on. Twelve levels, each with a name.

The **Safety Passport** is the more important artefact. Seven capability areas,
each phrased as something the holder can do:

| Skill              | What it claims                                                    |
| ------------------ | ----------------------------------------------------------------- |
| Decision Making    | Pauses under pressure and picks the option they can defend later   |
| Peer Intervention  | Interrupts a bad moment in a way that lets everyone keep face      |
| Scam Awareness     | Spots urgency, verification requests and payment redirection early |
| Safety Design      | Diagnoses why a system pushes people towards the wrong choice      |
| Community Action   | Contributes to programmes rather than only consuming advice        |
| Leadership         | Sets the norm in a group instead of following it                   |
| Communication      | Turns a warning into something a peer will act on                  |

The passport is a SIDEQUEST record. It is not a SkillsFuture credential and
carries no formal recognition. The structure is designed so that a recognised
credential could be issued by an appropriate body later.

## 7. Rewards

The reward model deliberately puts the cheapest rewards at the bottom and the
commercial ones at the top of the curve. If the fastest route to a voucher is
clicking through content, the product becomes a voucher farm and the prevention
value disappears.

Claiming never spends XP. Progress is a record of what you have done, and
taking a reward should not erase it.

Design is built around autonomy, competence, relatedness, curiosity, mastery
and visible impact. Rewards supplement those motivations, they do not replace
them.

Every reward naming a potential partner is labelled a partner concept. No
retailer, brand or organisation has agreed to fund anything. Prototype claims
issue no code and carry no monetary value, and the confirmation says so.

## 8. Crews

Crews provide the social pull. For the prototype they are asynchronous: a
shared goal, a weekly board, and seeded members. There is no realtime layer, no
account system and no invite flow, and the screens say so.

This was a deliberate scope decision. Realtime multiplayer would have consumed
the time that went into the three signature missions, and it would not have
made the argument any stronger.

## 9. Safety and ethics model

SIDEQUEST is the participation and engagement layer. Official agencies remain
the authoritative safety and reporting layer. The app never becomes a channel
for reports, allegations or surveillance.

The full policy is in `docs/DATA_SAFETY.md`. The one-line version:

**Support safe behaviour, do not profile people.**

## 10. Future architecture

Nothing here is built yet, and nothing here is needed for the hackathon.

- **Content**: an official API, RSS arrangement or partner feed replaces the
  seeded Pulse fixtures. The `PulseItem` model already carries source, source
  URL, provenance and relation fields for exactly this.
- **Persistence**: the zustand store is one module. A managed database behind
  the same interface swaps localStorage out without touching components.
- **Partner authoring**: `/partner` shows the workflow. A real version needs
  accounts, review and moderation, all of which are policy problems before they
  are engineering problems.
- **Real norm data**: replace the placeholders and flip the provenance flag.
- **Credentials**: the Safety Passport structure is designed to support formal
  recognition issued by a body qualified to issue it.
- **AI**: not required at runtime and deliberately absent. It could later help
  with mission authoring, categorisation, accessibility adaptation and
  moderation assistance. It has no place in the prevention loop itself.
