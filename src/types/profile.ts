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
}
