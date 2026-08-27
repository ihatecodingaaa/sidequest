import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

import { DISCOVERY_LINKS, PULSE_ITEMS } from "@/data/pulse";
import { REWARDS } from "@/data/rewards";
import { PARTNER_CHALLENGES } from "@/data/partner-challenges";
import { RADIO_STATIONS } from "@/data/radio";
import { NORM_QUESTIONS } from "@/data/norm-mirror";
import { OFFICIAL_RESOURCES, SAFE_PATHS } from "@/lib/official-links";
import { SIGNAL_MODES, SIGNAL_MODE_IDS } from "@/data/signals";
import { PREVENTION_THREADS, THREAD_XP, getThread } from "@/data/prevention-threads";
import { CREW_SHIFT_ROUNDS } from "@/data/campaigns/crew-shift";
import { CREW_ROLES } from "@/lib/crew-roles";
import { MISSIONS } from "@/data/missions";

/**
 * Content integrity.
 *
 * These are not tests of behaviour. They are tripwires: cheap, deterministic
 * checks that fail the build if a future change makes SIDEQUEST claim something
 * that is not true. Every one of them exists because the corresponding mistake
 * is easy to make while moving fast and hard to notice in review.
 *
 * The rule they enforce collectively is the one in `CLAUDE.md`: anything
 * seeded, synthetic or unconfirmed is labelled, no partnership is implied
 * before it exists, and official services stay official.
 */

const SRC = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(full)) out.push(full);
  }
  return out;
}

const SOURCE_FILES = walk(SRC).map((path) => ({
  path: relative(process.cwd(), path).replace(/\\/g, "/"),
  text: readFileSync(path, "utf8"),
}));

/* ------------------------------------------------- Exhaustive labelling */

describe("provenance labelling is exhaustive within a class", () => {
  /*
   * Pennycook, Bear, Collins and Rand (2020) found that warning a subset of
   * items raises the perceived accuracy of the items left unwarned. A feed
   * where seven of eight rows carry a label teaches the reader that the eighth
   * has been checked. So the check is not "most items are labelled", it is
   * "every item is".
   */
  it("gives every Pulse item a provenance", () => {
    expect(PULSE_ITEMS.length).toBeGreaterThan(0);
    for (const item of PULSE_ITEMS) {
      expect(item.provenance, `${item.id} has no provenance`).toBeTruthy();
    }
  });

  it("gives every discovery link a provenance", () => {
    expect(DISCOVERY_LINKS.length).toBeGreaterThan(0);
    for (const link of DISCOVERY_LINKS) {
      expect(link.provenance, `${link.id} has no provenance`).toBeTruthy();
    }
  });

  it("gives every reward a provenance", () => {
    expect(REWARDS.length).toBeGreaterThan(0);
    for (const reward of REWARDS) {
      expect(reward.provenance, `${reward.id} has no provenance`).toBeTruthy();
    }
  });

  it("never labels team-written Pulse content as an official source", () => {
    // The card text is a SIDEQUEST summary even when the source it cites is an
    // agency. Calling the summary official would put words in the agency's
    // mouth.
    for (const item of PULSE_ITEMS) {
      expect(item.provenance, `${item.id} claims to be an official source`).not.toBe(
        "official-source",
      );
    }
  });
});

/* ------------------------------------------------------ Demo aggregates */

describe("synthetic aggregates are declared", () => {
  it("keeps every Norm Mirror figure in a field whose name says it is invented", () => {
    expect(NORM_QUESTIONS.length).toBeGreaterThan(0);
    for (const question of NORM_QUESTIONS) {
      expect(typeof question.demoAggregate, `${question.id}`).toBe("number");
    }
  });

  it("names the field demoAggregate, never a word implying measurement", () => {
    // The field name is load-bearing: it is what a future author reads before
    // deciding what the number means. "actual", "real" or "survey" would all
    // invite the wrong template string.
    const banned = /\b(actualAggregate|realAggregate|surveyResult|measuredRate)\b/;
    for (const file of SOURCE_FILES) {
      expect(banned.test(file.text), `${file.path} names a synthetic figure as measured`).toBe(
        false,
      );
    }
  });
});

