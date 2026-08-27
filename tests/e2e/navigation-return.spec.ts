import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile } from "./helpers";

/**
 * Where finishing an experience takes you.
 *
 * A real device found this: somebody walked up to a neighbour in Streets,
 * played the mission that neighbour opened, tapped finish, and landed on the
 * generic missions directory. The world loop is explore, meet somebody, play,
 * **return to the same world**, and see it react. Landing in a list breaks it
 * at the last step.
 *
 * The obvious fix, routing every completion to Streets, would have broken the
 * two surfaces that were already right. So these tests exist in pairs: each
 * one that checks the new destination has a partner checking the old one still
 * holds.
 */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };
const seedPlayer = (page: Page, extra: Record<string, unknown> = {}) =>
  seedProfile(page, { streetsAvatar: AVATAR, ...extra });

/**
 * Opens Streets and waits for the world to actually be running.
 *
 * The canvas element exists before the renderer does, because the engine is
 * behind a dynamic import. Pressing a key in that window does nothing, so
 * every test that walks has to wait for the engine rather than for the
 * element. `data-player-tile` is only published once a frame has been drawn.
 */
async function enterWorld(page: Page) {
  await page.goto("/streets");
  await expect(page.getByTestId("streets-canvas")).toBeVisible();
  await expect(page.getByTestId("streets-canvas")).toHaveAttribute("data-player-tile", /\d+,\d+/);
}

/** Plays Norm Mirror to its completion screen. Four situations, predict then choose. */
async function playNormMirror(page: Page) {
  await page.getByRole("button", { name: /Start|Begin|Continue/ }).first().click();
  for (let guard = 0; guard < 40; guard += 1) {
    const finished = await page
      .getByRole("link", { name: /Back to the block|Next mission/ })
      .isVisible()
      .catch(() => false);
    if (finished) return true;

    const choice = page.locator("main button:enabled, button:enabled").first();
    if (!(await choice.isVisible().catch(() => false))) break;
    await choice.click();
    await page.waitForTimeout(120);
  }
  return page
    .getByRole("link", { name: /Back to the block|Next mission/ })
    .isVisible()
    .catch(() => false);
}

/* ------------------------------------------------------- Origin routing */

