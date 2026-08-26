# Session state

Kept current so another session can pick this up cold. Update after every major
stage.

**Last updated:** 26 August 2026
**Status:** Consumer UX pass complete and verified. Feature complete overall.
**Repository:** https://github.com/ihatecodingaaa/sidequest
**Deployment:** not yet deployed to Vercel. CLI installed, not authenticated.

---

## What works right now

The full judge journey runs end to end, repeatedly, with a one-tap reset.

### Core app

| Area | State |
| ---- | ----- |
| Onboarding | Four steps: welcome, age band and name, interests, area. All optional except age band, which defaults. |
| Home | One hero (continue or start the Campaign), then the three signature missions, crew, one story worth knowing with its mission handoff, and radio. Level and XP live in a compact chip. |
| Pulse | One lead story with its mission handoff, then a compact list of seven. Filters, save, outbound discovery below the product's own content. Detail pages carry signals, actions, primary source and the route into the mission. |
| Radio | Six stations, all linking out to meLISTEN. No streaming. |
| Missions | Campaign hero, "Start here" for the signature three, then short scenarios as compact rows and bigger commitments as cards. Five filters. Detail pages state the behavioural mechanism. |
| REWIND | Full branching scenario, five pivot options, rewind mechanic, second run with the first choice locked out, side-by-side comparison, debrief. |
| Norm Mirror | Four situations, predict then choose then reveal, labelled demo aggregates, summary of the gap. |
| BREAKSAFE | Interactive mock terminal, seven hotspots, six patch options scored on five axes, before and after rebuild, the reveal. |
| Field Quest | Brief, camera QR scanning where supported, manual code always visible, task checklist, completion. |
| Partner Challenge | Full brief, validated submission form, persistence into the Safety Passport. |
| Partner studio | `/partner`. Six mission templates, a draft form and a preview. Explicitly a walkthrough. |
| Safe | Four categorised paths: Emergency, Scam help, Report something, Police services. Urgency ordered, one red element, reading links separated below. No profile, campaign or network dependency, and exempt from onboarding. |
| You | Level ring, three counts with no denominators, the capabilities you are actually building with tier labels, untouched areas collapsed to one line, Campaign participation, contributions, completed missions, shortcuts, claims. |
| Rewards | Six rewards, honesty labelling, claim flow that never spends XP. |
| Crew | Seeded crew, weekly challenge, leaderboard, join by code. |
| Settings | Name, age band, interests, area, demo controls, data disclosure. |
| PWA | Manifest, six generated PNG icons including maskable, apple touch icon, service worker with an offline shell. |

### Campaigns

| Area | State |
| ---- | ----- |
| Listing and detail | `/campaigns`, `/campaigns/[slug]`. Mode selection, story map, progress, station code entry. |
| QR entry | `/campaigns/[slug]/chapter/[chapterSlug]`. Prerendered, outside the onboarding gate, works on a cold device. |
| Scan and Scatter | Chapter unlocked, then a prominent instruction to move away from the station. |
| Route distribution | Four routes, one per starting station, assigned from a stable per-browser seed. Guidance, never a lock. |
| Three of four | Finale opens on any three chapters. Full completion adds a bonus on the same code path. |
| Station codes | A7, B4, C9, D2. Permanent control on the Campaign screen, punctuation and case forgiving. |
| Chapter 1 | The favour. Runs on REWIND. Ken asks Ilyas for his account in front of the group: peer pressure as the mechanism, not a background detail. |
| Chapter 2 | Everyone would do it. Runs on Norm Mirror with a new three-question set. |
| Chapter 3 | Design the moment. Runs on BREAKSAFE. |
| Chapter 4 | Crew Shift. New mechanic: pass the phone, private answers, reveal, timed discussion, group decision, shift report. Solo supported. |
| Finale | One decision, four themed options, four outcomes plus a shared closing. |
| Follow-ups | Aftermath at 20h, One week later at 168h. Elapsed-time unlock, no backend, no push. |
| Station signs | `/campaigns/[slug]/stations`. Real QR codes generated in-browser, printable, with codes and sign text. |
| Impact | `/campaigns/[slug]/impact`. Demo funnel and behavioural measures, labelled invented throughout. |
| Demo controls | Unlock all, reassign route, skip a day, skip a week, reset Campaign. Collapsed by default. |
| Sidekick | Echo. Pure SVG, four moods, no external assets. |

