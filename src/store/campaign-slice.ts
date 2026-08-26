import type { UserProfile } from "@/types/profile";
import type {
  Campaign,
  CampaignFollowUp,
  CampaignMode,
  CampaignProgress,
  ChapterResult,
} from "@/types/campaign";
import type { SkillAward } from "@/types/core";
import { awardMission, type AwardResult } from "@/lib/xp";
import {
  createProgress,
  grantKey,
  isFinaleUnlocked,
  isFullyCompleted,
  pickRouteId,
} from "@/lib/campaign";

/**
 * Campaign state transitions, written as pure functions over the profile.
 *
 * They live outside the zustand store so the roadshow rules that actually
 * matter (XP paid exactly once, the 3 of 4 finale, resets) can be unit-tested
 * without mounting anything.
 *
 * XP always flows through `awardMission` from `src/lib/xp.ts`. There is one
 * progression engine in SIDEQUEST and Campaigns does not get a second one.
 * The only difference is the ledger: campaign grants are keyed in
 * `progress.awardedKeys` rather than in `completedMissionIds`, so a chapter
 * never masquerades as a standalone mission in the Safety Passport's
 * completed list.
 */

const NO_AWARD = (profile: UserProfile): AwardResult => ({
  xp: profile.xp,
  completedMissionIds: profile.completedMissionIds,
  skillPoints: profile.skillPoints,
  awarded: false,
  xpGained: 0,
  leveledUp: false,
  levelBefore: 1,
  levelAfter: 1,
});

export interface CampaignGrant {
  key: string;
  xp: number;
  skillRewards: SkillAward[];
}

export interface CampaignMutation {
  profile: UserProfile;
  result: AwardResult;
}

export function getProgress(
  profile: UserProfile,
  campaignId: string,
): CampaignProgress | undefined {
  return profile.campaigns?.[campaignId];
}

function withProgress(profile: UserProfile, progress: CampaignProgress): UserProfile {
  return {
    ...profile,
    campaigns: { ...(profile.campaigns ?? {}), [progress.campaignId]: progress },
  };
}

/**
 * Pays a grant exactly once.
 *
 * The key is checked against the ledger before anything is added, so a
 * refreshed page, a re-scanned QR or a replayed chapter all resolve to the
 * same no-op.
 */
export function applyGrant(
  profile: UserProfile,
  progress: CampaignProgress,
  grant: CampaignGrant,
): CampaignMutation {
  if (progress.awardedKeys.includes(grant.key)) {
    return { profile: withProgress(profile, progress), result: NO_AWARD(profile) };
  }

  const result = awardMission(
    {
      xp: profile.xp,
      // The ledger stands in for completedMissionIds. `awardMission` only ever
      // uses it as an idempotency set, which is exactly what is wanted here.
      completedMissionIds: progress.awardedKeys,
      skillPoints: profile.skillPoints,
    },
    { id: grant.key, xp: grant.xp, skillRewards: grant.skillRewards },
  );

  const nextProgress: CampaignProgress = {
    ...progress,
    awardedKeys: result.completedMissionIds,
  };

  return {
    profile: {
      ...withProgress(profile, nextProgress),
      xp: result.xp,
      skillPoints: result.skillPoints,
    },
    result,
  };
}

/* ------------------------------------------------------------- Actions */

export function startCampaign(
  profile: UserProfile,
  campaign: Campaign,
  mode: CampaignMode,
  seed: string,
  now: Date = new Date(),
): UserProfile {
  const existing = getProgress(profile, campaign.id);
  // Restarting keeps the assigned route. A participant who switches to Quick
  // mode halfway through a roadshow should not be sent to a different station.
  const progress = existing
    ? { ...existing, mode }
    : createProgress(campaign, mode, seed, now);
  return withProgress(profile, progress);
}

export function setCampaignMode(
  profile: UserProfile,
  campaignId: string,
  mode: CampaignMode,
): UserProfile {
  const progress = getProgress(profile, campaignId);
  if (!progress) return profile;
  return withProgress(profile, { ...progress, mode });
}

/**
 * Unlocking is what a QR scan or a station code does. It is separate from
 * completing, because the whole Scan and Scatter idea depends on a participant
 * unlocking at the station and playing somewhere else.
 */
export function unlockChapter(
  profile: UserProfile,
  campaignId: string,
  chapterId: string,
): UserProfile {
  const progress = getProgress(profile, campaignId);
  if (!progress) return profile;
  if (progress.unlockedChapterIds.includes(chapterId)) return profile;
  return withProgress(profile, {
    ...progress,
    unlockedChapterIds: [...progress.unlockedChapterIds, chapterId],
  });
}

