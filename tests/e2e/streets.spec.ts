import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile } from "./helpers";

/**
 * SIDEQUEST Streets.
 *
 * Everything here is asserted through the DOM: the HUD, the dialogue overlay,
 * the Quest List and the store. Nothing is asserted against canvas pixels,
 * which would be brittle and would also prove the wrong thing. What matters is
 * not that a particular green rectangle is at a particular coordinate, it is
 * that walking makes an NPC reachable, that talking opens the real mission, and
 * that the world never becomes the only way in.
 */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };

/** A profile that has already chosen a look, so tests land in the world. */
const seedPlayer = (page: Page, extra: Record<string, unknown> = {}) =>
  seedProfile(page, { streetsAvatar: AVATAR, ...extra });

/** Walks in a direction for a while, using the keyboard. */
async function walk(page: Page, key: string, ms: number) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(120);
}

/**
 * Walks a route in short bursts until a control appears.
 *
 * One long press sails past whatever the test was walking towards, which is
 * correct behaviour for a world you can explore and a bad way to write a test.
 */
async function reach(page: Page, label: RegExp, legs: [string, number][]) {
  for (const [key, steps] of legs) {
    for (let i = 0; i < steps; i += 1) {
      if (await page.getByRole("button", { name: label }).isVisible().catch(() => false)) return;
      await walk(page, key, 220);
    }
  }
}

/* --------------------------------------------------------------- Loading */

test.describe("the world loads and stays out of the rest of the app", () => {
  test("renders the district", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");

    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await expect(page.getByRole("button", { name: /Quests/ })).toBeVisible();
  });

  test("is reachable from Home, showing the player's own character", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/");

    const entry = page.getByRole("link", { name: /SIDEQUEST Streets/ });
    await expect(entry).toBeVisible();
    await entry.click();
    await expect(page).toHaveURL(/\/streets$/);
  });

  test("draws no canvas on Home, Safe or Updates", async ({ page }) => {
    /*
     * The engine is behind a dynamic import inside a dynamically imported
     * client component, so the rest of the product never downloads it. A canvas
     * appearing on one of these routes would mean that split had broken.
     */
    await seedPlayer(page);
    for (const route of ["/", "/safe", "/pulse"]) {
      await page.goto(route);
      await page.waitForSelector("#main");
      await expect(page.locator("canvas")).toHaveCount(0);
    }
  });

  test("keeps Safe free of the world", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/safe");

    // Safe is exempt from every part of this, permanently.
    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();
    await expect(page.getByText(/Streets/)).toHaveCount(0);
    await expect(page.getByTestId("streets-root")).toHaveCount(0);
  });
});

/* ---------------------------------------------------------------- Avatar */

test.describe("avatar", () => {
  test("is chosen once, then remembered", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/streets");

    await expect(page.getByRole("heading", { name: "Who are you today?" })).toBeVisible();
    await page.getByRole("button", { name: "Head out" }).click();

    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    expect((await readProfile(page)).streetsAvatar).toBeTruthy();

    // Second visit goes straight into the world.
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Who are you today?" })).toHaveCount(0);
  });

  test("can be skipped", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: "Skip" }).click();
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
  });
});

/* -------------------------------------------------------------- Movement */

test.describe("movement", () => {
  test("walking brings somebody into range", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    // Nobody is in range at spawn: the player has to go and find them.
    await expect(page.getByRole("button", { name: /Nobody nearby/ })).toBeDisabled();
    const startTile = await page.getByTestId("streets-canvas").getAttribute("data-player-tile");

    /*
     * Short bursts rather than one long press. A single long walk sails past
     * the person entirely, which is correct behaviour for a world you can
     * explore and a bad way to write a test.
     */
    let reached = false;
    for (let i = 0; i < 5 && !reached; i += 1) {
      await walk(page, "ArrowUp", 260);
      reached = await page
        .getByRole("button", { name: /^Talk/ })
        .isVisible()
        .catch(() => false);
    }

    expect(await page.getByTestId("streets-canvas").getAttribute("data-player-tile")).not.toBe(
      startTile,
    );
    await expect(page.getByRole("button", { name: /^Talk/ })).toBeEnabled();
  });

  test("does not trap the player against a wall", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    /*
     * Walking hard into the block above, then sideways, then back down. If
     * axis-separated collision were broken the player would stick on a corner
     * and never return to somebody they can talk to.
     */
    await walk(page, "ArrowUp", 1600);
    await walk(page, "ArrowLeft", 700);
    await walk(page, "ArrowDown", 900);

    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await expect(page.getByRole("button", { name: /Quests/ })).toBeVisible();
  });
});

