# Data, safety and honesty policy

This document is the answer to "what could go wrong with this app". It is
written to be checked against the code, not to reassure.

## 1. What SIDEQUEST stores

Everything lives in `localStorage` on the user's own device, under one key,
`sidequest.profile.v1`. There is no server, no database and no account.

Stored:

- Display name, if given. Optional.
- Age band, interests, neighbourhood. All optional.
- XP, streak, completed mission ids, saved story ids.
- Skill points per capability area.
- Build Quest submissions the user wrote.
- Reward claims, as an id and a prototype reference with no value.

Not stored, ever:

- Coordinates or any location history.
- Anything about an incident, a place or another person.
- Contacts, messages, social graph or device identifiers.
- Analytics or third-party tracking of any kind. There are no trackers in this
  build.

**Reset demo** in Settings clears the key completely.

## 2. Location

The app is fully usable with location permission denied, never asked for, or
unavailable. Manual area selection is the primary path and appears in
onboarding and in Settings.

The browser geolocation API is called in exactly one place: the **Use my area**
button in Settings (`src/features/profile/settings-screen.tsx`). When used:

1. The reading is taken once, with `enableHighAccuracy: false`.
2. It is compared in memory against a table of approximate town centres.
3. The nearest town **name** is stored.
4. The coordinates go out of scope and are never written anywhere.

No background location. No repeated polling. No location history.

## 3. Profiling: the things we refuse to build

SIDEQUEST does not contain, and must never contain:

- Facial recognition or emotion recognition.
- Individual criminality or risk scores.
- Suspicious-person flagging of any kind.
- Predictive policing.
- Public crime hotspot maps or neighbourhood risk ranking.
- Anonymous accusation channels.
- Citizen suspect hunting, or uploads of anyone's face.
- Chat surveillance or friend-network profiling.

The product principle: **support safe behaviour, do not profile people.**

This is enforced in content as well as in code. BREAKSAFE offers facial
recognition as a patch option specifically so it can be scored 1 out of 5 on
privacy and fairness with the reasoning spelled out, and the Partner Challenge
brief rules it out in its constraints. A unit test asserts both.

XP is never awarded for reporting a crime, photographing a person, submitting an
allegation, or identifying anyone. Field Quests instruct participants to look at
systems, not at people, and to leave anywhere that feels wrong to be in.

The app never encourages confrontation. In REWIND, every option that produces a
good outcome is quiet, private, or simply leaving.

## 4. Crime reporting

SIDEQUEST does not receive crime reports and does not store incident
information. The Safe screen contains no form and no free-text field, and an
e2e test asserts that.

Reports go to the Police, through the Police. `src/lib/official-links.ts` is the
single source of truth for those handoffs, and each entry states plainly what
tapping it will do.

Numbers and URLs were verified against the live official sites on 25 August
2026. If the app and an agency's own site ever disagree, the agency is right.

## 5. Content and copyright

No article text is scraped, copied or republished. Every Pulse item is an
original summary written by the SIDEQUEST team from publicly available
advisories, and each one links out to a real page owned by the authority it
names.

Discovery tiles carry no invented headlines. Each names a publisher and opens a
section that publisher actually maintains.

Radio never streams or rehosts audio. Every station opens meLISTEN, which
handles playback and rights.

## 6. Partnership claims

**No organisation has partnered with SIDEQUEST.** Not SPF, NCPC, MHA, MOE,
Mediacorp, CNA, FairPrice Group, Sheng Siong, any bank, any school, or any
hackathon sponsor.

Where the product needs a partner-shaped thing, it says so:

- Missions carry `partner.isConfirmedPartner: false`.
- Radio stations carry `isPartnerConfirmed: false`.
- The self-checkout brief is labelled a **Prototype Partner Challenge** and
  states on screen that nobody commissioned it.
- Rewards naming a plausible sponsor are labelled **Partner concept**.
- No unapproved commercial logos are used anywhere.

Copy says "Listen on meLISTEN", never "our partner Mediacorp".

Unit tests in `tests/unit/content.test.ts` fail the build if any of these flags
is ever flipped to true without a real agreement behind it.

## 7. Prototype data policy

Four provenance labels, rendered by one component, `ProvenanceTag`:

| Label              | Means                                                        |
| ------------------ | ------------------------------------------------------------ |
| Official source    | Links out to the agency that owns this service                |
| Prototype content  | Written by the team from public advisories, not a live feed   |
| Demo aggregate     | Illustrative placeholder numbers, not survey results          |
| Partner concept    | A proposal. No organisation has committed to this             |

Rules:

- Never use a "LIVE" label for manually seeded data. Seeded Pulse content is
  labelled "Prototype content" and the feed footer repeats that recency labels
  are illustrative.
- "Listen live on meLISTEN" is acceptable because the external service really
  is live. The claim is about meLISTEN, not about us.
- The word "verified" appears only where prototype data is actually marked
  verified.

### Norm Mirror specifically

Every percentage in `src/data/norm-mirror.ts` is **synthetic**. They are shaped
to demonstrate a mechanism and they are not findings about Singapore youth.

The direction of the effect is grounded: the social norms literature repeatedly
finds people overestimate how many peers engage in a risky behaviour. The
magnitudes are ours and they are placeholders.

Every reveal in the mission shows a "Demo aggregate" chip, a "Prototype data"
chip, and the sentence: *"These percentages are illustrative placeholders
created for the SIDEQUEST prototype, not survey results."* The summary screen
repeats it in full. An e2e test asserts all three appear on every question.

To replace with real data: run the same questions as a survey, drop the results
into `demoAggregate`, add `sampleSize` and `sourceNote`, and flip the mission's
provenance. No component changes are needed.

## 8. Credentials

The Safety Passport is a SIDEQUEST record. It is **not** a SkillsFuture
credential and carries no formal or government recognition. The profile screen
says this in plain language.

The structure is designed so that a body qualified to issue recognition could
do so later. That is a future possibility, not a current claim.

## 9. Application security

Client-side only, deployed as a static site, but still:

- All user text passes through `sanitiseText`, which strips control and
  invisible characters and clamps length.
- Build Quest submissions are validated with Zod before being stored.
- No `dangerouslySetInnerHTML` anywhere in the codebase.
- Outbound links go through `ExternalLink`, which refuses anything that is not
  http(s) or `tel:` and applies `rel="noopener noreferrer"`. This closes off
  `javascript:` and `data:` URLs arriving from data.
- Security headers in `next.config.ts`: `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`,
  and a `Permissions-Policy` that limits geolocation and camera to same-origin
  and disables microphone and payment entirely.
- No secrets, no environment variables, no API keys in the build.
- The service worker caches the app shell and static assets only. It never
  caches anything a user typed.

## 10. Safeguarding in mission content

- Missions never instruct anyone to intervene physically or to confront a
  person.
- Field Quests are explicitly about systems and spaces, never about people, and
  the brief says do not photograph anybody, do not follow anybody, do not record
  staff, and leave anywhere that feels wrong.
- Scenario content avoids operational detail. REWIND describes a decision, not a
  technique. BREAKSAFE describes ambiguity in an interface, not how to defeat
  one.
- Outcomes are realistic. No choice ends in an instant arrest, because that is
  not what usually happens and modelling it that way teaches nothing.
- Debriefs explain mechanisms rather than moralising.
