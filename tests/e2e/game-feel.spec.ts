import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { playScene, readProfile, seedProfile } from "./helpers";

/**
 * The game feel pass.
 *
 * Stories are player-paced, the Campaign says where you are, and Echo has a
 * small collection attached to things you actually did. These tests pin the
 * parts that are promises rather than styling.
 */

const CAMPAIGN = "/campaigns/one-bad-minute";
const CAMPAIGN_ID = "campaign-one-bad-minute";

/* ------------------------------------------------------------ StoryBeat */

test.describe("stories are player-paced", () => {
  test("reveals one idea at a time instead of the whole scene", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/play/mission-rewind");
    await page.getByRole("button", { name: "Start" }).click();

    const body = page.locator("#main p, main p");
    const before = await body.count();

    await page.getByRole("button", { name: "Tap to continue" }).click();
    const after = await body.count();

    // The scene grew rather than being replaced: earlier lines stay readable.
    expect(after).toBeGreaterThan(before);
  });

  test("does not show the choices until the scene has finished", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/play/mission-rewind");
    await page.getByRole("button", { name: "Start" }).click();

    /*
     * The whole reason the choices are gated: nobody should be asked a question
     * they have not finished reading. This is also what stops a fast tapper
     * skipping straight past a decision.
     */
    await expect(page.getByRole("button", { name: /Keep watching/ })).toHaveCount(0);
    await playScene(page);
    await expect(page.getByRole("button", { name: /Keep watching/ })).toBeVisible();
  });

  test("advances from the keyboard", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/play/mission-rewind");
    await page.getByRole("button", { name: "Start" }).click();

    const body = page.locator("#main p, main p");
    const before = await body.count();

    await page.locator("body").press("ArrowDown");
    await expect(async () => {
      expect(await body.count()).toBeGreaterThan(before);
    }).toPass();
  });

  test("loses nothing with motion disabled", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedProfile(page);
    await page.goto("/play/mission-rewind");
    await page.getByRole("button", { name: "Start" }).click();

    await playScene(page);

    // Same end state, reached the same way. Nothing is revealed by animation.
    await expect(page.getByRole("button", { name: /Keep watching/ })).toBeVisible();
    await expect(page.getByText(/Wei is holding a pair of earphones/)).toBeVisible();
  });

  test("names the speaker in text, not only by portrait", async ({ page }) => {
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/the-favour`);
    await page.getByRole("button", { name: "Start chapter 1" }).click();

    // One beat in, Ken speaks. Deliberately not `playScene`, which would run
    // straight past the intro and into the mission's own opening screen.
    await page.getByRole("button", { name: "Continue" }).click();

    /*
     * Portraits are decorative and expression never carries an idea on its own,
     * so the speaker has to be readable without either.
     */
    await expect(page.getByText("Ken", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/So\. Random question\./)).toBeVisible();
  });
});

/* -------------------------------------------------- Campaign navigation */

test.describe("the campaign says where you are", () => {
  const seedOneDone = (page: Parameters<typeof seedProfile>[0]) =>
    seedProfile(page, {
      campaigns: {
        [CAMPAIGN_ID]: {
          campaignId: CAMPAIGN_ID,
          mode: "story",
          routeId: "route-a",
          startedAt: "2026-08-01T10:00:00.000Z",
          unlockedChapterIds: ["obm-c1", "obm-c2"],
          completedChapterIds: ["obm-c1"],
          chapterResults: {},
          finaleCompleted: false,
          finaleOptionId: null,
          completedAt: null,
          completedFollowUpIds: [],
          awardedKeys: ["chapter:obm-c1"],
          demoHoursOffset: 0,
        },
      },
    });

  test("puts the next chapter above the map and names it", async ({ page }) => {
    await seedOneDone(page);
    await page.goto(CAMPAIGN);

    await expect(page.getByText("Chapter 2, up next")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Everyone would do it" }).first(),
    ).toBeVisible();
  });

  test("continues to the right chapter", async ({ page }) => {
    await seedOneDone(page);
    await page.goto(CAMPAIGN);

    await page.getByRole("link", { name: /^Continue/ }).click();
    await expect(page).toHaveURL(/chapter\/everyone-would$/);
  });

  test("distinguishes every node state in words, not only by colour", async ({ page }) => {
    await seedOneDone(page);
    await page.goto(CAMPAIGN);

    const main = page.locator("#main");
    await expect(main.getByText("Done").first()).toBeVisible();
    await expect(main.getByText("Up next").first()).toBeVisible();
    await expect(main.getByText("Scan at the station").first()).toBeVisible();
  });

  test("offers the finale once three chapters are done", async ({ page }) => {
    await seedProfile(page, {
      campaigns: {
        [CAMPAIGN_ID]: {
          campaignId: CAMPAIGN_ID,
          mode: "story",
          routeId: "route-a",
          startedAt: "2026-08-01T10:00:00.000Z",
          unlockedChapterIds: ["obm-c1", "obm-c2", "obm-c3", "obm-c4"],
          completedChapterIds: ["obm-c1", "obm-c2", "obm-c3"],
          chapterResults: {},
          finaleCompleted: false,
          finaleOptionId: null,
          completedAt: null,
          completedFollowUpIds: [],
          awardedKeys: [],
          demoHoursOffset: 0,
        },
      },
    });
    await page.goto(CAMPAIGN);

    // Three of four resilience is unchanged, and now it is the primary control.
    await expect(page.getByRole("heading", { name: "The finale" })).toBeVisible();
    await page.getByRole("link", { name: /Play the finale/ }).click();
    await expect(page).toHaveURL(/\/finale$/);
  });

  test("has no axe violations on the map", async ({ page }) => {
    await seedOneDone(page);
    await page.goto(CAMPAIGN);
    await page.waitForSelector("#main");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});

/* -------------------------------------------------------- Echo collection */

test.describe("Echo collection", () => {
  test("starts with one unlocked and the rest legible but locked", async ({ page }) => {
    await seedProfile(page, { completedMissionIds: [] });
    await page.goto("/you");

    // The collection is a grid of tiles now rather than a settings list, so it
    // reports its own count and each tile carries its state in its label.
    await expect(page.getByText("1/5")).toBeVisible();
    // A locked entry says what unlocks it, before you do it.
    await expect(page.getByText("Finish REWIND.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Echo Signal/ })).toBeDisabled();
  });

  test("unlocks deterministically from what was actually done", async ({ page }) => {
    await seedProfile(page, { completedMissionIds: ["mission-rewind"] });
    await page.goto("/you");

    await expect(page.getByText("2/5")).toBeVisible();
    await expect(page.getByRole("button", { name: /Echo Signal/ })).toBeEnabled();
  });

  test("remembers the selection", async ({ page }) => {
    await seedProfile(page, { completedMissionIds: ["mission-rewind"] });
    await page.goto("/you");

    await page.getByRole("button", { name: /Echo Signal/ }).click();
    await expect(page.getByRole("button", { name: /Echo Signal/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect((await readProfile(page)).echoStyleId).toBe("signal");

    await page.reload();
    await expect(page.getByRole("button", { name: /Echo Signal/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("cannot select a locked style, even if storage claims one", async ({ page }) => {
    // Availability is derived from progress, so a hand-edited selection is
    // ignored rather than honoured.
    await seedProfile(page, { completedMissionIds: [], echoStyleId: "architect" });
    await page.goto("/you");

    await expect(page.getByRole("button", { name: /Echo Core/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: /Echo Architect/ })).toBeDisabled();
  });

  test("is cleared by a demo reset", async ({ page }) => {
    await seedProfile(page, { completedMissionIds: ["mission-rewind"], echoStyleId: "signal" });
    await page.goto("/settings");
    await page.getByRole("button", { name: "Reset demo" }).click();
    await page.getByRole("button", { name: /Reset everything|Yes, reset/ }).click();

    await expect(page.getByRole("heading", { name: /SIDEQUEST/ }).first()).toBeVisible();
    const profile = await readProfile(page);
    expect(profile.echoStyleId ?? "core").toBe("core");
  });
});

/* ------------------------------------------------------ Mascot and reward */

test.describe("Echo is visible as a character", () => {
  test("appears on the campaign screen, wearing the equipped style", async ({ page }) => {
    await seedProfile(page, { completedMissionIds: ["mission-rewind"], echoStyleId: "signal" });
    await page.goto(CAMPAIGN);

    /*
     * The mascot is decorative wherever it speaks, because the line beside it
     * says the thing. What is asserted here is that it is actually rendered:
     * the previous version of this feature worked and was invisible, which is
     * the failure this pass exists to fix.
     */
    const echo = page.locator("#main svg").first();
    await expect(echo).toBeVisible();
    const box = await echo.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(28);
  });

  test("never appears on Safe", async ({ page }) => {
    await seedProfile(page, { completedMissionIds: ["mission-rewind"] });
    await page.goto("/safe");

    // Safe is exempt from every part of the delight layer, permanently.
    await expect(page.getByText(/Echo/)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();
  });
});

test.describe("completion is reward-first", () => {
  /** Plays REWIND end to end. It is the mission that grants Echo Signal. */
  async function finishRewind(page: Parameters<typeof seedProfile>[0]) {
    await page.goto("/play/mission-rewind");
    await page.getByRole("button", { name: "Start" }).click();
    await playScene(page);
    await page.getByRole("button", { name: "Keep watching" }).click();
    await playScene(page);
    await page.getByRole("button", { name: /Say nothing and look away/ }).click();
    await playScene(page);
    await page.getByRole("button", { name: "Two weeks later" }).click();
    await page.getByRole("button", { name: /Rewind to the decision/ }).click();
    await playScene(page);
    await page.getByRole("button", { name: /say something only he can hear/ }).click();
    await playScene(page);
    await page.getByRole("button", { name: "Leave it there" }).click();
    await page.getByRole("button", { name: "Compare the two runs" }).click();
    await page.getByRole("button", { name: "What this trains" }).click();
    await page.getByRole("button", { name: "Finish mission" }).click();
  }

  test("announces a new Echo and lets it be worn on the spot", async ({ page }) => {
    await seedProfile(page, { xp: 0, completedMissionIds: [] });
    await finishRewind(page);

    await expect(page.getByText("New Echo unlocked")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Echo Signal" })).toBeVisible();

    // Equipping happens here. Sending somebody elsewhere to wear the thing they
    // just earned is how the moment gets lost.
    await page.getByRole("button", { name: "Wear it" }).click();
    await expect(page.getByRole("button", { name: /Wearing it/ })).toBeVisible();
    expect((await readProfile(page)).echoStyleId).toBe("signal");
  });

  test("puts the reward before the passport detail", async ({ page }) => {
    await seedProfile(page, { xp: 0, completedMissionIds: [] });
    await finishRewind(page);

    /*
     * Order is the point. The screen used to spend four of its first five
     * elements on numbers about the player, which is a report rather than a
     * reward. The passport data is still here and still useful; it is just no
     * longer second.
     */
    const unlockY = (await page.getByText("New Echo unlocked").boundingBox())?.y ?? 0;
    const passport = page.getByRole("button", { name: /What this added to your passport/ });
    const passportY = (await passport.boundingBox())?.y ?? 0;

    expect(unlockY).toBeGreaterThan(0);
    expect(passportY).toBeGreaterThan(unlockY);

    // Collapsed by default, and still reachable.
    await expect(passport).toHaveAttribute("aria-expanded", "false");
    await passport.click();
    await expect(page.getByText("Decision Making")).toBeVisible();
  });

  test("does not re-announce an unlock on a replay", async ({ page }) => {
    await seedProfile(page, { xp: 200, completedMissionIds: ["mission-rewind"] });
    await finishRewind(page);

    await expect(page.getByText("Already counted. Replays do not add XP.")).toBeVisible();
    await expect(page.getByText("New Echo unlocked")).toHaveCount(0);
  });
});

/*
 * The mission worlds.
 *
 * These are decorative by design, so nothing here can be asserted through the
 * accessibility tree. That is exactly why they need covering another way: the
 * failure that matters is a mission rendering somebody else's scene, and every
 * existing test would stay green through it.
 */
test.describe("hero missions carry their own world", () => {
  const HERO = [
    { path: "/missions/mission-rewind", world: "rewind" },
    { path: "/missions/mission-norm-mirror", world: "norm-mirror" },
    { path: "/missions/mission-breaksafe", world: "breaksafe" },
  ];

  for (const { path, world } of HERO) {
    test(`${world} appears on its own discovery surface and no other does`, async ({ page }) => {
      await seedProfile(page);
      await page.goto(path);

      await expect(page.locator(`[data-mission-world="${world}"]`).first()).toBeAttached();

      for (const other of HERO.filter((entry) => entry.world !== world)) {
        await expect(page.locator(`[data-mission-world="${other.world}"]`)).toHaveCount(0);
      }
    });
  }

  test("the worlds stay decorative, so they never shadow the mission title", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/missions");

    const worlds = page.locator("[data-mission-world]");
    expect(await worlds.count()).toBeGreaterThan(0);

    for (const handle of await worlds.all()) {
      await expect(handle).toHaveAttribute("aria-hidden", "true");
    }

    // The title is the thing that names the mission, not the drawing.
    await expect(page.getByRole("link", { name: /REWIND/ }).first()).toBeVisible();
  });
});
