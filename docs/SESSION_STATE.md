# Session state

Kept current so another session can pick this up cold. Update after every major
stage.

**Last updated:** 27 August 2026
**Status:** Living prevention world complete and verified. Signals, threads,
moving residents, the Community Safety Crew, Solo Preview and the rubric
evidence set.

**The landscape defect is fixed, and it was not a layout problem.** Rotating
the phone was destroying the canvas: the two orientations rendered different
JSX trees, React reconciles children by position, so a rotation unmounted the
whole subtree and mounted a fresh canvas while the engine went on drawing into
the old detached one. The world was not thin, it was dead. Full write-up in
`docs/LANDSCAPE_RECOVERY.md`.

**The next action is real iPhone testing**, and rotation during play is the
first thing to try. Everything here was measured in Chromium, which is what
missed the bug in the first place.
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
| Pulse, labelled Updates | One lead story with its mission handoff, then a compact list of seven. Filters, save, and outbound discovery grouped by publisher: official services separately from news reporting. Detail pages carry signals, actions, primary source and the route into the mission. |
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
| Chapter 4 | Crew Shift. Pass the phone, private answers, reveal, timed discussion, **a second private round**, then a before-and-after distribution. The second round is also the decision; a tie is broken by the crew. Solo supported. |
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

## Signature experience pass

Ran after the consumer UX pass. No new features, no new navigation destination,
no backend. Research in `docs/SIGNATURE_EXPERIENCE_RESEARCH.md`.

| Change | Effect |
| ------ | ------ |
| "Pulse" tab relabelled **Updates** | Closes UX_AUDIT H8, the highest-confidence finding the previous pass left unactioned. Route stays `/pulse`; the pillar keeps its name in the docs. |
| One shared reveal grammar | REWIND, Norm Mirror, BREAKSAFE and Crew Shift now all end in a labelled before state, a connector, and a labelled after state, via `ShiftReveal`. Four games, one grammar. |
| Crew Shift runs two private rounds | The second round produces the "after" distribution and *is* the crew's decision. Previously one private round, and then whoever held the phone chose for everyone. |
| Peer shift is shown, not asserted | Two bar distributions on a shared baseline, in fixed option order, plus a count of how many answers changed. Never a seat, never a persuader. |
| "What changed the outcome?" | One to three protective factors resolved from the path taken, from a shared closed vocabulary. Story language on screen, behavioural terms internal. |
| Provenance vocabulary completed | `reported` added for journalism, `pilot` added and guarded. Required on every Pulse item, discovery link and reward. |
| Content integrity guardrails | 14 unit tests that fail the build on partnership language, an unlabelled record, a duplicated emergency number, or a `pilot` claim. |
| Install invitation | One placement, after the Campaign finale, next to the delayed follow-ups that are the reason. Dismissible, remembered, gates nothing. Real button on Chromium, real instructions elsewhere, nothing in standalone. |
| Campaign warm-up | `router.prefetch` for the four chapters and the finale once the Campaign screen mounts. Skipped under `saveData`. |
| Onboarding skip | "Skip, I will pick later" now appears from the interests step rather than only the last one. Shortest honest path is welcome, age band, skip. |
| Offline copy | Says progress is saved on this device, which is true because there is no backend. |
| Flaky test fixed | The bottom-bar geometry test read tab positions with `evaluateAll`, which does not auto-wait, so it flaked about six runs in seven. It predates this pass and was found by verifying each commit separately rather than only the tip. |

## Game feel pass

Ran after the signature experience pass, and unlike the two before it this one
started from **user feedback rather than an audit**: real testers said it was
too wordy, visually flat, and hard to navigate inside the Campaign. Research in
`docs/GAME_FEEL_RESEARCH.md`, screen-by-screen findings in
`docs/FOCAL_POINT_AUDIT.md`, the visual system in
`docs/VISUAL_ART_DIRECTION.md`.

