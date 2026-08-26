import type {
  Campaign,
  CampaignChapter,
  CampaignFollowUp,
  CampaignMode,
  CampaignProgress,
} from "@/types/campaign";

/**
 * Campaign rules, as pure functions.
 *
 * Everything here is deterministic and free of React and of storage, so the
 * roadshow behaviour that actually matters (route spreading, the 3 of 4 finale
 * rule, XP paid once) is unit-testable without a browser.
 */

/** Grant keys are the idempotency ledger. One key, one payment, ever. */
export const grantKey = {
  chapter: (chapterId: string) => `chapter:${chapterId}`,
  finale: (campaignId: string) => `finale:${campaignId}`,
  fullCompletion: (campaignId: string) => `bonus:${campaignId}`,
  followUp: (followUpId: string) => `follow-up:${followUpId}`,
};

/* ---------------------------------------------------------- Route choice */

/**
 * Picks a starting route so a crowd spreads across the stations instead of
 * queueing at chapter one.
 *
 * The seed is a per-browser value, so a participant keeps the same route
 * across a refresh, but two phones at the same event land differently. There
 * is no server, and there does not need to be one: with enough participants a
 * uniform hash spreads them evenly enough for a hall.
 */
export function pickRouteId(campaign: Campaign, seed: string): string {
  if (campaign.routes.length === 0) throw new Error("Campaign has no routes");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return campaign.routes[hash % campaign.routes.length].id;
}

export function getRoute(campaign: Campaign, routeId: string) {
  return campaign.routes.find((route) => route.id === routeId) ?? campaign.routes[0];
}

/**
 * The chapter the route suggests next: the first one on this route that is not
 * finished yet. Guidance only, never a lock. A participant who finds station 3
 * free can always take it.
 */
export function nextRecommendedChapter(
  campaign: Campaign,
  progress: CampaignProgress,
): CampaignChapter | undefined {
  const route = getRoute(campaign, progress.routeId);
  const nextId = route.orderedChapterIds.find(
    (id) => !progress.completedChapterIds.includes(id),
  );
  return campaign.chapters.find((chapter) => chapter.id === nextId);
}

/* ------------------------------------------------------------- Progress */

export function physicalChapters(campaign: Campaign): CampaignChapter[] {
  return campaign.chapters.filter((chapter) => chapter.isPhysicalStation);
}

export function completedPhysicalCount(
  campaign: Campaign,
  progress: CampaignProgress,
): number {
  return physicalChapters(campaign).filter((chapter) =>
    progress.completedChapterIds.includes(chapter.id),
  ).length;
}

/**
 * The resilience rule. Three of four stations opens the finale, so one broken
 * QR, one crowded table or one closed corner cannot end somebody's experience.
 */
export function isFinaleUnlocked(campaign: Campaign, progress: CampaignProgress): boolean {
  return completedPhysicalCount(campaign, progress) >= campaign.minimumChaptersForFinale;
}

export function isFullyCompleted(campaign: Campaign, progress: CampaignProgress): boolean {
  return completedPhysicalCount(campaign, progress) === physicalChapters(campaign).length;
}

export function chaptersRemainingForFinale(
  campaign: Campaign,
  progress: CampaignProgress,
): number {
  return Math.max(
    0,
    campaign.minimumChaptersForFinale - completedPhysicalCount(campaign, progress),
  );
}

/** 0 to 1 across stations plus the finale, for the progress ring. */
export function campaignFraction(campaign: Campaign, progress: CampaignProgress): number {
  const total = physicalChapters(campaign).length + 1;
  const done = completedPhysicalCount(campaign, progress) + (progress.finaleCompleted ? 1 : 0);
  return Math.min(1, done / total);
}

/* ----------------------------------------------------------- Unlocking */