/* ------------------------------------------------------------- Partners */

describe("no partnership is implied before one exists", () => {
  /*
   * The leading word boundary on `our partner` is load-bearing. Without it the
   * pattern also matches "y-our Partner Challenge", which is how the first
   * version of this test failed on a reward that says nothing of the kind.
   */
  const CONFIRMED_LANGUAGE = [
    /official partner/i,
    /sponsored by/i,
    /in partnership with/i,
    /\bour partner\b/i,
    /brought to you by/i,
  ];

  it("keeps every partner challenge unconfirmed", () => {
    expect(PARTNER_CHALLENGES.length).toBeGreaterThan(0);
    for (const challenge of PARTNER_CHALLENGES) {
      expect(challenge.isConfirmedPartner, `${challenge.id}`).toBe(false);
    }
  });

  it("keeps every radio station unconfirmed", () => {
    expect(RADIO_STATIONS.length).toBeGreaterThan(0);
    for (const station of RADIO_STATIONS) {
      expect(station.isPartnerConfirmed, `${station.id}`).toBe(false);
    }
  });

  it("labels any reward that names an organisation as a partner concept", () => {
    // Rewards carry no confirmation flag. They carry `potentialPartner`, and
    // the word "potential" is only honest if the label agrees with it.
    for (const reward of REWARDS) {
      if (!reward.potentialPartner) continue;
      expect(reward.provenance, `${reward.id} names ${reward.potentialPartner}`).toBe(
        "partner-concept",
      );
    }
  });

  it("never uses confirmed-partnership language anywhere in the source", () => {
    for (const file of SOURCE_FILES) {
      for (const pattern of CONFIRMED_LANGUAGE) {
        expect(pattern.test(file.text), `${file.path} matches ${pattern}`).toBe(false);
      }
    }
  });
});

/* --------------------------------------------------------- Safe origins */

