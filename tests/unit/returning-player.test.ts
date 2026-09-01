import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { continueItem, crewThing, hasHistory, openLoop } from "@/features/home/continue-state";
import { CAMPAIGNS } from "@/data/campaigns";
import { DISTRICT_STICKERS } from "@/data/district-stickers";
import { EMPTY_PROFILE } from "@/store/app-store";
import type { UserProfile } from "@/types/profile";

/**
 * Coming back tomorrow.
 *
 * The thing most likely to go wrong here is not a bug, it is a lie: a home
 * screen that tells somebody they have unfinished business when they do not,
 * or that something is new when nothing changed, or that a day has been
 * missed. Every one of those is a small betrayal that costs more than the
 * engagement it buys, and all three are tripwired below.
 */

const blank: UserProfile = { ...EMPTY_PROFILE };
const with_ = (patch: Partial<UserProfile>): UserProfile => ({ ...blank, ...patch });

const campaign = CAMPAIGNS[0];

describe("a first-time visitor", () => {
  it("has no history, so nothing offers to carry on", () => {
    expect(hasHistory(blank)).toBe(false);
    expect(continueItem(blank)).not.toBeNull();
    /*
     * The item resolves (somebody in the district always wants a word), but
     * Home gates it on `hasHistory`, so a brand new player never sees a
     * "where you were" card about a place they have never been.
     */
  });

  it("is not told about a crew before joining one", () => {
    expect(crewThing(blank)).toBeNull();
  });

  it("gets no open loop when the district is completely untouched", () => {
    /*
     * "Six places still have nothing of yours in them" is technically true on
     * a cold install and is useless: it describes the whole product rather
     * than a thread worth picking up.
     */
    expect(openLoop(blank)).toBeNull();
  });
});

describe("somebody who has been here before", () => {
  it("counts any real progress as history", () => {
    expect(hasHistory(with_({ xp: 40 }))).toBe(true);
    expect(hasHistory(with_({ metNpcs: ["npc-wei"] }))).toBe(true);
    expect(hasHistory(with_({ completedMissionIds: ["mission-rewind"] }))).toBe(true);
  });

  it("carries on with a half-read campaign before anything else", () => {
    /*
     * Strict priority. A story somebody stopped in the middle of is the
     * strongest claim this product can honestly make on their attention.
     */
    const profile = with_({
      metNpcs: ["npc-wei"],
      campaigns: {
        [campaign.id]: {
          campaignId: campaign.id,
          completedChapterIds: [campaign.chapters[0].id],
        } as unknown as NonNullable<UserProfile["campaigns"]>[string],
      },
    });
    const item = continueItem(profile)!;
    expect(item.kind).toBe("campaign");
    expect(item.href).toContain(`/campaigns/${campaign.slug}/chapter/`);
  });

  it("never offers a chapter that is already finished", () => {
    const done = campaign.chapters.map((chapter) => chapter.id);
    const profile = with_({
      xp: 10,
      campaigns: {
        [campaign.id]: {
          campaignId: campaign.id,
          completedChapterIds: done,
        } as unknown as NonNullable<UserProfile["campaigns"]>[string],
      },
    });
    const item = continueItem(profile);
    expect(item?.kind).not.toBe("campaign");
  });

  it("falls back to a person in the district, and names them once met", () => {
    const item = continueItem(with_({ metNpcs: ["npc-wei"] }))!;
    expect(item.kind).toBe("streets");
    expect(item.title).toMatch(/still waiting/);
  });

  it("offers one thing, never a list", () => {
    /*
     * The type is a single item on purpose. A home screen offering four ways
     * to resume is a menu, and the entire value of a continue control is not
     * having to choose.
     */
    const item = continueItem(with_({ metNpcs: ["npc-wei"] }));
    expect(Array.isArray(item)).toBe(false);
  });
});

/**
 * Comments out, so these read what a player can see.
 *
 * The same stripper `integrity.test.ts` uses, and for the same reason it needed
 * one: a file whose comment explains that it contains no streak would fail a
 * naive scan for the word streak, which would make the tripwire unusable
 * exactly where the reasoning is written down.
 */
function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_match, before: string) => before);
}

const readCode = (path: string) =>
  stripComments(readFileSync(join(process.cwd(), path), "utf8"));

describe("what the returning state may never do", () => {
  const source = readCode("src/features/home/continue-state.ts");
  const card = readCode("src/features/home/continue-card.tsx");

  it("cannot build a daily login system, because it cannot read a clock", () => {
    /*
     * The strongest available guarantee. No day counter, no missed day, no
     * midnight and no streak can be built out of this module, because nothing
     * in it can find out what time it is.
     */
    expect(source).not.toMatch(/Date\.now|new Date|getTime|toISOString|setInterval/);
  });

  it("never uses the vocabulary of urgency", () => {
    const text = `${source} ${card}`;
    expect(text).not.toMatch(
      /\b(streak|daily|today only|expires?|missed|don't lose|hurry|countdown|before midnight)\b/i,
    );
  });

  it("claims nothing is new, because it cannot know", () => {
    /*
     * Knowing something is new needs a record of what has already been seen.
     * Inventing that state to power an unread badge would be writing data
     * purely to manufacture a sense of missing out, so the section the brief
     * offered was deliberately not built. See the module comment.
     */
    expect(card).not.toMatch(/\bnew\b/i);
  });

  it("keeps every open loop true whenever it is read", () => {
    /*
     * An open loop is a fact about the world right now, with no implication
     * that it expires or that somebody is waiting on a response.
     */
    const partial = with_({ metNpcs: ["npc-wei"], xp: 20 });
    const loop = openLoop(partial);
    expect(loop).not.toBeNull();
    expect(loop!).not.toMatch(/hurry|soon|before|left today|expires/i);
  });

  it("stops mentioning stickers once they are all earned", () => {
    const everything = with_({
      metNpcs: ["npc-wei"],
      districtMoments: [],
    });
    /* Nothing here should ever read as a completion demand. */
    const loop = openLoop(everything);
    if (loop) expect(loop).not.toMatch(/\bof \d+\b|%/);
    expect(DISTRICT_STICKERS.length).toBeGreaterThan(0);
  });
});