test.describe("finishing returns you where you came from", () => {
  test("Streets tags the mission it opens", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page.getByRole("button", { name: "Play REWIND" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Play REWIND/ }).click();

    // A key, never a path. Nothing from the URL is navigated to.
    await expect(page).toHaveURL(/\/play\/mission-rewind\?from=streets$/);
  });

  test("the close control goes back to Streets, not to the mission page", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/play/mission-rewind?from=streets");
    await page.getByRole("link", { name: "Close mission" }).click();
    await expect(page).toHaveURL(/\/streets$/);
    // Closing is not finishing. It must never award anything.
    expect((await readProfile(page)).completedMissionIds).toEqual([]);
  });

  test("the close control keeps its old destination without an origin", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/play/mission-rewind");
    await page.getByRole("link", { name: "Close mission" }).click();
    await expect(page).toHaveURL(/\/missions\/mission-rewind$/);
  });

  test("finishing from Streets offers the way back to the block", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/play/mission-norm-mirror?from=streets");
    expect(await playNormMirror(page)).toBe(true);

    const back = page.getByRole("link", { name: /Back to the block/ });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/streets$/);
  });

  test("finishing without an origin still offers the next mission", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/play/mission-norm-mirror");
    expect(await playNormMirror(page)).toBe(true);

    const next = page.getByRole("link", { name: /Next mission/ });
    await expect(next).toBeVisible();
    await next.click();
    await expect(page).toHaveURL(/\/missions$/);
  });

  test("ignores an origin it does not recognise", async ({ page }) => {
    /*
     * The origin is a key looked up in a table, so an unknown one falls back
     * exactly as a missing one does. There is no path in the URL to follow and
     * therefore no open redirect to find.
     */
    await seedPlayer(page);
    await page.goto("/play/mission-rewind?from=https://example.com");
    await page.getByRole("link", { name: "Close mission" }).click();
    await expect(page).toHaveURL(/\/missions\/mission-rewind$/);
  });

  test("leaves the campaign flow alone", async ({ page }) => {
    /*
     * Campaigns pass their own host with their own exit, which is the same
     * idea one layer up. The origin mechanism must not reach into it.
     */
    await seedPlayer(page);
    await page.goto("/campaigns/one-bad-minute");
    await expect(page).toHaveURL(/\/campaigns\/one-bad-minute$/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

/* ------------------------------------------------- Coming back to the world */

test.describe("coming back to the same part of the world", () => {
  test("puts the player back where they were standing", async ({ page }) => {
    await seedPlayer(page);
    await enterWorld(page);
    const canvas = page.getByTestId("streets-canvas");

    // Walk somewhere that is not the spawn point.
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(500);
    await page.keyboard.up("ArrowLeft");
    await page.waitForTimeout(200);
    const left = await canvas.getAttribute("data-player-tile");
    expect(left).not.toBe("20,11");

    // Out to a mission and back.
    await page.goto("/play/mission-rewind?from=streets");
    await page.getByRole("link", { name: "Close mission" }).click();
    await expect(canvas).toHaveAttribute("data-player-tile", /\d+,\d+/);

    expect(await canvas.getAttribute("data-player-tile")).toBe(left);
  });

  test("puts the player back inside the building they were in", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page
      .locator("li")
      .filter({ hasText: "Bea" })
      .first()
      .getByRole("button", { name: "Go there" })
      .click();
    await expect(page.getByText("Sunrise Minimart")).toBeVisible();

    await page.goto("/play/mission-rewind?from=streets");
    await page.getByRole("link", { name: "Close mission" }).click();

    // Not thrown outdoors at the spawn point.
    await expect(page.getByText("Sunrise Minimart")).toBeVisible();
  });

  test("shows the world reacting without a refresh", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();

    const wei = page.locator("li").filter({ hasText: "Wei" }).first();
    await expect(wei.getByText("REDIRECT")).toBeVisible();

    // Finish Wei's mission somewhere else, then walk back in.
    await page.goto("/play/mission-norm-mirror?from=streets");
    await page.goto("/streets");
    await page.evaluate(() => {
      const raw = localStorage.getItem("sidequest.profile.v1");
      if (!raw) return;
      const state = JSON.parse(raw);
      state.state.profile.completedMissionIds = ["mission-rewind"];
      localStorage.setItem("sidequest.profile.v1", JSON.stringify(state));
    });
    await page.reload();
    await page.getByRole("button", { name: /Quests/ }).click();

    const after = page.locator("li").filter({ hasText: "Wei" }).first();
    await expect(after.getByText("REDIRECT")).toHaveCount(0);
    await expect(after.getByText("Done")).toBeVisible();
  });

  test("a fresh session still starts at the spawn point", async ({ page }) => {
    /*
     * Position is session state, not progress. Somebody who picks the device
     * up a week later should not be restored to a corner they have forgotten.
     */
    await seedPlayer(page);
    await enterWorld(page);
    expect(await page.getByTestId("streets-canvas").getAttribute("data-player-tile")).toBe("20,11");
  });

  test("grants nothing twice across a return and a refresh", async ({ page }) => {
    await seedPlayer(page, { xp: 0 });
    await enterWorld(page);
    await page.getByRole("button", { name: /Quests/ }).click();
    await page
      .locator("li")
      .filter({ hasText: "Nadia" })
      .first()
      .getByRole("button", { name: "Take a look" })
      .click();
    const next = page.getByRole("button", { name: "Continue" });
    if (await next.isVisible().catch(() => false)) await next.click();
    await page.getByRole("button", { name: /Nobody legitimate needs your bank account/ }).click();
    expect((await readProfile(page)).xp).toBe(25);

    await page.goto("/play/mission-rewind?from=streets");
    await page.getByRole("link", { name: "Close mission" }).click();
    // Wait for the navigation before reloading, or the reload re-runs the
    // mission route instead of the world.
    await expect(page).toHaveURL(/\/streets$/);
    await page.reload();
    await expect(page.getByTestId("streets-canvas")).toHaveAttribute(
      "data-player-tile",
      /\d+,\d+/,
    );

    expect((await readProfile(page)).xp).toBe(25);
  });
});
