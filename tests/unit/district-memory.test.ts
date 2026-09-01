import { describe, expect, it } from "vitest";

import {
  districtMemory,
  memoryAt,
  memoryByPlace,
  memoryTotals,
} from "@/features/streets/district-memory";
import { LANDMARKS, NPCS } from "@/features/streets/streets-data";
import { WORLD_PROPS } from "@/features/streets/streets-props";
import { EMPTY_PROFILE } from "@/store/app-store";
import type { UserProfile } from "@/types/profile";

/**
 * District memory.
 *
 * The system's whole value is that it is true. A memory of something that did
 * not happen is worse than no memory at all, because the player knows what
 * they did and the district claiming otherwise makes the whole thing feel
 * generated rather than remembered.
 *
 * So these test three properties: nothing is remembered before it happens,
 * everything is remembered once it does, and nothing is remembered twice.
 */

const blank: UserProfile = { ...EMPTY_PROFILE };

const withProfile = (patch: Partial<UserProfile>): UserProfile => ({ ...blank, ...patch });

describe("a new player has no history anywhere", () => {
  it("remembers nothing at all", () => {
    /*
     * A brand-new profile has an empty crew, so even the join entry is false.
     * If this ever returns something, the district is inventing history, which
     * is the one failure mode that would make the feature worse than absent.
     */
    expect(districtMemory(blank)).toEqual([]);
  });

  it("still lists every place, with nothing in them", () => {
    const places = memoryByPlace(blank);
    expect(places).toHaveLength(LANDMARKS.length);
    for (const place of places) {
      expect(place.entries, place.landmark.id).toEqual([]);
      /* And every place has something that could go in it. */
      expect(place.total, place.landmark.id).toBeGreaterThan(0);
    }
  });
});

