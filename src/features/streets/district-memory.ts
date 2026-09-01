import { getThread, requiredSteps, stepKey } from "@/data/prevention-threads";
import { NPCS, LANDMARKS, type Npc } from "@/features/streets/streets-data";
import { WORLD_PROPS } from "@/features/streets/streets-props";
import type { UserProfile } from "@/types/profile";

/**
 * District memory.
 *
 * ---
 *
 * ## What this is
 *
 * The district remembers what happened in it. Not a score, not a completion
 * percentage, not a morality meter: a short list, per place, of things that
 * are true because the player did them. Met Wei at the minimart. Changed
 * something about the shop floor. Found whoever waters the planter.
 *
 * The design law behind it is one sentence, and it is worth stating because
 * every decision below follows from it:
 *
 * > **You have history here.**
 *
 * A world that is identical on your tenth visit and your first is a menu with
 * a walk attached. The point is not to reward the player again, it is to make
 * the place theirs.
 *
 * ## Almost all of it is derived
 *
 * This file stores nothing. Every entry is a predicate over the profile the
 * product already keeps, so a memory cannot contradict the thing it describes
 * and there is no second copy of "did they finish REWIND" to fall out of sync.
 * Completing a mission, banking a thread, finding a moment, saving a draft:
 * all of it is already recorded for its own reasons, and memory is a reading
 * of it.
 *
 * There is exactly one thing the product did not already know, which is
 * whether the player has ever actually *spoken* to somebody without finishing
 * their content. That is `profile.metNpcs`, and it is the only new state this
 * system introduces.
 *
 * ## What it deliberately is not
 *
 * There is no `goodCitizenPoints`, no `crimesSolved`, no ranking and no
 * percentage. `tests/unit/integrity.test.ts` fails the build if a field like
 * that appears. Memory is narrative state, and the moment it becomes a number
 * it becomes a target, which is the opposite of what it is for.
 *
 * It is also not an impact measure. What a player remembers about a fictional
 * block says nothing about whether anything was prevented, and
 * `docs/PILOT_MEASUREMENT_PLAN.md` keeps those apart.
 */

export type MemoryType =
  /** Spoke to somebody for the first time. */
  | "met"
  /** Did the thing they needed. */
  | "helped"
  /** Noticed something about the place. */
  | "discovered"
  /** The place itself is different now. */
  | "changed"
  /** Made something. */
  | "created"
  /** Was somewhere that matters, without any of the above. */
  | "visited";

export interface MemoryEntry {
  id: string;
  /** A landmark id. Every memory belongs to a place. */
  locationId: string;
  type: MemoryType;
  /** One short line, past tense. What happened, not what it taught. */
  title: string;
}

interface MemorySource extends Omit<MemoryEntry, "id"> {
  id: string;
  /** True once the profile proves this happened. Pure. */
  when: (profile: UserProfile) => boolean;
}

/* ------------------------------------------------------------- Helpers */

const has = (list: string[] | undefined, id: string) => (list ?? []).includes(id);

/** Every required step of a thread banked. The same rule the world uses. */
function threadDone(profile: UserProfile, threadId: string): boolean {
  const thread = getThread(threadId);
  if (!thread) return false;
  const banked = profile.threadSteps ?? [];
  return requiredSteps(thread).every((step) => banked.includes(stepKey(thread.id, step.id)));
}

/** One specific step banked, for a memory about a moment rather than a story. */
function stepDone(profile: UserProfile, threadId: string, stepId: string): boolean {
  return has(profile.threadSteps, stepKey(threadId, stepId));
}

/**
 * People, as opposed to noticeboards.
 *
 * A machine and a poster are interactable and are not somebody you have met.
 * "You met Self checkout 2" would be a joke the product did not intend to
 * make, and it would cheapen the entries that are about actual people.
 */
const PEOPLE: Npc[] = NPCS.filter((npc) => (npc.figure ?? "person") === "person");

/* ------------------------------------------------------------- Sources */

/**
 * Meeting somebody, one entry each.
 *
 * Generated rather than hand-written, because there are fourteen of them and a
 * hand-written table would drift the moment a resident was added. This is the
 * one place in this file where the entry text is a template, and it is
 * defensible: the interesting part of "met Wei" is the name.
 */