describe("official destinations come from one place", () => {
  /*
   * Emergency numbers and agency URLs must not be pasted into components. A
   * duplicated number is a number that will eventually be updated in one place
   * and not the other, and the one that goes stale is the one somebody dials.
   */
  const ALLOWED = new Set(["src/lib/official-links.ts"]);
  const TEL = /href=["'`]tel:/;
  const AGENCY_URL = /https:\/\/www\.(police|scamshield|ncpc)\.(gov\.)?[a-z.]+/;

  it("declares tel: links only in official-links.ts", () => {
    for (const file of SOURCE_FILES) {
      if (ALLOWED.has(file.path)) continue;
      expect(TEL.test(file.text), `${file.path} hard-codes a tel: link`).toBe(false);
    }
  });

  it("declares agency URLs only in data and official-links.ts", () => {
    for (const file of SOURCE_FILES) {
      if (ALLOWED.has(file.path) || file.path.startsWith("src/data/")) continue;
      expect(AGENCY_URL.test(file.text), `${file.path} hard-codes an agency URL`).toBe(false);
    }
  });

  it("gives every Safe path a destination that resolves to a real service", () => {
    expect(SAFE_PATHS.length).toBeGreaterThan(0);
    for (const path of SAFE_PATHS) {
      expect(path.primary.href, `${path.id} primary`).toMatch(/^(tel:|https:\/\/)/);
      if (path.secondary) {
        expect(path.secondary.href, `${path.id} secondary`).toMatch(/^(tel:|https:\/\/)/);
      }
    }
    for (const resource of OFFICIAL_RESOURCES) {
      expect(resource.href, `${resource.id} has no destination`).toMatch(/^(tel:|https:\/\/)/);
    }
  });
});

/* ------------------------------------------------------------ Pilot data */

describe("pilot provenance stays unusable until a pilot exists", () => {
  /*
   * `pilot` means "measured during a real SIDEQUEST pilot". No pilot has run,
   * so nothing can honestly wear it. The status exists so the vocabulary is
   * complete; this test is what stops it being used as a nicer-sounding
   * synonym for demo data in the meantime.
   */
  it("does not appear in any fixture", () => {
    const dataFiles = SOURCE_FILES.filter((file) => file.path.startsWith("src/data/"));
    expect(dataFiles.length).toBeGreaterThan(0);
    for (const file of dataFiles) {
      expect(
        /provenance:\s*["'`]pilot["'`]/.test(file.text),
        `${file.path} claims pilot data`,
      ).toBe(false);
    }
  });
});

/* ----------------------------------------------- Signals describe responses */

describe("a Signal describes a situation, never a person", () => {
  /*
   * The single most important tripwire in this file.
   *
   * A product that hangs a colour off a person's identifier teaches, through
   * thousands of repetitions, that people carry a risk colour and that it is
   * knowable by looking. Dismantling exactly that habit is most of what youth
   * crime prevention is, so the structure has to make it impossible rather
   * than merely discouraged.
   */
  const FORBIDDEN = [
    "riskLevel",
    "riskScore",
    "suspicionScore",
    "suspicion",
    "dangerScore",
    "threatLevel",
    "criminality",
    "offenderScore",
  ];

  it("has no risk score on a person anywhere in the source", () => {
    const offenders: string[] = [];
    for (const file of SOURCE_FILES) {
      for (const term of FORBIDDEN) {
        if (new RegExp(`\\b${term}\\b`).test(file.text)) {
          offenders.push(`${file.path}: ${term}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps the mode on the signal and off the NPC type", () => {
    const data = SOURCE_FILES.find(
      (file) => file.path === "src/features/streets/streets-data.ts",
    );
    expect(data).toBeDefined();
    /*
     * Field declarations, not prose. An earlier version of this assertion
     * scanned for the word "severity" and was failed by the comment above the
     * NPC interface explaining that there is no severity field, which is a
     * good illustration of why a tripwire has to test structure.
     */
    expect(data!.text).not.toMatch(/^\s*(severity|dangerous|isSuspect|rating)\??:/m);
  });

  it("gives every mode a label, an icon and an accessible name", () => {
    for (const id of SIGNAL_MODE_IDS) {
      const spec = SIGNAL_MODES[id];
      expect(spec.label.length).toBeGreaterThan(2);
      expect(spec.icon).toBe(id);
      expect(spec.accessibleName.length).toBeGreaterThan(20);
      // Colour is one channel of four, so a mode is never colour and nothing else.
      expect(spec.colour).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("names a response in every mode, not a level of seriousness", () => {
    const severityWords = /\b(minor|serious|severe|critical|low|high|level)\b/i;
    for (const id of SIGNAL_MODE_IDS) {
      expect(SIGNAL_MODES[id].means).not.toMatch(severityWords);
    }
  });
});

/* --------------------------------------------------- XP ignores seriousness */

describe("XP never scales with how serious a situation is", () => {
  /*
   * Whatever pays most is what people go and do. A product that pays four
   * times for the most dangerous situation available has told a sixteen year
   * old to go and find danger, and no amount of careful dialogue inside the
   * encounter would undo an incentive sitting on top of it.
   */
  it("pays the same for a step whatever mode it is in", () => {
    const byMode = new Map<string, Set<number>>();
    for (const thread of PREVENTION_THREADS) {
      for (const step of thread.steps) {
        if (!byMode.has(step.mode)) byMode.set(step.mode, new Set());
        byMode.get(step.mode)!.add(step.xp);
      }
    }
    const everyValue = new Set([...byMode.values()].flatMap((set) => [...set]));
    expect([...everyValue]).toEqual([THREAD_XP.step]);
  });

  it("does not pay more for the red thread than the amber one", () => {
    const total = (id: string) =>
      (getThread(id)?.steps ?? []).reduce((sum, step) => sum + step.xp, 0);
    expect(total("thread-shout")).toBeLessThanOrEqual(total("thread-favour"));
  });

  it("keeps exactly one Protect thread in the district", () => {
    const red = PREVENTION_THREADS.filter((thread) => thread.mode === "protect");
    expect(red).toHaveLength(1);
  });
});

/* -------------------------------------------------------- Threads are sound */

describe("prevention threads", () => {
  it("cite a source and declare provenance", () => {
    for (const thread of PREVENTION_THREADS) {
      expect(thread.source.label.length).toBeGreaterThan(8);
      expect(thread.source.body.length).toBeGreaterThan(40);
      expect(thread.provenance).toBe("seeded");
    }
  });

  it("never teach going closer, chasing, or holding anybody", () => {
    /*
     * A Protect situation must never reward heroics. The safest options are
     * checked positively rather than by scanning for forbidden words, because
     * the honest consequence of a bad option has to be allowed to describe it.
     */
    const shout = getThread("thread-shout");
    expect(shout).toBeDefined();
    const decision = shout!.steps.find((step) => step.kind === "decision");
    const safest = (decision?.choices ?? []).filter((choice) => choice.isSafest);
    expect(safest.length).toBeGreaterThan(0);
    for (const choice of safest) {
      expect(choice.label).not.toMatch(/chase|film|between|grab|hold|follow/i);
    }
  });

  it("gives every decision step a consequence for every option", () => {
    for (const thread of PREVENTION_THREADS) {
      for (const step of thread.steps) {
        for (const choice of step.choices ?? []) {
          expect(choice.outcome.length).toBeGreaterThan(30);
          // Consequence, never a verdict.
          expect(choice.outcome).not.toMatch(/\bwrong\b|\bcorrect answer\b|\bfailed\b/i);
        }
      }
    }
  });

  it("starts before the harm rather than after it", () => {
    for (const thread of PREVENTION_THREADS) {
      expect(thread.hook).not.toMatch(/crime scene|investigate|suspect|evidence|witness statement/i);
    }
  });
});

/* -------------------------------------------------- Group play is declared */

describe("whether something needs other people is visible before it opens", () => {
  it("declares a play mode on every mission", () => {
    for (const mission of MISSIONS) {
      expect(["solo", "crew", "either"]).toContain(mission.playMode);
    }
  });

  it("says how many people a crew mission wants", () => {
    for (const mission of MISSIONS) {
      if (mission.playMode === "solo") continue;
      expect(mission.crewSize, mission.id).toBeTruthy();
    }
  });

  it("writes the Solo Preview responses down rather than generating them", () => {
    /*
     * A product whose entire subject is peer influence does not get to
     * fabricate peer responses. The preview answers are authored, reviewable,
     * and the same every time.
     */
    for (const round of Object.values(CREW_SHIFT_ROUNDS)) {
      expect(round.preview.first.length).toBeGreaterThan(1);
      expect(round.preview.first.length).toBe(round.preview.second.length);
      const ids = round.options.map((option) => option.id);
      for (const answer of [...round.preview.first, ...round.preview.second]) {
        expect(ids).toContain(answer);
      }
    }
  });
});

/* ------------------------------------------------- The Crew is not police */

describe("the Community Safety Crew holds no powers", () => {
  it("uses roles rather than ranks", () => {
    for (const role of CREW_ROLES) {
      expect(role.name).not.toMatch(
        /officer|constable|sergeant|inspector|detective|commander|rank/i,
      );
      // Every role reads a capability the profile already stored.
      expect(role.skillId.length).toBeGreaterThan(3);
    }
  });

  it("never claims police status anywhere in the world's copy", () => {
    const world = SOURCE_FILES.filter(
      (file) => file.path.startsWith("src/features/streets/") || file.path === "src/lib/crew-roles.ts",
    );
    for (const file of world) {
      expect(file.text, file.path).not.toMatch(
        /\byou are (a |an )?(police|officer)\b|police powers|make an arrest/i,
      );
    }
  });
});
