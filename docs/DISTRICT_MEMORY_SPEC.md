# District Memory

The signature system of the Living District pass. What the block remembers
about you, where that memory lives, and the rules that keep it true.

**Built:** 1 September 2026.
**Code:** `src/features/streets/district-memory.ts`,
`src/features/streets/components/history-sheet.tsx`,
`src/features/profile/district-memories.tsx`.
**Tests:** `tests/unit/district-memory.test.ts` (14),
`tests/e2e/living-district.spec.ts`.

---

## 1. The problem it exists to solve

SIDEQUEST Streets had a memory in the strict sense: NPC lines changed once you
finished what they needed, a signal marker disappeared, and a person moved to a
different tile. What it did not have was a **place** that knew anything.

Walk back to the minimart after doing all three things there and the minimart
was exactly the minimart you first arrived at. The building did not know you.
The consequence was that a district you had spent forty minutes in looked
identical to one you had never entered, and every reason to return was a
reason to do a task, never a reason to be somewhere.

That is the difference between a level and a neighbourhood. A level is
somewhere you clear. A neighbourhood is somewhere that accumulates.

## 2. What it is

A derived, per-place record of things that actually happened to this player,
readable in two surfaces:

- **In the world.** Standing at or inside a landmark you have history in turns
  the place label into a control with a count. Tapping it opens
  `HistorySheet`: "You have history here", then the list.
- **On You.** `DistrictMemories` groups every entry under its landmark, and
  lists places you have never been, quietly, with nothing in them.

Six memory types, each with a verb: `met`, `helped`, `discovered`, `changed`,
`created`, `visited`.

## 3. The architectural decision: derive, do not store

**Exactly one new field was added to the profile: `metNpcs: string[]`.**

Everything else is computed from state the product already had:

| Memory | Derived from |
| ------ | ------------ |
| Met somebody | `metNpcs` (**the only new state**) |
| Helped somebody | `completedMissionIds`, `streetChecksDone`, `threadSteps` |
| Noticed something | `districtMoments` |
| Changed something | thread steps that resolve a situation |
| Made something | `questDrafts`, `submissions` |
| Been somewhere | `crewId`, `rewardClaims`, `campaigns` |

This was the single most consequential decision in the pass, and it was made
against the obvious alternative, which was a `districtMemory: MemoryEntry[]`
array appended to on every event.

**Why derivation wins here.** A stored log is a second source of truth for
facts that already have one. It can disagree with the profile, and when it
does, the district is lying about the player's own life, which is the one
failure mode that would make this feature worse than not having it. A log also
has to be migrated, deduplicated, capped and repaired; a derivation cannot
drift, cannot double-count, and is correct for profiles written before it
existed. Somebody who finished ONE BAD MINUTE in July opened this build and
found the district already remembered it.

**Why `metNpcs` had to be new.** Meeting somebody is not implied by any
existing field. You can talk to Wei five times, never open her mission, and
nothing in the profile changes. Recording it is the whole basis of the three
conversation states, and there is no honest way to infer it.

**What derivation costs.** Ordering is by source declaration, not by when
things happened, because nothing records when. That is a real loss and it was
accepted: a memory list is read as a set of things that are true about a place,
not as a timeline, and nothing in either surface implies chronology.

## 4. Rules

1. **Nothing is remembered that did not happen.** A blank profile returns an
   empty array from every entry point. Pinned by test.
2. **Nothing is remembered twice.** Ids are unique across sources. Pinned.
3. **Every entry belongs to exactly one place.** There is no global feed.
4. **Memory pays nothing.** No XP, no unlock, no cosmetic, no streak. Reaching
   six memories at the minimart is worth exactly what reaching one is worth.
5. **There is no denominator.** The count is "four things have happened here",
   never "4 of 9". A fraction turns a record into a checklist, which is what
   the district moments collection had become and why it was replaced.
6. **Unvisited places stay visible.** A place that hides until you go there
   cannot invite you.
7. **Nobody is ranked.** No most-visited place, no favourite neighbour, no
   comparison to other players.

## 5. Where you can be

Two ways of being somewhere, because the district has two kinds of place:

- **Inside.** An interior maps to its landmark through the door you came in
  by, so memory made in the shop belongs to the shop rather than to a room id
  nobody has seen a name for.
- **At.** Outdoors, the nearest landmark within five tiles.

The proximity path exists because two of the six landmarks, the court and the
bus stop, have no interior at all. Without it their memory was real, recorded,
and reachable from nowhere in the world where it happened.

Five tiles is tight on purpose. Standing at the court means the court, not the
block, and a chip that followed the player everywhere would be a history of
everything, which is a dashboard.

## 6. What it deliberately is not

- **Not a timeline.** No dates, no "3 days ago". The profile has no event
  clock and inventing one to display would be state that exists only to be
  shown.
- **Not a completion surface.** No percentages, no "explored 4/6".
- **Not social.** Nothing here is comparable, shareable or visible to a crew.
- **Not a location history.** Landmark ids in a fictional district, derived on
  read, never coordinates and never a trace of where a real person went. See
  `docs/DATA_SAFETY.md`.

## 7. Test coverage

| Claim | Where |
| ----- | ----- |
| A new player has no history anywhere | `district-memory.test.ts` |
| Every place is listed, empty, for a new player | `district-memory.test.ts` |
| Meeting somebody records exactly one memory | `district-memory.test.ts` |
| Ids are unique across every source | `district-memory.test.ts` |
| Every source names a real landmark | `district-memory.test.ts` |
| Every landmark has at least two possible memories | `district-memory.test.ts` |
| A blank district says so, on You | `living-district.spec.ts` |
| Meeting somebody costs no XP | `living-district.spec.ts` |
| Standing at a place offers its history | `living-district.spec.ts` |
