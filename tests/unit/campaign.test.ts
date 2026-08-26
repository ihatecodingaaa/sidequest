import { describe, expect, it } from "vitest";

import {
  campaignFraction,
  chaptersRemainingForFinale,
  completedPhysicalCount,
  createProgress,
  findChapterByStationCode,
  followUpLockLabel,
  getRoute,
  grantKey,
  hoursUntilFollowUp,
  isChapterUnlocked,
  isFinaleUnlocked,
  isFollowUpUnlocked,
  isFullyCompleted,
  nextRecommendedChapter,
  normaliseStationCode,
  physicalChapters,
  pickRouteId,
} from "@/lib/campaign";
import { ONE_BAD_MINUTE } from "@/data/campaigns";
import type { CampaignProgress } from "@/types/campaign";

const campaign = ONE_BAD_MINUTE;
const NOW = new Date("2026-09-01T12:00:00.000Z");

function progressWith(overrides: Partial<CampaignProgress> = {}): CampaignProgress {
  return { ...createProgress(campaign, "story", "seed", NOW), ...overrides };
}

describe("route assignment", () => {
  it("always returns a route the campaign defines", () => {
    for (let i = 0; i < 200; i += 1) {
      const routeId = pickRouteId(campaign, `seed-${i}`);
      expect(campaign.routes.some((route) => route.id === routeId)).toBe(true);
    }
  });

  it("is stable for the same seed", () => {
    const first = pickRouteId(campaign, "abc123");
    for (let i = 0; i < 20; i += 1) {
      expect(pickRouteId(campaign, "abc123")).toBe(first);
    }
  });

  it("spreads a crowd across every starting station", () => {
    // The whole point of routes is that eighty people do not queue at chapter
    // one. A hash that only ever produced two routes would pass the "valid
    // route" test above and still fail the roadshow.
    const seen = new Set<string>();
    for (let i = 0; i < 400; i += 1) {
      seen.add(pickRouteId(campaign, `phone-${i}`));
    }
    expect(seen.size).toBe(campaign.routes.length);
  });

  it("gives each route a distinct first chapter", () => {
    const firsts = campaign.routes.map((route) => route.orderedChapterIds[0]);
    expect(new Set(firsts).size).toBe(campaign.routes.length);
  });

  it("covers every chapter in every route", () => {
    const stationIds = physicalChapters(campaign).map((chapter) => chapter.id).sort();
    for (const route of campaign.routes) {
      expect([...route.orderedChapterIds].sort()).toEqual(stationIds);
    }
  });

  it("falls back to the first route for an unknown id", () => {
    expect(getRoute(campaign, "does-not-exist").id).toBe(campaign.routes[0].id);
  });
});

describe("recommended next chapter", () => {
  it("follows the assigned route", () => {
    const route = campaign.routes[1];
    const progress = progressWith({ routeId: route.id });
    expect(nextRecommendedChapter(campaign, progress)?.id).toBe(route.orderedChapterIds[0]);
  });

  it("skips chapters already completed", () => {
    const route = campaign.routes[0];
    const progress = progressWith({
      routeId: route.id,
      completedChapterIds: [route.orderedChapterIds[0]],
    });
    expect(nextRecommendedChapter(campaign, progress)?.id).toBe(route.orderedChapterIds[1]);
  });

  it("returns nothing once every chapter is done", () => {
    const progress = progressWith({
      completedChapterIds: campaign.chapters.map((chapter) => chapter.id),
    });
    expect(nextRecommendedChapter(campaign, progress)).toBeUndefined();
  });
});

