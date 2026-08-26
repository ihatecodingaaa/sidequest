import { beforeEach, describe, expect, it } from "vitest";

import { EMPTY_PROFILE, useAppStore } from "@/store/app-store";
import { ONE_BAD_MINUTE } from "@/data/campaigns";
import { physicalChapters } from "@/lib/campaign";
import type { ChapterResult } from "@/types/campaign";

/**
 * XP is the thing most likely to be quietly wrong, and the roadshow is full of
 * ways to trigger a double payment: a re-scanned QR, a browser back button, a
 * replayed chapter, a refreshed finale. These tests exist for that.
 */

const campaign = ONE_BAD_MINUTE;
const store = () => useAppStore.getState();
const stations = physicalChapters(campaign);

const STORY: ChapterResult = { mechanic: "story" };

beforeEach(() => {
  useAppStore.setState({ profile: { ...EMPTY_PROFILE, campaigns: {} }, hasHydrated: true });
});

function start() {
  store().startCampaign(campaign, "story");
}

function completeAll(count = stations.length) {
  for (const chapter of stations.slice(0, count)) {
    store().completeChapter(campaign, chapter.id, STORY);
  }
}

describe("starting a campaign", () => {
  it("creates progress with a valid route", () => {
    start();
    const progress = store().getCampaignProgress(campaign.id);
    expect(progress).toBeDefined();
    expect(campaign.routes.some((route) => route.id === progress!.routeId)).toBe(true);
    expect(progress!.mode).toBe("story");
    expect(progress!.awardedKeys).toEqual([]);
  });

  it("keeps the assigned route when the mode changes mid-event", () => {
    start();
    const first = store().getCampaignProgress(campaign.id)!.routeId;
    store().startCampaign(campaign, "quick");

    const progress = store().getCampaignProgress(campaign.id)!;
    expect(progress.routeId).toBe(first);
    expect(progress.mode).toBe("quick");
  });

  it("persists the mode preference", () => {
    start();
    store().setCampaignMode(campaign.id, "quick");
    expect(store().getCampaignProgress(campaign.id)!.mode).toBe("quick");
    store().setCampaignMode(campaign.id, "story");
    expect(store().getCampaignProgress(campaign.id)!.mode).toBe("story");
  });
});

describe("unlocking", () => {
  it("records an unlock without completing anything", () => {
    start();
    store().unlockChapter(campaign.id, "obm-c1");

    const progress = store().getCampaignProgress(campaign.id)!;
    expect(progress.unlockedChapterIds).toContain("obm-c1");
    expect(progress.completedChapterIds).not.toContain("obm-c1");
  });

  it("is idempotent, because a QR gets scanned more than once", () => {
    start();
    for (let i = 0; i < 5; i += 1) store().unlockChapter(campaign.id, "obm-c1");
    expect(store().getCampaignProgress(campaign.id)!.unlockedChapterIds).toEqual(["obm-c1"]);
  });
});

describe("chapter XP", () => {
  it("pays once", () => {
    start();
    const chapter = stations[0];

    const first = store().completeChapter(campaign, chapter.id, STORY);
    expect(first.awarded).toBe(true);
    expect(first.xpGained).toBe(chapter.xp);
    expect(store().profile.xp).toBe(chapter.xp);

    const second = store().completeChapter(campaign, chapter.id, STORY);
    expect(second.awarded).toBe(false);
    expect(second.xpGained).toBe(0);
    expect(store().profile.xp).toBe(chapter.xp);
  });

  it("cannot be farmed by replaying", () => {
    start();
    const chapter = stations[0];
    for (let i = 0; i < 20; i += 1) {
      store().completeChapter(campaign, chapter.id, STORY);
    }
    expect(store().profile.xp).toBe(chapter.xp);
  });

  it("adds skill points to the shared Safety Passport", () => {
    start();
    const chapter = stations[0];
    store().completeChapter(campaign, chapter.id, STORY);

    for (const award of chapter.skillRewards) {
      expect(store().profile.skillPoints[award.skillId]).toBe(award.points);
    }
  });

  it("keeps chapters out of the standalone mission list", () => {
    start();
    completeAll();
    // A Campaign chapter is not a catalogue mission and must never appear as
    // one on the profile's completed list.
    expect(store().profile.completedMissionIds).toEqual([]);
  });

  it("records the latest result for a replayed chapter", () => {
    start();
    store().completeChapter(campaign, "obm-c4", {
      mechanic: "crew-shift",
      playerCount: 2,
      shifted: false,
      finalOptionId: "watch",
      movedCount: 0,
    });
    store().completeChapter(campaign, "obm-c4", {
      mechanic: "crew-shift",
      playerCount: 4,
      shifted: true,
      finalOptionId: "private",
      movedCount: 2,
    });

    const result = store().getCampaignProgress(campaign.id)!.chapterResults["obm-c4"];
    expect(result).toEqual({
      mechanic: "crew-shift",
      playerCount: 4,
      shifted: true,
      finalOptionId: "private",
      movedCount: 2,
    });
  });

  it("ignores an unknown chapter", () => {
    start();
    const result = store().completeChapter(campaign, "not-a-chapter", STORY);
    expect(result.awarded).toBe(false);
    expect(store().profile.xp).toBe(0);
  });
});