describe("memory is derived from what already happened", () => {
  it("remembers meeting somebody, filed where they stand", () => {
    const wei = NPCS.find((npc) => npc.id === "npc-wei")!;
    const profile = withProfile({ metNpcs: ["npc-wei"] });

    const entries = memoryAt(profile, wei.landmarkId);
    expect(entries.map((e) => e.title)).toContain("Met Wei");
    expect(entries[0].type).toBe("met");
  });

  it("remembers a finished mission without being told separately", () => {
    /*
     * The point of derivation. Nothing writes a memory when REWIND completes:
     * the memory is a reading of `completedMissionIds`, which was already
     * there for its own reasons and cannot disagree with itself.
     */
    const profile = withProfile({ completedMissionIds: ["mission-rewind"] });
    const titles = memoryAt(profile, "minimart").map((e) => e.title);
    expect(titles).toContain("Went back and said something to Ken");
  });

  it("remembers a whole thread only once every required step is banked", () => {
    const partial = withProfile({
      threadSteps: ["thread-favour:step-hear", "thread-favour:step-ask"],
    });
    expect(memoryAt(partial, "voiddeck").map((e) => e.id)).not.toContain("helped-favour");

    const whole = withProfile({
      threadSteps: [
        "thread-favour:step-hear",
        "thread-favour:step-ask",
        "thread-favour:step-choose",
        "thread-favour:step-after",
      ],
    });
    expect(memoryAt(whole, "voiddeck").map((e) => e.id)).toContain("helped-favour");
  });

  it("remembers a single step where the step itself is the memory", () => {
    /*
     * Showing Lek what was making it easy is a thing that happened at the
     * minimart whether or not the thread was ever finished. Filing it under
     * the whole story would lose it for anybody who stopped after two steps.
     */
    const profile = withProfile({ threadSteps: ["thread-last-two:step-shopfloor"] });
    const ids = memoryAt(profile, "minimart").map((e) => e.id);
    expect(ids).toContain("changed-shopfloor");
    expect(ids).not.toContain("helped-last-two");
  });

  it("remembers a discovery using the words it was found with", () => {
    const prop = WORLD_PROPS.find((entry) => entry.discovery)!;
    const profile = withProfile({ districtMoments: [prop.discovery!.id] });
    const titles = memoryAt(profile, prop.locationId).map((e) => e.title);
    expect(titles).toContain(prop.discovery!.label);
  });

  it("remembers making something and joining something", () => {
    const profile = withProfile({
      crewId: "crew-clubhouse",
      questDrafts: [
        {
          id: "d1",
          title: "t",
          hook: "h",
          moment: "m",
          response: "r",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    const ids = memoryAt(profile, "voiddeck").map((e) => e.id);
    expect(ids).toContain("created-draft");
    expect(ids).toContain("visited-crew");
  });
});

describe("memory cannot contradict itself or repeat", () => {
  it("never lists the same thing twice", () => {
    const profile = withProfile({
      metNpcs: NPCS.map((npc) => npc.id),
      completedMissionIds: ["mission-rewind", "mission-norm-mirror", "mission-breaksafe"],
      streetChecksDone: ["check-checkout", "check-job", "check-verify"],
      districtMoments: WORLD_PROPS.flatMap((p) => (p.discovery ? [p.discovery.id] : [])),
      crewId: "crew-clubhouse",
    });
    const ids = districtMemory(profile).map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never remembers a fixture as somebody the player met", () => {
    /*
     * The noticeboard, the self checkout and the counter notice are things,
     * not people. "Met Self checkout 2" would be a joke the product did not
     * intend to make, and it would cheapen every entry that is about a person.
     */
    const profile = withProfile({ metNpcs: NPCS.map((npc) => npc.id) });
    const titles = districtMemory(profile).map((entry) => entry.title);
    for (const npc of NPCS) {
      if ((npc.figure ?? "person") === "person") continue;
      expect(titles, `${npc.id} is a fixture`).not.toContain(`Met ${npc.name}`);
    }
  });

  it("files every entry at a landmark that exists", () => {
    const profile = withProfile({
      metNpcs: NPCS.map((npc) => npc.id),
      completedMissionIds: ["mission-rewind", "mission-norm-mirror", "mission-breaksafe"],
      streetChecksDone: ["check-checkout", "check-job", "check-verify"],
      districtMoments: WORLD_PROPS.flatMap((p) => (p.discovery ? [p.discovery.id] : [])),
      crewId: "crew-clubhouse",
      rewardClaims: [{ rewardId: "r", claimedAt: "2026-01-01", reference: "x" }],
    });
    const known = new Set(LANDMARKS.map((l) => l.id));
    for (const entry of districtMemory(profile)) {
      expect(known.has(entry.locationId), `${entry.id} at ${entry.locationId}`).toBe(true);
    }
  });

  it("spreads history across the whole district rather than one corner", () => {
    /*
     * A district where five of six places can never accumulate anything is a
     * district with one interesting street. The totals are what make walking
     * somewhere else worth doing.
     */
    const totals = memoryTotals();
    for (const landmark of LANDMARKS) {
      expect(totals[landmark.id], landmark.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("memory is narrative, never a score", () => {
  it("exposes no number a player could optimise", () => {
    /*
     * There is deliberately no percentage, no rank and no total on the entry
     * type. The moment memory becomes a number it becomes a target, and a
     * target is the opposite of remembering something.
     */
    const profile = withProfile({ metNpcs: ["npc-wei"] });
    const entry = districtMemory(profile)[0];
    expect(Object.keys(entry).sort()).toEqual(["id", "locationId", "title", "type"]);
  });

  it("writes every title as something that happened, not something taught", () => {
    /*
     * A memory that reads like a learning objective is a certificate, and the
     * district is not issuing certificates. This catches the drift where
     * somebody helpfully rewrites an entry as the skill it demonstrated.
     */
    const CURRICULUM =
      /\b(learn|learned|practis|practic|skill|objective|competen|lesson|module|understood the)\b/i;
    const profile = withProfile({
      metNpcs: NPCS.map((npc) => npc.id),
      completedMissionIds: ["mission-rewind", "mission-norm-mirror", "mission-breaksafe"],
      streetChecksDone: ["check-checkout", "check-job", "check-verify"],
      districtMoments: WORLD_PROPS.flatMap((p) => (p.discovery ? [p.discovery.id] : [])),
      crewId: "crew-clubhouse",
    });
    for (const entry of districtMemory(profile)) {
      expect(CURRICULUM.test(entry.title), `${entry.id}: ${entry.title}`).toBe(false);
      expect(entry.title.length, entry.id).toBeGreaterThan(4);
      expect(entry.title.split(/\s+/).length, `${entry.id} too long`).toBeLessThanOrEqual(12);
    }
  });
});
