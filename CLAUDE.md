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

A screen-level declaration must be **exhaustive for that screen**. Labelling
some rows and not others is worse than labelling none: warning a subset raises
the perceived accuracy of whatever is left unwarned (Pennycook et al. 2020, the
implied truth effect). `DataProvenance` is therefore required, never optional
and never defaulted, on every record of a labelled type. `pilot` may not be
used until real pilot data exists, and `tests/unit/integrity.test.ts` fails the
build if it appears. There is no `verified` status, because there is no
verification procedure to give it meaning.

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

## Player input

**Choice first. Action first. Keyboard last.** For standard gameplay, required
keyboard typing is zero. That is a product law, not a target: Streets Signals,
Street Checks, Prevention Threads, NPC conversations, linked missions, Crew
activities, roadshow chapters and quick missions all complete by tapping.

Three exceptions, and no others: a station or crew or mission code, settings and
onboarding, and optional creator expression. Every one of them has a tap path
beside it, and none is on the path a player has to walk. Every `<input>` and
`<textarea>` in `src` must declare `data-input-role` naming which exception it
is; there is deliberately no permitted value meaning "the player must type this",
and `tests/unit/integrity.test.ts` fails the build on an undeclared field.
`npm run audit:input` prints the current count, and `--against <ref>` diffs it.

A `<textarea>` promises an essay whether or not the label does. Optional creator
fields are single-line inputs, and the only textarea left in the product is in
the partner studio, which nothing links to.

This is not permission to make everything multiple choice. A prevention product
whose every activity is four lettered options is a quiz, and a quiz is the thing
the thesis refuses to build. The interaction kit in `src/components/interaction/`
is four primitives and the narrative picks which one a step uses:

- `ChoiceCards` for a decision. Options are actions, never A/B/C/D, capped at
  four, and nothing marks the approved one before it is chosen.
- `Consequence` after every selection, always. Option-specific feedback is what
  makes a choice a learning event rather than a guess, and Butler and Roediger
  (2008) is why it is not optional. No verdict, no score, no red cross. A
  riskier option still gets told what it costs.
- `HotspotScene` for a step about a place. Tap what is making the wrong thing
  easy. Every spot is a real button with a real name, the artwork is decorative,
  and no spot is ever a person.
- `OrderCards` where the sequence is the lesson. Tap to place, never drag.

Prediction is Norm Mirror's slider, which opens no keyboard. Matching is a
choice list with a different prompt. Neither needs a component of its own.

A generated draft is a template and says so on screen. No runtime model, no
network call, and nothing that lets a player believe otherwise.

Evidence, and the overclaims it does not support, live in
`docs/INTERACTION_FIRST_RESEARCH.md`. The "eight second attention span" claim is
not usable: it traces to a consumer report citing an unverifiable source, and
attention researchers reject it.

## Sound

**Every sound is synthesised at runtime. There are no audio files, anywhere.**
Not one. `tests/unit/integrity.test.ts` fails the build if an audio file appears
under `src` or `public`, if any component constructs an `Audio` element or an
`AudioContext`, or if the audio engine is imported statically outside
`src/lib/audio/`. That is what makes the provenance answer trivial: a
synthesised wave cannot contain somebody else's recording, so there is nothing
to license and no way a sample arrives by accident.

No Nintendo, no Pokemon, no ripped game audio, no fan recreations, no packs. The
binding test is in `docs/AUDIO_ART_DIRECTION.md`: if a knowledgeable player could
reasonably say "that is basically the Pokemon sound", it does not ship.

**Sound never carries information.** Every cue accompanies something already on
screen, so the product is complete with audio off and the settings screen says
so. Nothing is announced by sound alone, and nobody is expected to learn a
vocabulary of motifs: abstract earcons rank last of every alert type in the
evidence, and these are acknowledgement rather than signal.

**Nothing plays without a genuine user gesture**, and nothing plays into a
hidden tab. No autoplay, no silent-buffer unlock trick. The product asks once,
plainly, and takes the answer either way, permanently.

**Music never plays audibly under anything being read.** It ducks to inaudible
whenever a sheet is open, because background sound carries a measured cost to
reading comprehension and this product's core interaction is reading a situation
and deciding about it. No vocals, ever, anywhere.

**Safe is silent by an enforced route rule**, not as a side effect of
unmounting. Three separate switches plus a master, in Streets and in Settings,
persisted under their own storage key because sound is a fact about the room
somebody is in, not about who they are.

Do not claim sound improves learning. It does not, and
`docs/LIVING_WORLD_RESEARCH.md` records why.

## Reveals

- All four signature mechanics end in the same grammar: a labelled before
  state, a connector, a labelled after state, both permanently on screen. Use
  `ShiftReveal`; do not invent a fifth private layout.
- `ShiftReveal` renders no card. The comparison is typography, spacing and a
  hairline. A comparison nested in a card inside a card is how card soup comes
  back.
