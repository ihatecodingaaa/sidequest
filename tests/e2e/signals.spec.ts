import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile } from "./helpers";

/**
 * Prevention Signals, Threads and the Community Safety Crew.
 *
 * Everything is asserted through the DOM, as everywhere else in this suite.
 * What matters is not that a particular coloured shape is at a particular
 * coordinate, it is that the mode describes a response rather than a person,
 * that the red thread does not pay more than the amber one, that a Solo
 * Preview never claims anybody answered, and that a young person can reach all
 * of it without walking a step.
 */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };

const seedPlayer = (page: Page, extra: Record<string, unknown> = {}) =>
  seedProfile(page, { streetsAvatar: AVATAR, ...extra });

/** Opens the Quest List and takes the shortcut to somebody. */
async function goTo(page: Page, who: string) {
  await page.goto("/streets");
  await page.getByRole("button", { name: /Quests/ }).click();
  await page
    .locator("li")
    .filter({ hasText: who })
    .first()
    .getByRole("button", { name: "Go there" })
    .click();
}

/** A step with one line has nothing to advance. That is correct, not a bug. */
async function advance(page: Page) {
  const next = page.getByRole("button", { name: "Continue" });
  if (await next.isVisible().catch(() => false)) await next.click();
}

/* ------------------------------------------------------------- Signals */

test.describe("a Signal says what a situation needs", () => {
  test("carries its mode as text, not only as a colour", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();

    // The four modes are words in the list, which is the channel that
    // survives a colour vision deficiency and reaches a screen reader.
    await expect(page.getByText("REDIRECT").first()).toBeVisible();
    await expect(page.getByText("CONNECT").first()).toBeVisible();
    await expect(page.getByText("PROTECT").first()).toBeVisible();
    await expect(page.getByText("PREVENT").first()).toBeVisible();
  });

  test("describes the situation rather than the person", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();

    const list = page.getByRole("heading", { name: "Around the block" });
    await expect(list).toBeVisible();

    // The row says what is happening. Nowhere does it rate anybody.
    await expect(page.getByText(/A job offer that wants an account/)).toBeVisible();
    await expect(page.getByText(/suspicious|suspect|dangerous person/i)).toHaveCount(0);
  });

  test("goes out when the situation is resolved", async ({ page }) => {
    /*
     * Nadia's Connect signal is raised by her Street Check. Banking the check
     * resolves the situation, so the marker and the chip both go.
     */
    await seedPlayer(page, { streetChecksDone: ["check-job"] });
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();

    const row = page.locator("li").filter({ hasText: "Nadia" }).first();
    await expect(row.getByText("CONNECT")).toHaveCount(0);
    await expect(row.getByText("Done")).toBeVisible();
  });

  test("keeps exactly one Protect situation on the block", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    // Rarity is the design. A farmable red teaches people to walk towards danger.
    await expect(page.getByText("PROTECT")).toHaveCount(1);
  });
});

/* ------------------------------------------------------- Ambient world */

test.describe("the district is inhabited", () => {
  test("has people who walk somewhere", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    const canvas = page.getByTestId("streets-canvas");
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500);

    const before = await canvas.getAttribute("data-residents");
    expect(before).toBeTruthy();
    expect(before!.split(" ").length).toBeGreaterThan(3);

    await page.waitForTimeout(2500);
    const after = await canvas.getAttribute("data-residents");
    expect(after).not.toBe(before);
  });

  test("does not put a resident on top of somebody you were sent to find", async ({ page }) => {
    await seedPlayer(page);
    await goTo(page, "Devi");
    await page.waitForTimeout(400);
    // Arriving next to a quest giver still offers them, not a passer by.
    await expect(page.getByRole("button", { name: /Talk\s*Devi/ })).toBeEnabled();
  });
});

/* ---------------------------------------------------- Prevention Threads */

