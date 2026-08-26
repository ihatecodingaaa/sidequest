import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile, trackConsoleErrors } from "./helpers";

/**
 * The signature experience upgrades.
 *
 * Four mechanics now end in the same grammar: a labelled before state, a
 * connector, a labelled after state. These tests pin the parts of that which
 * are promises rather than styling: both states are readable, the peer reveal
 * never identifies anybody, the reduced-motion path loses no information, and
 * the install invitation stays out of the way until it has a reason.
 */

const CAMPAIGN = "/campaigns/one-bad-minute";
const CAMPAIGN_ID = "campaign-one-bad-minute";

/* -------------------------------------------------------------- Helpers */

/** Runs Crew Shift with `count` players, choosing per-round answers by seat. */
async function playCrewShift(
  page: Page,
  count: number,
  first: (seat: number) => RegExp,
  second: (seat: number) => RegExp,
) {
  await page.getByRole("button", { name: "Start chapter 4" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Setup starts at three.
  for (let i = 3; i < count; i += 1) await page.getByRole("button", { name: "More players" }).click();
  for (let i = 3; i > count; i -= 1) await page.getByRole("button", { name: "Fewer players" }).click();

  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: count > 1 ? "Pass to player 1" : "Your call" }).click();

  for (let seat = 1; seat <= count; seat += 1) {
    if (count > 1) await page.getByRole("button", { name: `I am player ${seat}` }).click();
    await page.getByRole("button", { name: first(seat) }).click();
    await page.getByRole("button", { name: "Lock answer" }).click();
  }

  await page.getByRole("button", { name: count > 1 ? "Talk about it" : "Continue" }).click();
  await page.getByRole("button", { name: /Skip ahead and decide|^Decide$/ }).click();

  for (let seat = 1; seat <= count; seat += 1) {
    if (count > 1) await page.getByRole("button", { name: `I am player ${seat}` }).click();
    await page.getByRole("button", { name: second(seat) }).click();
    await page.getByRole("button", { name: "Lock answer" }).click();
  }
}

const PRIVATE = /One person talks to him alone/;
const ADULT = /Tell someone older/;

/** A campaign that has been played all the way through the finale. */
async function seedFinishedCampaign(page: Page) {
  await seedProfile(page, {
    campaigns: {
      [CAMPAIGN_ID]: {
        campaignId: CAMPAIGN_ID,
        mode: "story",
        routeId: "route-a",
        startedAt: "2026-08-01T10:00:00.000Z",
        unlockedChapterIds: ["obm-c1", "obm-c2", "obm-c3", "obm-c4"],
        completedChapterIds: ["obm-c1", "obm-c2", "obm-c3", "obm-c4"],
        chapterResults: {},
        finaleCompleted: true,
        finaleOptionId: "speak",
        completedAt: "2026-08-01T11:00:00.000Z",
        completedFollowUpIds: [],
        awardedKeys: [],
        demoHoursOffset: 0,
      },
    },
  });
}

/* ------------------------------------------------- Crew Shift peer reveal */

