import { describe, expect, it } from "vitest";

import {
  DISTRICT_MOMENTS,
  WORLD_PROPS,
  propsOn,
} from "@/features/streets/streets-props";
import {
  DISTRICT_ID,
  MAPS,
  NPCS,
  SOLID,
  TILE,
  type TerrainCode,
} from "@/features/streets/streets-data";

/**
 * Props in the district.
 *
 * A prop is a tile with a name on it, so every failure mode is a placement
 * failure: off the map, inside a wall nobody can stand next to, on top of a
 * neighbour, or two of them close enough that the interact button flickers
 * between them while somebody walks past. All four are invisible in review and
 * obvious the moment a person plays, which is exactly what a tripwire is for.
 */

const PROP_RANGE = 20;

/** The map a prop lives on. */
function mapOf(propMapId: string | undefined) {
  const map = MAPS[propMapId ?? DISTRICT_ID];
  if (!map) throw new Error(`no map ${propMapId}`);
  return map;
}

function codeAt(mapId: string | undefined, x: number, y: number): TerrainCode | null {
  const map = mapOf(mapId);
  const row = map.rows[y];
  if (!row) return null;
  const ch = row[x];
  return (ch ?? null) as TerrainCode | null;
}

describe("every prop is somewhere a player can actually reach", () => {
  it("has props to check", () => {
    expect(WORLD_PROPS.length).toBeGreaterThan(8);
  });

  it("gives every prop a unique id", () => {
    const ids = WORLD_PROPS.map((prop) => prop.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puts every prop on a map that exists, inside its bounds", () => {
    for (const prop of WORLD_PROPS) {
      const map = mapOf(prop.mapId);
      expect(prop.x, `${prop.id} x`).toBeGreaterThanOrEqual(0);
      expect(prop.y, `${prop.id} y`).toBeGreaterThanOrEqual(0);
      expect(prop.x, `${prop.id} x`).toBeLessThan(map.w);
      expect(prop.y, `${prop.id} y`).toBeLessThan(map.h);
    }
  });

  it("leaves somewhere to stand beside every prop", () => {
    /*
     * A prop may sit on a solid tile, because a bench is solid and you look at
     * it from beside it. What it may not do is sit somewhere with no walkable
     * neighbour, which is a prop welded into the middle of a wall: visible in
     * the data, unreachable in the world, and silent about it.
     */
    for (const prop of WORLD_PROPS) {
      const around = [
        codeAt(prop.mapId, prop.x + 1, prop.y),
        codeAt(prop.mapId, prop.x - 1, prop.y),
        codeAt(prop.mapId, prop.x, prop.y + 1),
        codeAt(prop.mapId, prop.x, prop.y - 1),
      ];
      const standable = around.filter(
        (code) => code !== null && !SOLID.has(code) && code !== undefined,
      );
      expect(standable.length, `${prop.id} has no walkable neighbour`).toBeGreaterThan(0);
    }
  });

  it("keeps props far enough apart that the button does not flicker", () => {
    /*
     * Two props inside one interact radius means the offer changes as somebody
     * walks between them, which reads as a bug rather than as a world. Twice
     * the radius is the smallest gap that guarantees only one is ever in
     * reach.
     */
    for (const map of new Set(WORLD_PROPS.map((p) => p.mapId ?? DISTRICT_ID))) {
      const here = propsOn(map, DISTRICT_ID);
      for (let i = 0; i < here.length; i += 1) {
        for (let j = i + 1; j < here.length; j += 1) {
          const a = here[i];
          const b = here[j];
          const d = Math.hypot((a.x - b.x) * TILE, (a.y - b.y) * TILE);
          expect(d, `${a.id} and ${b.id} overlap`).toBeGreaterThan(PROP_RANGE * 2);
        }
      }
    }
  });

  it("never puts a prop on top of somebody", () => {
    /*
     * A person always wins the interact button, so a prop under an NPC is a
     * prop that can never be looked at. It would also be a bench somebody is
     * standing inside.
     */
    for (const prop of WORLD_PROPS) {
      for (const npc of NPCS) {
        if ((npc.mapId ?? DISTRICT_ID) !== (prop.mapId ?? DISTRICT_ID)) continue;
        const d = Math.hypot((npc.x - prop.x) * TILE, (npc.y - prop.y) * TILE);
        expect(d, `${prop.id} sits on ${npc.id}`).toBeGreaterThan(PROP_RANGE);
      }
    }
  });
});

describe("props are observations, not a checklist", () => {
  it("leaves most of them with nothing to collect", () => {
    /*
     * A collectible behind every object turns a neighbourhood into a list to
     * be cleared, and the point of these is noticing rather than completing.
     * Fewer than half carry a moment, on purpose.
     */
    const withMoment = WORLD_PROPS.filter((prop) => prop.discovery).length;
    expect(withMoment).toBeGreaterThan(2);
    expect(withMoment).toBeLessThan(WORLD_PROPS.length / 2 + 1);
  });

  it("gives every district moment a unique id and a real label", () => {
    const ids = DISTRICT_MOMENTS.map((moment) => moment.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const moment of DISTRICT_MOMENTS) {
      expect(moment.label.length, moment.id).toBeGreaterThan(8);
    }
  });

  it("keeps every observation short enough to read while standing up", () => {
    for (const prop of WORLD_PROPS) {
      expect(prop.lines.length, prop.id).toBeGreaterThan(0);
      expect(prop.lines.length, prop.id).toBeLessThanOrEqual(2);
      for (const line of prop.lines) {
        expect(line.split(/\s+/).length, `${prop.id}: ${line}`).toBeLessThanOrEqual(24);
      }
    }
  });

  it("never describes a person as the thing to look at", () => {
    /*
     * The same rule the hotspot scenes follow, and for the same reason. A
     * world that invites tapping on people to see what they are is one bad
     * decision from teaching that people can be read by looking, which is the
     * habit this whole product exists to dismantle.
     */
    const PERSON = /\b(suspect|shoplifter|thief|dodgy|shifty|troublemaker)\b/i;
    for (const prop of WORLD_PROPS) {
      expect(PERSON.test(prop.name), `${prop.id} name`).toBe(false);
      for (const line of prop.lines) {
        expect(PERSON.test(line), `${prop.id}: ${line}`).toBe(false);
      }
    }
  });
});