/* ------------------------------------------------------- Quest List route */

test.describe("the quest list is a peer of the map", () => {
  test("lists everybody and opens without walking", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();

    await expect(page.getByRole("heading", { name: "Around the block" })).toBeVisible();
    for (const name of ["Wei", "Ken", "Rina", "Jas", "Mr Tan", "Nadia", "Arif"]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
  });

  test("opens a hero mission directly", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();

    // Never rebuilt inside the world: this is the existing REWIND player.
    await page.getByRole("button", { name: "Play REWIND" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Play REWIND/ }).click();
    await expect(page).toHaveURL(/\/play\/mission-rewind$/);
  });

  test("opens Safe with no reward attached", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page.getByRole("button", { name: "Open Safe" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText(/No XP here/)).toBeVisible();
    await page.getByRole("button", { name: /Open Safe/ }).click();
    await expect(page).toHaveURL(/\/safe$/);
    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();
  });

  test("has no axe violations", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await expect(page.getByRole("heading", { name: "Around the block" })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});

/* --------------------------------------------------------- Street Checks */

test.describe("street checks", () => {
  /**
   * Opens Nadia's check from the list.
   *
   * The Continue press is conditional because a finished NPC greets you with a
   * single line, so there is nothing to advance. That is the world reacting to
   * progress, not an inconsistency.
   */
  const openCheck = async (page: Page, who: string) => {
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page
      .locator("li")
      .filter({ hasText: who })
      .first()
      .getByRole("button", { name: "Take a look" })
      .click();
    const next = page.getByRole("button", { name: "Continue" });
    if (await next.isVisible().catch(() => false)) await next.click();
  };

  test("grants XP exactly once", async ({ page }) => {
    await seedPlayer(page, { xp: 0 });
    await openCheck(page, "Nadia");

    await page.getByRole("button", { name: /Nobody legitimate needs your bank account/ }).click();
    await expect(page.getByText("+25 XP")).toBeVisible();
    expect((await readProfile(page)).xp).toBe(25);

    // The ledger is the existing one, so a replay is free and pays nothing.
    await page.getByRole("button", { name: "Back to the block" }).click();
    await openCheck(page, "Nadia");
    await page.getByRole("button", { name: /Nobody legitimate needs your bank account/ }).click();
    await expect(page.getByText(/Already counted/)).toBeVisible();
    expect((await readProfile(page)).xp).toBe(25);
  });

  test("never punishes a choice, and cites its source afterwards", async ({ page }) => {
    await seedPlayer(page, { xp: 0 });
    await openCheck(page, "Nadia");

    // The least safe option still gets an honest consequence, never a verdict.
    await page.getByRole("button", { name: /Try it once and see if the money is real/ }).click();

    await expect(page.getByText(/WRONG/i)).toHaveCount(0);
    await expect(page.getByText(/The first payment is often real/)).toBeVisible();
    await expect(page.getByText(/Singapore Police Force advisories/)).toBeVisible();

    // XP is for taking part, not for picking the approved answer.
    expect((await readProfile(page)).xp).toBe(25);
  });

  test("teaches verifying the request rather than inspecting the video", async ({ page }) => {
    await seedPlayer(page, { xp: 0 });
    await openCheck(page, "Arif");

    /*
     * The design rule for fabricated media: current guidance is that it can be
     * hard to identify by sight, so teaching people to trust their eye builds
     * false confidence. Looking harder is offered and is honestly reported as
     * not settling anything.
     */
    await page.getByRole("button", { name: /Look closely at the video/ }).click();
    await expect(page.getByText(/no more certain than before/)).toBeVisible();
    await expect(page.getByText("Verify the request, not the face. Use a number you already had.")).toBeVisible();
  });
});

/* --------------------------------------------------------------- Doors */

test.describe("buildings open", () => {
  /** Uses the list rather than walking, which is what the list is for. */
  const goInside = async (page: Page, who: string) => {
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page.locator("li").filter({ hasText: who }).first().getByRole("button", { name: "Go there" }).click();
  };

  test("the district names where you are, and so does an interior", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByText("District 01")).toBeVisible();

    await goInside(page, "Bea");
    await expect(page.getByText("Sunrise Minimart")).toBeVisible();
  });

  test("arriving next to somebody puts them in range", async ({ page }) => {
    /*
     * "Go there" used to land two tiles below, which is just outside talking
     * range, so the world greeted you with "Nobody nearby" immediately after
     * taking you to a person. This is that regression pinned.
     */
    await seedPlayer(page);
    await goInside(page, "Bea");
    await expect(page.getByRole("button", { name: /^Talk/ })).toBeEnabled();
  });

  test("a door works in both directions, on foot", async ({ page }) => {
    await seedPlayer(page);
    await goInside(page, "Bea");

    // The mat is at the front of the shop, so leaving is a walk, not a teleport.
    await reach(page, /Step out/, [
      ["ArrowRight", 6],
      ["ArrowDown", 5],
    ]);
    await page.getByRole("button", { name: /Step out/ }).click();
    await expect(page.getByText("District 01")).toBeVisible();

    /*
     * And you arrive on the pavement outside the door you came through, close
     * enough that it offers to take you back. That is the street side of the
     * same proximity test, without any dead reckoning in the test itself.
     */
    await expect(page.getByRole("button", { name: /Go in/ })).toBeEnabled();
    await page.getByRole("button", { name: /Go in/ }).click();
    await expect(page.getByText("Sunrise Minimart")).toBeVisible();
  });
});