const MET: MemorySource[] = PEOPLE.map((npc) => ({
  id: `met-${npc.id}`,
  locationId: npc.landmarkId,
  type: "met" as const,
  title: `Met ${npc.name}`,
  when: (profile) => has(profile.metNpcs, npc.id),
}));

/**
 * Finding something, one entry each.
 *
 * The props already carry their own label, written for the moment of finding
 * it, so memory reuses that rather than inventing a second phrasing of the
 * same discovery.
 */
const FOUND: MemorySource[] = WORLD_PROPS.filter((prop) => prop.discovery).map((prop) => ({
  id: `found-${prop.discovery!.id}`,
  locationId: prop.locationId,
  type: "discovered" as const,
  title: prop.discovery!.label,
  when: (profile) => has(profile.districtMoments, prop.discovery!.id),
}));

/**
 * Everything else, written by hand.
 *
 * These are the entries worth reading, so each one is a sentence somebody
 * chose. They are deliberately about what happened rather than about what it
 * demonstrated: "Talked Kai out of the last two" and not "Practised peer
 * intervention".
 */
const AUTHORED: MemorySource[] = [
  /* ------------------------------------------------------ Sunrise Minimart */
  {
    id: "helped-rewind",
    locationId: "minimart",
    type: "helped",
    title: "Went back and said something to Ken",
    when: (profile) => has(profile.completedMissionIds, "mission-rewind"),
  },
  {
    id: "helped-checkout",
    locationId: "minimart",
    type: "helped",
    title: "Scanned the last two for Bea",
    when: (profile) => has(profile.streetChecksDone, "check-checkout"),
  },
  {
    id: "changed-shopfloor",
    locationId: "minimart",
    type: "changed",
    title: "Showed Lek what was making it easy",
    when: (profile) => stepDone(profile, "thread-last-two", "step-shopfloor"),
  },
  {
    id: "helped-last-two",
    locationId: "minimart",
    type: "helped",
    title: "The last two, all the way through",
    when: (profile) => threadDone(profile, "thread-last-two"),
  },

  /* ------------------------------------------------------------ Block 118 */
  {
    id: "helped-favour",
    locationId: "voiddeck",
    type: "helped",
    title: "The favour, and Devi had the words ready after",
    when: (profile) => threadDone(profile, "thread-favour"),
  },
  {
    id: "helped-job",
    locationId: "voiddeck",
    type: "helped",
    title: "Read the job offer with Nadia",
    when: (profile) => has(profile.streetChecksDone, "check-job"),
  },
  {
    id: "created-draft",
    locationId: "voiddeck",
    type: "created",
    title: "Built a quest of your own on the Crew board",
    when: (profile) => (profile.questDrafts?.length ?? 0) > 0,
  },
  {
    id: "visited-crew",
    locationId: "voiddeck",
    type: "visited",
    title: "Joined the Community Safety Crew",
    when: (profile) => Boolean(profile.crewId),
  },
  {
    id: "helped-campaign",
    locationId: "voiddeck",
    type: "helped",
    title: "Started ONE BAD MINUTE with Ken",
    when: (profile) =>
      Object.values(profile.campaigns ?? {}).some(
        (entry) => (entry?.completedChapterIds?.length ?? 0) > 0,
      ),
  },

  /* ------------------------------------------------------------ The court */
  {
    id: "helped-shout",
    locationId: "court",
    type: "helped",
    title: "Got Elle away from the shouting, then got help",
    when: (profile) => threadDone(profile, "thread-shout"),
  },
  {
    id: "helped-kai",
    locationId: "court",
    type: "helped",
    title: "Said it to Kai privately",
    when: (profile) => stepDone(profile, "thread-last-two", "step-say"),
  },

  /* ------------------------------------------------------ Corner kopitiam */
  {
    id: "helped-norm",
    locationId: "foodcourt",
    type: "helped",
    title: "Settled Rina's argument about what everyone would really do",
    when: (profile) => has(profile.completedMissionIds, "mission-norm-mirror"),
  },
  {
    id: "changed-breaksafe",
    locationId: "foodcourt",
    type: "changed",
    title: "Rebuilt Mr Tan's checkout so the honest thing was easy",
    when: (profile) => has(profile.completedMissionIds, "mission-breaksafe"),
  },
  {
    id: "visited-counter",
    locationId: "foodcourt",
    type: "visited",
    title: "Claimed something at Mei's counter",
    when: (profile) => (profile.rewardClaims?.length ?? 0) > 0,
  },

  /* ------------------------------------------------------- Community post */
  {
    id: "helped-sumi",
    locationId: "safehub",
    type: "helped",
    title: "Asked Ms Sumi what actually happens next",
    when: (profile) => stepDone(profile, "thread-favour", "step-adult"),
  },

  /* --------------------------------------------------------- Bus stop 118 */
  {
    id: "helped-verify",
    locationId: "busstop",
    type: "helped",
    title: "Told Arif to call the number he already had",
    when: (profile) => has(profile.streetChecksDone, "check-verify"),
  },
];

