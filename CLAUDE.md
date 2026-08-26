# CLAUDE.md

Engineering rules for SIDEQUEST. Keep this short enough to actually be read.

## Product thesis

We are not building another place for youths to learn about crime prevention.
We are building a reason for them to participate in it.

The loop is: see, understand, play, act, create, impact. If a change breaks the
path from a Pulse story into a mission, it is the wrong change.

## Non-negotiables

**Data honesty.** Anything seeded, synthetic or unconfirmed is labelled. The
rule is per claim and per screen, not per card: a `ProvenanceTag` must appear
on every detail view, every mission, every reward that names a potential
partner, every Norm Mirror reveal and the Campaign impact page, and a dense
feed declares provenance once at the top rather than on all eight rows. That is
a deliberate anti-fatigue decision, not permission to remove labels. Norm
Mirror percentages are placeholders and every reveal says so. Never label
seeded content "live".

**No fake partnerships.** SPF, NCPC, Mediacorp, CNA, FairPrice, banks, schools
and hackathon sponsors are named only as sources or as *potential* partners.
`isConfirmedPartner` and `isPartnerConfirmed` stay `false` until a real
agreement exists. Unit tests enforce this.

**No profiling.** No facial recognition, emotion recognition, individual risk
scores, predictive policing, public crime maps, anonymous accusations or
suspect hunting. Never reward reporting people, photographing people or
identifying people. Support safe behaviour, do not profile people.

**No content redistribution.** Never scrape or reproduce article text. Write an
original summary, attribute the authority, link out to their own page.

**Official services stay official.** SIDEQUEST never receives a crime report and
never rebuilds an agency service. `src/lib/official-links.ts` is the single
source of truth, and every entry must be checked against the live site.

**Location.** Never store coordinates, never build a location history. A
neighbourhood name is the finest granularity, and it is optional. The app must
work fully with location denied.

## Navigation and Safe

- Safe is the elevated centre tab. It is a **destination, never an action**:
  tapping it opens a screen and must never dial, report, share location or
  notify anyone. Apple's guidance on tab bars is the reason, and an e2e test
  pins it.
- Safe never moves, never changes label, and is never hidden behind overflow.
  Its whole value is that its position does not have to be remembered.
- Safe is exempt from the onboarding gate. A first-time visitor under stress
  must reach it without answering setup questions.
- Safe must not depend on profile, XP, campaign, crew or network state.
- Nothing in the bottom bar animates at rest. Permanent motion on a safety
  affordance produces the alarm fatigue it is meant to avoid.
- Every tab keeps a text label. The label carries the meaning; the icon does
  not rescue an unclear one.
- Exactly one element on Safe is red. If everything is urgent, nothing is.

## Track B alignment

The submission is Delta Challenge Track B, **Crime Prevention**, not scam
education. The consumer journey must lead with youth crime prevention: peer
pressure, shop theft, identity and account misuse, impulsive choices, peer
redirection. Scam content is legitimate where it is a youth offending pathway
(money mule recruitment) but it is secondary, and it must never be what Home,
the featured story or the demo opens with. ScamShield and the scam helpline
belong under Safe as utility, not in discovery.

## Campaigns

- Campaign routes live outside the `(app)` group so a QR scan is never blocked
  by onboarding. A chapter must run on a completely cold device.
- Campaign chapters drive the existing mission players through `MissionHost`.
  Never copy mission logic into a Campaign component.
- Campaign XP goes through `awardMission` and the per-campaign grant ledger.
  One grant key, one payment, ever.
- The finale opens on any three of four chapters. That rule is deployment
  resilience, not difficulty tuning, and it should not be tightened.
- Station codes are a permanent control on the Campaign screen, never an error
  state. QR must never be a single point of failure.
- Impact figures are invented and labelled as demo data. Never present them as
  participant evidence.

## Engineering

- Mobile first. 390px is the design target. 44px minimum touch targets, safe
  area insets respected, no horizontal scroll on any route.
- No backend, no database, no auth, no runtime AI. If one becomes genuinely
  necessary, stop and explain why before creating anything.
- XP is awarded once per mission id. Replaying is free and grants nothing.
- Client components only where interactivity requires them.
- Accent colours come from `src/lib/accent.ts` as literal class strings.
  Tailwind scans source text, so never build a class name by concatenation.
- Respect `prefers-reduced-motion` in CSS and in JS-driven animation.
- Outbound links go through `ExternalLink`, which enforces http(s) and
  `rel="noopener noreferrer"`.
- No `dangerouslySetInnerHTML`. Sanitise and validate anything a user types.

## Writing

Short, confident, conversational, non-judgemental. No forced youth slang, no
fearmongering, no preachy warnings, no corporate filler. Do not imply Singapore
is unsafe.

**No em dashes.** Unicode U+2014 must not appear anywhere: UI copy, docs,
comments, commit messages, test names, generated content. Use commas, colons,
parentheses, semicolons or hyphens.

## Git

- Never add `Co-Authored-By` trailers.
- Never credit Claude, Anthropic or any AI as an author, in commits, in the
  README, or anywhere else.
- Never modify the user's git identity and never use `git commit --author`.
- Never rewrite published history or force push unless explicitly told to.
- Never commit `.env`, keys, tokens or personal data.

## Before calling a stage done

```bash
npm run verify     # lint, typecheck, unit tests, production build
npx playwright test
```

All four must pass, plus the e2e suite. Do not report success with known errors
outstanding. Update `docs/SESSION_STATE.md` after every major stage, and update
the other docs whenever product behaviour changes.

## Demo reliability

The judging walkthrough in `docs/DEMO_SCRIPT.md` must run start to finish,
repeatedly, with a one-tap reset between judges. No single non-core integration
(camera, geolocation, an external link) may be able to break it.
