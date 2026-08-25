# Session state

Kept current so another session can pick this up cold. Update after every major
stage.

**Last updated:** 26 August 2026
**Status:** feature complete, verified, pushed to GitHub
**Repository:** https://github.com/ihatecodingaaa/sidequest
**Deployment:** not yet deployed to Vercel.

---

## What works right now

The full judge journey runs end to end, repeatedly, with a one-tap reset.

| Area | State |
| ---- | ----- |
| Onboarding | Four steps: welcome, age band and name, interests, area. All optional except age band, which defaults. |
| Home | Greeting, level and XP, Safety Pulse hero with **Try the related quest**, the three signature missions, a Quick Quest, a Field Quest near you, crew, radio, reward teaser, thesis. |
| Pulse | Eight seeded stories, category filters, save, outbound discovery to CNA and official sources, detail pages with signals, actions, primary source and a route into the mission. |
| Radio | Six stations, all linking out to meLISTEN. No streaming. |
| Missions | Catalogue of 11, "Start here" section for the signature three, filters by type and relevance, detail pages with the behavioural mechanism stated. |
| REWIND | Full branching scenario, five pivot options, rewind mechanic, second run with the first choice locked out, side-by-side comparison, debrief. |
| Norm Mirror | Four situations, predict then choose then reveal, labelled demo aggregates, summary of the gap. |
| BREAKSAFE | Interactive mock terminal, seven hotspots (five real problems, two decoys), six patch options scored on five axes, before and after rebuild, the reveal. |
| Field Quest | Brief, camera QR scanning where supported, manual code always visible, task checklist, completion. |
| Partner Challenge | Full brief with context, constraints, behavioural notes, deadline, reward concept, validated submission form, persistence into the Safety Passport. |
| Partner studio | `/partner`. Six mission templates, a draft form and a preview. Explicitly a walkthrough, not a console. |
| Safe | Two urgent cards, six official services, and a plain statement of what SIDEQUEST does not do. |
| You | Level ring, stats, seven-skill Safety Passport, contributions, completed missions, shortcuts, claims. |
| Rewards | Six rewards, honesty labelling, claim flow that never spends XP. |
| Crew | Seeded crew, weekly challenge, leaderboard, join by code. |
| Settings | Name, age band, interests, area (manual plus optional one-shot geolocation), demo controls, data disclosure. |
| PWA | Manifest, six generated PNG icons including maskable, apple touch icon, service worker with an offline shell. |
| Demo mode | `Load demo progress` and `Reset demo` in Settings, plus `/?demo=1` and `/?demo=reset`. |

## Verification

All green as of the last run.

```bash
npm run lint          # clean
npm run typecheck     # clean
npm run test          # 65 unit tests, 3 files
npm run build         # succeeds, every route prerendered static
npx playwright test   # 79 passed, 1 skipped (desktop-only skip of a phone check)
```

The e2e suite runs on two projects, `mobile` (Pixel 7) and `desktop` (1440x900),
and covers: onboarding, every route, navigation, horizontal overflow, deep link
refresh, PWA manifest and icons, Safe links and the absence of any report form,
information to action from Home and from Pulse, saving, all three signature
missions including the rewind mechanic and the profiling warning, Field Quest
manual check-in, Partner Challenge submission and persistence, reward claiming,
locked rewards, demo reset, demo load determinism, crew join, plus a full
accessibility suite (axe at WCAG AA across 12 routes, accessible names, touch
target sizes, skip link, reduced motion).

Bundle: about 1.3 MB of JavaScript chunks across all routes before compression.

## Known limitations

Deliberate, and mostly documented in the product itself.

1. **All content is seeded.** There is no live feed. Every seeded surface is
   labelled with a `ProvenanceTag`. Recency labels are illustrative and the
   Pulse footer says so.
2. **Norm Mirror percentages are invented.** Labelled on every reveal. See
   `docs/DATA_SAFETY.md`.
3. **No partnerships exist.** Every partner-shaped thing is labelled a concept
   or a prototype. Unit tests fail the build if a confirmation flag is flipped.
4. **Crews are not real.** No realtime layer, no accounts, no invites. Members
   and weekly totals are seeded, and the screen says so.
5. **State is per-browser.** localStorage only. Clearing site data resets
   everything, and a passport does not follow you to another device.
6. **QR scanning depends on `BarcodeDetector`.** Safari has no support. The
   manual code field is always visible, so this can never block a demo.
7. **Partner studio saves nothing.** It is a walkthrough of the authoring
   workflow, not an admin backend.
8. **Next.js is pinned to 16.3.2.** The npm `latest` tag points at 16.3.3, whose
   tarball currently 404s on the registry. Unpin once that is fixed.
9. **Dark mode only.** A deliberate single-look commitment, not an oversight.

## Deferred on purpose

- Realtime crew multiplayer. Would have cost the signature missions their time
  and would not strengthen the argument.
- A database and accounts. The first genuinely necessary backend arrives with
  the pilot, not before. See `docs/PILOT_PLAN.md`.
- Runtime AI. Not needed, and it would add cost, latency and privacy surface to
  a loop that works deterministically.
- Reverse geocoding through an API. The nearest-centroid table is enough and
  keeps coordinates off the wire entirely.
- Age-differentiated content bodies. Age band reorders the feed today. Whether
  13 to 15 needs materially different content is a question for the pilot.

## Next actions

1. **Deploy on Vercel.** Import the GitHub repo through the Vercel web UI.
   Framework preset is Next.js, root directory is the repo root, and every
   build setting is the default. There are no environment variables to set.
2. After deploying, test the live URL at phone width and on a laptop: direct
   route refresh, the manifest, the install prompt, and every outbound link.
3. Record the deployment URL in this file.
4. Rehearse `docs/DEMO_SCRIPT.md` twice against the deployed URL.

## Repository

- Remote: https://github.com/ihatecodingaaa/sidequest
- Branch: `main`, tracking `origin/main`
- Working tree: clean
- Author on every commit: Lucas Tan
- No `Co-Authored-By` trailers, and no AI attribution anywhere in the history.

Note: this repository was initialised inside `Documents/sidequest`. The parent
`Documents` folder happens to contain its own unrelated git repository with no
commits. Nothing in this project touches it.
