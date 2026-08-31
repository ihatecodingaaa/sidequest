import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile } from "./helpers";

/**
 * The zero-keyboard journey.
 *
 * ---
 *
 * ## What this pins
 *
 * Real testers said "there is too much typing" and "typing answers feels
 * tedious". The product answer was: for normal gameplay, required keyboard
 * input is zero. This is the regression test for that promise, and it is
 * written so that it cannot pass by accident.
 *
 * Every spec in here goes through `tapOnly`, which replaces `page.fill`,
 * `page.type`, `keyboard.type` and `keyboard.insertText` with functions that
 * throw. A future author who reaches for one of them inside these tests gets a
 * failure naming the rule rather than a quietly weakened suite. Arrow keys are
 * left alone, because walking a character around a world with the arrow keys is
 * a pointer alternative rather than typing, and the accessibility rule this
 * product keeps is that keyboard navigation always works even though keyboard
 * *entry* is never required.
 *
 * ## What it deliberately does not cover
 *
 * Settings, onboarding names, and station or crew codes. Those are the three
 * documented exceptions in `docs/INTERACTION_FIRST_RESEARCH.md`: none of them
 * is on the path a player has to walk, and each has a tap path beside it.
 */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };

const seedPlayer = (page: Page, extra: Record<string, unknown> = {}) =>
  seedProfile(page, { streetsAvatar: AVATAR, ...extra });

/**
 * Removes every text-entry route from the page object.
 *
 * The point is not defence against a malicious author. It is that "we did not
 * type anything" is otherwise an unenforceable claim about a test, and a claim
 * nobody can check is one that stops being true within two commits.
 */
function tapOnly(page: Page): void {
  const banned = (name: string) => () => {
    throw new Error(
      `${name}() is not allowed in the no-keyboard suite. Normal gameplay must be completable by tapping.`,
    );
  };

  const target = page as unknown as Record<string, unknown>;
  target.fill = banned("page.fill");
  target.type = banned("page.type");

  const keyboard = page.keyboard as unknown as Record<string, unknown>;
  keyboard.type = banned("keyboard.type");
  keyboard.insertText = banned("keyboard.insertText");
}

test.beforeEach(async ({ page }) => {
  tapOnly(page);
});

/*
 * Rows are matched on a name anchored to the start of the row.
 *
 * A row's text begins with the person's name, and an unanchored substring
 * match picks up any other row whose dialogue happens to mention them. Kai
 * opens with "You talked to Lek", so `hasText: "Lek"` resolved to Kai's row
 * and then waited forever for a button that was never going to be in it.
 */

/** Opens the world by the list rather than by walking. Both are pointer only. */
async function openQuests(page: Page) {
  await page.goto("/streets");
  await expect(page.getByTestId("streets-canvas")).toBeVisible();
  await page.getByRole("button", { name: /Quests/ }).click();
}

/** Presses Continue if the sheet is still revealing lines. */
async function advance(page: Page, times = 3) {
  for (let i = 0; i < times; i += 1) {
    const next = page.getByRole("button", { name: "Continue" });
    if (!(await next.isVisible().catch(() => false))) return;
    await next.click();
  }
}

/* ------------------------------------------------------------ The journey */

