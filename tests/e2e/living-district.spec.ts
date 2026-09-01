import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile } from "./helpers";

/**
 * Living District: memory, ownership, and things worth nothing.
 *
 * ---
 *
 * The question this pass was built to answer is whether SIDEQUEST is somewhere
 * a young person would want to exist, and the honest tests of that are not
 * about features being present. They are:
 *
 * - does the district remember what you did, and only what you actually did
 * - can you touch something purely because it is nice, and get paid nothing
 * - does the front door name a person rather than count a backlog
 * - does the page about you open with you, and not with your score
 *
 * All four are pinned here, on foot where the world is involved.
 */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };

const seedPlayer = (page: Page, extra: Record<string, unknown> = {}) =>
  seedProfile(page, { streetsAvatar: AVATAR, ...extra });

/** Walks in one direction in short bursts until a control appears. */
async function reach(page: Page, label: RegExp, key: string, tries = 12) {
  for (let i = 0; i < tries; i += 1) {
    if (await page.getByRole("button", { name: label }).isVisible().catch(() => false)) return true;
    await page.keyboard.down(key);
    await page.waitForTimeout(220);
    await page.keyboard.up(key);
    await page.waitForTimeout(90);
  }
  return page.getByRole("button", { name: label }).isVisible().catch(() => false);
}

const enterWorld = async (page: Page) => {
  await page.goto("/streets");
  await expect(page.getByTestId("streets-canvas")).toBeVisible();
  await page.getByRole("button", { name: "Keep it quiet" }).click();
};

/* -------------------------------------------------------- District memory */

test.describe("the district remembers", () => {
  test("says nothing happened before anything has", async ({ page }) => {
    /*
     * The failure mode that would sink the whole feature: a memory of
     * something the player did not do. A brand new profile must have an empty
     * record on every place, or the district is generating a past.
     */
    /*
     * No crew either. Joining one is a real memory, and the shared seed hands
     * every spec a crew by default, so a genuinely blank district needs saying
     * out loud.
     */
    await seedPlayer(page, { crewId: null });
    await page.goto("/you");

    await expect(page.getByRole("heading", { name: "District memories" })).toBeVisible();
    await expect(
      page.getByText("Nothing yet. The block remembers what you do in it."),
    ).toBeVisible();
    await expect(page.getByText("Not been yet.").first()).toBeVisible();
  });

  test("records meeting somebody, at the place it happened", async ({ page }) => {
    await seedPlayer(page);
    await enterWorld(page);

    const reached = await reach(page, /^Talk/, "ArrowUp");
    expect(reached, "nobody within a short walk of spawn").toBe(true);
    await page.getByRole("button", { name: /^Talk/ }).click();
    await expect(page.getByRole("dialog", { name: /^Talking to/ })).toBeVisible();
    await page.getByRole("button", { name: "Close conversation" }).click();

    /* Meeting somebody is recorded, and it costs nothing. */
    const profile = await readProfile(page);
    expect((profile.metNpcs as string[]).length).toBeGreaterThan(0);
    expect(profile.xp).toBe(0);

    await page.goto("/you");
    await expect(page.getByText(/^Met\./).first()).toBeVisible();
  });

  test("shows what you have done here, in the place you did it", async ({ page }) => {
    /*
     * The in-world half. Standing in a place you have history in offers a way
     * to read it, and a place you have never been offers nothing, because a
     * sheet that opens onto "you have done nothing here" is a punishment for
     * arriving.
     */
    await seedPlayer(page, { metNpcs: ["npc-jas"], completedMissionIds: ["mission-rewind"] });
    await enterWorld(page);

    /*
     * Walked to, not teleported to. The affordance is proximity: standing at
     * the court is what makes the court offer its history, and spawn is
     * deliberately not standing at anything.
     */
    const label = page.getByRole("button", { name: /things? h(as|ave) happened here/i });
    for (let i = 0; i < 10; i += 1) {
      if (await label.isVisible().catch(() => false)) break;
      await page.keyboard.down("ArrowDown");
      await page.waitForTimeout(220);
      await page.keyboard.up("ArrowDown");
      await page.waitForTimeout(90);
    }

    await expect(label).toBeVisible();
    await label.click();

    const sheet = page.getByRole("dialog", { name: /^What has happened at/ });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { name: "You have history here" })).toBeVisible();
    await expect(sheet.getByText("Met", { exact: true }).first()).toBeVisible();
  });
});

/* --------------------------------------------------- Things worth nothing */

