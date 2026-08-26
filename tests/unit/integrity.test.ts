import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

import { DISCOVERY_LINKS, PULSE_ITEMS } from "@/data/pulse";
import { REWARDS } from "@/data/rewards";
import { PARTNER_CHALLENGES } from "@/data/partner-challenges";
import { RADIO_STATIONS } from "@/data/radio";
import { NORM_QUESTIONS } from "@/data/norm-mirror";
import { OFFICIAL_RESOURCES, SAFE_PATHS } from "@/lib/official-links";

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
