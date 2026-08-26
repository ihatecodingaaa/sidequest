# SIDEQUEST

A youth-first crime prevention app for Singapore, built for Delta Challenge 2026, Track B.

> We are not building another place for youths to learn about crime prevention.
> We are building a reason for them to participate in it.

Singapore already has school talks, advisories, message boards, roadshows and
ScamShield. What it does not have is a single place where reading about a risk
leads directly into doing something about it. SIDEQUEST is that layer:

**See, understand, play, act, create, impact.**

The signature interaction is that a story does not end when you close it. Every
Pulse story finishes with a **Play** button that drops you into a two minute
scenario about the exact situation you just read about. Reading and doing are
the same tap.

---

## Three pillars

| Pillar      | Question it answers        | What it contains                                                     |
| ----------- | -------------------------- | -------------------------------------------------------------------- |
| **Pulse**   | What is happening?         | Safety stories, discovery links, radio, everything linked to a mission. Labelled **Updates** in the navigation. |
| **Missions**| What can I do about it?    | Quick, Crew, Field, Build, Service and Boss quests                     |
| **Safe**    | I need help now.           | Direct handoff to official Singapore services                          |

Plus **Home** (one thing to do next) and **You** (the Safety Passport).

Five destinations, in this order: Home, Updates, **Safe**, Missions, You. Safe is
the elevated centre tab. It carries the brand mark and a label, it sits in the
same place on every screen, and it never pulses or demands attention. It is a
destination, not an action: tapping it opens a screen and does nothing else. It
is also the one route that works before onboarding, because a safety hub that a
setup flow can block is not a safety hub.

## The three signature missions

**REWIND** puts you in a group situation with your friends, lets it play out,
then rewinds to the single second where it was decided and lets you answer
differently. It is decision rehearsal: the options that work are the quiet ones
that let the other person keep face.

**Norm Mirror** asks what percentage of your peers would take a risk, then what
you would do, then shows the aggregate. People usually overestimate, and the
overestimate is part of what makes a risky choice feel normal. Every figure in
the prototype is a labelled placeholder, not a survey result.

**BREAKSAFE** is crime prevention as engineering. You inspect a mock
self-checkout, find what makes the honest action harder than the dishonest one,
then choose what to change. Facial recognition is on the menu and scores badly
on privacy and fairness, on purpose. The reveal:

> SAME PERSON. SAME PRODUCT. DIFFERENT ENVIRONMENT.
> We changed the environment, not the person.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

No database, no environment variables, no API keys, no accounts. Everything is
typed fixture data plus localStorage.

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Development server                                  |
| `npm run build`     | Production build                                    |
| `npm run start`     | Serve the production build                          |
| `npm run lint`      | ESLint                                              |
| `npm run typecheck` | TypeScript, no emit                                 |
| `npm run test`      | Vitest unit tests                                   |
| `npm run e2e`       | Playwright smoke tests, builds and serves as needed |
| `npm run verify`    | Lint, typecheck, unit tests and build in one go     |
| `npm run icons`     | Regenerate the PWA icon set                         |
| `npm run shots`     | Screenshot every screen at phone width for QA       |
| `npm run shots:audit` | Screenshot every screen at 390, 430, 768 and 1440, and report overflow |

Before running `npm run e2e` for the first time: `npx playwright install chromium`.

## Demo controls

Judging happens more than once, so resetting has to be instant.

- **Settings, Load demo progress** fills in a deterministic set of XP, completed
  missions and skill points. The same button always produces the same state.
- **Settings, Reset demo** clears everything and returns to onboarding.
- `/?demo=1` loads demo progress from the URL.
- `/?demo=reset` clears everything from the URL.

See `docs/DEMO_SCRIPT.md` for the three to four minute walkthrough, including
what to do if the network or the camera fails.

---

## Architecture

```text
src/
  app/
    (app)/            navigated routes: home, pulse, missions, safe, you, ...
    play/[id]/        full-screen mission players, deliberately outside the shell
    manifest.ts       PWA manifest
  components/
    layout/           app shell, wordmark, onboarding gate, service worker
    navigation/       bottom bar and desktop rail
    ui/               button and shared primitives
    mission/          mission cards
  features/
    home/ pulse/ missions/ safe/ profile/ rewards/ crews/ radio/ partner/
    missions/
      engine/         shared scenario player, mission shell, completion screen
      rewind/ norm-mirror/ breaksafe/ field/ partner/
  data/               typed fixtures: missions, pulse, scenarios, rewards, crews
  lib/                XP engine, official links, formatting, accent tokens
  store/              zustand store with localStorage persistence
  types/              domain models
```

Some choices worth knowing about:

- **No backend, by decision.** A polished deterministic prototype beats an
  unreliable one with infrastructure. The store is a single module, so swapping
  localStorage for a real persistence layer later touches one file.
- **Mission players are data-driven.** Everything except the three signature
  missions runs on one branching engine, so a new scenario is a fixture change.
- **`ProvenanceTag` is the honesty mechanism.** Every surface that renders
  seeded, synthetic or unconfirmed material carries one. See `docs/DATA_SAFETY.md`.
- **Recency is a number, not a timestamp.** Pulse items store an offset in
  hours, so the feed renders identically on the server and the client and does
  not drift between demo days.
- **XP is awarded once per mission id.** Replaying is encouraged and adds
  nothing, which keeps the product from becoming a click farm.

Stack: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4,
Zustand, Zod, Lucide, Vitest, Playwright.

## Documentation

| File                     | What is in it                                          |
| ------------------------ | ------------------------------------------------------ |
| `docs/PRODUCT_SPEC.md`   | Thesis, audience, pillars, missions, behavioural design |
| `docs/CAMPAIGNS_SPEC.md` | The Campaign subsystem: model, chapters, routes, follow-ups |
| `docs/CAMPAIGN_DEPLOYMENT.md` | Running a Campaign at a real school or roadshow      |
| `docs/CAMPAIGN_BEHAVIOUR.md` | Mechanism, hypothesis and limits, chapter by chapter  |
| `docs/DEMO_SCRIPT.md`    | The judging walkthrough and its recovery steps          |
| `docs/DATA_SAFETY.md`    | Privacy, profiling, partnership and demo data policy    |
| `docs/PILOT_PLAN.md`     | A realistic post-hackathon pilot                        |
| `docs/SOURCES.md`        | Authoritative sources behind the factual content        |
| `docs/SESSION_STATE.md`  | Current build status, tests, known issues, next actions |
| `docs/UX_RESEARCH.md`    | Interface research, sources, and the decisions each one drove |
| `docs/UX_AUDIT.md`       | Consumer UX problem inventory, severity, and Track B alignment |
| `docs/SIGNATURE_EXPERIENCE_RESEARCH.md` | Comparison, peer influence, provenance and PWA install decisions |
| `CLAUDE.md`              | Engineering rules for anyone working in this repo       |

## What SIDEQUEST deliberately does not do

No facial recognition. No suspicious-person scoring. No predictive policing. No
public crime maps. No anonymous accusations. No crime reporting inside the app.
No claimed partnerships that do not exist. No republished article text.

The product principle: **support safe behaviour, do not profile people.**