- Distributions are bars on one shared baseline, in fixed option order, never
  re-sorted by count. If a row moves, the movement is the signal. Counts are
  integers: four people are counts, not percentages.
- Nothing is revealed by motion and nothing is hidden without it. The reduced
  motion path must be identical, not merely acceptable.
- No scores in a reveal. None of these mechanics has a correct answer.
- "What changed the outcome?" resolves ids from `src/data/protective-factors.ts`
  against the path taken. `label` and `description` describe the story; the
  `mechanism` field is internal and must never render.

## Crew Shift

- Two private rounds, one either side of the discussion. The second round is
  both the "after" distribution and the crew's decision. Never let one person
  choose on the group's behalf.
- A tie is resolved by the crew tapping once, never silently by declaration
  order.
- The reveal may state the two distributions and how many answers changed. It
  may never name a seat, order the seats, or infer who persuaded whom, because
  none of that is captured and all of it points at a person.
- "Your crew held its position" is a result, not a failure. No confetti, no
  winner, no correct option.

## Story and visuals

- Narrative is player-paced. Use `StoryBeat`; never print a whole scene at
  once. The unit is **one idea**, not one sentence: two short sentences that
  form a single thought belong in one beat, and splitting a thought across two
  taps reintroduces the split attention segmenting exists to remove.
- Choices do not exist until the scene has finished. Nobody is asked a question
  they have not read to the end of.
- Exactly one advance control per screen. Two ways forward means one of them
  silently skips the story.
- **No visual without a job.** The valid jobs are enumerated in
  `docs/VISUAL_ART_DIRECTION.md`. "Make it look fun" is not one.
- All artwork is original SVG drawn in code. No stock, no third-party character
  art, no AI imagery. If that ever changes, record source and licence in
  `docs/ASSET_LICENSES.md` first.
- Character portraits are stylised, never realistic, and expression never
  carries an idea the words do not also state. Nothing may imply that
  appearance predicts who offends.
- Behavioural vocabulary stays out of the play surface. Plain language on
  screen, mechanism behind "Why this works", jargon in the docs.
- Node and status states use shape, icon, label and position, never colour
  alone.
- Echo cosmetics are deterministic, legible before they are earned, free, and
  purely cosmetic. No randomness, no scarcity, no purchase, no expiry.
- Safe gets none of this: no Echo, no collection, no marks, no sound, no motion.

## Echo and delight

- Echo is a mascot, not an icon: shield body, visor face, six expressions, five
  crest variants. It reads at 28px and at 120px from one drawing.
- **Delight is load-bearing at a moment; clutter is present at rest.** At most
  one character presence and one hero artwork per screen. Artwork concentrates
  at completion, unlock, chapter start and story beats.
- The tonal test before adding charm anywhere: if this screen appeared in a
  story about something serious happening to a friend, would the character
  still be appropriate? If not, pull it back.
- No big pleading eyes, no blush, no sparkles, no bounce loop, no limbs, no
  emoji, no exclamation marks, no confetti after a harmful outcome.
- Completion screens are **reward-first**: what happened, what you unlocked,
  XP, what next, then the passport detail behind a disclosure. Never open with
  four numbers about the player.
- An unlock is announced where it happens and equippable on the spot. An unlock
  discovered later on another screen is a database write, not a reward.
- Echo, collectibles, motifs, playful motion and sound never appear on Safe or
  Settings.

## SIDEQUEST Streets

- **The game does not own product state.** XP, missions, Echo unlocks, campaign
  progress and the passport stay in the store. The world reads it, asks the
  product to act, and reflects the result. Delete Streets and every earned
  point must still be valid.
- Everything crosses through `quest-bridge.ts`. Nothing under `features/streets`
  touches `localStorage`.
- NPCs open the **existing** missions. Never rebuild an experience inside the
  world.
- The Quest List is a peer of the map, not a fallback. Every destination is
  openable without walking. Learning is never gated behind dexterity.
- All dialogue is DOM. A canvas has no semantics.
- One currency. No street coins, energy, lives, gems, loot boxes, gacha or
  random drops.
- No leaderboard in the world.
- No NPC signals criminality by appearance. No police roleplay, chasing or
  combat.
- Safe is a calm door: no XP, no quest, no reward, no playfulness.
- All world art is drawn in code. No sprite rips, no tile packs, no stock.
- Institutional colours are SIDEQUEST-owned and inspired. Never described as
  official, never a crest or logo, and no copy implies endorsement.

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
- The install invitation appears only where its reason is true, is dismissible,
  remembers the dismissal, and gates nothing. `beforeinstallprompt` does not
  exist on Safari or Firefox, so never render anything resembling a system
  install dialog there: describe the real Share menu step instead. Detect
  standalone with `(display-mode: standalone)`, which Safari has supported
  since 13.
- No push infrastructure. Follow-up copy says the chapter is waiting, never
  that the phone will buzz.
- Campaign warm-up uses `router.prefetch` on already-static routes and is
  skipped under `saveData`. Do not add a service-worker framework for it.

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