| Change | Effect |
| ------ | ------ |
| `StoryBeat` | Every narrative surface reveals one idea at a time at the player's pace instead of printing the whole scene. Choices do not appear until the scene ends. Keyboard, screen reader and reduced motion all supported. |
| Character portraits | Original stylised SVG, six expressions, speaker always named in text. Never realistic, and expression never carries an idea alone. |
| Campaign navigation | The next chapter is lifted out of the list into the largest control on the screen, named. Node states use shape, icon, label and position, not colour alone. |
| Chapter entry rebuilt | Was the heaviest reading load in the whole chapter at 45 words. Now three things: it worked, what this is, move away from the station. |
| Mission marks | One original abstract SVG per signature mission, doing the job of recognition before reading. |
| Echo collection | Five cosmetic variants, each unlocked deterministically by something actually done, selectable and persisted. No randomness, currency or scarcity. |
| Debriefs | The behavioural mechanism moved behind a "Why this works" disclosure. Plain language stays in the play surface. |
| Text audit tooling | `npm run audit:text` and `npm run audit:taps`, so the next person measures instead of guessing. |

Measured, with `scripts/tap-audit.mjs`:

| Journey | Taps before | after | Worst reading step before | after |
| ------- | ----------: | ----: | ------------------------: | ----: |
| ONE BAD MINUTE ch1 | 4 | 8 | 45w | 26w |
| REWIND | 2 | 7 | 44w | 36w |
| Crew Shift | 4 | 9 | 46w | 29w |

Taps roughly doubled on purpose: more presses, far less to read per press.
Story beats now deliver 12 to 18 words each. An early version reached 13 taps
for chapter 1 by giving every sentence a beat, which is tap fatigue; merging
tightly coupled lines and cutting one duplicated screen brought it back to 8.

Deferred deliberately, with reasons in the research doc: background music (no
lyrics is settled by the evidence, instrumental was a scope call), interface
sound effects, and the four Digital Street Smarts missions (P2, gated behind
this pass being complete).

## Visual delight pass

Ran after the game feel pass, on the same kind of evidence: a reviewer looked at
the built product and said the collectible layer was "technically present but
not emotionally or visually obvious". That is a different failure from broken,
and it needed a different fix. Research in `docs/VISUAL_DELIGHT_RESEARCH.md`,
system in `docs/VISUAL_ART_DIRECTION.md`.

| Change | Effect |
| ------ | ------ |
| Echo is a mascot | Shield body, visor face, six expressions, five crest variants. Reads at 28px and 120px from one 64 unit drawing. It was a ring with a stroke through it. |
| The collection is visible | A grid of character tiles with the equipped one worn and locked ones showing as slots with their condition. It was five list rows below a passport. |
| Unlocks are a moment | A new Echo is announced on the completion screen at 104px and equippable there. Previously it was recorded and discovered later somewhere else. |
| Completion is reward-first | What happened, the unlock, XP, what next, then passport detail behind a disclosure. It used to spend four of its first five elements on numbers about the player. |
| The cast is visible | Portraits rebuilt in three layers (field, hair silhouette, face plane), which is what gives them contrast at portrait size. Ken, Jas and Ilyas are now distinguishable at a glance in dialogue. |
| Home has people in it | The four leads sit behind the hero type at low opacity. The hero was a colour field and a headline, which is atmosphere without a subject. |
| The campaign is a journey | A two-layer spine that fills as you progress, and a finale that looks like a destination rather than a fifth row. |
| Updates has editorial art | Original motifs of the object or system each story is about. This was the largest thing the previous pass left undone. |

Deliberately not done, with reasons in the research doc: background music and
sound effects (design settled, unbuilt), new missions (the P2 gate was not met),
scene backdrops, and a horizontal campaign map.

### Perceptibility follow-up

A rendered audit at 390, 430, 768 and 1440 found four things the pass had built
correctly and then placed where nobody would meet them. Code review would not
have caught any of them, because none of them are defects in the components.

