import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CREW_CHALLENGES, CREW_SHIFT_TARGET, yourChallengesDone } from "@/data/crew-challenges";
import { CREW_PATTERNS } from "@/components/crew/crew-banner";
import { PRACTICE_THEMES, practiceFor, themeForPulse } from "@/data/practice-themes";
import { PULSE_ITEMS } from "@/data/pulse";
import { MISSIONS } from "@/data/missions";
import { PREVENTION_THREADS } from "@/data/prevention-threads";
import { EMPTY_PROFILE } from "@/store/app-store";
import type { UserProfile } from "@/types/profile";

const blank: UserProfile = { ...EMPTY_PROFILE };
const with_ = (patch: Partial<UserProfile>): UserProfile => ({ ...blank, ...patch });

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

/* ------------------------------------------------------------------ Crew */

describe("crew challenges", () => {
  it("offers more than one shape of thing to do", () => {
    /*
     * The failure mode is four challenges that are all "complete N missions"
     * with different nouns. A crew whose every activity is a quota is a shared
     * homework list.
     */
    const formats = new Set(CREW_CHALLENGES.map((challenge) => challenge.format));
    expect(formats.size).toBeGreaterThanOrEqual(3);
  });

  it("mostly does not need everybody present at the same time", () => {
    /*
     * The whole point of the asynchronous model. Exactly one challenge is
     * allowed to require the crew in a room together, because that one is
     * Crew Shift and being together is what it is for.
     */
    const together = CREW_CHALLENGES.filter((challenge) => challenge.format === "together");
    expect(together).toHaveLength(1);
  });

  it("says nothing has been done by a player who has done nothing", () => {
    expect(yourChallengesDone(blank)).toEqual([]);
    for (const challenge of CREW_CHALLENGES) {
      expect(challenge.done(blank), challenge.id).toBe(false);
    }
  });

  it("reads your own contribution from your own progress", () => {
    /*
     * The replacement for the hardcoded progress bar. Doing the thing has to
     * change the answer, or the screen is lying again in a new place.
     */
    const patched = with_({ completedMissionIds: ["mission-breaksafe"] });
    const change = CREW_CHALLENGES.find((entry) => entry.id === "challenge-change-something")!;
    expect(change.done(blank)).toBe(false);
    expect(change.done(patched)).toBe(true);

    const built = with_({
      questDrafts: [
        {
          id: "d1",
          title: "t",
          hook: "h",
          moment: "m",
          response: "r",
          createdAt: "2026-09-01T00:00:00.000Z",
        },
      ],
    });
    const make = CREW_CHALLENGES.find((entry) => entry.id === "challenge-make-three")!;
    expect(make.done(blank)).toBe(false);
    expect(make.done(built)).toBe(true);
  });

  it("points every challenge at something that exists", () => {
    const missionIds = new Set(MISSIONS.map((mission) => mission.id));
    const threadIds = new Set(PREVENTION_THREADS.map((thread) => thread.id));
    expect(CREW_SHIFT_TARGET, "the Crew Shift chapter has moved or been renamed").not.toBeNull();

    for (const challenge of CREW_CHALLENGES) {
      expect(challenge.href.startsWith("/"), challenge.id).toBe(true);
      const missionMatch = challenge.href.match(/^\/missions\/(.+)$/);
      if (missionMatch) expect(missionIds.has(missionMatch[1]), challenge.id).toBe(true);
    }
    /* The split challenge names a thread, and that thread has to be real. */
    expect(threadIds.has("thread-favour")).toBe(true);
  });

  it("pays only a cosmetic banner, and every unlock is a real pattern", () => {
    const patterns = new Set(CREW_PATTERNS.map((pattern) => pattern.id));
    for (const challenge of CREW_CHALLENGES) {
      expect(patterns.has(challenge.unlocks as never), challenge.id).toBe(true);
      const keys = Object.keys(challenge);
      for (const banned of ["xp", "reward", "coins", "voucher", "points", "multiplier"]) {
        expect(keys, `${challenge.id} pays ${banned}`).not.toContain(banned);
      }
    }
  });

  it("never invents a number about the other members", () => {
    /*
     * The crew screen may not render a crew-wide total, because there is no
     * backend and every such number would be fabricated. The per-member points
     * column and the cross-crew league table are both gone, and this fails the
     * build if either comes back.
     */
    const screen = read("src/features/crews/crew-screen.tsx");
    expect(screen).not.toMatch(/weeklyXp/);
    expect(screen).not.toMatch(/LEADERBOARD/);
    expect(screen).not.toMatch(/currentChallenge/);
  });

  it("says out loud that the members are prototype content", () => {
    const screen = read("src/features/crews/crew-screen.tsx");
    expect(screen).toMatch(/[Pp]rototype/);
  });

  it("does not pretend anything synchronises between devices", () => {
    /*
     * No websocket, no polling, no fetch. If a real backend arrives it
     * replaces the prototype half deliberately rather than appearing by
     * accident inside a component.
     */
    for (const path of [
      "src/features/crews/crew-screen.tsx",
      "src/features/crews/crew-identity-editor.tsx",
      "src/data/crew-challenges.ts",
    ]) {
      const source = read(path);
      expect(source, path).not.toMatch(/\bfetch\(|WebSocket|EventSource|setInterval/);
    }
  });
});

/* --------------------------------------------------------------- Updates */

describe("updates and the fictional practice link", () => {
  it("maps a theme to a mission, never a story to a mission", () => {
    /*
     * The safeguard is structural. A theme names a situation; nothing anywhere
     * connects one piece of reporting to one scenario, so "replay this
     * incident" cannot be expressed.
     */
    const source = read("src/data/practice-themes.ts");
    expect(source).not.toMatch(/pulseId:\s*"/);
    for (const theme of PRACTICE_THEMES) {
      /*
       * A theme names a situation, never a person it happened to and never an
       * outcome somebody suffered. These are the words that would show it had
       * drifted from describing a shape into describing a case.
       */
      expect(theme.name, theme.id).not.toMatch(
        /(victim|arrested|charged|jailed|case|incident|reported)/i,
      );
    }
  });

  it("only points at missions that exist", () => {
    const ids = new Set(MISSIONS.map((mission) => mission.id));
    for (const theme of PRACTICE_THEMES) {
      expect(ids.has(theme.missionId), theme.id).toBe(true);
    }
  });

  it("describes the scenario as made up, in the theme itself", () => {
    for (const theme of PRACTICE_THEMES) {
      expect(
        /fiction|made-up|made up|invented/i.test(theme.fiction),
        `${theme.id} does not say it is fictional`,
      ).toBe(true);
    }
  });

  it("labels the control fictional wherever it is offered", () => {
    /*
     * Three surfaces carry this link and all three must carry the word, since
     * somebody who taps without reading the paragraph still must not be able
     * to believe they are replaying the report.
     */
    for (const path of [
      "src/features/pulse/pulse-feed.tsx",
      "src/features/pulse/pulse-detail.tsx",
      "src/features/home/home-screen.tsx",
    ]) {
      expect(read(path), path).toMatch(/Practise a fictional version/);
    }
  });

  it("offers nothing where no theme is mapped", () => {
    expect(themeForPulse("pulse-does-not-exist")).toBeUndefined();
    expect(practiceFor("pulse-does-not-exist")).toBeUndefined();
  });

  it("leaves every story with its source and its provenance", () => {
    for (const item of PULSE_ITEMS) {
      expect(item.source.length, item.id).toBeGreaterThan(0);
      expect(item.sourceUrl.startsWith("https://"), item.id).toBe(true);
      expect(item.provenance, item.id).toBeDefined();
    }
  });

  it("does not upgrade a story's provenance because it links to a mission", () => {
    /*
     * A real report does not become official by acquiring a practice link, and
     * this is the shape of mistake that would be invisible on screen.
     */
    for (const item of PULSE_ITEMS) {
      const before = item.provenance;
      practiceFor(item.id);
      expect(item.provenance, item.id).toBe(before);
    }
  });
});