test.describe("a whole session without the keyboard", () => {
  test("enter Streets, find a Signal, talk, complete a check, bank progress", async ({ page }) => {
    await seedPlayer(page, { xp: 0 });
    await openQuests(page);

    /* A Signal is legible in the list, with its mode in words, not colour. */
    await expect(page.getByRole("heading", { name: "Around the block" })).toBeVisible();

    await page
      .locator("li")
      .filter({ hasText: /^Nadia/ })
      .first()
      .getByRole("button", { name: "Take a look" })
      .click();

    await advance(page);
    await page.getByRole("button", { name: /Nobody legitimate needs your bank account/ }).click();

    /* Option-specific consequence, then one takeaway, then the way out. */
    await expect(page.getByText(/no company she can look up/)).toBeVisible();
    await expect(page.getByText("+25 XP")).toBeVisible();
    await page.getByRole("button", { name: "Back to the block" }).click();

    expect((await readProfile(page)).xp).toBe(25);
  });

  test("plays a whole Prevention Thread across three mechanics", async ({ page }) => {
    /*
     * The interaction-variety proof, walked end to end.
     *
     * Mira is a conversation, Lek is a hotspot, Kai is a choice. If a future
     * change collapses those back into three identical choice lists, this test
     * still passes but the one below it, which asserts the mechanics exist,
     * does not.
     */
    await seedPlayer(page, { xp: 0 });

    /* Step one: somebody tells you something. */
    await openQuests(page);
    await page
      .locator("li")
      .filter({ hasText: /^Mira/ })
      .first()
      .getByRole("button", { name: /Hear her out/ })
      .click();
    await advance(page);
    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.getByText("+30 XP")).toBeVisible();
    await page.getByRole("button", { name: "Back to the block" }).click();

    /* Step two: the hotspot. Tap the place, not the person. */
    await openQuests(page);
    await page
      .locator("li")
      .filter({ hasText: /^Lek/ })
      .first()
      .getByRole("button", { name: /Take a look/ })
      .click();
    await advance(page);

    await expect(page.getByRole("button", { name: /Find 3 more/ })).toBeDisabled();
    for (const spot of [
      /The stack in front of the counter/,
      /The self checkout bank/,
      /The checkout screen/,
    ]) {
      await page.getByRole("button", { name: spot }).click();
    }
    /* A decoy is tappable and says why it is not the answer. */
    await page.getByRole("button", { name: /The camera/ }).click();
    await expect(page.getByText(/records what already happened/)).toBeVisible();

    await page.getByRole("button", { name: "Say what you found" }).click();
    await expect(page.getByText(/none of them is a person/)).toBeVisible();
    await page.getByRole("button", { name: "Back to the block" }).click();

    /* Step three: the conversation the thread was walking towards. */
    await openQuests(page);
    await page
      .locator("li")
      .filter({ hasText: /^Kai/ })
      .first()
      .getByRole("button", { name: /Say something/ })
      .click();
    await advance(page);
    await page.getByRole("button", { name: /Tell him what it means for you too/ }).click();

    await expect(page.getByText(/enough to be liable/)).toBeVisible();
    await expect(page.getByText(/Change the shop and talk to the friend/)).toBeVisible();

    /*
     * The if-then plan, which is the one mechanic here with evidence for
     * carry-over outside the app. A choice card supplies a response inside a
     * fictional situation; the cue is the half the player has to supply, so it
     * is a tap rather than a paragraph they read.
     */
    await expect(page.getByText("When would this actually come up for you?")).toBeVisible();
    await page.getByRole("button", { name: /A friend does it while I am standing there/ }).click();
    await expect(page.getByText("Your plan")).toBeVisible();
    await expect(page.getByText(/a friend does it while I am standing there/)).toBeVisible();
    await expect(page.getByText(/tell him what it means for you too/)).toBeVisible();

    const profile = await readProfile(page);
    expect(profile.xp).toBe(90);
    expect(profile.threadSteps).toEqual(
      expect.arrayContaining([
        "thread-last-two:step-notice",
        "thread-last-two:step-shopfloor",
        "thread-last-two:step-say",
      ]),
    );
  });

  test("puts an ordering step in sequence by tapping", async ({ page }) => {
    /*
     * The Shout's takeaway is a sequence, so the sequence is the interaction.
     * Placing is a tap, never a drag: a drag is unavailable to a keyboard user
     * and unreliable for anybody with a motor impairment, and this product's
     * rule is that every interaction has a non-drag path.
     */
    await seedPlayer(page, {
      xp: 0,
      threadSteps: ["thread-shout:step-notice", "thread-shout:step-act"],
    });

    await openQuests(page);
    await page
      .locator("li")
      .filter({ hasText: /^Hana/ })
      .first()
      .getByRole("button", { name: "Talk to her" })
      .click();
    await advance(page);

    await expect(page.getByRole("button", { name: /Place 3 more/ })).toBeDisabled();
    await page.getByRole("button", { name: /Get distance, and take them with you/ }).click();
    await page.getByRole("button", { name: /Check they are okay/ }).click();
    await page.getByRole("button", { name: /Tell someone whose job it is/ }).click();

    await page.getByRole("button", { name: "That is the order" }).click();
    await expect(page.getByText(/That is the order\./)).toBeVisible();
    expect((await readProfile(page)).xp).toBe(30);
  });
});

/* ----------------------------------------------------- Quick Quest Builder */

