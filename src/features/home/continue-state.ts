import { CAMPAIGNS } from "@/data/campaigns";
import { CREW_CHALLENGES, type CrewChallenge } from "@/data/crew-challenges";
import { DISTRICT_STICKERS } from "@/data/district-stickers";
import { PREVENTION_THREADS, requiredSteps, stepKey } from "@/data/prevention-threads";
import { LANDMARKS } from "@/features/streets/streets-data";
import { memoryByPlace } from "@/features/streets/district-memory";
import { whoIsWaiting } from "@/features/streets/game/quest-bridge";
import type { UserProfile } from "@/types/profile";

/**
 * What a returning player should continue, derived from what they actually did.
 *
 * ---
 *
 * ## The question
 *
 * Somebody opens SIDEQUEST tomorrow. Before this, they got exactly the same
 * screen they got the first time: a greeting, a world card, the campaign, the
 * same three signature missions. Nothing in the product knew they had been
 * here, so nothing could offer to carry on.
 *
 * ## What this is not
 *
 * **There is no daily login system**, and there is deliberately nothing here
 * that could become one. No day counter, no claim, no midnight, no missed day,
 * no flame. Nothing in this module reads a clock, and it cannot, because the
 * profile does not record when anything happened. That was a constraint and it
 * turned out to be a useful one: it makes the whole class of urgency mechanic
 * impossible to build without adding state somebody would have to justify.
 *
 * **There is no "new since you left" section either**, which the brief offered
 * and which I could not make honest. Knowing something is new needs a record
 * of what the player has already seen, and inventing that state to power a
 * badge would be writing data purely to create a sense of unread. The open
 * loop below does the same job with facts that are true whenever they are
 * read.
 *
 * ## What returning means here
 *
 * Not "came back today", which is unknowable. It means **this profile has done
 * things before**, which is exactly what the greeting claims and no more.
 */

export type ContinueKind = "campaign" | "thread" | "streets" | "crew";

export interface ContinueItem {
  kind: ContinueKind;
  /** What it is, in the player's terms. Never a route name. */
  title: string;
  /** One line of context. Names a person or a place wherever it can. */
  detail: string;
  href: string;
  /** The label on the control. */
  cta: string;
}

/** Whether this profile has any history at all. */
export function hasHistory(profile: UserProfile): boolean {
  return (
    profile.xp > 0 ||
    profile.completedMissionIds.length > 0 ||
    (profile.metNpcs ?? []).length > 0 ||
    (profile.threadSteps ?? []).length > 0 ||
    Object.keys(profile.campaigns ?? {}).length > 0
  );
}

/**
 * A campaign that is started and not finished.
 *
 * First in the order because it is the only thing in the product with an
 * actual narrative sequence: a half-read story is the strongest claim on
 * somebody's attention that this product can honestly make.
 */
function campaignInProgress(profile: UserProfile): ContinueItem | null {
  for (const campaign of CAMPAIGNS) {
    const progress = profile.campaigns?.[campaign.id];
    const done = progress?.completedChapterIds ?? [];
    if (done.length === 0) continue;
    const next = campaign.chapters.find((chapter) => !done.includes(chapter.id));
    if (!next) continue;
    return {
      kind: "campaign",
      title: next.title,
      detail: `Chapter ${next.chapterNumber} of ${campaign.title}.`,
      href: `/campaigns/${campaign.slug}/chapter/${next.slug}`,
      cta: "Carry on",
    };
  }
  return null;
}

/**
 * A Prevention Thread with some steps banked and some not.
 *
 * Threads run across several people in several places, so the useful detail is
 * who is still holding a piece of it rather than how many steps remain.
 */
function threadInProgress(profile: UserProfile): ContinueItem | null {
  const banked = profile.threadSteps ?? [];
  if (banked.length === 0) return null;

  for (const thread of PREVENTION_THREADS) {
    const steps = requiredSteps(thread);
    const doneCount = steps.filter((step) => banked.includes(stepKey(thread.id, step.id))).length;
    if (doneCount === 0 || doneCount === steps.length) continue;
    const next = steps.find((step) => !banked.includes(stepKey(thread.id, step.id)));
    return {
      kind: "thread",
      title: thread.title,
      detail: next ? `${next.title}, on the block.` : "Still open on the block.",
      href: "/streets",
      cta: "Go and finish it",
    };
  }
  return null;
}

/** Somebody in the district with an unresolved situation, preferring one you know. */
function someoneWaiting(profile: UserProfile): ContinueItem | null {
  const npc = whoIsWaiting(profile);
  if (!npc) return null;
  const place = LANDMARKS.find((landmark) => landmark.id === npc.landmarkId);
  const met = (profile.metNpcs ?? []).includes(npc.id);
  return {
    kind: "streets",
    title: met ? `${npc.name} is still waiting` : "Somebody wants a word",
    detail: place
      ? met
        ? `At the ${place.name.toLowerCase()}.`
        : `${npc.name}, at the ${place.name.toLowerCase()}.`
      : "On the block.",
    href: "/streets",
    cta: met ? "Go back" : "Go and see",
  };
}

/**
 * The one thing to continue, or nothing.
 *
 * Strict priority, not a list. A home screen that offers four ways to carry on
 * is a menu, and the whole value of a continue control is that somebody does
 * not have to choose.
 */
export function continueItem(profile: UserProfile): ContinueItem | null {
  return campaignInProgress(profile) ?? threadInProgress(profile) ?? someoneWaiting(profile);
}

/** A crew challenge this player has not done their part in. */
export function crewThing(profile: UserProfile): CrewChallenge | null {
  if (!profile.crewId) return null;
  return CREW_CHALLENGES.find((challenge) => !challenge.done(profile)) ?? null;
}

/**
 * One truthful thing that is still out there.
 *
 * Every branch states something that is true at the moment it is read, with no
 * countdown, no urgency and no implication that it will expire or that anybody
 * is waiting for a response. It is the difference between "there is more of
 * this place" and "come back before you lose it".
 */
export function openLoop(profile: UserProfile): string | null {
  const places = memoryByPlace(profile);
  const untouched = places.filter((place) => place.entries.length === 0);
  if (untouched.length > 0 && untouched.length < LANDMARKS.length) {
    return untouched.length === 1
      ? `One place on the block still has nothing of yours in it: ${untouched[0].landmark.name}.`
      : `${untouched.length} places on the block still have nothing of yours in them.`;
  }

  const locked = DISTRICT_STICKERS.filter((sticker) => !sticker.earned(profile));
  if (locked.length > 0 && locked.length < DISTRICT_STICKERS.length) {
    return `${locked.length} ${locked.length === 1 ? "sticker" : "stickers"} in your district are still out there.`;
  }

  return null;
}
