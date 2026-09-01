import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CURIOSITY_STICKER_IDS,
  DISTRICT_STICKERS,
  earnedStickers,
  getSticker,
  stickerStanding,
} from "@/data/district-stickers";
import { LANDMARKS } from "@/features/streets/streets-data";
import { WORLD_PROPS } from "@/features/streets/streets-props";
import { EMPTY_PROFILE } from "@/store/app-store";
import type { UserProfile } from "@/types/profile";

/**
 * District stickers.
 *
 * A collection is the easiest system in a product like this to corrupt, and it
 * corrupts in a specific direction: towards randomness, towards scarcity, and
 * towards paying for things that were previously free. Every rule that keeps
 * it from doing that is a tripwire here rather than a paragraph in a doc.
 */

const blank: UserProfile = { ...EMPTY_PROFILE };
const with_ = (patch: Partial<UserProfile>): UserProfile => ({ ...blank, ...patch });

describe("the set itself", () => {
  it("is small, finite and complete", () => {
    expect(DISTRICT_STICKERS.length).toBeGreaterThanOrEqual(6);
    expect(DISTRICT_STICKERS.length).toBeLessThanOrEqual(10);
  });

  it("has no duplicate ids, names or artwork", () => {
    const ids = new Set(DISTRICT_STICKERS.map((sticker) => sticker.id));
    const names = new Set(DISTRICT_STICKERS.map((sticker) => sticker.name));
    const art = new Set(DISTRICT_STICKERS.map((sticker) => sticker.art));
    expect(ids.size).toBe(DISTRICT_STICKERS.length);
    expect(names.size).toBe(DISTRICT_STICKERS.length);
    expect(art.size, "two stickers share a drawing").toBe(DISTRICT_STICKERS.length);
  });

  it("states what earns it, before it is earned", () => {
    /*
     * Legible before earned. A locked slot with a question mark sells
     * uncertainty rather than the thing, which is the mechanic this product
     * refuses everywhere else.
     */
    for (const sticker of DISTRICT_STICKERS) {
      expect(sticker.requirement.trim().length, sticker.id).toBeGreaterThan(0);
      expect(sticker.memory.trim().length, sticker.id).toBeGreaterThan(0);
      expect(sticker.requirement).not.toMatch(/\?\?\?|hidden|secret|mystery/i);
    }
  });

  it("only ever names a landmark that exists", () => {
    const places = new Set(LANDMARKS.map((landmark) => landmark.id));
    for (const sticker of DISTRICT_STICKERS) {
      if (!sticker.locationId) continue;
      expect(places.has(sticker.locationId), sticker.id).toBe(true);
    }
  });

  it("commemorates places and curiosity, never danger or people", () => {
    /*
     * No sticker for spotting a crime, reporting somebody or avoiding a
     * threat. The collection is about having been somewhere.
     */
    const text = DISTRICT_STICKERS.map((s) => `${s.name} ${s.memory} ${s.requirement}`).join(" ");
    expect(text).not.toMatch(/\b(caught|reported|suspect|criminal|thief|danger|hero|saved)\b/i);
  });
});

describe("earning is deterministic and free", () => {
  it("gives a new profile nothing", () => {
    expect(earnedStickers(blank)).toEqual([]);
  });

  it("returns the same answer every time for the same profile", () => {
    const profile = with_({ metNpcs: ["npc-wei"], districtMoments: ["a", "b", "c", "d"] });
    const once = earnedStickers(profile).map((sticker) => sticker.id);
    const twice = earnedStickers(profile).map((sticker) => sticker.id);
    const thrice = earnedStickers({ ...profile }).map((sticker) => sticker.id);
    expect(twice).toEqual(once);
    expect(thrice).toEqual(once);
  });

  it("never rolls for anything", () => {
    /*
     * The strongest form of "deterministic": the module cannot reach a random
     * number generator or a clock at all. A test that only compared two calls
     * would pass on a system that seeded itself once per process.
     */
    const source = readFileSync(
      join(process.cwd(), "src/data/district-stickers.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/Math\.random|crypto\.|Date\.now|new Date/);
  });

  it("earns the first one from meeting a single person", () => {
    const earned = earnedStickers(with_({ metNpcs: ["npc-wei"] }));
    expect(earned.map((sticker) => sticker.id)).toContain("sticker-first-light");
  });

  it("cannot earn the same sticker twice", () => {
    const profile = with_({ metNpcs: ["npc-wei", "npc-ken", "npc-rina"] });
    const ids = earnedStickers(profile).map((sticker) => sticker.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("rewards curiosity as well as finishing things", () => {
    /*
     * At least three of the set come from exploring rather than from
     * completing an objective. If that ever drops, the collection has quietly
     * become a mission checklist with pictures.
     */
    expect(CURIOSITY_STICKER_IDS.length).toBeGreaterThanOrEqual(3);
    for (const id of CURIOSITY_STICKER_IDS) {
      expect(getSticker(id), `${id} is not in the set`).toBeDefined();
    }
  });
});

describe("what stickers must never touch", () => {
  it("leaves the props that pay nothing paying nothing", () => {
    /*
     * The P0 rule, still standing. A player who touches the cat, the mural,
     * the bicycle, the hoop, the drinks machine and the door chime, and does
     * nothing else at all, earns no sticker whatsoever.
     */
    const useless = WORLD_PROPS.filter((prop) => !prop.discovery).map((prop) => prop.id);
    expect(useless.length).toBeGreaterThanOrEqual(6);
    const profile = with_({ districtMoments: useless });
    expect(earnedStickers(profile)).toEqual([]);
  });

  it("has no rarity, no price and no expiry anywhere in its shape", () => {
    for (const sticker of DISTRICT_STICKERS) {
      const keys = Object.keys(sticker);
      for (const banned of ["rarity", "tier", "price", "cost", "expires", "limited", "odds"]) {
        expect(keys, `${sticker.id} has ${banned}`).not.toContain(banned);
      }
    }
  });

  it("never shows a completion percentage", () => {
    /*
     * The standing line is words or nothing. A bar turns "I have been to the
     * court a few times" into "I am 60 percent through the court".
     */
    const profile = with_({ metNpcs: ["npc-wei", "npc-lek"] });
    for (const sticker of DISTRICT_STICKERS) {
      const standing = stickerStanding(profile, sticker);
      if (standing === null) continue;
      expect(standing).not.toMatch(/%|\bof\b/);
    }
  });

  it("says nothing about a sticker already earned", () => {
    const profile = with_({ metNpcs: ["npc-wei"] });
    const first = getSticker("sticker-first-light")!;
    expect(first.earned(profile)).toBe(true);
    expect(stickerStanding(profile, first)).toBeNull();
  });
});

describe("older profiles", () => {
  it("reads a profile written before stickers existed", () => {
    /*
     * Every field the derivation touches is optional, so a profile persisted
     * before this pass rehydrates and simply earns whatever its history
     * already justifies. No migration, no crash, no empty state that is wrong.
     */
    const old = {
      displayName: "Lucas",
      xp: 400,
      streakDays: 3,
      completedMissionIds: ["mission-rewind"],
      savedPulseIds: [],
      crewId: "crew-clubhouse",
      skillPoints: {},
      submissions: [],
      rewardClaims: [],
      interests: [],
    } as unknown as UserProfile;

    expect(() => earnedStickers(old)).not.toThrow();
    expect(Array.isArray(earnedStickers(old))).toBe(true);
  });

  it("ignores a pinned sticker that does not exist", () => {
    expect(getSticker("sticker-that-was-removed")).toBeUndefined();
    expect(getSticker(undefined)).toBeUndefined();
  });
});