export function completeChapter(
  profile: UserProfile,
  campaign: Campaign,
  chapterId: string,
  result: ChapterResult,
): CampaignMutation {
  const progress = getProgress(profile, campaign.id);
  const chapter = campaign.chapters.find((entry) => entry.id === chapterId);
  if (!progress || !chapter) {
    return { profile, result: NO_AWARD(profile) };
  }

  const nextProgress: CampaignProgress = {
    ...progress,
    unlockedChapterIds: progress.unlockedChapterIds.includes(chapterId)
      ? progress.unlockedChapterIds
      : [...progress.unlockedChapterIds, chapterId],
    completedChapterIds: progress.completedChapterIds.includes(chapterId)
      ? progress.completedChapterIds
      : [...progress.completedChapterIds, chapterId],
    // The latest playthrough wins. Replaying is allowed and free.
    chapterResults: { ...progress.chapterResults, [chapterId]: result },
  };

  return applyGrant(profile, nextProgress, {
    key: grantKey.chapter(chapterId),
    xp: chapter.xp,
    skillRewards: chapter.skillRewards,
  });
}

export function completeFinale(
  profile: UserProfile,
  campaign: Campaign,
  optionId: string,
  now: Date = new Date(),
): CampaignMutation {
  const progress = getProgress(profile, campaign.id);
  if (!progress || !isFinaleUnlocked(campaign, progress)) {
    return { profile, result: NO_AWARD(profile) };
  }

  const nextProgress: CampaignProgress = {
    ...progress,
    finaleCompleted: true,
    finaleOptionId: optionId,
    completedAt: progress.completedAt ?? now.toISOString(),
  };

  const finaleGrant = applyGrant(profile, nextProgress, {
    key: grantKey.finale(campaign.id),
    xp: campaign.finale.xp,
    skillRewards: campaign.finale.skillRewards,
  });

  // Clearing every station pays a bonus, once, on top of the finale.
  if (!isFullyCompleted(campaign, nextProgress)) return finaleGrant;

  const afterFinale = getProgress(finaleGrant.profile, campaign.id);
  if (!afterFinale) return finaleGrant;

  const bonus = applyGrant(finaleGrant.profile, afterFinale, {
    key: grantKey.fullCompletion(campaign.id),
    xp: campaign.fullCompletionBonusXp,
    skillRewards: [],
  });

  return {
    profile: bonus.profile,
    result: {
      ...finaleGrant.result,
      // Report the combined figure so the completion screen is honest about
      // what was actually added.
      xpGained: finaleGrant.result.xpGained + bonus.result.xpGained,
      xp: bonus.result.awarded ? bonus.result.xp : finaleGrant.result.xp,
      levelAfter: bonus.result.awarded ? bonus.result.levelAfter : finaleGrant.result.levelAfter,
      leveledUp: finaleGrant.result.leveledUp || bonus.result.leveledUp,
    },
  };
}

export function completeFollowUp(
  profile: UserProfile,
  campaign: Campaign,
  followUp: CampaignFollowUp,
): CampaignMutation {
  const progress = getProgress(profile, campaign.id);
  if (!progress) return { profile, result: NO_AWARD(profile) };

  const nextProgress: CampaignProgress = {
    ...progress,
    completedFollowUpIds: progress.completedFollowUpIds.includes(followUp.id)
      ? progress.completedFollowUpIds
      : [...progress.completedFollowUpIds, followUp.id],
  };

  return applyGrant(profile, nextProgress, {
    key: grantKey.followUp(followUp.id),
    xp: followUp.xp,
    skillRewards: followUp.skillRewards,
  });
}

/* --------------------------------------------------------- Demo controls */

export function resetCampaign(profile: UserProfile, campaignId: string): UserProfile {
  const campaigns = { ...(profile.campaigns ?? {}) };
  delete campaigns[campaignId];
  return { ...profile, campaigns };
}

export function reassignRoute(
  profile: UserProfile,
  campaign: Campaign,
  seed: string,
): UserProfile {
  const progress = getProgress(profile, campaign.id);
  if (!progress) return profile;
  return withProgress(profile, { ...progress, routeId: pickRouteId(campaign, seed) });
}

export function unlockAllChapters(profile: UserProfile, campaign: Campaign): UserProfile {
  const progress = getProgress(profile, campaign.id);
  if (!progress) return profile;
  return withProgress(profile, {
    ...progress,
    unlockedChapterIds: campaign.chapters.map((chapter) => chapter.id),
  });
}

/** Demo only. Moves the clock forward so a follow-up can be shown on stage. */
export function advanceDemoClock(
  profile: UserProfile,
  campaignId: string,
  hours: number,
): UserProfile {
  const progress = getProgress(profile, campaignId);
  if (!progress) return profile;
  return withProgress(profile, {
    ...progress,
    demoHoursOffset: Math.max(0, progress.demoHoursOffset + hours),
  });
}
