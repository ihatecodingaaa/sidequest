# Session state

Kept current so another session can pick this up cold. Update after every major
stage.

**Last updated:** 26 August 2026
**Status:** Campaigns complete and verified. Feature complete overall.
**Repository:** https://github.com/ihatecodingaaa/sidequest
**Deployment:** not yet deployed to Vercel. CLI installed, not authenticated.

---

## What works right now

The full judge journey runs end to end, repeatedly, with a one-tap reset.

### Core app

| Area | State |
| ---- | ----- |
| Onboarding | Four steps: welcome, age band and name, interests, area. All optional except age band, which defaults. |
| Home | Greeting, level and XP, Safety Pulse hero with **Try the related quest**, the three signature missions, the Campaign card, a Quick Quest, a Field Quest near you, crew, radio, reward teaser, thesis. |
| Pulse | Eight seeded stories, category filters, save, outbound discovery to CNA and official sources, detail pages with signals, actions, primary source and a route into the mission. |
| Radio | Six stations, all linking out to meLISTEN. No streaming. |
| Missions | Catalogue of 11, "Start here" for the signature three, a Campaigns section, filters, detail pages with the behavioural mechanism stated. |
| REWIND | Full branching scenario, five pivot options, rewind mechanic, second run with the first choice locked out, side-by-side comparison, debrief. |
| Norm Mirror | Four situations, predict then choose then reveal, labelled demo aggregates, summary of the gap. |
| BREAKSAFE | Interactive mock terminal, seven hotspots, six patch options scored on five axes, before and after rebuild, the reveal. |
| Field Quest | Brief, camera QR scanning where supported, manual code always visible, task checklist, completion. |
| Partner Challenge | Full brief, validated submission form, persistence into the Safety Passport. |
| Partner studio | `/partner`. Six mission templates, a draft form and a preview. Explicitly a walkthrough. |
| Safe | Two urgent cards, six official services, and a plain statement of what SIDEQUEST does not do. |
| You | Level ring, stats, seven-skill Safety Passport, Campaign participation, contributions, completed missions, shortcuts, claims. |
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
| Chapter 1 | Quick money. Runs on REWIND with a new scenario. |
| Chapter 2 | Everyone would do it. Runs on Norm Mirror with a new three-question set. |
| Chapter 3 | Design the moment. Runs on BREAKSAFE. |
| Chapter 4 | Crew Shift. New mechanic: pass the phone, private answers, reveal, timed discussion, group decision, shift report. Solo supported. |
| Finale | One decision, four themed options, four outcomes plus a shared closing. |
| Follow-ups | Aftermath at 20h, One week later at 168h. Elapsed-time unlock, no backend, no push. |
| Station signs | `/campaigns/[slug]/stations`. Real QR codes generated in-browser, printable, with codes and sign text. |
| Impact | `/campaigns/[slug]/impact`. Demo funnel and behavioural measures, labelled invented throughout. |
| Demo controls | Unlock all, reassign route, skip a day, skip a week, reset Campaign. Collapsed by default. |
| Sidekick | Echo. Pure SVG, four moods, no external assets. |

## Verification

Baseline before this stage, then after.

| Check | Before | After |
| ----- | ------ | ----- |
| `npm run lint` | clean | clean |
| `npm run typecheck` | clean | clean |
| `npm run test` | 65 passed | **129 passed** |
| `npx playwright test` | 79 passed, 1 skipped | **135 passed, 1 skipped** |
| `npm run build` | passes | passes |

No existing test was weakened or removed. The `MissionHost` refactor is
transparent: a player with no host behaves exactly as before, which is why the
79 pre-existing e2e tests passed unchanged immediately after it.

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

Bundle: about 1.7 MB of JavaScript chunks across all routes before compression,
up from 1.3 MB. The QR encoder is roughly 50 KB, code-split into chunks
referenced only by the organiser station signs page and never loaded by a
participant.

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