describe("the three of four rule", () => {
  const stations = physicalChapters(campaign);

  it("keeps the finale shut below the threshold", () => {
    for (let count = 0; count < campaign.minimumChaptersForFinale; count += 1) {
      const progress = progressWith({
        completedChapterIds: stations.slice(0, count).map((chapter) => chapter.id),
      });
      expect(isFinaleUnlocked(campaign, progress), `${count} chapters`).toBe(false);
    }
  });

  it("opens the finale at exactly three chapters", () => {
    const progress = progressWith({
      completedChapterIds: stations.slice(0, 3).map((chapter) => chapter.id),
    });
    expect(isFinaleUnlocked(campaign, progress)).toBe(true);
    expect(isFullyCompleted(campaign, progress)).toBe(false);
  });

  it("opens with any three, not a specific three", () => {
    // A broken QR at one station must never be able to end somebody's Campaign.
    for (let skipped = 0; skipped < stations.length; skipped += 1) {
      const completed = stations
        .filter((_, index) => index !== skipped)
        .map((chapter) => chapter.id);
      const progress = progressWith({ completedChapterIds: completed });
      expect(isFinaleUnlocked(campaign, progress), `without station ${skipped}`).toBe(true);
    }
  });

  it("recognises full completion separately", () => {
    const progress = progressWith({
      completedChapterIds: stations.map((chapter) => chapter.id),
    });
    expect(isFullyCompleted(campaign, progress)).toBe(true);
    expect(completedPhysicalCount(campaign, progress)).toBe(stations.length);
  });

  it("counts down honestly", () => {
    expect(chaptersRemainingForFinale(campaign, progressWith())).toBe(3);
    expect(
      chaptersRemainingForFinale(
        campaign,
        progressWith({ completedChapterIds: [stations[0].id, stations[1].id] }),
      ),
    ).toBe(1);
    expect(
      chaptersRemainingForFinale(
        campaign,
        progressWith({ completedChapterIds: stations.map((c) => c.id) }),
      ),
    ).toBe(0);
  });

  it("reports a progress fraction between 0 and 1", () => {
    expect(campaignFraction(campaign, progressWith())).toBe(0);
    const full = progressWith({
      completedChapterIds: stations.map((c) => c.id),
      finaleCompleted: true,
    });
    expect(campaignFraction(campaign, full)).toBe(1);
  });
});