test.describe("a youth can create a quest draft without typing", () => {
  const openBuilder = async (page: Page) => {
    await openQuests(page);
    /* A `hub` NPC opens the Crew board straight from the list. */
    await page.getByRole("button", { name: "Open the Crew board" }).click();
    await page.getByRole("tab", { name: "Build a quest" }).click();
  };

  test("four taps produce a saved, structured draft", async ({ page }) => {
    await seedPlayer(page);
    await openBuilder(page);

    await expect(page.getByRole("heading", { name: "Where does it happen?" })).toBeVisible();
    await page.getByRole("button", { name: "Minimart" }).click();

    await expect(page.getByRole("heading", { name: "What starts the moment?" })).toBeVisible();
    await page.getByRole("button", { name: "A dare" }).click();

    await expect(page.getByRole("heading", { name: "What decision matters?" })).toBeVisible();
    await page.getByRole("button", { name: "Say something privately" }).click();

    await expect(page.getByRole("heading", { name: "What could change the outcome?" })).toBeVisible();
    await page
      .getByRole("button", { name: /There was a way out that cost nothing/ })
      .click();

    /* The preview, assembled deterministically and labelled as such. */
    await expect(page.getByRole("heading", { name: "The dare at the minimart" })).toBeVisible();
    await expect(page.getByText(/because everyone is watching/)).toBeVisible();
    await expect(page.getByText(/Do you go along, walk away, or say something privately\?/)).toBeVisible();
    await expect(page.getByText(/No AI wrote this/)).toBeVisible();

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Saved as a draft")).toBeVisible();

    /* The structured choices are what is stored, not only the prose. */
    const drafts = (await readProfile(page)).questDrafts as Record<string, unknown>[];
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toMatchObject({
      title: "The dare at the minimart",
      settingId: "minimart",
      triggerId: "dare",
      decisionId: "say-privately",
      factorId: "face-saving-exit",
      source: "builder",
    });
    expect(drafts[0].customDetail).toBeUndefined();
  });

  test("Something else opens more options, never a text box", async ({ page }) => {
    /*
     * An "Other" that drops the player into free text is the old four-textarea
     * form wearing a different label, and it would arrive at exactly the moment
     * somebody has told us none of the offered answers fit.
     */
    await seedPlayer(page);
    await openBuilder(page);

    await page.getByRole("button", { name: "Somewhere else" }).click();
    await expect(page.locator("input, textarea")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "A part-time job" })).toBeVisible();
    await page.getByRole("button", { name: "Somewhere online" }).click();

    await expect(page.getByRole("heading", { name: "What starts the moment?" })).toBeVisible();
  });

  test("keeps the keyboard behind a deliberate second tap", async ({ page }) => {
    await seedPlayer(page);
    await openBuilder(page);

    await page.getByRole("button", { name: "School" }).click();
    await page.getByRole("button", { name: "Quick money" }).click();
    await page.getByRole("button", { name: "Walk away" }).click();
    await page.getByRole("button", { name: /Someone who could actually help was told/ }).click();

    /* Nothing that opens a keyboard exists until it is asked for. */
    await expect(page.locator("input, textarea")).toHaveCount(0);

    await page.getByRole("button", { name: "Add my own detail" }).click();
    await expect(page.locator("input[data-input-role='optional-creator']")).toHaveCount(2);
    await expect(page.getByText(/The draft above is already complete/)).toBeVisible();
  });
});

/* ------------------------------------------------- The Partner Challenge */

test.describe("the build mission is three taps, not a blank box", () => {
  test("composes and submits an entry without typing", async ({ page }) => {
    await seedPlayer(page, { xp: 0 });
    await page.goto("/play/mission-partner-selfcheckout");

    await page.getByRole("button", { name: "Design your answer" }).click();

    await expect(page.getByRole("heading", { name: "What is going wrong?" })).toBeVisible();
    await page.getByRole("button", { name: /You cannot tell if it scanned/ }).click();

    await expect(page.getByRole("heading", { name: "What would you change?" })).toBeVisible();
    await page.getByRole("button", { name: /Show the basket like a receipt/ }).click();

    await expect(page.getByRole("heading", { name: /Which idea is it leaning on\?/ })).toBeVisible();
    await page.getByRole("button", { name: /Make the state visible/ }).click();

    await expect(page.getByText(/No AI wrote this/)).toBeVisible();
    await expect(page.locator("input, textarea")).toHaveCount(0);

    await page.getByRole("button", { name: "Submit your entry" }).click();

    const profile = await readProfile(page);
    const submissions = profile.submissions as Record<string, unknown>[];
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      title: "Show the basket like a receipt",
      principleId: "principle-visible",
      problemId: "problem-unsure",
      moveId: "move-receipt",
    });
    expect(profile.completedMissionIds).toContain("mission-partner-selfcheckout");
  });
});

