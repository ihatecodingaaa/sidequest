import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile } from "./helpers";

/**
 * One product, not six features.
 *
 * ---
 *
 * P1 asked why somebody would come back tomorrow, and answered it with
 * continuity rather than pressure. These check the answer is real on screen:
 * a returning player is offered where they were, a crew is worth opening
 * alone, Updates admits which half of itself is fiction, You is somewhere you
 * own, and a small collection exists without becoming an economy.
 */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };

const seedPlayer = (page: Page, extra: Record<string, unknown> = {}) =>
  seedProfile(page, { streetsAvatar: AVATAR, ...extra });

/* ------------------------------------------------------- Returning player */

test.describe("coming back", () => {
  test("a first-time visitor is not told where they were", async ({ page }) => {
    /*
     * The failure that would matter most: telling somebody they have
     * unfinished business in a place they have never been.
     */
    await seedPlayer(page, { xp: 0, completedMissionIds: [], crewId: null });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Where you were" })).toHaveCount(0);
    await expect(page.getByText("SIDEQUEST Streets")).toBeVisible();
  });

  test("somebody with history is offered the thing they stopped in the middle of", async ({
    page,
  }) => {
    await seedPlayer(page, { xp: 260, metNpcs: ["npc-wei"] });
    await page.goto("/");

    const card = page.getByRole("region", { name: "Where you were" });
    await expect(card).toBeVisible();
    await expect(card.getByText(/Wei is still waiting/)).toBeVisible();

    await card.getByRole("link", { name: /Go back/ }).click();
    await expect(page).toHaveURL(/\/streets/);
  });

  test("never shows a streak, a day count or anything that expires", async ({ page }) => {
    await seedPlayer(page, { xp: 400, streakDays: 4, metNpcs: ["npc-wei"] });
    await page.goto("/");
    const body = (await page.locator("body").innerText()).toLowerCase();
    for (const word of ["day streak", "daily", "expires", "before midnight", "don't lose"]) {
      expect(body, `home says "${word}"`).not.toContain(word);
    }
  });
});

/* --------------------------------------------------------------- The crew */

test.describe("crew is worth opening on your own", () => {
  test("leads with what we are doing, not with a score", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/crew");

    await expect(
      page.getByRole("heading", { name: "What we are doing together" }),
    ).toBeVisible();

    /*
     * No league table, and no points column ranking four friends.
     *
     * Scoped to the member list rather than the page, because the app shell
     * header carries the reader's own XP on every screen and that is theirs to
     * see. What must not exist is a number next to somebody else's name.
     */
    await expect(page.getByText("This week", { exact: true })).toHaveCount(0);
    const members = page.getByRole("list").filter({ hasText: "Danish" });
    await expect(members.getByText(/\d/)).toHaveCount(0);
  });

  test("reads your own contribution from your own progress", async ({ page }) => {
    /*
     * The replacement for a progress bar whose number lived in a data file.
     * Doing the thing has to change what the screen says.
     */
    await seedPlayer(page, { completedMissionIds: ["mission-breaksafe"] });
    await page.goto("/crew");

    /*
     * A finished challenge drops out of the lead slot and into the compact
     * rows, saying so in the reader's own terms. The lead becomes the first
     * one still waiting on them, so the screen changes shape as they work
     * through it rather than showing four identical cards forever.
     */
    await expect(page.getByText("You have done your part.").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Split the favour between you" }),
    ).toBeVisible();
  });

  test("says which half of the screen is prototype content", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/crew");
    await expect(page.getByText(/[Pp]rototype/).first()).toBeVisible();
    await expect(page.getByText(/no account system and no server/)).toBeVisible();
  });

  test("lets a crew own a banner, and locks the patterns it has not earned", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/crew");

    await page.getByRole("button", { name: "Change the banner" }).click();
    const sheet = page.getByRole("dialog", { name: "Crew banner" });
    await expect(sheet).toBeVisible();

    /* Locked patterns are visible and say what earns them, never hidden. */
    await expect(sheet.getByRole("button", { name: /locked/ }).first()).toBeDisabled();
    await expect(page.getByText(/comes from/).first()).toBeVisible();

    await sheet.getByRole("button", { name: "Ring" }).click();
    await sheet.getByRole("button", { name: "Save" }).click();
    await expect(sheet).toHaveCount(0);

    const profile = await readProfile(page);
    expect((profile.crewBanner as Record<string, string>).emblem).toBe("ring");
  });
});

/* ------------------------------------------------------------- Updates */

test.describe("updates belongs to the product", () => {
  test("offers a fictional version of the theme, never a replay of the report", async ({
    page,
  }) => {
    await seedPlayer(page);
    await page.goto("/pulse");

    await expect(page.getByText(/This is about/).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Practise a fictional version/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Not a recreation of the report above/).first(),
    ).toBeVisible();
  });

  test("keeps the source link and the provenance intact", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/pulse/pulse-job-scams");

    const source = page.getByRole("link", { name: /Read the official advisories/ });
    await expect(source).toHaveAttribute("href", "https://www.police.gov.sg/Advisories");
    await expect(source).toHaveAttribute("rel", /noopener/);

    await page.getByRole("link", { name: /Practise a fictional version/ }).click();
    await expect(page).toHaveURL(/\/missions\/mission-job-scam$/);
  });
});