test.describe("some things are just nice", () => {
  test("lets you do something harmless and pays absolutely nothing for it", async ({ page }) => {
    /*
     * The most important test in this file, and the easiest one to quietly
     * delete. If touching the drinks machine ever pays, the world stops being
     * somewhere to be and becomes somewhere to farm.
     */
    await seedPlayer(page, { xp: 0 });
    await enterWorld(page);

    const found = await reach(page, /^Look/, "ArrowDown", 16);
    expect(found, "nothing to look at within a walk of spawn").toBe(true);
    await page.getByRole("button", { name: /^Look/ }).click();

    const sheet = page.getByRole("dialog", { name: /^Looking at/ });
    await expect(sheet).toBeVisible();

    const before = await readProfile(page);
    const options = sheet.getByRole("radio");
    if (await options.count()) {
      /* A choice resolves into a response, and the way out only appears after. */
      await expect(sheet.getByRole("button", { name: "Back to the block" })).toHaveCount(0);
      await options.first().click();
      await expect(sheet.getByRole("button", { name: "Back to the block" })).toBeVisible();
    }

    await sheet.getByRole("button", { name: "Back to the block" }).click();

    const after = await readProfile(page);
    expect(after.xp).toBe(before.xp);
    expect(after.xp).toBe(0);
  });
});

/* ------------------------------------------------------------ The front door */

test.describe("home names a person", () => {
  test("counts strangers before you know anybody", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/");
    await expect(page.getByText(/want a word|who is out/)).toBeVisible();
  });

  test("names somebody once you have met them", async ({ page }) => {
    /*
     * A separate test rather than a second seed in the first one: the shared
     * helper only writes when storage is empty, on purpose, so re-seeding
     * inside a test silently does nothing and the assertion that follows is
     * about the previous state.
     *
     * Once a player has history the naming moves up into the continue card,
     * which is the stronger placement, and the world card below stops
     * repeating it. Both halves of that are asserted here because the
     * duplication is what a screenshot caught and a test did not.
     */
    await seedPlayer(page, { metNpcs: ["npc-wei"], xp: 40 });
    await page.goto("/");

    const carryOn = page.getByRole("region", { name: "Where you were" });
    await expect(carryOn.getByText(/Wei is still waiting/)).toBeVisible();
    await expect(carryOn.getByText(/At the sunrise minimart/)).toBeVisible();

    /* And the world card does not say the same sentence a second time. */
    await expect(page.getByText(/is still at the sunrise minimart/)).toHaveCount(0);
  });

  test("still counts strangers on the world card for a player with no history", async ({
    page,
  }) => {
    /*
     * The suppression must be conditional. Somebody who has met nobody has no
     * continue card at all, so the world card is the only thing that can say
     * what is out there and it has to keep saying it.
     */
    await seedPlayer(page, { xp: 0, crewId: null });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Where you were" })).toHaveCount(0);
    await expect(page.getByText(/want a word|who is out/)).toBeVisible();
  });
});

/* ------------------------------------------------------------------- You */

test.describe("you opens with you", () => {
  test("leads with the person, not the score", async ({ page }) => {
    await seedPlayer(page, { xp: 400, displayName: "Sam" });
    await page.goto("/you");

    const corner = page.getByText("Your corner");
    await expect(corner).toBeVisible();

    /*
     * The ordering claim, made falsifiable. The XP total must sit below the
     * ownership block on the page, not above it, because which one is first is
     * the entire difference between a profile and a report card.
     */
    const cornerBox = await corner.boundingBox();
    const xpBox = await page.getByText("XP", { exact: true }).first().boundingBox();
    expect(cornerBox && xpBox && cornerBox.y < xpBox.y).toBe(true);
  });

  test("lets somebody change how they look, more than once", async ({ page }) => {
    /*
     * Customisation used to be reachable exactly once, on the first entry to
     * Streets. A look chosen in the first thirty seconds was permanent, which
     * is the opposite of ownership.
     */
    await seedPlayer(page);
    await page.goto("/you");

    await page.getByRole("button", { name: "Change your look" }).click();
    await expect(page.getByRole("heading", { name: "Change your look" })).toBeVisible();
    await page.getByRole("button", { name: "Randomise" }).click();
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("heading", { name: "Change your look" })).toHaveCount(0);

    const profile = await readProfile(page);
    expect(profile.streetsAvatar).toBeTruthy();
  });
});

/* -------------------------------------------------------- The quest journal */

test.describe("the catalogue and the district are the same thing", () => {
  test("says who asks for a mission and where they stand", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/missions");
    await expect(page.getByText(/asks, at the/).first()).toBeVisible();
  });

  test("moves finished missions out of the way without hiding them", async ({ page }) => {
    await seedPlayer(page, { completedMissionIds: ["mission-otp"] });
    await page.goto("/missions");
    await expect(page.getByRole("heading", { name: "Already played" })).toBeVisible();
  });
});
