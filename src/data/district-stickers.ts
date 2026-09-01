import { districtMemory, memoryByPlace } from "@/features/streets/district-memory";
import { WORLD_PROPS } from "@/features/streets/streets-props";
import type { UserProfile } from "@/types/profile";

/**
 * District stickers.
 *
 * ---
 *
 * ## Why this exists now and did not exist in P0
 *
 * The previous pass refused collectibles, and the refusal was right at the
 * time: there was nowhere for a collectible to mean anything. A sticker that
 * commemorates nothing is a progress bar with a picture on it, and the reward
 * evidence argues against attaching one to an interaction somebody already
 * enjoyed.
 *
 * District Memory changed the situation, because now there is a record of
 * things that actually happened in specific places. A sticker can commemorate
 * one of those rather than invent an achievement to hand out. "You have been
 * around the whole block" is a fact about a player's history with a
 * neighbourhood. "Complete 5 missions" is a quota.
 *
 * ## The rules, all enforced by test
 *
 * **Finite.** Eight, listed here, and the list is the whole set. There is no
 * generator and no procedural tail.
 *
 * **Deterministic.** Every one is a pure function of the profile. The same
 * profile always earns the same stickers, in the same order, forever. No
 * randomness, no rolls, no drop tables.
 *
 * **Legible before earned.** Every locked sticker states its own requirement
 * in plain words, in the same place it will eventually appear. A collection
 * with mystery slots is a slot machine with a nicer frame.
 *
 * **Cosmetic and free.** No XP, no rarity tier, no purchase, no expiry, no
 * trade, no real-world value, and no effect on anything in the product except
 * which small drawing the player can pin to their corner.
 *
 * ## What they are deliberately not attached to
 *
 * **The six props that pay nothing still pay nothing.** The cat, the mural,
 * the bicycle, the hoop, the drinks machine and the door chime earn no sticker
 * individually and contribute to none of the counts below. That rule survived
 * this pass intact, and `tests/unit/district-stickers.test.ts` fails the build
 * if one of them ever becomes a requirement. Curiosity is rewarded here
 * through the props that were always designed to leave something behind, and
 * through breadth of history, never by converting an ambient joke into a
 * task.
 *
 * **Nothing is awarded for danger.** No sticker commemorates a crime spotted,
 * a person reported or a threat avoided. They are about places and about
 * having been in them.
 */

export type StickerArt =
  | "awning"
  | "block"
  | "hoop"
  | "cup"
  | "route"
  | "eye"
  | "spark"
  | "sunrise";

export interface DistrictSticker {
  id: string;
  /** Short, on the sticker itself. Two words where possible. */
  name: string;
  /** One sentence, past tense, shown when the sticker is tapped. */
  memory: string;
  /** Plain words, present tense, shown while it is still locked. */
  requirement: string;
  art: StickerArt;
  /** Which landmark it belongs to, when it belongs to one. */
  locationId?: string;
  /** Pure. Never reads anything outside the profile. */
  earned: (profile: UserProfile) => boolean;
}

/** Entries recorded at one landmark. */
function at(profile: UserProfile, locationId: string): number {
  return memoryByPlace(profile).find((place) => place.landmark.id === locationId)?.entries.length ?? 0;
}

/** How many places have anything at all in them. */
function placesWithHistory(profile: UserProfile): number {
  return memoryByPlace(profile).filter((place) => place.entries.length > 0).length;
}

/**
 * The ids of things that were actually designed to be found.
 *
 * Sharp Eyes counts against this set rather than against the raw length of
 * `districtMoments`, and the difference is the whole P0 guarantee. Counting
 * the array would mean that the day somebody gives the cat or the drinks
 * machine a moment id, six deliberately worthless props silently start paying
 * for a sticker. Intersecting with the discovery props makes that impossible
 * rather than merely unlikely, which is the right way to hold a rule that a
 * future change would break by accident.
 */
const DISCOVERABLE = new Set(
  WORLD_PROPS.filter((prop) => prop.discovery).map((prop) => prop.discovery!.id),
);

function found(profile: UserProfile): number {
  return (profile.districtMoments ?? []).filter((id) => DISCOVERABLE.has(id)).length;
}