test.describe("Crew Shift makes the peer shift visible", () => {
  test("shows both distributions when the group moves", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    // Three seats start split two-one, then all three land on the same option.
    await playCrewShift(
      page,
      3,
      (seat) => (seat === 3 ? ADULT : PRIVATE),
      () => ADULT,
    );

    await expect(page.getByRole("heading", { name: "Your crew shifted" })).toBeVisible();

    // Both states are labelled and both are on screen at once.
    await expect(page.getByText("Before discussion")).toBeVisible();
    await expect(page.getByText("After discussion")).toBeVisible();

    // The count of changed answers is reported, and it is a count.
    await expect(page.getByText("2 answers changed between the two rounds.")).toBeVisible();

    const result = await readProfile(page);
    expect(result).toBeTruthy();
    expect(errors).toEqual([]);
  });

  test("says so plainly when nobody moves", async ({ page }) => {
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    await playCrewShift(page, 3, () => ADULT, () => ADULT);

    // Holding a position is a result, not a failure, and the copy says so.
    await expect(page.getByRole("heading", { name: "Your crew held its position" })).toBeVisible();
    await expect(page.getByText("All 3 of you answered the same way twice.")).toBeVisible();
    await expect(page.getByText(/Your crew shifted/)).toHaveCount(0);
  });

  test("never names a seat in the reveal", async ({ page }) => {
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    await playCrewShift(
      page,
      3,
      (seat) => (seat === 1 ? PRIVATE : ADULT),
      () => ADULT,
    );

    /*
     * The whole point of the mechanic is that peer influence becomes visible
     * without anybody being pointed at. Seat labels are all over the private
     * rounds and must not survive into the summary.
     */
    const main = page.locator("#main");
    await expect(main.getByText(/Player \d/)).toHaveCount(0);
    await expect(main.getByText(/changed .* mind because/i)).toHaveCount(0);
  });

  test("keeps the numbers readable with motion disabled", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    await playCrewShift(
      page,
      3,
      (seat) => (seat === 3 ? ADULT : PRIVATE),
      () => ADULT,
    );

    // Nothing is revealed by animation, so everything is still here without it.
    await expect(page.getByRole("heading", { name: "Your crew shifted" })).toBeVisible();
    await expect(page.getByText("Before discussion")).toBeVisible();
    await expect(page.getByText("After discussion")).toBeVisible();
    await expect(page.getByText("2 answers changed between the two rounds.")).toBeVisible();
  });

  test("resolves a genuine tie by asking the crew, not by declaration order", async ({ page }) => {
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    // Two seats each way in round two: a real split with no majority.
    await playCrewShift(
      page,
      2,
      () => PRIVATE,
      (seat) => (seat === 1 ? PRIVATE : ADULT),
    );

    await expect(page.getByText("Still split")).toBeVisible();
    await page.getByRole("button", { name: ADULT }).click();
    await expect(page.getByRole("heading", { name: /Your crew/ })).toBeVisible();
  });

  test("has no axe violations at the reveal", async ({ page }) => {
    // The reveal is a screen state rather than a route, so the route-level
    // accessibility suite never reaches it. It is also the densest new UI in
    // this pass, which makes it the one most worth checking.
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    await playCrewShift(
      page,
      3,
      (seat) => (seat === 3 ? ADULT : PRIVATE),
      () => ADULT,
    );
    await expect(page.getByRole("heading", { name: "Your crew shifted" })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test("attributes the outcome to protective factors, without jargon", async ({ page }) => {
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    await playCrewShift(page, 3, () => ADULT, () => ADULT);

    await expect(page.getByRole("heading", { name: "What changed the outcome?" })).toBeVisible();
    await expect(page.getByText("Someone who could actually help was told")).toBeVisible();

    // Mechanism text is internal. It must never reach the screen.
    await expect(page.getByText(/capable guardian/i)).toHaveCount(0);
    await expect(page.getByText(/diffusion of responsibility/i)).toHaveCount(0);
  });
});

/* ------------------------------------------------------ Install invitation */

test.describe("install invitation", () => {
  test("stays hidden until the campaign is finished", async ({ page }) => {
    await seedProfile(page);
    await page.goto(CAMPAIGN);

    // Nothing has happened yet, so there is no honest reason to ask.
    await expect(page.getByRole("heading", { name: "Keep SIDEQUEST" })).toHaveCount(0);
  });

  test("appears after the finale, next to the reason it gives", async ({ page }) => {
    await seedFinishedCampaign(page);
    await page.goto(CAMPAIGN);

    const invite = page.getByRole("heading", { name: "Keep SIDEQUEST" });
    await expect(invite).toBeVisible();
    await expect(page.getByText(/Your next chapter unlocks later/)).toBeVisible();

    // No API in this browser context, so instructions rather than a fake dialog.
    await expect(page.getByText(/Tap the Share button/)).toBeVisible();
  });

  test("stays dismissed", async ({ page }) => {
    await seedFinishedCampaign(page);
    await page.goto(CAMPAIGN);

    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect(page.getByRole("heading", { name: "Keep SIDEQUEST" })).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole("heading", { name: "Keep SIDEQUEST" })).toHaveCount(0);
  });

  test("says nothing when the app is already installed", async ({ page }) => {
    /*
     * Playwright cannot emulate `display-mode`, so the media query itself is
     * stubbed. What is under test is the component's response to a standalone
     * result, not the browser's implementation of the query.
     */
    await page.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (query: string) =>
        query.includes("display-mode")
          ? ({
              matches: true,
              media: query,
              addEventListener() {},
              removeEventListener() {},
              addListener() {},
              removeListener() {},
              onchange: null,
              dispatchEvent: () => false,
            } as unknown as MediaQueryList)
          : real(query);
    });

    await seedFinishedCampaign(page);
    await page.goto(CAMPAIGN);

    await expect(page.getByText(/One week later|Aftermath/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Keep SIDEQUEST" })).toHaveCount(0);
  });

  test("blocks nothing when declined", async ({ page }) => {
    await seedFinishedCampaign(page);
    await page.goto(CAMPAIGN);
    await page.getByRole("button", { name: "Dismiss" }).click();

    // Everything the campaign offers still works without installing.
    await expect(page.getByText(/One week later|Aftermath/).first()).toBeVisible();
    await page.goto("/rewards");
    await expect(page.getByRole("heading", { name: "Rewards" }).first()).toBeVisible();
    await page.goto(`${CAMPAIGN}/impact`);
    await expect(page.locator("#main")).toBeVisible();
  });
});

/* ------------------------------------------------------------- Provenance */

test.describe("provenance is exhaustive on screen", () => {
  test("separates official services from news reporting", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/pulse");

    await expect(page.getByText("Official services")).toBeVisible();
    await expect(page.getByText("News reporting, written by the publisher")).toBeVisible();
  });

  test("declares the feed's own content as prototype material", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/pulse");

    await expect(page.getByText("Prototype content").first()).toBeVisible();
  });
});
