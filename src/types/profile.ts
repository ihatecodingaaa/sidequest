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
}

/**
 * A scenario a young person wrote.
 *
 * Saved locally and marked as a draft. Nothing a user writes becomes live
 * content: the intended pipeline is facilitator or school review first, and
 * that is stated on the screen rather than only in a document. An unmoderated
 * crime-scenario publishing system aimed at teenagers is an obvious harm, and
 * the fact that it would demo well is not a reason to build it.
 */
export interface QuestDraft {
  id: string;
  title: string;
  /** The situation, in the author's own words. */
  hook: string;
  /** The moment somebody has to choose. */
  moment: string;
  /** What they think the workable response is. */
  response: string;
  createdAt: string;
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
}