/**
 * Eight, and the thresholds are set against what each place actually holds.
 *
 * The void deck can record twelve things and the bus stop four, so a flat
 * "five at any place" would have made two landmarks unreachable and one
 * trivial. Each threshold is roughly half of what its place can hold, which
 * means every one of them is a real visit rather than a walk past.
 */
export const DISTRICT_STICKERS: DistrictSticker[] = [
  {
    id: "sticker-first-light",
    name: "First Light",
    memory: "The first person on the block who knew your face.",
    requirement: "Meet somebody in the district.",
    art: "sunrise",
    earned: (profile) => (profile.metNpcs ?? []).length >= 1,
  },
  {
    id: "sticker-sunrise",
    name: "Sunrise Regular",
    memory: "Enough afternoons in that shop that the door chime stopped being a surprise.",
    requirement: "Four things happen at the Sunrise Minimart.",
    art: "awning",
    locationId: "minimart",
    earned: (profile) => at(profile, "minimart") >= 4,
  },
  {
    id: "sticker-block-118",
    name: "Block 118",
    memory: "You spent real time on that void deck.",
    requirement: "Five things happen at Block 118.",
    art: "block",
    locationId: "voiddeck",
    earned: (profile) => at(profile, "voiddeck") >= 5,
  },
  {
    id: "sticker-court-side",
    name: "Court Side",
    memory: "Three things happened on that court, and you were there for all of them.",
    requirement: "Three things happen at the court.",
    art: "hoop",
    locationId: "court",
    earned: (profile) => at(profile, "court") >= 3,
  },
  {
    id: "sticker-kopitiam",
    name: "Kopitiam Regular",
    memory: "The corner table, more than once.",
    requirement: "Three things happen at the corner kopitiam.",
    art: "cup",
    locationId: "foodcourt",
    earned: (profile) => at(profile, "foodcourt") >= 3,
  },
  {
    id: "sticker-long-way",
    name: "Long Way Round",
    memory: "Every place on the block has something of yours in it.",
    requirement: "Have history in all six places.",
    art: "route",
    earned: (profile) => placesWithHistory(profile) >= 6,
  },
  {
    id: "sticker-sharp-eyes",
    name: "Sharp Eyes",
    memory: "You kept noticing things nobody asked you to look at.",
    requirement: "Notice four things worth keeping.",
    art: "eye",
    earned: (profile) => found(profile) >= 4,
  },
  {
    id: "sticker-made-something",
    name: "Made Something",
    memory: "You wrote something for somebody else to play.",
    requirement: "Build a quest of your own.",
    art: "spark",
    earned: (profile) =>
      (profile.questDrafts ?? []).length >= 1 || (profile.submissions ?? []).length >= 1,
  },
];

/** The earned set, in list order. Pure, and safe to call on every render. */
export function earnedStickers(profile: UserProfile): DistrictSticker[] {
  return DISTRICT_STICKERS.filter((sticker) => sticker.earned(profile));
}

export function getSticker(id: string | null | undefined): DistrictSticker | undefined {
  if (!id) return undefined;
  return DISTRICT_STICKERS.find((sticker) => sticker.id === id);
}

/**
 * How close a locked sticker is, as plain words rather than a bar.
 *
 * Returns null for anything already earned and for the two that are not
 * countable. A progress bar on a collectible turns a record of having been
 * somewhere into a task with a completion percentage, which is the shape this
 * whole system was written to avoid, so the only progress ever shown is the
 * requirement sentence itself.
 */
export function stickerStanding(profile: UserProfile, sticker: DistrictSticker): string | null {
  if (sticker.earned(profile)) return null;
  if (sticker.locationId) {
    const count = at(profile, sticker.locationId);
    return count === 0 ? null : `${count} so far`;
  }
  return null;
}

/**
 * Whether a sticker commemorates curiosity rather than finishing something.
 *
 * Used by the tests to assert that the set does not drift into being a
 * completion checklist. Not rendered anywhere: a badge that told the player
 * which of their stickers counted as curiosity would be a grade.
 */
export const CURIOSITY_STICKER_IDS = [
  "sticker-long-way",
  "sticker-sharp-eyes",
  "sticker-first-light",
];

/** Total memories recorded, used by the You header line. */
export function memoryCount(profile: UserProfile): number {
  return districtMemory(profile).length;
}
