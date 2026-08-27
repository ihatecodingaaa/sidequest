import { describe, expect, it } from "vitest";

import { MISSIONS, getMission } from "@/data/missions";
import { PULSE_ITEMS, DISCOVERY_LINKS } from "@/data/pulse";
import { RADIO_STATIONS } from "@/data/radio";
import { REWARDS } from "@/data/rewards";
import { CREWS } from "@/data/crews";
import { PARTNER_CHALLENGES, DESIGN_PRINCIPLES } from "@/data/partner-challenges";
import { CHECKOUT_HOTSPOTS, PATCH_OPTIONS, REQUIRED_FINDINGS } from "@/data/breaksafe";
import { NORM_QUESTIONS } from "@/data/norm-mirror";
import { OFFICIAL_RESOURCES } from "@/lib/official-links";
import { SAFETY_SKILLS, skillTier } from "@/data/skills";
import { getScenario } from "@/data/scenarios";
import { isSafeExternalUrl, sanitiseText } from "@/lib/format";
import { nearestNeighbourhood } from "@/data/neighbourhoods";
import { offsetLabel } from "@/features/pulse/offset-label";

describe("catalogue integrity", () => {
  it("has unique mission ids", () => {
    const ids = MISSIONS.map((mission) => mission.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique pulse ids", () => {
    const ids = PULSE_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every pulse item at a mission that exists", () => {
    for (const item of PULSE_ITEMS) {
      if (!item.relatedMissionId) continue;
      expect(getMission(item.relatedMissionId), item.id).toBeDefined();
    }
  });

  it("points every mission at pulse items that exist", () => {
    const pulseIds = new Set(PULSE_ITEMS.map((item) => item.id));
    for (const mission of MISSIONS) {
      for (const id of mission.relatedPulseItemIds ?? []) {
        expect(pulseIds.has(id), `${mission.id} -> ${id}`).toBe(true);
      }
    }
  });

  it("gives every playable mission a working player", () => {
    for (const mission of MISSIONS) {
      if (mission.player !== "scenario" && mission.player !== "rewind") continue;
      expect(getScenario(mission.id), mission.id).toBeDefined();
    }
  });

  it("gives every scenario reachable, terminating branches", () => {
    for (const mission of MISSIONS) {
      const scenario = getScenario(mission.id);
      if (!scenario) continue;

      const ids = new Set(scenario.beats.map((beat) => beat.id));
      expect(ids.has(scenario.startBeatId), mission.id).toBe(true);

      for (const beat of scenario.beats) {
        // Every beat either offers choices or ends the run.
        expect(Boolean(beat.choices?.length) || Boolean(beat.outcome), `${mission.id}/${beat.id}`).toBe(
          true,
        );
        for (const choice of beat.choices ?? []) {
          expect(ids.has(choice.next), `${mission.id}/${beat.id} -> ${choice.next}`).toBe(true);
        }
      }
    }
  });

  it("gives REWIND a pivot with enough options to rewind into", () => {
    const scenario = getScenario("mission-rewind");
    const pivot = scenario?.beats.find((beat) => beat.isPivot);
    expect(pivot).toBeDefined();
    // The second run disables the first choice, so a pivot needs at least two.
    expect(pivot?.choices?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("keeps every mission XP value positive and awardable", () => {
    for (const mission of MISSIONS) {
      expect(mission.xp, mission.id).toBeGreaterThan(0);
      expect(mission.skillRewards.length, mission.id).toBeGreaterThan(0);
    }
  });
});

describe("data honesty", () => {
  it("never claims a confirmed partnership", () => {
    for (const mission of MISSIONS) {
      if (!mission.partner) continue;
      expect(mission.partner.isConfirmedPartner, mission.id).toBe(false);
    }
    for (const station of RADIO_STATIONS) {
      expect(station.isPartnerConfirmed, station.id).toBe(false);
    }
    for (const challenge of PARTNER_CHALLENGES) {
      expect(challenge.isConfirmedPartner, challenge.id).toBe(false);
    }
  });

  it("labels every reward that names a potential partner as a concept", () => {
    for (const reward of REWARDS) {
      if (!reward.potentialPartner) continue;
      expect(reward.provenance, reward.id).toBe("partner-concept");
    }
  });

  it("tells every reward claimant that the prototype has no monetary value", () => {
    for (const reward of REWARDS) {
      expect(reward.footnote.length, reward.id).toBeGreaterThan(10);
    }
    for (const reward of REWARDS.filter((entry) => entry.rewardType === "voucher")) {
      expect(reward.footnote.toLowerCase(), reward.id).toContain("no monetary value");
    }
  });

  it("marks Norm Mirror as a demo aggregate", () => {
    expect(getMission("mission-norm-mirror")?.provenance).toBe("demo-aggregate");
  });

  it("keeps every Norm Mirror percentage inside a sane range", () => {
    for (const question of NORM_QUESTIONS) {
      expect(question.demoAggregate, question.id).toBeGreaterThanOrEqual(0);
      expect(question.demoAggregate, question.id).toBeLessThanOrEqual(100);
    }
  });
});

describe("outbound links", () => {
  const externalUrls = [
    ...PULSE_ITEMS.map((item) => item.sourceUrl),
    ...DISCOVERY_LINKS.map((link) => link.url),
    ...RADIO_STATIONS.map((station) => station.officialUrl),
  ];

  it("only ever uses https", () => {
    for (const url of externalUrls) {
      expect(isSafeExternalUrl(url), url).toBe(true);
      expect(url.startsWith("https://"), url).toBe(true);
    }
  });

  it("rejects unsafe schemes", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,<script>")).toBe(false);
    expect(isSafeExternalUrl("not a url")).toBe(false);
  });

  it("gives every official resource a usable target", () => {
    for (const resource of OFFICIAL_RESOURCES) {
      if (resource.action === "call") {
        expect(resource.href.startsWith("tel:"), resource.id).toBe(true);
      } else if (resource.action === "sms") {
        // Digits only, and no prefilled body: the person writes the message.
        expect(resource.href, resource.id).toMatch(/^sms:\d+$/);
      } else {
        expect(isSafeExternalUrl(resource.href), resource.id).toBe(true);
      }
      expect(resource.owner.length, resource.id).toBeGreaterThan(0);
      expect(resource.handoff.length, resource.id).toBeGreaterThan(0);
    }
  });

  it("keeps the emergency number correct", () => {
    const emergency = OFFICIAL_RESOURCES.find((entry) => entry.id === "police-emergency");
    expect(emergency?.href).toBe("tel:999");
    expect(OFFICIAL_RESOURCES.find((entry) => entry.id === "scam-helpline")?.href).toBe("tel:1799");
  });
});

describe("BREAKSAFE", () => {
  it("offers enough real design problems to satisfy the requirement", () => {
    const issues = CHECKOUT_HOTSPOTS.filter((hotspot) => hotspot.isDesignIssue);
    expect(issues.length).toBeGreaterThanOrEqual(REQUIRED_FINDINGS);
  });

  it("includes decoys that are not design problems", () => {
    expect(CHECKOUT_HOTSPOTS.some((hotspot) => !hotspot.isDesignIssue)).toBe(true);
  });

  it("scores the profiling option badly on privacy and fairness", () => {
    const profiling = PATCH_OPTIONS.filter((option) => option.profilesPeople);
    expect(profiling.length).toBeGreaterThan(0);
    for (const option of profiling) {
      expect(option.scores.privacy, option.id).toBeLessThanOrEqual(2);
      expect(option.scores.fairness, option.id).toBeLessThanOrEqual(2);
      expect(option.isStrong, option.id).toBe(false);
    }
  });

  it("keeps every strong option free of profiling", () => {
    for (const option of PATCH_OPTIONS.filter((entry) => entry.isStrong)) {
      expect(option.profilesPeople, option.id).toBe(false);
      expect(option.scores.privacy, option.id).toBeGreaterThanOrEqual(4);
    }
  });

  it("keeps every score inside 1 to 5", () => {
    for (const option of PATCH_OPTIONS) {
      for (const value of Object.values(option.scores)) {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe("skills", () => {
  it("gives every skill a capability statement", () => {
    for (const skill of SAFETY_SKILLS) {
      expect(skill.capability.length, skill.id).toBeGreaterThan(10);
    }
  });

  it("maps every mission skill award to a real skill", () => {
    const ids = new Set(SAFETY_SKILLS.map((skill) => skill.id));
    for (const mission of MISSIONS) {
      for (const award of mission.skillRewards) {
        expect(ids.has(award.skillId), `${mission.id} -> ${award.skillId}`).toBe(true);
      }
    }
  });

  it("moves through tiers as points accumulate", () => {
    expect(skillTier(0).label).toBe("Not started");
    expect(skillTier(0).index).toBe(0);
    expect(skillTier(35).index).toBeGreaterThan(skillTier(5).index);
    expect(skillTier(500).nextAt).toBeNull();
  });
});

describe("crews", () => {
  it("gives every crew a unique join code", () => {
    const codes = CREWS.map((crew) => crew.joinCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("keeps crew challenge progress within its target", () => {
    for (const crew of CREWS) {
      expect(crew.currentChallenge.progress).toBeLessThanOrEqual(crew.currentChallenge.target);
      expect(crew.currentChallenge.target).toBeGreaterThan(0);
    }
  });
});

describe("partner challenges", () => {
  it("references a mission that exists", () => {
    for (const challenge of PARTNER_CHALLENGES) {
      expect(getMission(challenge.missionId), challenge.id).toBeDefined();
    }
  });

  it("uses only known design principles in its sample entries", () => {
    const ids = new Set(DESIGN_PRINCIPLES.map((principle) => principle.id));
    for (const challenge of PARTNER_CHALLENGES) {
      for (const entry of challenge.sampleEntries) {
        expect(ids.has(entry.principleId), entry.title).toBe(true);
      }
    }
  });

  it("rules out profiling in its constraints", () => {
    for (const challenge of PARTNER_CHALLENGES) {
      const text = challenge.constraints.join(" ").toLowerCase();
      expect(text, challenge.id).toContain("facial recognition");
    }
  });
});

describe("helpers", () => {
  it("labels recency without touching the clock", () => {
    expect(offsetLabel(0.5)).toBe("Just now");
    expect(offsetLabel(3)).toBe("3h ago");
    expect(offsetLabel(24)).toBe("Yesterday");
    expect(offsetLabel(72)).toBe("3d ago");
    expect(offsetLabel(24 * 8)).toBe("1 week ago");
  });

  it("strips control characters and collapses whitespace", () => {
    expect(sanitiseText("  hello   world  ")).toBe("hello world");
    const zeroWidth = "a" + String.fromCharCode(0x200b) + "b";
    expect(sanitiseText(zeroWidth)).toBe("ab");
    expect(sanitiseText("a" + String.fromCharCode(7) + "b")).toBe("ab");
    expect(sanitiseText("x".repeat(200), 10)).toHaveLength(10);
  });

  it("resolves a coordinate to the nearest town name", () => {
    // Roughly Tampines and roughly Jurong East.
    expect(nearestNeighbourhood(1.3496, 103.9568)).toBe("Tampines");
    expect(nearestNeighbourhood(1.3329, 103.7436)).toBe("Jurong East");
  });
});
