import { LANDMARKS, NPCS } from "@/features/streets/streets-data";
import type { Mission } from "@/types/mission";
import type { UserProfile } from "@/types/profile";

/**
 * Who asks for a mission, and where they are standing.
 *
 * ---
 *
 * ## The problem this solves
 *
 * Missions and the district were built in that order, and it showed. The list
 * described eleven experiences by name, duration and XP, and the world had
 * eleven neighbours who opened them, and nothing on either side said they were
 * the same eleven things. A player who met Wei in the minimart and later read
 * "Shelf Life" in a catalogue had no way to know they had already been asked.
 *
 * So this derives the connection rather than storing it. Every NPC already
 * declares what it opens and which landmark it stands at, which means the
 * catalogue can say "Wei asks, at the minimart" without a single new field and
 * without the two halves being able to drift apart. If somebody moves Wei to
 * the bus stop tomorrow, this follows.
 *
 * ## Why it is only who and where
 *
 * Not a map, not a route, not a distance. The Quest List already exists in the
 * world and every destination is openable without walking to it, so the job
 * here is recognition rather than navigation: turning a row in a list into
 * somebody you have met.
 */

/** A mission's place in the district, when it has one. */
export interface QuestGiver {
  npcId: string;
  /** The person who asks. */
  name: string;
  /** The landmark they stand at, in plain words. */
  place: string;
  landmarkId: string;
  /** Whether this player has actually met them yet. */
  met: boolean;
}

const PLACE_NAMES = new Map(LANDMARKS.map((landmark) => [landmark.id, landmark.name]));

/**
 * Mission id to the neighbour who opens it.
 *
 * Built once at module scope. First writer wins if two characters ever open
 * the same mission, which is not a case that exists today and would be a
 * content mistake rather than something to resolve cleverly.
 */
const GIVERS = new Map<string, Omit<QuestGiver, "met">>();
for (const npc of NPCS) {
  if (npc.action?.kind !== "mission") continue;
  if (GIVERS.has(npc.action.missionId)) continue;
  const place = PLACE_NAMES.get(npc.landmarkId);
  if (!place) continue;
  GIVERS.set(npc.action.missionId, {
    npcId: npc.id,
    name: npc.name,
    place,
    landmarkId: npc.landmarkId,
  });
}

export function questGiver(missionId: string, profile: UserProfile): QuestGiver | null {
  const giver = GIVERS.get(missionId);
  if (!giver) return null;
  return { ...giver, met: (profile.metNpcs ?? []).includes(giver.npcId) };
}

/** How many of the catalogue actually have somebody attached. Used by tests. */
export function missionsWithGivers(): string[] {
  return [...GIVERS.keys()];
}

/**
 * Open versus already played.
 *
 * Deliberately two groups and not three. A "current" group would need a
 * concept of a mission in progress, and nothing in this product has one:
 * everything is resumable, nothing is abandoned, and inventing a started state
 * to fill a third heading would mean writing state that exists only to be
 * displayed. Done is a real fact and it is the only one worth separating,
 * because a catalogue that keeps finished things at the top asks somebody to
 * re-read what they already did every time they open it.
 */
export function splitByStatus<T extends Mission>(
  missions: T[],
  profile: UserProfile,
  ready: boolean,
): { open: T[]; done: T[] } {
  if (!ready) return { open: missions, done: [] };
  const done = new Set(profile.completedMissionIds);
  return {
    open: missions.filter((mission) => !done.has(mission.id)),
    done: missions.filter((mission) => done.has(mission.id)),
  };
}
