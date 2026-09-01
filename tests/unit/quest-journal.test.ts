import { describe, expect, it } from "vitest";

import { questGiver, missionsWithGivers, splitByStatus } from "@/features/missions/quest-journal";
import { MISSIONS } from "@/data/missions";
import { NPCS } from "@/features/streets/streets-data";
import { EMPTY_PROFILE } from "@/store/app-store";
import type { UserProfile } from "@/types/profile";

/**
 * The catalogue and the district are the same eleven things.
 *
 * These exist because the connection is derived, and derived connections fail
 * silently. A typo in a mission id does not throw: it produces a neighbour who
 * opens nothing and a catalogue row with no name on it, and both halves keep
 * rendering perfectly while the product quietly stops cohering.
 */

const blank: UserProfile = { ...EMPTY_PROFILE };
const with_ = (patch: Partial<UserProfile>): UserProfile => ({ ...blank, ...patch });

describe("who asks for a mission", () => {
  it("points every world quest at a mission that exists", () => {
    const ids = new Set(MISSIONS.map((mission) => mission.id));
    for (const missionId of missionsWithGivers()) {
      expect(ids.has(missionId), `no mission called ${missionId}`).toBe(true);
    }
  });

  it("names somebody and somewhere for the signature missions", () => {
    /*
     * The three that carry the idea are the three a judge will open, and they
     * are the ones whose neighbours are worth meeting. If one of them ever
     * loses its giver, the demo walkthrough silently stops connecting.
     */
    for (const id of ["mission-rewind", "mission-norm-mirror", "mission-breaksafe"]) {
      const giver = questGiver(id, blank);
      expect(giver, id).not.toBeNull();
      expect(giver!.name.length).toBeGreaterThan(0);
      expect(giver!.place.length).toBeGreaterThan(0);
    }
  });

  it("returns nothing for a mission nobody in the world opens", () => {
    expect(questGiver("mission-does-not-exist", blank)).toBeNull();
  });

  it("only says you were asked once you have actually met them", () => {
    const giver = questGiver("mission-rewind", blank);
    expect(giver!.met).toBe(false);
    const after = questGiver("mission-rewind", with_({ metNpcs: [giver!.npcId] }));
    expect(after!.met).toBe(true);
  });

  it("names a real person, never a machine", () => {
    /*
     * A self checkout can open a Street Check. It must never be described as
     * somebody who asks you for something, because an object with a request is
     * an object with an intention.
     */
    for (const missionId of missionsWithGivers()) {
      const giver = questGiver(missionId, blank)!;
      const npc = NPCS.find((entry) => entry.id === giver.npcId)!;
      expect(npc.figure ?? "person", giver.npcId).toBe("person");
    }
  });
});

describe("open and already played", () => {
  const missions = MISSIONS.slice(0, 3);

  it("leaves everything open before the profile has loaded", () => {
    const { open, done } = splitByStatus(missions, blank, false);
    expect(open).toHaveLength(missions.length);
    expect(done).toEqual([]);
  });

  it("moves finished missions out of the open list without losing them", () => {
    const profile = with_({ completedMissionIds: [missions[0].id] });
    const { open, done } = splitByStatus(missions, profile, true);
    expect(done.map((mission) => mission.id)).toEqual([missions[0].id]);
    expect(open).toHaveLength(missions.length - 1);
    /* Nothing may vanish: a mission is in exactly one of the two groups. */
    expect(open.length + done.length).toBe(missions.length);
  });
});