/* ----------------------------------------------------------------- Crew */

test.describe("joining a crew is a tap", () => {
  test("the seeded crews are buttons, not a code to copy out", async ({ page }) => {
    /*
     * This screen used to print the crew codes as text next to a box you had
     * to type one into, which is a keyboard requirement with the answer
     * underneath it.
     */
    await seedPlayer(page);
    await page.goto("/crew");

    await page.getByRole("button", { name: /Northline/ }).click();
    await expect(page.getByRole("button", { name: /Northline/ })).toBeDisabled();
    expect((await readProfile(page)).crewId).toBe("crew-northline");
  });
});

/* ------------------------------------------------------------- Geometry */

/**
 * The new surfaces at every width the product claims to support.
 *
 * A choice list is the most repeated interaction in the product, and a hotspot
 * scene is the first thing here that is positioned by percentage inside a
 * fixed-ratio box, which is exactly the construction that survives one viewport
 * and breaks on the next. Both are checked at the six widths rather than at the
 * two the rest of the suite runs.
 */
const WIDTHS = [
  { name: "390 phone", width: 390, height: 844 },
  { name: "430 phone", width: 430, height: 932 },
  { name: "small landscape", width: 667, height: 375 },
  { name: "large landscape", width: 926, height: 428 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 },
];

const overflows = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );

for (const size of WIDTHS) {
  test.describe(`at ${size.name}`, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    test("the quest builder lays out without sideways scroll", async ({ page }) => {
      await seedPlayer(page);
      await openQuests(page);
      await page.getByRole("button", { name: "Open the Crew board" }).click();
      await page.getByRole("tab", { name: "Build a quest" }).click();

      await expect(page.getByRole("heading", { name: "Where does it happen?" })).toBeVisible();
      expect(await overflows(page), `${size.name} builder`).toBe(false);

      await page.getByRole("button", { name: "Minimart" }).click();
      await page.getByRole("button", { name: "A dare" }).click();
      await page.getByRole("button", { name: "Say something privately" }).click();
      await page.getByRole("button", { name: /There was a way out that cost nothing/ }).click();

      await expect(page.getByRole("heading", { name: "The dare at the minimart" })).toBeVisible();
      expect(await overflows(page), `${size.name} preview`).toBe(false);
    });

    test("the hotspot scene keeps every spot inside its box", async ({ page }) => {
      await seedPlayer(page, { threadSteps: ["thread-last-two:step-notice"] });
      await openQuests(page);
      await page
        .locator("li")
        .filter({ hasText: /^Lek/ })
        .first()
        .getByRole("button", { name: /Take a look/ })
        .click();
      await advance(page);

      const scene = page.getByRole("group", { name: "Find what makes it easy" });
      await expect(scene).toBeVisible();
      const box = (await scene.boundingBox())!;

      /*
       * Percentage-positioned markers inside a fixed-ratio box. A marker whose
       * centre lands outside the scene is a marker pointing at nothing, and it
       * is invisible to a test that only checks the page does not scroll.
       */
      for (const label of [
        /The stack in front of the counter/,
        /The self checkout bank/,
        /The checkout screen/,
        /The camera/,
        /The warning poster/,
      ]) {
        const spot = (await page.getByRole("button", { name: label }).boundingBox())!;
        const cx = spot.x + spot.width / 2;
        const cy = spot.y + spot.height / 2;
        expect(cx, `${size.name} ${label}`).toBeGreaterThanOrEqual(box.x);
        expect(cx, `${size.name} ${label}`).toBeLessThanOrEqual(box.x + box.width);
        expect(cy, `${size.name} ${label}`).toBeGreaterThanOrEqual(box.y);
        expect(cy, `${size.name} ${label}`).toBeLessThanOrEqual(box.y + box.height);
        /* And still a real touch target at every width. */
        expect(spot.width, `${size.name} ${label} width`).toBeGreaterThanOrEqual(40);
        expect(spot.height, `${size.name} ${label} height`).toBeGreaterThanOrEqual(40);
      }

      expect(await overflows(page), `${size.name} hotspot`).toBe(false);
    });
  });
}