## Consumer UX pass

Ran after Campaigns. No features were added; the work was hierarchy, navigation,
language and Track B alignment. Research in `docs/UX_RESEARCH.md`, problem
inventory in `docs/UX_AUDIT.md`. Before and after screenshots at 390, 430,
768 and 1440 were captured to `artifacts/`, which is gitignored: about 100 MB
of full-page PNGs, regenerable with `npm run shots:audit`.

| Change | Effect |
| ------ | ------ |
| Safe moved to the elevated centre tab | Same position on every route, branded mark, 78x64 target, label kept. A destination, never an action. |
| Safe redesigned | Eight flat cards to four categorised paths, urgency ordered, one red element, no profile or network dependency. 3878px to 2392px tall. |
| Safe exempted from onboarding | It was previously unreachable on a device that had never opened the app. |
| Home rebuilt around one hero | Eleven equal cards to one hero plus three subordinate groups. 6554px to 3340px tall. |
| Pulse rebuilt | Eight identical threat-chipped cards to one lead story plus a compact list. 5508px to 3348px. |
| Missions differentiated | Short scenarios are rows, bigger commitments are cards. Denominator and glossary removed. |
| You de-assessed | Seven progress bars with point counts to four capabilities with tiers; untouched areas collapse to one line. |
| Institutional language removed | Pillar eyebrows, "3 of 11 completed", the mission glossary and the thesis card are gone. |
| Provenance density | Per claim and per screen instead of per card. Rule written into `CLAUDE.md`. |
| Track B alignment | Home, the featured story and the feed now lead with peer pressure rather than scams; Campaign chapter one reframed from scam victim to peer favour. |

Two findings were surfaced rather than acted on, both recorded in the audit:
renaming the "Pulse" tab (H8, a brand decision for the product owner) and light
mode (deferred feature scope).

## Verification

Baseline before this stage, then after.

| Check | Start of project | After Campaigns | After UX pass |
| ----- | ---------------- | --------------- | ------------- |
| `npm run lint` | clean | clean | clean |
| `npm run typecheck` | clean | clean | clean |
| `npm run test` | 65 | 129 | **129** |
| `npx playwright test` | 79 (+1 skip) | 135 (+1 skip) | **149 (+7 skip)** |
| `npm run build` | passes | passes | passes |
| client JS | ~1.3 MB | ~1.6 MB | **1559 KB** |

The seven skips are the new bottom-bar geometry tests, which are phone-only by
design and skip on the desktop project. Six existing assertions were updated
because they encoded copy and structure this pass intentionally changed; each is
commented in the test with the reason. Nothing was deleted to get green.

Earlier in the project the `MissionHost` refactor was verified the same way: a
player with no host behaves exactly as before, which is why the 79 pre-existing
e2e tests passed unchanged immediately after it.

E2E runs on `mobile` (Pixel 7) and `desktop` (1440x900). Campaign coverage adds:
listing and detail, entry points from Home and Missions, mode persistence, QR
deep links for all four chapters, entry on a device that has never opened
SIDEQUEST, refresh mid-chapter, station code unlock and rejection, the full
pass-the-phone flow with answers verified hidden until all are in, solo mode,
chapter XP paid once, the map reflecting progress, the finale locked below
three, the finale paying once, the completion bonus at four, follow-up lock
then demo-clock unlock, follow-up XP paid once, the weekly follow-up needing a
week, station signs producing local data-URL QR codes, impact labelling,
Campaign reset preserving earned XP, and full demo reset clearing campaigns.

Accessibility: axe at WCAG AA across 17 routes including five Campaign routes,
plus accessible names, touch target sizes, skip link and reduced motion. All
pass.