/** Station codes are spoken aloud and typed with one thumb. Be forgiving. */
export function normaliseStationCode(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function findChapterByStationCode(
  campaign: Campaign,
  input: string,
): CampaignChapter | undefined {
  const code = normaliseStationCode(input);
  if (!code) return undefined;
  return campaign.chapters.find(
    (chapter) => chapter.stationCode && normaliseStationCode(chapter.stationCode) === code,
  );
}

export function isChapterUnlocked(
  progress: CampaignProgress | undefined,
  chapterId: string,
): boolean {
  if (!progress) return false;
  return (
    progress.unlockedChapterIds.includes(chapterId) ||
    progress.completedChapterIds.includes(chapterId)
  );
}

/* ---------------------------------------------------------- Follow-ups */

/**
 * Follow-ups unlock on elapsed time since Campaign completion.
 *
 * `demoHoursOffset` shifts the clock forward for judging. It is a demo control,
 * it is labelled as one in the UI, and it never changes what a real deployment
 * would do: the interval is configured per follow-up, not hard-coded here.
 */
export function followUpUnlockedAt(
  progress: CampaignProgress,
  followUp: CampaignFollowUp,
): Date | null {
  if (!progress.completedAt) return null;
  const base = new Date(progress.completedAt).getTime();
  if (Number.isNaN(base)) return null;
  return new Date(base + followUp.unlockAfterHours * 3_600_000);
}

export function isFollowUpUnlocked(
  progress: CampaignProgress | undefined,
  followUp: CampaignFollowUp,
  now: Date = new Date(),
): boolean {
  if (!progress?.completedAt) return false;
  const unlocksAt = followUpUnlockedAt(progress, followUp);
  if (!unlocksAt) return false;
  const effectiveNow = now.getTime() + progress.demoHoursOffset * 3_600_000;
  return effectiveNow >= unlocksAt.getTime();
}

export function hoursUntilFollowUp(
  progress: CampaignProgress,
  followUp: CampaignFollowUp,
  now: Date = new Date(),
): number {
  const unlocksAt = followUpUnlockedAt(progress, followUp);
  if (!unlocksAt) return followUp.unlockAfterHours;
  const effectiveNow = now.getTime() + progress.demoHoursOffset * 3_600_000;
  return Math.max(0, (unlocksAt.getTime() - effectiveNow) / 3_600_000);
}

/** Human label for a locked follow-up. Deliberately vague, never a countdown. */
export function followUpLockLabel(hours: number): string {
  if (hours <= 0) return "Ready";
  if (hours < 1) return "Unlocks shortly";
  if (hours < 24) return `Unlocks in ${Math.ceil(hours)}h`;
  // Floor, not ceil: 25 hours away is tomorrow, not two days.
  const days = Math.max(1, Math.floor(hours / 24));
  return days === 1 ? "Unlocks tomorrow" : `Unlocks in ${days} days`;
}

/* ------------------------------------------------------------ Creation */

export function createProgress(
  campaign: Campaign,
  mode: CampaignMode,
  seed: string,
  now: Date = new Date(),
): CampaignProgress {
  return {
    campaignId: campaign.id,
    mode,
    routeId: pickRouteId(campaign, seed),
    startedAt: now.toISOString(),
    unlockedChapterIds: [],
    completedChapterIds: [],
    chapterResults: {},
    finaleCompleted: false,
    finaleOptionId: null,
    completedAt: null,
    completedFollowUpIds: [],
    awardedKeys: [],
    demoHoursOffset: 0,
  };
}

/**
 * A stable per-browser seed. Falls back to a fresh random value when storage
 * is unavailable, which only means the route is picked once per session
 * instead of once per device.
 */
export const SEED_STORAGE_KEY = "sidequest.campaign.seed.v1";

export function readOrCreateSeed(): string {
  const fresh = () => Math.random().toString(36).slice(2, 12);
  try {
    const existing = window.localStorage.getItem(SEED_STORAGE_KEY);
    if (existing) return existing;
    const seed = fresh();
    window.localStorage.setItem(SEED_STORAGE_KEY, seed);
    return seed;
  } catch {
    return fresh();
  }
}
