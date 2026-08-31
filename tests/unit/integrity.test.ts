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
import {
  DISTRICT_01,
  DISTRICT_ID,
  NPCS,
  SOLID,
  SPAWN,
  STREET_CHECKS,
  TILE,
} from "@/features/streets/streets-data";
import { INTERACT_RANGE } from "@/features/streets/game/world-engine";
import { PROTECTIVE_FACTORS } from "@/data/protective-factors";
import {
  QUEST_DECISIONS,
  QUEST_FACTOR_MOVES,
  QUEST_PRIMARY_FACTORS,
  QUEST_SECONDARY_FACTORS,
  QUEST_SETTINGS,
  QUEST_TRIGGERS,
  generateQuestDraft,
} from "@/data/quest-builder";
import type { ProtectiveFactorId } from "@/types/protective";

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

/**
 * Source with comments removed.
 *
 * Two tripwires in this file scan for a construct that their own subject
 * documents in prose: a component explaining that it used to be a `<textarea>`
 * and no longer is, and one explaining that it promises no notification. A
 * tripwire that fires on the documentation of the rule it enforces is a
 * tripwire nobody will keep, so it reads code and not comments.
 *
 * Block comments cover JSDoc and JSX comments alike. Line comments are
 * stripped only where the slashes are not preceded by a colon, so a URL inside
 * a string survives.
 */
function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_match, before: string) => before);
}

const CODE = SOURCE_FILES.map((file) => ({ ...file, text: stripComments(file.text) }));

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
      // Three schemes, and nothing else. `sms:` is the route for when it is
      // not safe to speak, which is the one case a call is the wrong answer.
      expect(resource.href, `${resource.id} has no destination`).toMatch(
        /^(tel:|sms:|https:\/\/)/,
      );
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

/* --------------------------------------------- Outbound schemes stay narrow */

