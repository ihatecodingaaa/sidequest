import type { Mission } from "@/types/mission";
import type { SkillId } from "@/types/core";

/**
 * Deterministic progression engine.
 *
 * Cumulative XP required to reach level L is `20 * (L - 1) * (L + 4)`, which
 * produces level gaps of 120, 160, 200, 240 ... (a clean +40 arithmetic step).
 * A typical mission is worth 40 to 150 XP, so early levels arrive every two to
 * four missions and later ones take real commitment.
 */

export const MAX_LEVEL = 12;

export const LEVEL_TITLES: readonly string[] = [
  "Rookie",
  "Spotter",
  "Responder",
  "Signal",
  "Advocate",
  "Strategist",
  "Architect",
  "Guardian",
  "Catalyst",
  "Vanguard",
  "Luminary",
  "Legend",
] as const;

/** Cumulative XP needed to reach a given level. Level 1 starts at 0. */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  return 20 * (l - 1) * (l + 4);
}

export function levelForXp(xp: number): number {
  const safe = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  let level = 1;
  while (level < MAX_LEVEL && safe >= xpForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

export function levelTitle(level: number): string {
  const index = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level))) - 1;
  return LEVEL_TITLES[index] ?? LEVEL_TITLES[LEVEL_TITLES.length - 1];
}

export interface LevelProgress {
  level: number;
  title: string;
  xp: number;
  levelFloor: number;
  levelCeiling: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  /** 0 to 1. Reads 1 at max level. */
  fraction: number;
  isMaxLevel: boolean;
}

export function getLevelProgress(xp: number): LevelProgress {
  const safe = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  const level = levelForXp(safe);
  const isMaxLevel = level >= MAX_LEVEL;
  const levelFloor = xpForLevel(level);
  const levelCeiling = isMaxLevel ? levelFloor : xpForLevel(level + 1);
  const span = Math.max(1, levelCeiling - levelFloor);
  const xpIntoLevel = safe - levelFloor;

  return {
    level,
    title: levelTitle(level),
    xp: safe,
    levelFloor,
    levelCeiling,
    xpIntoLevel,
    xpForNextLevel: isMaxLevel ? 0 : levelCeiling - safe,
    fraction: isMaxLevel ? 1 : Math.min(1, Math.max(0, xpIntoLevel / span)),
    isMaxLevel,
  };
}

export interface AwardInput {
  xp: number;
  completedMissionIds: string[];
  skillPoints: Partial<Record<SkillId, number>>;
}

export interface AwardResult {
  xp: number;
  completedMissionIds: string[];
  skillPoints: Partial<Record<SkillId, number>>;
  /** False when the mission had already been completed. */
  awarded: boolean;
  xpGained: number;
  leveledUp: boolean;
  levelBefore: number;
  levelAfter: number;
}

/**
 * Awards a mission exactly once. Replaying a completed mission is allowed
 * (people should be able to revisit a scenario) but grants no further XP.
 */
export function awardMission(
  state: AwardInput,
  mission: Pick<Mission, "id" | "xp" | "skillRewards">,
): AwardResult {
  const already = state.completedMissionIds.includes(mission.id);
  const levelBefore = levelForXp(state.xp);

  if (already) {
    return {
      xp: state.xp,
      completedMissionIds: state.completedMissionIds,
      skillPoints: state.skillPoints,
      awarded: false,
      xpGained: 0,
      leveledUp: false,
      levelBefore,
      levelAfter: levelBefore,
    };
  }

  const gained = Math.max(0, Math.floor(mission.xp));
  const xp = state.xp + gained;
  const skillPoints: Partial<Record<SkillId, number>> = { ...state.skillPoints };
  for (const award of mission.skillRewards) {
    skillPoints[award.skillId] = (skillPoints[award.skillId] ?? 0) + award.points;
  }
  const levelAfter = levelForXp(xp);

  return {
    xp,
    completedMissionIds: [...state.completedMissionIds, mission.id],
    skillPoints,
    awarded: true,
    xpGained: gained,
    leveledUp: levelAfter > levelBefore,
    levelBefore,
    levelAfter,
  };
}

export function canClaimReward(xp: number, xpCost: number, alreadyClaimed: boolean): boolean {
  if (alreadyClaimed) return false;
  return xp >= xpCost;
}