Bundle: 1559 KB of JavaScript across 33 chunks, uncompressed, for the whole
product. Measure it with:

    find .next/static/chunks -name '*.js' -printf '%s
' | awk '{s+=$1} END {print s/1024" KB"}'

The two earlier figures in the table above were taken with a different command
and are approximate; this one is exact and is the measure to use from now on.
The UX pass added no dependencies and deleted one component, so its own effect
on this number is close to nothing. The QR encoder is roughly 50 KB, code-split
into chunks referenced only by the organiser station signs page and never
loaded by a participant.

## Known limitations

Deliberate, and mostly stated in the product itself.

1. **All content is seeded.** Every seeded surface carries a `ProvenanceTag`.
2. **Norm Mirror percentages are invented**, in both the standalone mission and
   the Campaign chapter. Labelled on every reveal. This matters more than a
   normal disclaimer, because a social norms intervention only works if the
   audience believes the number. See `docs/CAMPAIGN_BEHAVIOUR.md`.
3. **Campaign impact figures are invented.** The page says so twice.
4. **No partnerships exist.** Unit tests fail the build if a confirmation flag
   is flipped.
5. **State is per-browser.** Campaign progress does not follow a participant to
   another device, and clearing site data loses it.
6. **Follow-ups unlock but nothing notifies.** There is no push infrastructure,
   so the honest pitch is that the chapter is waiting, not that the phone buzzes.
7. **Crew Shift is pass-the-phone.** No realtime layer. For four people standing
   together this is the right mechanic, not a compromise, but it does not work
   for a distributed group.
8. **A first scan needs a connection.** Chapters already opened keep working
   offline; a chapter never loaded cannot open with no network at all.
9. **Campaign reset pays again.** Resetting clears the grant ledger, so a
   replayed Campaign genuinely awards XP again. Correct for a demo control, and
   the reason reset lives behind a collapsed panel.
10. **Next.js pinned to 16.3.2.** npm `latest` (16.3.3) has a broken tarball.
11. **Dark mode only.** A deliberate single-look commitment.

## Deferred on purpose

- Realtime multiplayer for Crew Shift.
- Accounts, a database, push notifications.
- An organiser CMS. Station signs are the whole of the organiser tooling.
- Runtime AI anywhere.
- Downloadable share card for Campaign completion.
- Haptics on chapter unlock. Support is inconsistent and the value was unclear.

## Design documentation

- `docs/UX_RESEARCH.md`: principles, sources and the decisions each one drove,
  including two corrections to reasoning the pass started with.
- `docs/UX_AUDIT.md`: the problem inventory with severity, and a Track B
  alignment section.
- `npm run shots:audit`: renders every screen at 390, 430, 768 and 1440 into
  `artifacts/`, and reports horizontal overflow and content hidden under the
  bottom bar. Not committed; the numbers drawn from it are in the audit.

## Next actions

1. **Deploy on Vercel.** Needs the user: `vercel login` and `vercel link` are
   interactive. The existing `sidequest` project should be linked rather than a
   new one created. No environment variables.
2. After deploying, print station signs **from the deployed address** and test
   a real scan with a real phone camera. This is the one thing that cannot be
   verified locally.
3. Test the live URL at phone width and on a laptop: deep-link refresh, the
   manifest, the install prompt, outbound links.
4. Record the deployment URL here.
5. Rehearse `docs/DEMO_SCRIPT.md` twice against the deployed URL, including the
   Campaign section with a real scan.

## Repository

- Remote: https://github.com/ihatecodingaaa/sidequest
- Branch: `main`, tracking `origin/main`
- Author on every commit: Lucas Tan
- No `Co-Authored-By` trailers, and no AI attribution anywhere in the history.
- Zero U+2014 em dashes in tracked files.

Note: this repository was initialised inside `Documents/sidequest`. The parent
`Documents` folder happens to contain its own unrelated git repository with no
commits. Nothing in this project touches it.
