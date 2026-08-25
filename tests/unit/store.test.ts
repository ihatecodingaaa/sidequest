import { beforeEach, describe, expect, it } from "vitest";

import { EMPTY_PROFILE, useAppStore } from "@/store/app-store";
import { REWARDS } from "@/data/rewards";
import { MISSIONS } from "@/data/missions";

const store = () => useAppStore.getState();

beforeEach(() => {
  useAppStore.setState({ profile: { ...EMPTY_PROFILE }, hasHydrated: true });
});

describe("onboarding", () => {
  it("records the profile and joins the prototype crew", () => {
    store().completeOnboarding({
      displayName: "  Lucas  ",
      ageBand: "16-18",
      interests: ["scams"],
      neighbourhood: "Tampines",
    });

    const { profile } = store();
    expect(profile.displayName).toBe("Lucas");
    expect(profile.ageBand).toBe("16-18");
    expect(profile.neighbourhood).toBe("Tampines");
    expect(profile.crewId).toBeTruthy();
    expect(profile.onboardedAt).toBeTruthy();
  });

  it("accepts an empty name without breaking", () => {
    store().completeOnboarding({
      displayName: "",
      ageBand: "13-15",
      interests: [],
      neighbourhood: null,
    });
    expect(store().profile.displayName).toBe("");
    expect(store().profile.neighbourhood).toBeNull();
  });
});

describe("mission completion", () => {
  const missionId = "mission-otp";
  const mission = MISSIONS.find((entry) => entry.id === missionId)!;

  it("awards XP once and only once", () => {
    const first = store().completeMission(missionId);
    expect(first.awarded).toBe(true);
    expect(store().profile.xp).toBe(mission.xp);

    const second = store().completeMission(missionId);
    expect(second.awarded).toBe(false);
    expect(store().profile.xp).toBe(mission.xp);
  });

  it("marks the mission as complete", () => {
    expect(store().isMissionComplete(missionId)).toBe(false);
    store().completeMission(missionId);
    expect(store().isMissionComplete(missionId)).toBe(true);
  });

  it("ignores an unknown mission id instead of throwing", () => {
    const result = store().completeMission("mission-does-not-exist");
    expect(result.awarded).toBe(false);
    expect(store().profile.xp).toBe(0);
  });
});

describe("saved pulse items", () => {
  it("toggles both ways", () => {
    store().toggleSavedPulse("pulse-otp");
    expect(store().profile.savedPulseIds).toContain("pulse-otp");
    store().toggleSavedPulse("pulse-otp");
    expect(store().profile.savedPulseIds).not.toContain("pulse-otp");
  });
});

describe("rewards", () => {
  const reward = REWARDS[0];

  it("refuses a claim without enough XP", () => {
    const outcome = store().claimReward(reward.id);
    expect(outcome.ok).toBe(false);
    expect(store().profile.rewardClaims).toHaveLength(0);
  });

  it("records a claim once the XP is there", () => {
    useAppStore.setState((state) => ({ profile: { ...state.profile, xp: reward.xpCost } }));
    const outcome = store().claimReward(reward.id);

    expect(outcome.ok).toBe(true);
    expect(store().profile.rewardClaims).toHaveLength(1);
    expect(store().profile.rewardClaims[0].rewardId).toBe(reward.id);
  });

  it("never spends XP on a claim", () => {
    useAppStore.setState((state) => ({ profile: { ...state.profile, xp: 5000 } }));
    store().claimReward(reward.id);
    expect(store().profile.xp).toBe(5000);
  });

  it("refuses a second claim of the same reward", () => {
    useAppStore.setState((state) => ({ profile: { ...state.profile, xp: 5000 } }));
    store().claimReward(reward.id);
    const second = store().claimReward(reward.id);
    expect(second.ok).toBe(false);
    expect(store().profile.rewardClaims).toHaveLength(1);
  });
});

describe("build quest submissions", () => {
  it("stores a sanitised submission", () => {
    const record = store().addSubmission({
      challengeId: "challenge-selfcheckout",
      title: "  Show the basket like a receipt  ",
      solution: "Print the running list where the shopper can actually see it.",
      principleId: "principle-visible",
    });

    expect(record.id).toBeTruthy();
    expect(record.title).toBe("Show the basket like a receipt");
    expect(store().profile.submissions).toHaveLength(1);
  });

  it("puts the newest submission first", () => {
    store().addSubmission({
      challengeId: "c",
      title: "First idea",
      solution: "a".repeat(50),
      principleId: "principle-easy",
    });
    store().addSubmission({
      challengeId: "c",
      title: "Second idea",
      solution: "b".repeat(50),
      principleId: "principle-easy",
    });

    expect(store().profile.submissions[0].title).toBe("Second idea");
  });
});

describe("demo controls", () => {
  it("loads a deterministic demo state", () => {
    store().loadDemoProgress();
    const first = { ...store().profile };

    useAppStore.setState({ profile: { ...EMPTY_PROFILE } });
    store().loadDemoProgress();
    const second = store().profile;

    expect(second.xp).toBe(first.xp);
    expect(second.completedMissionIds).toEqual(first.completedMissionIds);
    expect(second.skillPoints).toEqual(first.skillPoints);
  });

  it("resets everything back to a first run", () => {
    store().loadDemoProgress();
    store().addSubmission({
      challengeId: "c",
      title: "Anything",
      solution: "c".repeat(50),
      principleId: "principle-easy",
    });

    store().resetDemo();

    expect(store().profile).toEqual(EMPTY_PROFILE);
    expect(store().profile.onboardedAt).toBeNull();
  });
});