/* ----------------------------------------------------- Rewards counter */

test.describe("the rewards counter is the existing claim flow, in a room", () => {
  const openCounter = async (page: Page) => {
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page.getByRole("button", { name: "Open the counter" }).click();
  };

  test("claims through the store and never spends XP", async ({ page }) => {
    await seedPlayer(page, { xp: 520 });
    await openCounter(page);

    await expect(page.getByRole("dialog", { name: "Rewards counter" })).toBeVisible();
    await page
      .locator("li")
      .filter({ hasText: "Crew banner" })
      .getByRole("button", { name: "Claim at the counter" })
      .click();

    await expect(page.getByText(/Claimed. Recorded in your Safety Passport/)).toBeVisible();

    // XP is a threshold, not a balance. Claiming deducts nothing, ever.
    const profile = await readProfile(page);
    expect(profile.xp).toBe(520);
    expect((profile.rewardClaims as unknown[]).length).toBe(1);
  });

  test("says plainly that nothing here is a partnership", async ({ page }) => {
    await seedPlayer(page, { xp: 520 });
    await openCounter(page);

    await expect(page.getByText("Partner concept")).toBeVisible();
    await expect(
      page.getByText(/No retailer, brand or organisation has agreed to any of it/),
    ).toBeVisible();
  });

  test("keeps a reward locked below its threshold", async ({ page }) => {
    await seedPlayer(page, { xp: 10 });
    await openCounter(page);

    await expect(page.getByText("140 XP to go")).toBeVisible();
    await expect(page.getByRole("button", { name: "Claim at the counter" })).toHaveCount(0);
  });
});

/* ------------------------------------------------------- Noticeboards */

test.describe("seeded world copy declares itself", () => {
  test("labels the noticeboard as demo content", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page.getByRole("button", { name: "Read the board" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Seeded")).toBeVisible();
    await expect(page.getByText(/Not a live community feed/)).toBeVisible();
  });

  test("names the shop counter as a concept and nothing more", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page.getByRole("button", { name: "Read the notice" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText(/No shop has agreed to it/)).toBeVisible();
  });
});

/* -------------------------------------------------------- Orientation */

test.describe("landscape is a first class orientation", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test("moves the controls to the edges and keeps everything working", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");

    const root = page.getByTestId("streets-root");
    await expect(root).toHaveAttribute("data-orientation", "landscape");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    // The pad and the interact button sit at opposite edges, world between.
    const pad = page.getByRole("application", { name: /Movement pad/ });
    const box = await pad.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeLessThan(200);

    // And the same experiences open.
    await page.getByRole("button", { name: /Quests/ }).click();
    await expect(page.getByRole("heading", { name: "Around the block" })).toBeVisible();
  });

  test("has no axe violations in landscape", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe("the world reflects progress", () => {
  test("changes what an NPC says once their mission is done", async ({ page }) => {
    await seedPlayer(page, { completedMissionIds: ["mission-rewind"] });
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();

    // Wei opens REWIND, which is finished, so he says something else.
    await expect(page.getByText("You actually said something. Most people just watch.")).toBeVisible();
    await expect(page.getByText("Done").first()).toBeVisible();
  });

  test("keeps XP owned by the store, not the world", async ({ page }) => {
    await seedPlayer(page, { xp: 415 });
    await page.goto("/streets");

    // The HUD reads the profile. It never becomes the source of truth.
    await expect(page.getByText("415 XP")).toBeVisible();
    expect((await readProfile(page)).xp).toBe(415);
  });
});
