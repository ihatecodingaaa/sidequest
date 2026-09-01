import { CAMPAIGNS } from "@/data/campaigns";
import { getThread, requiredSteps, stepKey } from "@/data/prevention-threads";
import type { UserProfile } from "@/types/profile";

/**
 * Crew challenges: what a crew is doing together, when it is not together.
 *
 * ---
 *
 * ## The problem
 *
 * The Crew screen had one challenge per crew, hard-coded as a title, a target
 * and a **progress number that was also hard-coded**. "3 of 5" was a fact
 * about a data file. A player could complete BREAKSAFE five times and the bar
 * would not move, which is worse than having no bar: it teaches somebody that
 * nothing they do here counts, and it is a fabricated progress claim in a
 * product whose first rule is data honesty.
 *
 * ## What replaced it
 *
 * A challenge now has two halves that are kept strictly apart.
 *
 * **Your part is real.** `yourPart` is a pure function of the profile, exactly
 * like District Memory. If it says you have done your share, you have, and if
 * you have not, nothing on the screen pretends otherwise.
 *
 * **The crew's total is prototype content and says so, every time.** There is
 * no backend in this build, so there is no honest way to know what four other
 * people did. The screen states that in words next to the number rather than
 * in a footnote at the bottom, because a number with a caveat two hundred
 * pixels away is a number without a caveat.
 *
 * ## Why the formats vary
 *
 * Every challenge being "complete N missions" makes a crew a shared quota.
 * These are four different shapes of thing: split a story between you, make
 * something, change an environment, and be in the same room. Only one of them
 * is countable, which is the point.
 *
 * ## Designed so a backend could replace the prototype half
 *
 * `yourPart` is the whole contract the UI needs. A real implementation would
 * add other members' contributions from a server and leave this function, this
 * type and every component untouched, because nothing in the UI reads the
 * fabricated total except the one clearly labelled line that renders it.
 */

export type CrewChallengeFormat = "split" | "make" | "change" | "together";

export interface CrewChallenge {
  id: string;
  title: string;
  /** What the crew is doing, in one sentence. */
  detail: string;
  /** What *you* do, in the second person. Never a quota. */
  yourPart: string;
  format: CrewChallengeFormat;
  /** Where to go and do it. An existing route, never a new experience. */
  href: string;
  /** The label on the way in. */
  cta: string;
  /** True once this player has done their share. Pure. */
  done: (profile: UserProfile) => boolean;
  /** The banner pattern this unlocks for the crew. Cosmetic, free. */
  unlocks: string;
}

const has = (list: string[] | undefined, id: string) => (list ?? []).includes(id);

/**
 * The Crew Shift chapter, resolved from the campaign rather than typed here.
 *
 * Chapter ids are internal (`obm-c4`) and slugs are the route (`crew-shift`).
 * Writing either one into this file would be a second copy of a fact the
 * campaign already owns, and the kind that fails silently: a renamed chapter
 * would leave a challenge that can never be completed and no error anywhere.
 */
const CREW_SHIFT = (() => {
  for (const campaign of CAMPAIGNS) {
    const chapter = campaign.chapters.find((entry) => entry.slug === "crew-shift");
    if (chapter) return { campaignId: campaign.id, chapterId: chapter.id, slug: campaign.slug };
  }
  return null;
})();

/** Exported so a test can assert the chapter this challenge depends on exists. */
export const CREW_SHIFT_TARGET = CREW_SHIFT;

/** Any step of a thread banked, which is one person's share of a shared story. */
function anyStepOf(profile: UserProfile, threadId: string): boolean {
  const thread = getThread(threadId);
  if (!thread) return false;
  const banked = profile.threadSteps ?? [];
  return requiredSteps(thread).some((step) => banked.includes(stepKey(thread.id, step.id)));
}

export const CREW_CHALLENGES: CrewChallenge[] = [
  {
    id: "challenge-split-favour",
    title: "Split the favour between you",
    detail:
      "The favour runs across three people in three places, and nobody sees all of it. Take a different piece each and compare what you were told.",
    yourPart: "Take any one step of The favour.",
    format: "split",
    href: "/streets",
    cta: "Go and find one of them",
    done: (profile) => anyStepOf(profile, "thread-favour"),
    unlocks: "banner-split",
  },
  {
    id: "challenge-make-three",
    title: "Three quests, written by us",
    detail:
      "Everybody builds one situation they have actually seen. Three of them and the crew has a set nobody else has.",
    yourPart: "Build one quest of your own.",
    format: "make",
    href: "/streets",
    cta: "Open the crew room",
    done: (profile) => (profile.questDrafts ?? []).length >= 1,
    unlocks: "banner-make",
  },
  {
    id: "challenge-change-something",
    title: "Everyone changes one thing",
    detail:
      "Not one person changed, one thing changed. Each of you patches a different part of the same setup and says what it cost.",
    yourPart: "Finish BREAKSAFE and pick a patch.",
    format: "change",
    href: "/missions/mission-breaksafe",
    cta: "Open BREAKSAFE",
    done: (profile) => has(profile.completedMissionIds, "mission-breaksafe"),
    unlocks: "banner-change",
  },
  {
    id: "challenge-same-room",
    title: "One round, same room",
    detail:
      "The one thing that genuinely needs everybody at once. Two private votes either side of a conversation, about ninety seconds.",
    yourPart: "Play Crew Shift once, with whoever is around.",
    format: "together",
    href: CREW_SHIFT
      ? `/campaigns/${CREW_SHIFT.slug}/chapter/crew-shift`
      : "/campaigns",
    cta: "Open Crew Shift",
    done: (profile) =>
      CREW_SHIFT
        ? has(
            profile.campaigns?.[CREW_SHIFT.campaignId]?.completedChapterIds,
            CREW_SHIFT.chapterId,
          )
        : false,
    unlocks: "banner-together",
  },
];

export function getCrewChallenge(id: string | null | undefined): CrewChallenge | undefined {
  if (!id) return undefined;
  return CREW_CHALLENGES.find((challenge) => challenge.id === id);
}

/** How many of the four this player has personally done their share of. */
export function yourChallengesDone(profile: UserProfile): CrewChallenge[] {
  return CREW_CHALLENGES.filter((challenge) => challenge.done(profile));
}