| Finding | Measurement | Fix |
| ------- | ----------- | --- |
| The collection was still unfindable | Its heading sat 739px down an 1812px page, behind the level ring, three stat tiles, seven capability rows and two disclaimers | Moved above the Safety Passport. The passport still owns more of the screen; the collection now owns the first look. |
| Home had no mascot at all | Echo appeared only after a mission was already underway, so the busiest screen in the product gave no evidence a companion existed | Echo greets you at 64px, wearing the equipped variant, linking into the collection |
| Echo was the smallest thing on screen | 36px in the callout, below the surrounding iconography | 52px, enough for the visor and expression to carry |
| The Start pill sat across a face | The hero cast is anchored bottom right and the control is in flow, so they collided at every phone width | Left edge of the cluster masked out, which also pushes the eye to Ken |
| Chapter intros were mostly empty | Roughly 750px of black between the last line and the footer, which reads as a failed load rather than restraint | A scene band: the four leads and the timestamp, decorative, so the reading load the tap audit lowered stays lowered |

### Mission worlds pass

The audit before this one graded mission artwork FAIL and it was the right
call. Eleven dark rectangles with a 38px line drawing in the corner is a list.

| Change | Effect |
| ------ | ------ |
| Worlds, above marks | A wide scene per signature mission in `mission-world.tsx`, on discovery cards, mission detail and mission intros. The marks keep the compact rows, where a scene would blur. |
| REWIND | Three figures, a filled pivot, one future running on and one folding back into it. The mechanic is legible before the copy. |
| Norm Mirror | An imagined crowd inside a thought outline against a measured handful, across a bent mirror. No numbers and no axis, so the drawing cannot claim more than prototype data supports. |
| BREAKSAFE | The same figure at the same coordinates in both halves, with only the environment rearranged. The mission's claim is now the picture. |
| Crew Shift | Four figures of equal weight, scattered arrows becoming aligned ones. No individual is marked as the cause. |
| Mission detail gained art | It was the last surface before committing minutes and the only discovery surface with no picture of what was being committed to. |
| Story beats centre | Narration used to render two lines at the top of a 62vh column with the control in a fixed footer. Centred instead: no decoration added, no reading added. |
| Speaker portraits at 56px | At 44px they sat below the cap height of two lines and read as a bullet beside the name. |

Verified by rendering, not by inspection: speaker beats now confirmed to show
the portrait, the name and the expression together, which the previous audit
could not confirm.

### Campaign map pass

The last remaining PARTIAL. Chapter progress was a vertical list of four full
width cards on a spine: every state modelled correctly, and still a task
manager, because a single column reads as a sequence whatever is drawn beside
it.

| Change | Effect |
| ------ | ------ |
| Constellation, not a column | Four tiles under one destination, with connectors running only chapter to finale. No edge between chapters means nothing reads as "then". |
| Station codes moved into nodes | A7 is what The favour is, not a detail underneath it. |
| The progress card went | Its heading, count, bar and sentence are all stated by the map's own nodes. Keeping it pushed the map below the fold at 390px. |
| Echo marks position | On the recommended chapter, moving to the finale when the finale opens. |
| Chapter intro void, fixed structurally | MissionShell's main is now a column, so a child can take the slack it was already reserving. Nothing was added to the screen. |
| Story beats fill their height | `flex-1` is what made the earlier centring real. |

Page height fell from 2234px to 1920px while gaining the map. Bundle moved
1,699,466 to 1,700,117 bytes, because removing `chapter-node.tsx` and the
progress card paid for most of the map.

**Not done, and honest about it:** the typed narration scene system
(`scene`, `objectMotif`, `castComposition`) described in the brief was not
built. Narration beats are better balanced but still carry no contextual
visual. That is the largest remaining gap in the story layer.

## SIDEQUEST Streets

