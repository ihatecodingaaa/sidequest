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
}