describe("ExternalLink's allowlist", () => {
  /*
   * A tripwire on a security boundary. `ExternalLink` refuses anything that is
   * not http(s), `tel:` or `sms:`, which is what stops a `javascript:` or
   * `data:` URL arriving through content and reaching a user.
   *
   * The list is short on purpose and every addition widens what content can
   * reach the operating system through, so this test exists to make an
   * addition a deliberate act rather than a quiet one.
   */
  it("permits exactly http, https, tel and sms", () => {
    const source = SOURCE_FILES.find((file) => file.path === "src/components/ui/primitives.tsx");
    expect(source).toBeDefined();
    const schemes = [...source!.text.matchAll(/href\.startsWith\("(\w+):"\)/g)].map(
      (match) => match[1],
    );
    expect(schemes.sort()).toEqual(["sms", "tel"]);
  });

  it("gives the emergency SMS route a scheme the link component will render", () => {
    const sms = OFFICIAL_RESOURCES.find((resource) => resource.action === "sms");
    expect(sms, "no emergency SMS route").toBeDefined();
    expect(sms!.href).toBe("sms:70999");
    // Verified verbatim on police.gov.sg, 27 August 2026.
    expect(sms!.owner).toBe("Singapore Police Force");
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

/* ------------------------------------------------- Keyboard-last gameplay */

describe("normal gameplay never requires the keyboard", () => {
  /*
   * The tripwire for the interaction-first pass.
   *
   * Real testers said three things: "there is too much typing", "make the
   * tasks MCQ based instead", "typing answers feels tedious". Taking the
   * second one literally would turn a prevention product into a quiz, so what
   * was adopted is the first: choice first, action first, keyboard last.
   *
   * The rule is not "no text fields". Settings need one, a station code needs
   * one, and a young person who wants to write their own idea should be able
   * to. The rule is that **no text field is on the path a player has to walk**,
   * and that every one which exists has said out loud which of the permitted
   * reasons it exists for.
   *
   * That is what `data-input-role` is. Adding a field without one fails here,
   * which makes putting required typing back into gameplay a deliberate act
   * rather than a quiet one. There is no permitted value that means "the
   * player must type this to continue", which is the entire point: the check
   * cannot be satisfied by declaring the thing it forbids.
   */
  const ALLOWED_ROLES = new Set([
    /* Behind a deliberate secondary control. The flow completes without it. */
    "optional-creator",
    /* A station, crew or mission code, where a QR or tap path also exists. */
    "code-entry",
    /* Settings and onboarding. Not gameplay, and skippable. */
    "settings",
    /* The partner-facing studio at /partner, which nothing links to. */
    "partner-tool",
  ]);

  /*
   * Input types that open no keyboard.
   *
   * A range slider is how Norm Mirror takes a prediction, and it is a text
   * field only in the sense that the DOM calls it `<input>`. The rule is about
   * keyboards, so it is scoped to the controls that summon one.
   */
  const NO_KEYBOARD_TYPES = /type=\{?["']?(range|checkbox|radio|file|color)["']?\}?/;

  /** Every JSX opening tag of the given name, with its attribute text. */
  function openingTags(text: string, tag: string): { attrs: string; line: number }[] {
    const found: { attrs: string; line: number }[] = [];
    const marker = `<${tag}`;
    let from = 0;
    for (;;) {
      const start = text.indexOf(marker, from);
      if (start === -1) break;
      /* `<inputs` or `<textareaFoo` is a different element. */
      const after = text[start + marker.length];
      if (after && /[A-Za-z0-9_]/.test(after)) {
        from = start + marker.length;
        continue;
      }
      /*
       * Walk to the tag's own closing angle bracket, ignoring any inside a
       * JSX expression. Scanning a fixed number of characters instead would
       * read attributes off whatever element happened to come next.
       */
      let depth = 0;
      let i = start + marker.length;
      while (i < text.length) {
        const char = text[i];
        if (char === "{") depth += 1;
        else if (char === "}") depth -= 1;
        else if (char === ">" && depth === 0) break;
        i += 1;
      }
      found.push({
        attrs: text.slice(start, i),
        line: text.slice(0, start).split("\n").length,
      });
      from = i + 1;
    }
    return found;
  }

  it("declares a role on every control that opens a keyboard", () => {
    const offenders: string[] = [];

    for (const file of CODE) {
      for (const tag of ["input", "textarea"]) {
        for (const { attrs, line } of openingTags(file.text, tag)) {
          if (tag === "input" && NO_KEYBOARD_TYPES.test(attrs)) continue;

          const role = /data-input-role="([a-z-]+)"/.exec(attrs)?.[1];
          if (!role) {
            offenders.push(`${file.path}:${line} <${tag}> has no data-input-role`);
          } else if (!ALLOWED_ROLES.has(role)) {
            offenders.push(`${file.path}:${line} <${tag}> declares role "${role}"`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("keeps every textarea out of the player experience", () => {
    /*
     * A textarea is a promise about how much is expected. Even where typing is
     * genuinely optional, the six-row box asks for an essay whether or not the
     * label does, so the optional creator fields are single-line `<input>`
     * elements and the only remaining textarea in the product is in the
     * partner-facing studio, which nothing in the app links to.
     */
    const files = CODE.filter((file) => /<textarea[\s>]/.test(file.text)).map(
      (file) => file.path,
    );
    expect(files).toEqual(["src/features/partner/partner-studio.tsx"]);
  });

  it("leaves the partner studio unlinked from the player app", () => {
    /*
     * The previous assertion is only meaningful while /partner stays a tool
     * rather than a destination. The moment something links to it, its
     * textarea is on a player route and the exemption above is wrong.
     */
    for (const file of CODE) {
      if (file.path === "src/app/(app)/partner/page.tsx") continue;
      expect(/href=["'`]\/partner["'`]/.test(file.text), `${file.path} links to /partner`).toBe(
        false,
      );
    }
  });
});

/* ------------------------------------------- Interaction variety in Streets */

describe("a Prevention Thread is not four choice lists in a row", () => {
  /*
   * The complaint behind this pass was that the tasks felt like a quiz. Every
   * thread step used to end in the same interaction, so a thread was: read,
   * continue, pick one of four. Four times.
   *
   * The fix is not a rota. It is that a step about a *place* is allowed to be
   * about a place, and this checks that at least one thread actually uses that
   * freedom, so the mechanics do not quietly rot back into a single shape.
   */
  it("uses more than one interaction across the district", () => {
    const kinds = new Set(
      PREVENTION_THREADS.flatMap((thread) => thread.steps.map((step) => step.kind)),
    );
    expect(kinds.has("decision")).toBe(true);
    expect(kinds.has("hotspot")).toBe(true);
    expect(kinds.has("order")).toBe(true);
  });

  it("gives every hotspot step decoys, and every spot an explanation", () => {
    for (const thread of PREVENTION_THREADS) {
      for (const step of thread.steps) {
        if (!step.hotspot) continue;
        const { spots, required } = step.hotspot;
        const counting = spots.filter((spot) => spot.counts);
        expect(counting.length, `${step.id} required vs counting`).toBeGreaterThanOrEqual(required);
        /*
         * At least one decoy. BREAKSAFE established that an option refused
         * after reading its trade-offs teaches more than one never offered,
         * and the two decoys people reach for first (a camera, a warning sign)
         * are exactly the ones worth being able to reject.
         */
        expect(spots.length, `${step.id} has no decoy`).toBeGreaterThan(counting.length);
        for (const spot of spots) {
          expect(spot.explanation.length, `${step.id}:${spot.id}`).toBeGreaterThan(40);
          expect(spot.label.length, `${step.id}:${spot.id}`).toBeGreaterThan(3);
        }
      }
    }
  });

  it("never asks a player to tap a person", () => {
    /*
     * The most important line in this file, transplanted to the new mechanic.
     *
     * A hotspot invites tapping whatever is in the picture. A prompt that says
     * "tap what is making the wrong thing easy" over a scene containing a
     * figure has taught, in one gesture, that people are the thing to spot.
     * Situational prevention is the opposite claim, so the spots name objects
     * and the artwork contains nobody.
     */
    const PERSON = /\b(shopper|person|customer|kid|boy|girl|man|woman|teen|youth|suspect)\b/i;
    for (const thread of PREVENTION_THREADS) {
      for (const step of thread.steps) {
        for (const spot of step.hotspot?.spots ?? []) {
          expect(PERSON.test(spot.label), `${step.id}:${spot.id} names a person`).toBe(false);
        }
      }
    }
  });

  it("gives an ordering step a sequence drawn from its own cards", () => {
    for (const thread of PREVENTION_THREADS) {
      for (const step of thread.steps) {
        if (!step.order) continue;
        const ids = step.order.cards.map((card) => card.id);
        expect(ids.length, `${step.id} card count`).toBeGreaterThanOrEqual(2);
        expect(ids.length, `${step.id} card count`).toBeLessThanOrEqual(4);
        expect([...step.order.recommended].sort()).toEqual([...ids].sort());
        /* Both outcomes are written. Neither is a verdict. */
        expect(step.order.matched.length).toBeGreaterThan(30);
        expect(step.order.differed.length).toBeGreaterThan(30);
        expect(step.order.differed).not.toMatch(/\bwrong\b|\bincorrect\b|\bfailed\b/i);
      }
    }
  });
});

/* ---------------------------------------------- The Quick Quest Builder */

describe("youth co-creation survives the removal of typing", () => {
  /*
   * Removing required typing must not remove the Youth-Led criterion. These
   * check that the builder can still express a scenario, and that its
   * vocabulary stays wired to the one the rest of the product uses.
   */
  it("gives every protective factor a move the builder can write", () => {
    for (const id of Object.keys(PROTECTIVE_FACTORS) as ProtectiveFactorId[]) {
      expect(QUEST_FACTOR_MOVES[id], `${id} has no builder phrasing`).toBeTruthy();
    }
    /* And nothing invented that the factor table does not know about. */
    for (const id of Object.keys(QUEST_FACTOR_MOVES)) {
      expect(PROTECTIVE_FACTORS[id as ProtectiveFactorId], `${id} is not a factor`).toBeTruthy();
    }
  });

  it("offers every factor across the two pages, and never twice", () => {
    const offered = [...QUEST_PRIMARY_FACTORS, ...QUEST_SECONDARY_FACTORS];
    expect(new Set(offered).size).toBe(offered.length);
    expect([...offered].sort()).toEqual(Object.keys(PROTECTIVE_FACTORS).sort());
  });

  it("gives every trigger decisions that exist", () => {
    for (const trigger of QUEST_TRIGGERS) {
      expect(trigger.decisionIds.length, trigger.id).toBeGreaterThanOrEqual(3);
      for (const id of trigger.decisionIds) {
        expect(QUEST_DECISIONS[id], `${trigger.id} wants ${id}`).toBeTruthy();
      }
    }
  });

  it("generates a readable draft for every combination", () => {
    /*
     * Exhaustive rather than sampled. It is a few thousand string
     * concatenations and it is the only thing standing between a table edit
     * and a young person being shown a sentence with a hole in it.
     */
    for (const setting of QUEST_SETTINGS) {
      for (const trigger of QUEST_TRIGGERS) {
        for (const decisionId of trigger.decisionIds) {
          for (const factorId of Object.keys(PROTECTIVE_FACTORS) as ProtectiveFactorId[]) {
            const draft = generateQuestDraft({
              settingId: setting.id,
              triggerId: trigger.id,
              decisionId,
              factorId,
            });
            const where = `${setting.id}/${trigger.id}/${decisionId}/${factorId}`;
            expect(draft.title.length, where).toBeGreaterThan(8);
            expect(draft.hook, where).not.toContain("{where}");
            expect(draft.hook, where).not.toContain("undefined");
            expect(draft.moment, where).toMatch(/^Do you .+\?$/);
            expect(draft.response, where).toMatch(/\.$/);
            for (const field of [draft.title, draft.hook, draft.moment, draft.response]) {
              expect(field, where).not.toMatch(/\s{2,}|,\s*,|\bundefined\b/);
            }
          }
        }
      }
    }
  });

  it("never implies a template wrote something for the player", () => {
    /*
     * The draft is string concatenation over four ids. A screen that lets
     * somebody believe otherwise is lying about the one part of the product a
     * young person might repeat to a friend, so the honesty line is checked
     * rather than trusted.
     */
    for (const path of [
      "src/features/streets/components/quest-builder.tsx",
      "src/features/missions/partner/build-player.tsx",
    ]) {
      const file = SOURCE_FILES.find((entry) => entry.path === path);
      expect(file, path).toBeDefined();
      expect(file!.text, path).toMatch(/No AI wrote this/);
    }
  });
});

/* ------------------------------------------------- The district at spawn */

describe("the world does not greet you before you have walked", () => {
  /*
   * The district's design rule is that the player reaches something worth
   * stopping for within a few seconds of walking in any direction. Having
   * walked. Somebody standing inside conversation range of the spawn tile
   * hands the player a conversation they did not go and find, and it makes the
   * "nothing in reach" state of the interact control unreachable, which is a
   * real state with its own copy and its own e2e assertion.
   *
   * This exists because a new thread NPC was placed one tile diagonally from
   * spawn, which is 22 of the 30 world units the range allows. The e2e caught
   * it, intermittently, which is the worst way to catch anything.
   */
  it("puts nobody within conversation range of the spawn tile", () => {
    const offenders = NPCS.filter((npc) => {
      if ((npc.mapId ?? DISTRICT_ID) !== DISTRICT_ID) return false;
      const dx = (npc.x - SPAWN.x) * TILE;
      const dy = (npc.y - SPAWN.y) * TILE;
      return Math.hypot(dx, dy) < INTERACT_RANGE;
    });
    expect(offenders.map((npc) => npc.id)).toEqual([]);
  });

  it("keeps every district NPC on a walkable tile", () => {
    /*
     * A person standing inside a wall can be talked to from the Quest List and
     * never reached on foot, which makes "Go there" walk somebody into a
     * building and stop.
     */
    const rows = DISTRICT_01;
    for (const npc of NPCS) {
      if ((npc.mapId ?? DISTRICT_ID) !== DISTRICT_ID) continue;
      const code = rows[npc.y]?.[npc.x];
      expect(code, `${npc.id} at ${npc.x},${npc.y}`).toBeDefined();
      expect(SOLID.has(code as never), `${npc.id} stands in ${code}`).toBe(false);
    }
  });
});

/* --------------------------------------------- The plan at the end of a thread */

describe("a finished thread ends in a plan, not a pat on the back", () => {
  /*
   * Choosing in a scenario produces an intention, and intentions convert to
   * behaviour at about d+ = .36. The best-validated repair is an if-then plan
   * (d+ = 0.65), and the specific trap named in that literature is treating a
   * choice card as one: a branch supplies a response inside a fictional
   * situation, and the cue is the half that carries the effect.
   *
   * So the cues have to be about the player's life rather than the story's,
   * and they have to be short enough to read as a moment rather than a scene.
   */
  it("offers cues on every thread that has a decision to plan with", () => {
    for (const thread of PREVENTION_THREADS) {
      const hasDecision = thread.steps.some((step) => (step.choices?.length ?? 0) > 0);
      if (!hasDecision) continue;
      expect(thread.completion.plan, `${thread.id} has choices but no plan`).toBeTruthy();
      expect(thread.completion.plan!.cues.length).toBeGreaterThanOrEqual(2);
      expect(thread.completion.plan!.cues.length).toBeLessThanOrEqual(4);
    }
  });

  it("writes cues as a moment in the player's life, never as a character", () => {
    const CAST = /(Devi|Haziq|Joy|Elle|Hana|Kai|Mira|Lek|Bea|Nadia|Arif|Wei|Ken|Rina|Jas)/;
    for (const thread of PREVENTION_THREADS) {
      for (const cue of thread.completion.plan?.cues ?? []) {
        expect(CAST.test(cue.label), `${thread.id}:${cue.id} names the cast`).toBe(false);
        expect(cue.label.split(/\s+/).length, `${thread.id}:${cue.id} is too long`).toBeLessThanOrEqual(12);
      }
    }
  });

  it("never promises a reminder it cannot send", () => {
    /*
     * There is no push infrastructure and there is not going to be one, so
     * copy implying the phone will do something is a lie with a nice tone of
     * voice.
     */
    const file = CODE.find(
      (entry) => entry.path === "src/components/interaction/plan-reveal.tsx",
    );
    expect(file).toBeDefined();
    expect(file!.text).not.toMatch(/we will remind|notify you|we'll remind|notification/i);
  });
});

/* ------------------------------------ A riskier option never ends on the harm */

describe("every riskier option names the move that would have worked", () => {
  /*
   * The brief's rule is that refusing to score a choice is not the same as
   * pretending every choice is equally safe. The feedback literature turns
   * that into a specific, checkable shape.
   *
   * Kluger and DeNisi found that supplying the correct solution is what
   * separates a feedback intervention that works from one that barely does.
   * Shute's synthesis puts elaborated feedback above knowledge of the correct
   * response, and both above knowing only the result. Fong's moderator
   * analysis found that an instructional detail naming what to do instead is
   * the single feature that flips negative feedback from demotivating to
   * motivating.
   *
   * And the ordering matters most: a consequence that ends on the harm is fear
   * without an efficacy component, which is the shape of Scared Straight, the
   * one prevention approach with evidence of making outcomes worse. So the
   * last thing a player reads after a risky choice is what to do instead.
   */
  const riskyThreadChoices = PREVENTION_THREADS.flatMap((thread) =>
    thread.steps.flatMap((step) =>
      (step.choices ?? [])
        .filter((choice) => !choice.isSafest)
        .map((choice) => ({ where: `${thread.id}:${step.id}:${choice.id}`, choice })),
    ),
  );

  const riskyCheckOptions = Object.values(STREET_CHECKS).flatMap((check) =>
    check.options
      .filter((option) => !option.isSafest)
      .map((option) => ({ where: `${check.id}:${option.id}`, option })),
  );

  it("has riskier options to check in the first place", () => {
    expect(riskyThreadChoices.length).toBeGreaterThan(4);
    expect(riskyCheckOptions.length).toBeGreaterThan(3);
  });

  it("gives every riskier thread choice a safer move", () => {
    for (const { where, choice } of riskyThreadChoices) {
      expect(choice.safer, `${where} ends on the harm`).toBeTruthy();
      expect(choice.safer!.length, where).toBeGreaterThan(20);
    }
  });

  it("gives every riskier street check option a safer move", () => {
    for (const { where, option } of riskyCheckOptions) {
      expect(option.safer, `${where} ends on the harm`).toBeTruthy();
      expect(option.safer!.length, where).toBeGreaterThan(20);
    }
  });

  it("writes the safer move as an action, never as a verdict on the player", () => {
    /*
     * Hattie and Timperley put feedback about the self at the bottom of their
     * four levels, and the adolescent-specific work is stronger still: praise
     * can read to an older teenager as evidence that less was expected of
     * them. So the sentence points at the situation, and never at the person.
     */
    const VERDICT =
      /\byou (were|are) (wrong|stupid|careless|reckless|silly|naive)\b|\bshould have known\b|\bwhat were you thinking\b|\bobviously\b/i;
    const PRAISE = /\b(well done|good job|nice one|great choice|smart move)\b/i;

    const all = [
      ...riskyThreadChoices.map((entry) => ({ where: entry.where, text: entry.choice.safer ?? "" })),
      ...riskyCheckOptions.map((entry) => ({ where: entry.where, text: entry.option.safer ?? "" })),
    ];

    for (const { where, text } of all) {
      expect(VERDICT.test(text), `${where} passes judgement`).toBe(false);
      expect(PRAISE.test(text), `${where} praises`).toBe(false);
    }
  });

  it("renders the safer move after the outcome, never before it", () => {
    /*
     * The order is the finding. `Consequence` is the only component that
     * renders both, so the check is that the outcome paragraph precedes the
     * safer paragraph in its source.
     */
    const file = CODE.find(
      (entry) => entry.path === "src/components/interaction/consequence.tsx",
    );
    expect(file).toBeDefined();
    const outcomeAt = file!.text.indexOf("{outcome}");
    const saferAt = file!.text.indexOf("{safer}");
    expect(outcomeAt).toBeGreaterThan(-1);
    expect(saferAt).toBeGreaterThan(outcomeAt);
  });
});
