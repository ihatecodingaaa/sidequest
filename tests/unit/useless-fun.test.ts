import { describe, expect, it } from "vitest";

import { WORLD_PROPS } from "@/features/streets/streets-props";
import { NPCS } from "@/features/streets/streets-data";
import { districtMemory } from "@/features/streets/district-memory";
import { EMPTY_PROFILE } from "@/store/app-store";

/**
 * The part of the district that is worth nothing.
 *
 * ---
 *
 * These are tripwires on a decision that is easy to lose quietly. Every pass
 * over a world adds a reason for each object to exist, and the reasons are
 * always good ones: this bench could carry a protective factor, this machine
 * could pay two XP, this cat could unlock something. Do that six times and the
 * neighbourhood is a worksheet again.
 *
 * So the rule is written down as a test rather than as a paragraph in a doc.
 * A fixed floor of things that teach nothing, pay nothing and leave nothing
 * behind, and a hard assertion that the playful ones stay unpriced.
 */

/** Props that exist purely because they are nice to touch. */
const USELESS = WORLD_PROPS.filter((prop) => !prop.discovery);

describe("things worth nothing", () => {
  it("keeps at least six props that leave nothing behind", () => {
    expect(USELESS.length).toBeGreaterThanOrEqual(6);
  });

  it("never attaches a discovery to a prop that offers choices", () => {
    /*
     * The one combination that would quietly reintroduce payment. A machine
     * that gives you a collectible for pressing a button is a slot machine
     * with a drink theme, and it converts "I pressed it because it is funny"
     * into "I pressed it because it gave me something".
     */
    for (const prop of WORLD_PROPS) {
      if (!prop.choices) continue;
      expect(prop.discovery, `${prop.id} pays for a choice`).toBeUndefined();
    }
  });

  it("offers a real decision wherever it offers any", () => {
    for (const prop of WORLD_PROPS) {
      if (!prop.choices) continue;
      expect(prop.choices.length, `${prop.id}`).toBeGreaterThanOrEqual(2);
      const ids = new Set(prop.choices.map((choice) => choice.id));
      expect(ids.size, `${prop.id} has duplicate choice ids`).toBe(prop.choices.length);
      for (const choice of prop.choices) {
        expect(choice.label.trim().length, `${prop.id}/${choice.id}`).toBeGreaterThan(0);
        expect(choice.response.trim().length, `${prop.id}/${choice.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("resolves every option, so no choice is a filler", () => {
    /*
     * A choice with no outcome is a button that lies. Every option a player
     * can take here says something back, which is the same rule the mission
     * consequences follow, for the same reason.
     */
    const responses = WORLD_PROPS.flatMap((prop) =>
      (prop.choices ?? []).map((choice) => choice.response),
    );
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.every((line) => /[a-z]/i.test(line))).toBe(true);
  });

  it("keeps the useless ones out of District Memory", () => {
    /*
     * The strongest form of "this is worth nothing": a fresh profile that has
     * touched every playful prop in the district still has an empty record,
     * because none of them is a thing that can be recorded.
     */
    const profile = {
      ...EMPTY_PROFILE,
      districtMoments: USELESS.map((prop) => prop.id),
    };
    expect(districtMemory(profile)).toHaveLength(0);
  });

  it("does not let a playful prop imitate a person", () => {
    /*
     * A drinks machine with an opinion is charming. A drinks machine that
     * behaves like one of the neighbours is a person the player cannot get to
     * know, which is worse than no person at all.
     */
    const names = new Set(NPCS.map((npc) => npc.name.toLowerCase()));
    for (const prop of WORLD_PROPS) {
      expect(names.has(prop.name.toLowerCase()), prop.id).toBe(false);
    }
  });
});