describe("finale XP", () => {
  it("refuses to complete while locked", () => {
    start();
    store().completeChapter(campaign, stations[0].id, STORY);

    const result = store().completeFinale(campaign, "call-now");
    expect(result.awarded).toBe(false);
    expect(store().getCampaignProgress(campaign.id)!.finaleCompleted).toBe(false);
  });

  it("pays the finale once after three chapters", () => {
    start();
    completeAll(3);
    const chapterXp = stations.slice(0, 3).reduce((sum, c) => sum + c.xp, 0);

    const first = store().completeFinale(campaign, "call-now");
    expect(first.awarded).toBe(true);
    expect(store().profile.xp).toBe(chapterXp + campaign.finale.xp);

    const second = store().completeFinale(campaign, "tell-home");
    expect(second.awarded).toBe(false);
    expect(store().profile.xp).toBe(chapterXp + campaign.finale.xp);
  });

  it("does not pay the completion bonus at three chapters", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "call-now");

    const chapterXp = stations.slice(0, 3).reduce((sum, c) => sum + c.xp, 0);
    expect(store().profile.xp).toBe(chapterXp + campaign.finale.xp);
  });

  it("pays the bonus once when all four are done", () => {
    start();
    completeAll();
    const chapterXp = stations.reduce((sum, c) => sum + c.xp, 0);

    const result = store().completeFinale(campaign, "call-now");
    expect(result.awarded).toBe(true);
    expect(result.xpGained).toBe(campaign.finale.xp + campaign.fullCompletionBonusXp);
    expect(store().profile.xp).toBe(
      chapterXp + campaign.finale.xp + campaign.fullCompletionBonusXp,
    );

    store().completeFinale(campaign, "call-now");
    expect(store().profile.xp).toBe(
      chapterXp + campaign.finale.xp + campaign.fullCompletionBonusXp,
    );
  });

  it("pays the bonus when the fourth chapter is finished after the finale", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "call-now");
    const before = store().profile.xp;

    store().completeChapter(campaign, stations[3].id, STORY);
    const afterChapter = store().profile.xp;
    expect(afterChapter).toBe(before + stations[3].xp);

    // Replaying the finale is what claims the bonus, and it still pays once.
    store().completeFinale(campaign, "call-now");
    expect(store().profile.xp).toBe(afterChapter + campaign.fullCompletionBonusXp);
    store().completeFinale(campaign, "call-now");
    expect(store().profile.xp).toBe(afterChapter + campaign.fullCompletionBonusXp);
  });

  it("stamps a completion time and records the decision", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "tell-home");

    const progress = store().getCampaignProgress(campaign.id)!;
    expect(progress.finaleCompleted).toBe(true);
    expect(progress.finaleOptionId).toBe("tell-home");
    expect(progress.completedAt).toBeTruthy();
  });
});

describe("follow-up XP", () => {
  const followUp = campaign.followUps[0];

  it("pays once", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "call-now");
    const before = store().profile.xp;

    const first = store().completeFollowUp(campaign, followUp);
    expect(first.awarded).toBe(true);
    expect(store().profile.xp).toBe(before + followUp.xp);

    const second = store().completeFollowUp(campaign, followUp);
    expect(second.awarded).toBe(false);
    expect(store().profile.xp).toBe(before + followUp.xp);
  });

  it("records the follow-up as completed", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "call-now");
    store().completeFollowUp(campaign, followUp);

    expect(store().getCampaignProgress(campaign.id)!.completedFollowUpIds).toEqual([
      followUp.id,
    ]);
  });

  it("pays each follow-up separately", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "call-now");
    const before = store().profile.xp;

    for (const entry of campaign.followUps) {
      store().completeFollowUp(campaign, entry);
    }

    const total = campaign.followUps.reduce((sum, entry) => sum + entry.xp, 0);
    expect(store().profile.xp).toBe(before + total);
  });
});

describe("demo controls", () => {
  it("unlocks every station without completing any", () => {
    start();
    store().unlockAllChapters(campaign);

    const progress = store().getCampaignProgress(campaign.id)!;
    expect(progress.unlockedChapterIds).toHaveLength(campaign.chapters.length);
    expect(progress.completedChapterIds).toEqual([]);
    expect(store().profile.xp).toBe(0);
  });

  it("moves the clock forward without touching progress", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "call-now");
    const xp = store().profile.xp;

    store().advanceCampaignClock(campaign.id, 24);
    expect(store().getCampaignProgress(campaign.id)!.demoHoursOffset).toBe(24);
    store().advanceCampaignClock(campaign.id, 24 * 7);
    expect(store().getCampaignProgress(campaign.id)!.demoHoursOffset).toBe(24 * 8);
    expect(store().profile.xp).toBe(xp);
  });

  it("assigns a different route without clearing progress", () => {
    start();
    completeAll(2);
    const completed = store().getCampaignProgress(campaign.id)!.completedChapterIds;

    store().reassignCampaignRoute(campaign);
    const progress = store().getCampaignProgress(campaign.id)!;

    expect(campaign.routes.some((route) => route.id === progress.routeId)).toBe(true);
    expect(progress.completedChapterIds).toEqual(completed);
  });

  it("resets the campaign but keeps the XP already earned", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "call-now");
    const xp = store().profile.xp;

    store().resetCampaign(campaign.id);

    expect(store().getCampaignProgress(campaign.id)).toBeUndefined();
    // Resetting the demo state must not rewrite a participant's history.
    expect(store().profile.xp).toBe(xp);
  });

  it("can be replayed from scratch after a reset, without paying twice", () => {
    start();
    completeAll(3);
    const earned = store().profile.xp;

    store().resetCampaign(campaign.id);
    start();
    completeAll(3);

    // A fresh ledger means a fresh Campaign genuinely pays again. That is the
    // correct behaviour for a reset, and it is why reset is a demo control
    // rather than something a participant can reach.
    expect(store().profile.xp).toBe(earned * 2);
  });
});

describe("full demo reset", () => {
  it("clears campaign state along with everything else", () => {
    start();
    completeAll(3);
    store().completeFinale(campaign, "call-now");

    store().resetDemo();

    expect(store().profile.campaigns).toEqual({});
    expect(store().profile.xp).toBe(0);
  });
});
