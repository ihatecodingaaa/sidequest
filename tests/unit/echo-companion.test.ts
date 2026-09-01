import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ECHO_STYLE_ORDER } from "@/data/echo-styles";

/**
 * Echo, as a companion rather than a sprite.
 *
 * A reacting companion is one bad decision away from being a nuisance and two
 * away from being a second progression system. These pin the three rules that
 * keep it from becoming either: it carries no information, it stays cosmetic,
 * and it cannot appear where the product is deliberately not playful.
 */

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_match, before: string) => before);
}

const ENGINE = read("src/features/streets/game/world-engine.ts");
const ENGINE_CODE = stripComments(ENGINE);

describe("a reaction never carries information", () => {
  it("has no text, no speech and no label of any kind", () => {
    /*
     * The rule that lets it exist at all. Every event that triggers a reaction
     * is already fully described in a sheet that is opening on screen, so a
     * player who does not look at Echo, has reduced motion on, or cannot see
     * the canvas misses nothing whatsoever.
     *
     * A canvas has no semantics, so anything Echo said would be unreadable to
     * a screen reader by construction. The only safe amount of speech is none.
     */
    const reaction = ENGINE_CODE.slice(
      ENGINE_CODE.indexOf("private drawEcho"),
      ENGINE_CODE.indexOf("reactEcho(kind"),
    );
    expect(reaction).not.toMatch(/fillText|strokeText|measureText/);
  });

  it("is short, and rate limits itself", () => {
    /*
     * A burst of events must produce one hop rather than a jitter, and the
     * reaction must end on its own without anything having to clear it.
     */
    expect(ENGINE_CODE).toMatch(/if \(this\.echoReaction && this\.clock < this\.echoReaction\.until\) return;/);
    expect(ENGINE_CODE).toMatch(/until: this\.clock \+ \d+/);
  });

  it("keeps the face readable when motion is reduced", () => {
    /*
     * Reduced motion removes the hop and keeps the expression, which is the
     * reveal rule applied to a companion: nothing is shown by motion that is
     * not also shown without it. A reaction that was only a hop would simply
     * not happen for those players.
     */
    const draw = ENGINE_CODE.slice(
      ENGINE_CODE.indexOf("private drawEcho"),
      ENGINE_CODE.indexOf("reactEcho(kind"),
    );
    expect(draw).toMatch(/reducedMotion/);
    /* The eye shapes are chosen from the reaction, not from the hop. */
    expect(draw).toMatch(/reaction\.kind === "pleased"/);
  });
});

describe("variants stay cosmetic", () => {
  it("differs only in idle amplitude, speed and phase", () => {
    /*
     * The exact list of fields a variant may change. Anything else in this
     * table would be a gameplay difference wearing a cosmetic label, and the
     * whole Echo collection is free precisely because it can never be an
     * advantage.
     */
    const table = ENGINE_CODE.slice(
      ENGINE_CODE.indexOf("const ECHO_CHARACTER"),
      ENGINE_CODE.indexOf("const ECHO_TINT"),
    );
    const fields = new Set([...table.matchAll(/\b(\w+):\s*[\d.]+/g)].map((m) => m[1]));
    expect([...fields].sort()).toEqual(["lift", "phase", "speed"]);
  });

  it("gives every style a character and a tint", () => {
    for (const id of ECHO_STYLE_ORDER) {
      expect(ENGINE, `${id} has no idle character`).toMatch(new RegExp(`${id}: \\{ lift`));
      expect(ENGINE, `${id} has no tint`).toMatch(new RegExp(`${id}: "#`));
    }
  });

  it("never lets a variant reach range, speed or anything a player can use", () => {
    const table = ENGINE_CODE.slice(
      ENGINE_CODE.indexOf("const ECHO_CHARACTER"),
      ENGINE_CODE.indexOf("const ECHO_TINT"),
    );
    for (const banned of ["range", "xp", "bonus", "luck", "reveal", "detect", "radius"]) {
      expect(table, `a variant changes ${banned}`).not.toMatch(new RegExp(`\\b${banned}\\b`, "i"));
    }
  });
});

describe("where Echo may not go", () => {
  it("is absent from Safe and Settings entirely", () => {
    /*
     * Not "quiet on Safe", absent. Safe gets no Echo, no collectible, no
     * motif, no sound and no motion, and the cheapest way to keep that true is
     * that neither screen imports any of it.
     */
    for (const path of ["src/features/safe", "src/features/profile/settings-screen.tsx"]) {
      const full = join(process.cwd(), path);
      const files = path.endsWith(".tsx")
        ? [full]
        : readdirSyncSafe(full).map((name) => join(full, name));
      for (const file of files) {
        if (!file.endsWith(".tsx") && !file.endsWith(".ts")) continue;
        const source = readFileSync(file, "utf8");
        expect(source, file).not.toMatch(/EchoMascot|StickerMark|reactEcho|CrewBanner/);
      }
    }
  });
});

function readdirSyncSafe(dir: string): string[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require("node:fs") as typeof import("node:fs")).readdirSync(dir);
  } catch {
    return [];
  }
}