const SOURCES: MemorySource[] = [...MET, ...FOUND, ...AUTHORED];

/* --------------------------------------------------------------- Reading */

/**
 * Everything true about this profile, in place order.
 *
 * `met` sorts first within a location, because that is the order it happened
 * in: you meet somebody, then you do something with them.
 */
const TYPE_ORDER: Record<MemoryType, number> = {
  met: 0,
  helped: 1,
  changed: 2,
  created: 3,
  discovered: 4,
  visited: 5,
};

export function districtMemory(profile: UserProfile): MemoryEntry[] {
  return SOURCES.filter((source) => source.when(profile))
    .map((source) => ({
      id: source.id,
      locationId: source.locationId,
      type: source.type,
      title: source.title,
    }))
    .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
}

export function memoryAt(profile: UserProfile, locationId: string): MemoryEntry[] {
  return districtMemory(profile).filter((entry) => entry.locationId === locationId);
}

/**
 * How much history exists at each place, and how much could.
 *
 * The total is what makes a place feel like it has more in it, and it is why
 * the count is shown as a fraction rather than as a bare number. It is not a
 * completion target: nothing is withheld for having a low one, nothing is
 * awarded for filling it, and several entries are things a player may
 * reasonably never do.
 */
export function memoryTotals(): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const landmark of LANDMARKS) totals[landmark.id] = 0;
  for (const source of SOURCES) {
    totals[source.locationId] = (totals[source.locationId] ?? 0) + 1;
  }
  return totals;
}

/** Every place, with what happened there. Places with no history included. */
export function memoryByPlace(profile: UserProfile) {
  const all = districtMemory(profile);
  const totals = memoryTotals();
  return LANDMARKS.map((landmark) => ({
    landmark,
    entries: all.filter((entry) => entry.locationId === landmark.id),
    total: totals[landmark.id] ?? 0,
  }));
}

/**
 * Which landmark an interior belongs to.
 *
 * A room id is not a place a player has ever seen a name for. The door they
 * walked in by is.
 */
export function indoorLandmark(mapId: string): string | undefined {
  return LANDMARKS.find((landmark) => landmark.interiorId === mapId)?.id;
}

/**
 * How close counts as being somewhere, in tiles.
 *
 * Tight on purpose. Wide enough that standing on the court or under the bus
 * stop shelter reads as being there, narrow enough that walking down the main
 * path does not put the player in three places at once.
 */
const AT_PLACE = 5;

/**
 * Which outdoor landmark the player is standing at, if any.
 *
 * Nearest wins, and ties break by declaration order, which is stable. This
 * exists because two of the six landmarks (the court and the bus stop) have no
 * interior: without it their memory was real, recorded, and reachable from
 * nowhere in the world it happened in.
 */
export function nearLandmark(tile: { x: number; y: number }): string | undefined {
  let best: { id: string; distance: number } | undefined;
  for (const landmark of LANDMARKS) {
    const distance = Math.hypot(landmark.x - tile.x, landmark.y - tile.y);
    if (distance > AT_PLACE) continue;
    if (!best || distance < best.distance) best = { id: landmark.id, distance };
  }
  return best?.id;
}