An original top-down explorable district, added as a vertical slice rather than
an open world. Research in `docs/STREETS_RESEARCH.md` and
`docs/NEXT_WORLD_RESEARCH.md`, build in `docs/STREETS_ARCHITECTURE.md`, visual
system in `docs/STREETS_ART_DIRECTION.md` and
`docs/NEXT_WORLD_ART_DIRECTION.md`.

| Piece | State |
| ----- | ----- |
| District 01 | 40 x 28 tiles, six landmarks, drawn entirely in code. Minimart, void deck, kopitiam, community post, court, bus stop. |
| Graphics | Every surface lit from the top left with a three-tone bevel, drawn between surfaces rather than tile codes. Blocks are facades: roof, fascia, lit windows, awning, doorway, ground shadow. |
| Orientation | Portrait and landscape are both first class. The camera picks a scale and the viewport decides how much world fits; controls move to the outer edges in landscape. |
| Interiors | Three buildings open: minimart, community post, kopitiam. Each is a `WorldMap` like the district, so nothing about movement, collision, dialogue or the camera is duplicated. |
| Movement | Keyboard (arrows/WASD) and a touch thumb pad. Axis-separated collision so walls are slid along, never stuck on. |
| Avatar | Five axes including a covered head and one visible accessory, layered at draw time, works in all four walking directions. Randomise and Skip both present. Nothing earned, priced or dropped. |
| Echo | The equipped variant follows the player. The collection became a companion instead of a settings tile. |
| Cast | Twelve NPCs and fixtures, reusing the campaign characters. Situations, not quiz questions. A machine is drawn as a machine. |
| Missions | NPCs open the existing REWIND, Norm Mirror, BREAKSAFE, Crew Shift and ONE BAD MINUTE. Nothing was rebuilt inside the world. |
| Street Checks | Three optional encounters. The shop floor one is the Track B hero: a friend scans three of five and waits to see what you do. |
| Rewards counter | The existing `claimReward`, in a room, from a person. XP stays a threshold and is never spent. |
| Minimap | Real terrain silhouette, blocks in their own shopfront colours, gold dots on anybody with something available. District only. |
| Quest List | A peer of the map. Every destination openable without walking a step, interiors included. Rows carry the Signal mode as text. |
| Safe | Behind the community post desk. No XP, no reward, no quest, no playfulness. |
| Prevention Signals | Four modes naming the response a situation needs: Connect, Prevent, Redirect, Protect. Never a property of a person, enforced by a test. Colour, silhouette, label and accessible name. |
| Prevention Threads | The Favour (5 steps, 4 people, 2 places, one real branch) and The Shout (3 steps, the district's only red). |
| Residents | Nine ambient people on authored loops. No quest, no dialogue, and they stop when you come close. |
| Community Safety Crew | A room in the void deck: signal board, role card, Build a Quest. Roles read existing skill points. No ranks and no powers. |
| Play mode | Every mission and thread says whether it needs other people, before it opens. |
| Solo Preview | Crew Shift, shown with written example answers, labelled on every screen, granting no crew progression. |

**Engine.** Phaser 4.2.1 was installed, integrated and proven working on this
stack, then removed. It costs 1343 KB raw / 347 KB gzipped for a feature set
this district uses about a fifth of. The original renderer is **8 KB**, and the
whole feature added **73 KB** to the app. Full measurements in the architecture
doc.

**Also in the first Streets pass.** REWIND's separate debrief screen was folded
into the comparison: the player had already seen the consequence and both runs
side by side, and a third full screen teaching the same thing is where a game
stops being a game. The mechanism sits behind one disclosure.

**Two decisions were reversed by measurement during the world upgrade,** and
both are written up in `docs/NEXT_WORLD_RESEARCH.md`. Holding the visible area
constant collapses on a tall container, so the camera picks a scale instead.
And rooms built 18 wide by 12 deep cannot be framed on a portrait phone without
either cropping them or surrounding them with nothing, so they were turned to
face the same way the screen does: 14 wide by 18 deep.

Deferred deliberately: a second district, world audio, mementos, emotes, a
spendable currency, and the wider text compression across Crew, You and
Campaign.

## Verification

Baseline before this stage, then after.

| Check | Start | Campaigns | UX | Signature | Game feel | Delight | Streets | World | Prevention | Landscape |
| ----- | ----- | --------- | -- | --------- | --------- | ------- | ------- | ----- | ---------- | --------- |
| `npm run lint` | clean | clean | clean | clean | clean | clean | clean | clean | clean | clean |
| `npm run typecheck` | clean | clean | clean | clean | clean | clean | clean | clean | clean | clean |
| `npm run test` | 65 | 129 | 129 | 143 | 143 | 143 | 143 | 143 | 161 | **161** |
| `npx playwright test` | 79 (+1) | 135 (+1) | 149 (+7) | 177 (+7) | 207 (+7) | 239 (+7) | 273 (+7) | 295 (+7) | 329 (+7) | **357 (+7)** |
| `npm run build` | passes | passes | passes | passes | passes | passes | passes | passes | passes | passes |
| client JS | ~1.3 MB | ~1.6 MB | 1559 KB | 1574 KB | 1611 KB | 1660 KB | 1733 KB | 1763 KB | 1809 KB | **1810 KB** |

The world upgrade cost **30 KB** across the whole app: the renderer chunk grew
from 8 KB to 17 KB and the world's UI chunk carries the minimap and the rewards
counter. Both are still absent from every other route, verified by watching
network responses rather than by reading the config: on `/`, `/safe` and
`/pulse` neither chunk is requested, and on `/streets` the renderer is not
requested either until a canvas actually exists, because a first-time visitor
sees the avatar screen first.

Swept at five viewports (390, 430, landscape phone, 820 tablet, 1440 desktop)
across seven routes: **no horizontal overflow anywhere, no console errors, no
page errors.** The only sub-44px control found by the audit is the skip link,
which is `sr-only` until focused.

Four real bugs were found by looking rather than by testing, and all four are
now pinned:

- Banking a thread step made that step stop being available, which unmounted
  the panel showing the outcome, the XP and the way out. The sheet snapped back
  to idle dialogue the instant somebody chose something. The conversation is
  now latched to the step it opened with.
- Adding the Police emergency SMS route exposed that `ExternalLink` refuses
  anything that is not http(s), so it would have rendered as inert text. The
  worst possible failure mode for the one route somebody uses when it is not
  safe to speak. `sms:` joined the allowlist, and a test now fails the build if
  the allowlist grows again.

- Finishing a Street Check rebuilt the engine, because `isNpcDone` was a
  dependency of the boot effect. That threw the player back to the spawn point
  the moment they finished a conversation. Once buildings opened it put them
  out on the street mid-sentence.
- Every tree in the district had been drawn as a cream wall tile since the
  district was built. `at()` treated any uppercase character as a landmark door
  letter, and `T` is uppercase. Collision still worked, because a wall and a
  tree are both solid, so nothing failed loudly.
- "Go there" landed two tiles below the person it took you to, which is just
  outside talking range, so the world answered "take me to this person" with
  "Nobody nearby".

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

Bundle: 1637 KB of JavaScript across 36 chunks, uncompressed, for the whole
product, up 26 KB across the visual delight pass and 78 KB across the last
three passes together. No dependency has been added in either: the increase is components
and inline SVG. Every visual in the product is drawn in code, so there is no
image payload at all and nothing new to fetch at a roadshow. Measure it with:

    find .next/static/chunks -name '*.js' -printf '%s
' | awk '{s+=$1} END {print s/1024" KB"}'

The two earliest figures in the table above were taken with a different command
and are approximate. The last two are exact and comparable. The QR encoder is
roughly 50 KB, code-split into chunks referenced only by the organiser station
signs page and never loaded by a participant.

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
- `docs/SIGNATURE_EXPERIENCE_RESEARCH.md`: the comparison, peer influence,
  motivation, provenance, install and prefetch questions, each with its
  evidence, decision and a stated confidence level.
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
