import { describe, expect, it } from "vitest";

import { NPCS } from "@/features/streets/streets-data";

/**
 * The neighbours know each other.
 *
 * A cast of twenty who have never heard of one another is a menu with faces.
 * These pin the rules that keep the cross-references from becoming quest
 * arrows or gossip.
 */

const PEOPLE = NPCS.filter((npc) => (npc.figure ?? "person") === "person");
const WITH_REFS = PEOPLE.filter((npc) => (npc.aboutOthers ?? []).length > 0);

describe("what people say about each other", () => {
  it("has enough of them to be a neighbourhood", () => {
    expect(WITH_REFS.length).toBeGreaterThanOrEqual(6);
  });

  it("only ever names somebody who exists", () => {
    const ids = new Set(NPCS.map((npc) => npc.id));
    for (const npc of PEOPLE) {
      for (const entry of npc.aboutOthers ?? []) {
        expect(ids.has(entry.npcId), `${npc.id} names ${entry.npcId}`).toBe(true);
      }
    }
  });

  it("never has somebody talk about themselves in the third person", () => {
    for (const npc of PEOPLE) {
      for (const entry of npc.aboutOthers ?? []) {
        expect(entry.npcId).not.toBe(npc.id);
      }
    }
  });

  it("only names people, never a machine or a board", () => {
    /*
     * "The self checkout mentioned you" is a sentence about an object with a
     * memory of a person, which is exactly the kind of thing this product is
     * careful never to imply anywhere else.
     */
    for (const npc of PEOPLE) {
      for (const entry of npc.aboutOthers ?? []) {
        const other = NPCS.find((candidate) => candidate.id === entry.npcId)!;
        expect(other.figure ?? "person", `${npc.id} -> ${entry.npcId}`).toBe("person");
      }
    }
  });

  it("keeps every reference to one line, so nobody starts monologuing", () => {
    for (const npc of PEOPLE) {
      for (const entry of npc.aboutOthers ?? []) {
        expect(entry.line.trim().length, `${npc.id}`).toBeGreaterThan(0);
        /* Two sentences at the very most, and no wall of text. */
        expect(entry.line.length, `${npc.id} is too long`).toBeLessThanOrEqual(140);
      }
    }
  });

  it("never points at something the player has not done", () => {
    /*
     * The line is only ever shown when both situations are resolved, so it can
     * only be a memory. This catches the copy drifting into an instruction,
     * which is the shape that turns a neighbour into a quest arrow.
     */
    const IMPERATIVE = /\b(go see|go and see|you should|head over|find |talk to)\b/i;
    for (const npc of PEOPLE) {
      for (const entry of npc.aboutOthers ?? []) {
        expect(IMPERATIVE.test(entry.line), `${npc.id}: ${entry.line}`).toBe(false);
      }
    }
  });
});
