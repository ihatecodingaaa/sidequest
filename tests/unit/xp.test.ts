import { describe, expect, it } from "vitest";

import {
  MAX_LEVEL,
  awardMission,
  canClaimReward,
  getLevelProgress,
  levelForXp,
  levelTitle,
  xpForLevel,
} from "@/lib/xp";
import type { Mission } from "@/types/mission";

const mission: Pick<Mission, "id" | "xp" | "skillRewards"> = {
  id: "mission-test",
  xp: 100,
  skillRewards: [
    { skillId: "scam-awareness", points: 20 },
    { skillId: "decision-making", points: 10 },
  ],
};

const emptyState = { xp: 0, completedMissionIds: [] as string[], skillPoints: {} };

describe("level curve", () => {
  it("starts level 1 at zero XP", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(levelForXp(0)).toBe(1);
  });

  it("uses a clean arithmetic step between levels", () => {
    const gaps = [2, 3, 4, 5, 6].map((level) => xpForLevel(level) - xpForLevel(level - 1));
    expect(gaps).toEqual([120, 160, 200, 240, 280]);
  });

  it("is monotonic across the whole range", () => {
    for (let level = 2; level <= MAX_LEVEL; level += 1) {
      expect(xpForLevel(level)).toBeGreaterThan(xpForLevel(level - 1));
    }
  });

  it("levels up exactly at the threshold, not before", () => {
    expect(levelForXp(xpForLevel(3) - 1)).toBe(2);
    expect(levelForXp(xpForLevel(3))).toBe(3);
  });

  it("clamps at the maximum level", () => {
    expect(levelForXp(9_999_999)).toBe(MAX_LEVEL);
    expect(getLevelProgress(9_999_999).isMaxLevel).toBe(true);
    expect(getLevelProgress(9_999_999).fraction).toBe(1);
  });

  it("survives nonsense input rather than rendering NaN", () => {
    expect(levelForXp(Number.NaN)).toBe(1);
    expect(levelForXp(-500)).toBe(1);
    expect(getLevelProgress(Number.NaN).xp).toBe(0);
  });

  it("names every level", () => {
    for (let level = 1; level <= MAX_LEVEL; level += 1) {
      expect(levelTitle(level)).toBeTruthy();
    }
  });
});

describe("progress within a level", () => {
  it("reports the remaining XP to the next level", () => {
    const progress = getLevelProgress(200);
    expect(progress.level).toBe(2);
    expect(progress.levelFloor).toBe(120);
    expect(progress.levelCeiling).toBe(280);
    expect(progress.xpIntoLevel).toBe(80);
    expect(progress.xpForNextLevel).toBe(80);
    expect(progress.fraction).toBeCloseTo(0.5, 5);
  });

  it("keeps the fraction inside 0 and 1", () => {
    for (const xp of [0, 1, 119, 120, 121, 3000, 100000]) {
      const { fraction } = getLevelProgress(xp);
      expect(fraction).toBeGreaterThanOrEqual(0);
      expect(fraction).toBeLessThanOrEqual(1);
    }
  });
});

describe("awarding a mission", () => {
  it("grants XP and skill points the first time", () => {
    const result = awardMission(emptyState, mission);
    expect(result.awarded).toBe(true);
    expect(result.xpGained).toBe(100);
    expect(result.xp).toBe(100);
    expect(result.completedMissionIds).toEqual(["mission-test"]);
    expect(result.skillPoints).toEqual({ "scam-awareness": 20, "decision-making": 10 });
  });

  it("grants nothing on a replay", () => {
    const first = awardMission(emptyState, mission);
    const second = awardMission(first, mission);

    expect(second.awarded).toBe(false);
    expect(second.xpGained).toBe(0);
    expect(second.xp).toBe(first.xp);
    expect(second.completedMissionIds).toEqual(["mission-test"]);
    expect(second.skillPoints).toEqual(first.skillPoints);
  });

  it("cannot be farmed by repeating the same mission", () => {
    let state = emptyState;
    for (let i = 0; i < 25; i += 1) {
      state = awardMission(state, mission);
    }
    expect(state.xp).toBe(100);
    expect(state.completedMissionIds).toHaveLength(1);
  });

  it("accumulates skill points across different missions", () => {
    const first = awardMission(emptyState, mission);
    const second = awardMission(first, {
      id: "mission-other",
      xp: 60,
      skillRewards: [{ skillId: "scam-awareness", points: 5 }],
    });

    expect(second.xp).toBe(160);
    expect(second.skillPoints["scam-awareness"]).toBe(25);
    expect(second.skillPoints["decision-making"]).toBe(10);
  });

  it("reports a level up when one happens", () => {
    const state = { xp: 100, completedMissionIds: [], skillPoints: {} };
    const result = awardMission(state, mission);
    expect(result.levelBefore).toBe(1);
    expect(result.levelAfter).toBe(2);
    expect(result.leveledUp).toBe(true);
  });

  it("does not report a level up when the level is unchanged", () => {
    const result = awardMission(emptyState, { ...mission, xp: 10 });
    expect(result.leveledUp).toBe(false);
  });

  it("never mutates the state it was given", () => {
    const state = { xp: 0, completedMissionIds: [] as string[], skillPoints: {} };
    awardMission(state, mission);
    expect(state.xp).toBe(0);
    expect(state.completedMissionIds).toEqual([]);
    expect(state.skillPoints).toEqual({});
  });
});

describe("reward eligibility", () => {
  it("needs enough XP", () => {
    expect(canClaimReward(499, 500, false)).toBe(false);
    expect(canClaimReward(500, 500, false)).toBe(true);
    expect(canClaimReward(900, 500, false)).toBe(true);
  });

  it("refuses a reward that is already claimed", () => {
    expect(canClaimReward(9999, 500, true)).toBe(false);
  });
});