describe("station codes", () => {
  it("resolves each printed code to its chapter", () => {
    for (const chapter of physicalChapters(campaign)) {
      expect(findChapterByStationCode(campaign, chapter.stationCode!)?.id).toBe(chapter.id);
    }
  });

  it("forgives how a code gets typed", () => {
    // These are read aloud by a facilitator and typed with one thumb.
    for (const input of ["a7", " A7 ", "a-7", "A 7"]) {
      expect(findChapterByStationCode(campaign, input)?.slug, input).toBe("the-favour");
    }
  });

  it("rejects an unknown code", () => {
    expect(findChapterByStationCode(campaign, "Z9")).toBeUndefined();
    expect(findChapterByStationCode(campaign, "")).toBeUndefined();
    expect(findChapterByStationCode(campaign, "   ")).toBeUndefined();
  });

  it("gives every station a unique code", () => {
    const codes = physicalChapters(campaign).map((chapter) =>
      normaliseStationCode(chapter.stationCode ?? ""),
    );
    expect(codes.every(Boolean)).toBe(true);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("chapter unlocking", () => {
  it("treats a completed chapter as unlocked", () => {
    const progress = progressWith({ completedChapterIds: ["obm-c1"] });
    expect(isChapterUnlocked(progress, "obm-c1")).toBe(true);
  });

  it("is false without progress", () => {
    expect(isChapterUnlocked(undefined, "obm-c1")).toBe(false);
  });
});

describe("follow-up unlocking", () => {
  const [aftermath, week] = campaign.followUps;

  it("stays locked until the Campaign is finished", () => {
    const progress = progressWith({ completedAt: null });
    expect(isFollowUpUnlocked(progress, aftermath, NOW)).toBe(false);
  });

  it("stays locked before its interval elapses", () => {
    const progress = progressWith({ completedAt: NOW.toISOString() });
    const anHourLater = new Date(NOW.getTime() + 3_600_000);
    expect(isFollowUpUnlocked(progress, aftermath, anHourLater)).toBe(false);
  });

  it("unlocks once real time has passed", () => {
    const progress = progressWith({ completedAt: NOW.toISOString() });
    const later = new Date(NOW.getTime() + (aftermath.unlockAfterHours + 1) * 3_600_000);
    expect(isFollowUpUnlocked(progress, aftermath, later)).toBe(true);
  });

  it("unlocks the next-day chapter with the demo clock, but not the weekly one", () => {
    const progress = progressWith({ completedAt: NOW.toISOString(), demoHoursOffset: 24 });
    expect(isFollowUpUnlocked(progress, aftermath, NOW)).toBe(true);
    expect(isFollowUpUnlocked(progress, week, NOW)).toBe(false);
  });

  it("unlocks the weekly chapter after a week of demo clock", () => {
    const progress = progressWith({ completedAt: NOW.toISOString(), demoHoursOffset: 24 * 8 });
    expect(isFollowUpUnlocked(progress, week, NOW)).toBe(true);
  });

  it("reports remaining hours without going negative", () => {
    const progress = progressWith({ completedAt: NOW.toISOString() });
    expect(hoursUntilFollowUp(progress, aftermath, NOW)).toBeCloseTo(
      aftermath.unlockAfterHours,
      5,
    );
    const past = new Date(NOW.getTime() + 1000 * 3_600_000);
    expect(hoursUntilFollowUp(progress, aftermath, past)).toBe(0);
  });

  it("labels the wait vaguely rather than as a countdown", () => {
    expect(followUpLockLabel(0)).toBe("Ready");
    expect(followUpLockLabel(0.5)).toBe("Unlocks shortly");
    expect(followUpLockLabel(6)).toBe("Unlocks in 6h");
    expect(followUpLockLabel(20)).toBe("Unlocks in 20h");
    expect(followUpLockLabel(25)).toBe("Unlocks tomorrow");
    expect(followUpLockLabel(47)).toBe("Unlocks tomorrow");
    expect(followUpLockLabel(150)).toBe("Unlocks in 6 days");
  });
});

describe("grant keys", () => {
  it("namespaces every kind of grant separately", () => {
    const keys = [
      grantKey.chapter("obm-c1"),
      grantKey.finale(campaign.id),
      grantKey.fullCompletion(campaign.id),
      grantKey.followUp("obm-followup-aftermath"),
    ];
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("produces a distinct key per chapter", () => {
    const keys = campaign.chapters.map((chapter) => grantKey.chapter(chapter.id));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("campaign content integrity", () => {
  it("has unique chapter ids and slugs", () => {
    const ids = campaign.chapters.map((chapter) => chapter.id);
    const slugs = campaign.chapters.map((chapter) => chapter.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every chapter XP, skills and a behavioural rationale", () => {
    for (const chapter of campaign.chapters) {
      expect(chapter.xp, chapter.id).toBeGreaterThan(0);
      expect(chapter.skillRewards.length, chapter.id).toBeGreaterThan(0);
      expect(chapter.behaviouralMechanism.length, chapter.id).toBeGreaterThan(20);
      expect(chapter.behaviouralObjective.length, chapter.id).toBeGreaterThan(20);
    }
  });

  it("keeps chapters short enough to play standing up", () => {
    for (const chapter of campaign.chapters) {
      expect(chapter.estimatedMinutes, chapter.id).toBeLessThanOrEqual(5);
    }
  });

  it("gives every physical station a code and a sign", () => {
    for (const chapter of physicalChapters(campaign)) {
      expect(chapter.stationCode, chapter.id).toBeTruthy();
      expect(chapter.signText, chapter.id).toBeTruthy();
    }
  });

  it("requires fewer chapters than it has, so one can fail", () => {
    expect(campaign.minimumChaptersForFinale).toBeLessThan(physicalChapters(campaign).length);
  });

  it("maps every finale option to an outcome", () => {
    for (const option of campaign.finale.options) {
      expect(campaign.finale.outcomes[option.theme], option.id).toBeDefined();
    }
  });

  it("gives the finale options distinct themes", () => {
    const themes = campaign.finale.options.map((option) => option.theme);
    expect(new Set(themes).size).toBe(themes.length);
  });

  it("orders follow-ups so the next-day one comes first", () => {
    const hours = campaign.followUps.map((followUp) => followUp.unlockAfterHours);
    expect([...hours].sort((a, b) => a - b)).toEqual(hours);
    expect(hours[0]).toBeLessThan(24);
  });
});
