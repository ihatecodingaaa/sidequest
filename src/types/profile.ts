import type { EchoStyleId } from "@/data/echo-styles";
import type { AvatarLook } from "@/features/streets/streets-data";
import type { AgeBand, Interest, SkillId } from "./core";
import type { CampaignProgress } from "./campaign";

export interface SafetySkill {
  id: SkillId;
  name: string;
  blurb: string;
  /** Short verb phrase: what the holder can actually do. */
  capability: string;
}

export interface PartnerSubmission {
  id: string;
  challengeId: string;
  title: string;
  solution: string;
  principleId: string;
  submittedAt: string;
  /**
   * Which friction the entry designs against, and what it changes.
   *
   * Optional for the same reason the quest draft's structured ids are: an
   * entry submitted before the Partner Challenge became tap-first has neither,
   * and `zustand/persist` rehydrates it unchanged rather than migrating it.
   * The prose fields are still the ones that render.
   */
  problemId?: string;
  moveId?: string;
}

/**
 * A scenario a young person made.
 *
 * Saved locally and marked as a draft. Nothing a user creates becomes live
 * content: the intended pipeline is facilitator or school review first, and
 * that is stated on the screen rather than only in a document. An unmoderated
 * crime-scenario publishing system aimed at teenagers is an obvious harm, and
 * the fact that it would demo well is not a reason to build it.
 *
 * ---
 *
 * ## Why the four display fields are still here
 *
 * Drafts are now assembled from four tapped choices rather than typed into
 * four text areas, and the structured ids below are what the Quick Quest
 * Builder actually records. The prose fields stay because a draft written on
 * an older build is sitting in somebody's `localStorage` right now, and this
 * app has no migration step by design: `zustand/persist` rehydrates whatever
 * is there. Keeping the display fields and generating them from the choices
 * means an old draft renders unchanged and a new one renders the same way,
 * with no branch at the render site and nobody's work discarded.
 *
 * `settingId` and its siblings are therefore optional, and their absence is
 * the honest signal that a draft predates the builder.
 */
export interface QuestDraft {
  id: string;
  title: string;
  /** The situation. Generated from the choices, or authored on an old draft. */
  hook: string;
  /** The moment somebody has to choose. */
  moment: string;
  /** The response the author thinks would work. */
  response: string;
  createdAt: string;

  /* ------------------------------------------- Quick Quest Builder fields */

  /** Where it happens. Absent on a draft written before the builder existed. */
  settingId?: string;
  /** What starts the moment. */
  triggerId?: string;
  /** Which decision the author thinks matters. */
  decisionId?: string;
  /** What could change the outcome. A `ProtectiveFactorId`. */
  factorId?: string;
  /**
   * One short line the author chose to add in their own words.
   *
   * Optional in the strongest sense: reaching it takes a deliberate second tap
   * on a secondary control, and a draft saved without it is complete.
   */
  customDetail?: string;
  /** How this draft was made. Absent means a hand-written one. */
  source?: "builder" | "written";
}

export interface RewardClaim {
  rewardId: string;
  claimedAt: string;
  /** Prototype claims carry no monetary value and no real code. */
  reference: string;
}

export interface UserProfile {
  displayName: string;
  ageBand: AgeBand;
  interests: Interest[];
  neighbourhood: string | null;
  xp: number;
  streakDays: number;
  completedMissionIds: string[];
  savedPulseIds: string[];
  crewId: string | null;
  skillPoints: Partial<Record<SkillId, number>>;
  submissions: PartnerSubmission[];
  rewardClaims: RewardClaim[];
  onboardedAt: string | null;
  /** Campaign progress, keyed by campaign id. Optional so older persisted
   *  profiles rehydrate without a migration step. */
  campaigns?: Record<string, CampaignProgress>;
  /**
   * Chosen Echo style. Cosmetic only, and optional for the same rehydration
   * reason. Which styles are *available* is derived from progress rather than
   * stored, so this can never claim something that was not earned.
   */
  echoStyleId?: EchoStyleId;
  /**
   * Street Checks banked in SIDEQUEST Streets, as their own ledger.
   *
   * Deliberately not folded into `completedMissionIds`: these are ten to thirty
   * second encounters, not catalogue missions, and counting them there would
   * inflate "played N missions" on You. Same pattern the Campaign uses for
   * chapter grants, and the same XP engine either way, so the once-only rule
   * comes for free. Optional so older persisted profiles rehydrate.
   */
  streetChecksDone?: string[];
  /** Chosen Streets avatar. Cosmetic, local, and never a real photograph. */
  streetsAvatar?: AvatarLook;
  /**
   * Prevention Thread steps banked, as `threadId:stepId`.
   *
   * Its own ledger for the same reason Street Checks have one: a thread step
   * is not a catalogue mission and counting it as one would inflate "played N
   * missions" on You. Same `awardMission` engine either way, so the once-only
   * rule comes for free rather than being reimplemented.
   */
  threadSteps?: string[];
  /**
   * Which option was taken at each decision step, keyed the same way.
   *
   * Stored so the world can react to what somebody actually chose, and so a
   * completion screen can name it back to them. Never scored, never compared
   * to anybody else's, and never used to rank a person.
   */
  threadChoices?: Record<string, string>;
  /** Youth-authored scenario drafts. Local, and never published from here. */
  questDrafts?: QuestDraft[];
  /**
   * District moments found by looking at things in Streets.
   *
   * Cosmetic, free, deterministic, and worth no XP at all. Its own ledger for
   * the same reason Street Checks have one, and optional so older persisted
   * profiles rehydrate without a migration.
   *
   * Deliberately not a currency and deliberately not scarce: there is a fixed
   * list, everything on it is findable by walking, and nothing is ever removed
   * or expires. See `streets-props.ts`.
   */
  districtMoments?: string[];
}