/* ------------------------------------------------------ Stickers and You */

test.describe("a collection without an economy", () => {
  test("shows every sticker, earned or not, with what earns it", async ({ page }) => {
    await seedPlayer(page, { crewId: null });
    await page.goto("/you");

    await expect(page.getByRole("heading", { name: "Your district" })).toBeVisible();
    await expect(
      page.getByText("Nothing yet. These come from being places, not from finishing things."),
    ).toBeVisible();

    /* Locked stickers are named and explained, never a silhouette. */
    const locked = page.getByRole("button", { name: /Court Side\. Not yet\./ });
    await expect(locked).toBeVisible();
    await locked.click();
    await expect(page.getByText("Three things happen at the court.")).toBeVisible();
  });

  test("lets you pin one to your corner, and pays nothing for it", async ({ page }) => {
    await seedPlayer(page, { metNpcs: ["npc-wei"], xp: 120 });
    await page.goto("/you");

    await page.getByRole("button", { name: /First Light\. Earned\./ }).click();
    await page.getByRole("button", { name: "Put it on your corner" }).click();
    await expect(page.getByRole("button", { name: "On your corner" })).toBeVisible();

    const profile = await readProfile(page);
    expect(profile.pinnedSticker).toBe("sticker-first-light");
    expect(profile.xp, "pinning paid XP").toBe(120);
  });

  test("has no rarity tier, no price and nothing that runs out", async ({ page }) => {
    /*
     * Read from the stickers themselves rather than from the page text. The
     * page says "there are no rare ones" in plain words, which a substring
     * scan of the body would flag as a rarity tier, so the assertion looks at
     * what each sticker is actually labelled.
     */
    await seedPlayer(page, { metNpcs: ["npc-wei"] });
    await page.goto("/you");

    /*
     * Wait for the collection to actually be there before reading it.
     *
     * `evaluateAll` is a one-shot snapshot with no auto-waiting, so without
     * this it can run against an unhydrated page, come back with zero buttons,
     * and fail on the length assertion under parallel load while passing
     * whenever the suite is run alone. That is a flaky test, not a flaky
     * product.
     */
    const collection = page.getByRole("button", { name: /Earned\.|Not yet\./ });
    await expect(collection.first()).toBeVisible();

    const labels = await collection.evaluateAll((nodes) =>
      nodes.map((node) => (node.getAttribute("aria-label") ?? "").toLowerCase()),
    );
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      for (const word of ["rare", "epic", "legendary", "uncommon", "limited", "buy", "coins"]) {
        expect(label, `a sticker is labelled "${word}"`).not.toContain(word);
      }
    }
  });

  test("keeps identity above the numbers, with the collection between", async ({ page }) => {
    await seedPlayer(page, { xp: 400, metNpcs: ["npc-wei"] });
    await page.goto("/you");

    const corner = await page.getByText("Your corner").boundingBox();
    const stickers = await page
      .getByRole("heading", { name: "Your district" })
      .boundingBox();
    const memories = await page
      .getByRole("heading", { name: "District memories" })
      .boundingBox();
    const xp = await page.getByText("XP", { exact: true }).first().boundingBox();
    const passport = await page
      .getByRole("heading", { name: "Safety Passport" })
      .boundingBox();

    expect(corner!.y).toBeLessThan(stickers!.y);
    expect(stickers!.y).toBeLessThan(memories!.y);
    expect(memories!.y).toBeLessThan(xp!.y);
    /* The passport is still here, and still substantive. */
    expect(passport).not.toBeNull();
  });
});

/* -------------------------------------------------------------- Tracking */

test.describe("the journal points at the world", () => {
  test("shows me where somebody is, in words and on the map", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/missions");

    await page.getByRole("link", { name: "Show me where" }).first().click();
    await expect(page).toHaveURL(/\/streets\?track=npc-/);
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await page.getByRole("button", { name: "Keep it quiet" }).click();

    /* Named in real text, because a ring four pixels wide cannot be the carrier. */
    await expect(page.getByText(/^Following /)).toBeVisible();

    await page.getByRole("button", { name: /Stop following/ }).click();
    await expect(page.getByText(/^Following /)).toHaveCount(0);
  });
});

/* ------------------------------------------------------------------ Safe */

test.describe("safe is untouched", () => {
  test("has no sticker, no crew, no echo and nothing playful", async ({ page }) => {
    await seedPlayer(page, { metNpcs: ["npc-wei"], pinnedSticker: "sticker-first-light" });
    await page.goto("/safe");

    const body = (await page.locator("body").innerText()).toLowerCase();
    for (const word of ["sticker", "crew challenge", "echo", "banner", "your district"]) {
      expect(body, `safe mentions "${word}"`).not.toContain(word);
    }
  });
});
