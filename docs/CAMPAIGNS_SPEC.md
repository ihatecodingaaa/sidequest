# SIDEQUEST Campaigns

The subsystem that turns a physical activation into one continuous story.

## 1. What a Campaign is

A roadshow normally works like this: several booths, each with its own thing to
look at, no connection between them, one queue at whichever is busiest, and the
whole experience ends the moment somebody walks away.

A Campaign replaces that with a single story told across the same physical
space. Participants scan ordinary QR codes with the normal phone camera, unlock
a chapter, walk away from the station, play a short behavioural mission
wherever they end up standing, and reach a finale. Follow-up chapters arrive a
day and a week later.

The loop:

**Discover, scan, unlock, move away, play, progress, discuss, finale, follow
up, back into SIDEQUEST.**

The claim the subsystem is making: the roadshow becomes episode one, not the
whole thing.

## 2. Domain model

Everything lives in `src/types/campaign.ts`. It is data-first on purpose: a
second Campaign should be one authored file plus a registry entry, with no new
React components.

| Type | What it holds |
| ---- | ------------- |
| `Campaign` | Chapters, routes, finale, follow-ups, the 3 of 4 threshold, the completion bonus |
| `CampaignChapter` | One station: mechanic config, story beats, XP, skills, station code, sign text |
| `ChapterConfig` | Tagged union selecting the mechanic. A mis-authored chapter fails at compile time |
| `CampaignRoute` | An ordered list of chapter ids. One per starting station |
| `CampaignFinale` | Intro, one question, four themed options, four outcomes, one shared closing |
| `CampaignFollowUp` | A post-event chapter and how many hours after completion it opens |
| `CampaignProgress` | Per-participant state, including the XP grant ledger |
| `ChapterResult` | Tagged union of per-mechanic outcomes, readable by the finale without casts |

Rules live in `src/lib/campaign.ts` as pure functions, free of React and of
storage. State transitions live in `src/store/campaign-slice.ts`, also pure,
operating on the profile. The zustand store is a thin wrapper over both, which
is why the roadshow behaviour that matters is unit-testable without a browser.

## 3. Reusing the mission engine

Campaigns do not reimplement REWIND, Norm Mirror or BREAKSAFE. They drive the
existing players through one new seam.

`MissionHost` (`src/features/missions/engine/mission-host.tsx`) pulls out the
only three things a player does that depend on its context:

```ts
interface MissionHost {
  exitHref: string;                       // where the close button goes
  complete: () => AwardResult;            // records completion, idempotently
  renderComplete: (result, summary?) => ReactNode;  // the ending screen
}
```

A player with no host falls back to the standalone behaviour it always had, so
`/play/[id]` and the entire pre-existing test suite are unaffected. A player
given a Campaign host exits to the Campaign, awards against the Campaign
ledger, and renders the Campaign's chapter completion screen.

Content is injected the same way. `NormMirrorPlayer` takes an optional
`questions` prop defaulting to the standalone set; `RewindPlayer` already took
its scenario. `chapterAsMission()` adapts a chapter into the `Mission` shape the
players read for title, accent and skill rewards.

Only Crew Shift is new.

## 4. Chapters of the flagship

**ONE BAD MINUTE.** Four friends, one ordinary day, four small decisions.

| # | Chapter | Mechanic | Code | XP |
| - | ------- | -------- | ---- | -- |
| 1 | Quick money | REWIND | A7 | 70 |
| 2 | Everyone would do it | Norm Mirror | B4 | 60 |
| 3 | Design the moment | BREAKSAFE | C9 | 80 |
| 4 | Crew Shift | Crew Shift | D2 | 90 |
| F | Finale | Themed decision | | 120 (+60 bonus) |

Behavioural rationale for each is in `docs/CAMPAIGN_BEHAVIOUR.md`.

### Crew Shift

The one genuinely new interaction, and the only one that needs other people.

1. Choose the group size, one to four. Solo is supported and says so.
2. The situation is shown once, to everybody.
3. The phone is passed around. Each member answers **privately**; nothing from
   an earlier player is on screen.
4. Once every answer is locked, the tally is revealed. Agreement or
   disagreement, no score, no right answer.
5. A 45 second discussion window with three prompts. Skippable at any point,
   and running out does nothing.
6. The group commits to one decision together.
7. The screen reports whether the group ended up somewhere different from where
   its members started.

There is no realtime layer and no backend. Pass-the-phone is not a compromise
for four people standing in the same place; it is the correct mechanic, and it
is what makes the private commitment before the reveal possible at all.

## 5. Modes

Offered when a Campaign is started, changeable at any time from the Campaign
screen, and persisted per Campaign.

- **Story mode** plays the narrative beats before and after each mechanic.
- **Quick mode** goes straight to the challenge.

Both complete the same chapters and award identical XP. Quick mode skips the
story, not the thinking. Which mode somebody picks is exactly the sort of thing
a pilot would want to measure, and the schema records it.

## 6. Route distribution

Four routes, each starting at a different station:

```
Route A   1 → 2 → 3 → 4
Route B   2 → 3 → 4 → 1
Route C   3 → 4 → 1 → 2
Route D   4 → 1 → 2 → 3
```

A route is assigned on first start, from a stable per-browser seed
(`sidequest.campaign.seed.v1`), so it survives a refresh but differs between
phones. `pickRouteId` hashes the seed uniformly across the routes; a unit test
asserts that 400 seeds hit all four, because a hash that only produced two
would still pass a naive "returns a valid route" check and would still fail the
hall.