test.describe("a thread runs across several people and places", () => {
  test("moves the signal along as steps are banked", async ({ page }) => {
    await seedPlayer(page, { xp: 0 });

    await goTo(page, "Devi");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /^Talk/ }).click();
    await advance(page);
    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.getByText("+30 XP")).toBeVisible();
    await page.getByRole("button", { name: "Back to the block" }).click();

    // The next step belongs to somebody else, in another part of the block.
    await page.getByRole("button", { name: /Quests/ }).click();
    const joy = page.locator("li").filter({ hasText: "Joy" }).first();
    await expect(joy.getByText("CONNECT")).toBeVisible();
    // And Devi no longer carries one, because her step is done.
    const devi = page.locator("li").filter({ hasText: "Devi" }).first();
    await expect(devi.getByText("CONNECT")).toHaveCount(0);
  });

  test("grants each step once and nothing on a replay", async ({ page }) => {
    await seedPlayer(page, { xp: 0 });

    await goTo(page, "Devi");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /^Talk/ }).click();
    await advance(page);
    await page.getByRole("button", { name: "Got it" }).click();
    expect((await readProfile(page)).xp).toBe(30);
    await page.getByRole("button", { name: "Back to the block" }).click();

    await page.getByRole("button", { name: /Quests/ }).click();
    await page.locator("li").filter({ hasText: "Devi" }).first()
      .getByRole("button", { name: /Hear her out/ }).click();
    await advance(page);
    // Her step is banked, so she has nothing to hand over a second time.
    expect((await readProfile(page)).xp).toBe(30);
  });

  test("offers a branch: the trusted adult or the hard conversation", async ({ page }) => {
    await seedPlayer(page, {
      threadSteps: ["thread-favour:step-hear", "thread-favour:step-ask"],
    });
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();

    // Both are live at once. Neither is required to reach the other.
    await expect(
      page.locator("li").filter({ hasText: "Ms Sumi" }).first().getByText("CONNECT"),
    ).toBeVisible();
    await expect(
      page.locator("li").filter({ hasText: "Haziq" }).first().getByText("REDIRECT"),
    ).toBeVisible();
  });

  test("never punishes a choice, and keeps the source one tap away", async ({ page }) => {
    await seedPlayer(page, {
      threadSteps: ["thread-favour:step-hear", "thread-favour:step-ask"],
      xp: 0,
    });
    await goTo(page, "Haziq");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /^Talk/ }).click();
    await advance(page);

    // The least effective option still gets an honest consequence.
    await page.getByRole("button", { name: /Offer to use your own account/ }).click();
    await expect(page.getByText(/Now it is your name on it/)).toBeVisible();
    await expect(page.getByText(/WRONG/i)).toHaveCount(0);
    expect((await readProfile(page)).xp).toBe(30);

    // Detail on request, not four paragraphs by default.
    await expect(page.getByText(/Singapore Police Force youth advisory/)).toHaveCount(0);
    await page.getByRole("button", { name: /Why this/ }).click();
    await expect(page.getByText(/Singapore Police Force youth advisory/)).toBeVisible();
  });
});

/* ------------------------------------------------------ Protect is safe */

test.describe("a Protect situation teaches distance, not heroics", () => {
  const openShout = async (page: Page) => {
    await goTo(page, "Elle");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /^Talk/ }).click();
    await advance(page);
  };

  test("rewards getting the person away and getting help", async ({ page }) => {
    await seedPlayer(page, { threadSteps: ["thread-shout:step-notice"], xp: 0 });
    await openShout(page);

    await page.getByRole("button", { name: /Walk with Elle to the shop/ }).click();
    await expect(page.getByText(/Distance first, then help/)).toBeVisible();
    await expect(page.getByText(/Nothing about this required you to be brave/)).toBeVisible();
  });

  test("is honest about what filming and stepping in actually do", async ({ page }) => {
    await seedPlayer(page, { threadSteps: ["thread-shout:step-notice"], xp: 0 });
    await openShout(page);

    await page.getByRole("button", { name: /Get closer and film it/ }).click();
    await expect(page.getByText(/Filming is not helping/)).toBeVisible();
    // Still no punishment. The consequence is the teaching.
    expect((await readProfile(page)).xp).toBe(30);
  });

  test("pays no more than the amber thread", async ({ page }) => {
    /*
     * The whole incentive test. Whatever pays most is what people go and do,
     * so the most dangerous situation in the district must never be the most
     * rewarding one.
     */
    await seedPlayer(page, { xp: 0 });
    await goTo(page, "Elle");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /^Talk/ }).click();
    await advance(page);
    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.getByText("+30 XP")).toBeVisible();
  });
});

/* --------------------------------------------------- Community Safety Crew */

test.describe("the Crew is a youth crew, not a police force", () => {
  const openHub = async (page: Page) => {
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page.getByRole("button", { name: "Open the Crew board" }).click();
  };

  test("says what it is not, on the board itself", async ({ page }) => {
    await seedPlayer(page);
    await openHub(page);

    await expect(page.getByRole("dialog", { name: "Community Safety Crew board" })).toBeVisible();
    await expect(page.getByText(/Not a police force, and nobody here pretends to be/)).toBeVisible();
    await expect(page.getByText(/Written scenarios, not live incidents/)).toBeVisible();
  });

  test("shows a role read from capabilities, never a rank", async ({ page }) => {
    await seedPlayer(page, { skillPoints: { "peer-intervention": 40, communication: 10 } });
    await openHub(page);
    await page.getByRole("tab", { name: "Your role" }).click();

    // "Ally" appears twice, as the current role and as a row in the standing.
    await expect(page.getByText("Right now you are a")).toBeVisible();
    await expect(page.getByText("Ally", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Roles are what you are like, not what you outrank/)).toBeVisible();
  });

  test("saves a youth-written scenario as a draft and nothing more", async ({ page }) => {
    await seedPlayer(page);
    await openHub(page);
    await page.getByRole("tab", { name: "Build a quest" }).click();

    await expect(page.getByText("Draft, review required")).toBeVisible();
    await page.getByLabel("Call it something").fill("Two people, one bus stop");
    await page.getByLabel("The moment somebody has to choose").fill("Whether to say anything");
    await page.getByRole("button", { name: "Save as draft" }).click();

    await expect(page.getByText(/it stays one until somebody reviews it/)).toBeVisible();
    const profile = await readProfile(page);
    expect((profile.questDrafts as unknown[]).length).toBe(1);
  });

  test("has no axe violations", async ({ page }) => {
    await seedPlayer(page);
    await openHub(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