The route is **guidance, never a lock**. Every chapter is reachable at any time
from the map, from a QR and from a station code. If a participant finds station
3 free, they take station 3.

## 7. Resilience: three of four

The finale opens after any **three** of the four physical chapters. Completing
all four adds a bonus and one extra paragraph in the finale, on the same code
path rather than a separate one.

This is the single most important deployment decision in the subsystem. It
means a torn sign, a crowded table, a station somebody could not find, or a
chapter they simply did not enjoy cannot end their experience. A unit test
asserts the finale opens with any three, not a specific three.

## 8. QR and station codes

QR codes encode ordinary URLs:

```
https://<host>/campaigns/one-bad-minute/chapter/quick-money
```

Scanned with the normal phone camera. There is no in-app scanner, nothing to
install, and nothing to explain at a station.

Every chapter route is prerendered statically, so a scan does not wait on a
server. Campaign routes sit **outside** the `(app)` route group specifically so
the onboarding gate cannot block them: somebody scanning at a roadshow has
often never opened SIDEQUEST, and four onboarding questions at a station is how
you lose them. A chapter runs on a completely cold device.

Every station also has a short printed code (A7, B4, C9, D2), entered from the
Campaign screen. The entry field is permanent, not hidden behind an error
state, because by the time somebody hits an error they have already given up.
Code matching strips punctuation and case, since these get read aloud by a
facilitator and typed with one thumb.

`/campaigns/[slug]/stations` generates the printable signs. QR codes are
produced in the browser from `window.location.origin`, using a dynamically
imported encoder so it never reaches a participant's bundle, and never calls an
external QR service.

## 9. Scan and Scatter

The chapter entry screen exists to move people. It shows, in order: chapter
unlocked, the chapter title, and then a prominent callout:

> **Move away from the station.** It is saved to your phone now. Find somewhere
> to stand and play it there, so the next person can scan.

Combined with parallel routes, the 3 of 4 rule, chapters short enough to play
standing up, and duplicate printed QR codes for busy stations, this is the
congestion strategy. See `docs/CAMPAIGN_DEPLOYMENT.md`.

## 10. Finale

Not another quiz. One decision, at the moment the story has been building to.

The four options each lean on one chapter's theme (urgency, norms, system
design, peer support). The response names which one the participant reached
for, then everybody sees the same closing. Four outcomes plus one shared
ending is a small deterministic model, not a combinatorial branch tree, and it
is enough to make the ending feel like it belongs to the person playing it.

## 11. Follow-ups

Two, unlocking on elapsed time since Campaign completion:

- **Aftermath**, 20 hours. What happened the next morning.
- **One week later**, 168 hours. A new offer, a different friend, no story to
  lean on. The real test of whether the pattern transfers.

No push infrastructure and no backend. Unlocks are computed from
`completedAt` plus the configured interval, so they work on a phone that does
not open the app again until next Tuesday. The interval is per follow-up
configuration, not hard-coded.

Demo controls shift the clock forward. That offset only ever affects follow-up
unlock computation, is labelled as a demo control, and changes nothing about
what a real deployment does.

## 12. XP and progression

Campaign XP uses the existing engine. `awardMission` from `src/lib/xp.ts` does
the arithmetic; there is not a second progression system.

The difference is the ledger. Campaign grants are keyed in
`progress.awardedKeys` rather than in `completedMissionIds`, so a chapter never
masquerades as a catalogue mission in the Safety Passport's completed list.

Grant keys:

```
chapter:<chapterId>
finale:<campaignId>
bonus:<campaignId>
follow-up:<followUpId>
```

One key, one payment, ever. A re-scanned QR, a browser back button, a replayed
chapter and a refreshed finale all resolve to a no-op that says "already
counted". Unit tests cover each case, including the awkward one: finishing the
fourth chapter *after* the finale, which must still pay the completion bonus
exactly once.

Replaying is always allowed and always free.

## 13. Safety Passport

Chapters award existing skills. No new skill ids were introduced.

| Chapter | Skills |
| ------- | ------ |
| Quick money | Peer Intervention, Decision Making |
| Everyone would do it | Decision Making, Communication |
| Design the moment | Safety Design, Decision Making |
| Crew Shift | Peer Intervention, Leadership, Communication |
| Finale | Decision Making, Peer Intervention, Communication |

Campaign participation appears on the Safety Passport as its own section, next
to Build Quest submissions, because physically turning up and working through
something with other people is the closest thing SIDEQUEST has to a real
contribution.

## 14. Privacy

Campaigns add no new data category. What is stored is chapter ids, a route id,
a mode, decision option ids, a grant ledger and timestamps. All of it on the
device, all of it cleared by demo reset.

No names beyond the optional display name that already existed, no location, no
information about any person, no reporting channel. The measurement schema and
its explicit exclusions are on `/campaigns/[slug]/impact` and in
`docs/DATA_SAFETY.md`.

Crew Shift stores a count of players and which option won. It does not store
who answered what, and it does not claim to have measured anybody's
personality.

## 15. Adding a second Campaign

1. Author `src/data/campaigns/<slug>.ts` exporting a `Campaign`.
2. Add any new scenario, norm set or Crew Shift round to the content files.
3. Register it in `src/data/campaigns/index.ts`.

Routes, QR generation, station codes, progress, XP, the finale gate, follow-up
timing, the map, the station signs and the demo controls all work from the data.
No component knows anything about ONE BAD MINUTE specifically.
