import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile, trackConsoleErrors } from "./helpers";

const SLUG = "one-bad-minute";
const CAMPAIGN_ID = "campaign-one-bad-minute";
const CAMPAIGN = `/campaigns/${SLUG}`;

async function readCampaign(page: Page) {
  const profile = await readProfile(page);
  const campaigns = profile.campaigns as Record<string, Record<string, unknown>> | undefined;
  return campaigns?.[CAMPAIGN_ID];
}

/** Plays the Crew Shift chapter solo, which is the shortest full chapter. */
async function playCrewShiftSolo(page: Page) {
  await page.getByRole("button", { name: "Start chapter 4" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Fewer players" }).click();
  await page.getByRole("button", { name: "Fewer players" }).click();
  await expect(page.getByText("Solo. You can still play it through.")).toBeVisible();

  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Your call" }).click();
  await page.getByRole("button", { name: /One person talks to him alone/ }).click();
  await page.getByRole("button", { name: "Lock answer" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Decide" }).click();
  await page.getByRole("button", { name: /Tell someone older/ }).click();
  await page.getByRole("button", { name: "Finish chapter" }).click();
}

/** Norm Mirror, the quickest of the reused mechanics. */
async function playNormMirror(page: Page) {
  await page.getByRole("button", { name: "Start chapter 2" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Start" }).click();

  for (let i = 0; i < 3; i += 1) {
    await page.getByRole("slider").fill("70");
    await page.getByRole("button", { name: /Lock in 70%/ }).click();
    await page.getByRole("button", { name: /Most people would|I'd|I wouldn't/ }).first().click();
    await page
      .getByRole("button", { name: i < 2 ? "Next situation" : "See the pattern" })
      .click();
  }

  await page.getByRole("button", { name: "Finish mission" }).click();
}

test.describe("campaign discovery", () => {
  test("the listing and detail render", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);

    await page.goto("/campaigns");
    await expect(page.getByRole("heading", { name: "Campaigns", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ONE BAD MINUTE" })).toBeVisible();

    await page.getByRole("link", { name: /ONE BAD MINUTE/ }).click();
    await expect(page).toHaveURL(new RegExp(`${SLUG}$`));
    await expect(page.getByRole("heading", { name: "Story mode" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Start the Campaign" })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("reachable from Home and from Missions", async ({ page }) => {
    await seedProfile(page);

    await page.goto("/");
    // The campaign is the hero on Home, not a section among several.
    await expect(page.getByRole("heading", { name: "ONE BAD MINUTE" })).toBeVisible();
    await page.getByRole("link", { name: /ONE BAD MINUTE/ }).first().click();
    await expect(page).toHaveURL(new RegExp(`${SLUG}$`));

    await page.goto("/missions");
    await expect(page.getByRole("heading", { name: "ONE BAD MINUTE" })).toBeVisible();
  });

  test("mode selection persists", async ({ page }) => {
    await seedProfile(page);
    await page.goto(CAMPAIGN);

    await page.getByRole("button", { name: /Quick mode/ }).click();
    await page.getByRole("button", { name: "Start the Campaign" }).click();

    await expect(page.getByText("Quick mode")).toBeVisible();
    expect((await readCampaign(page))?.mode).toBe("quick");

    await page.reload();
    await expect(page.getByText("Quick mode")).toBeVisible();

    await page.getByRole("button", { name: "Switch to Story mode" }).click();
    expect((await readCampaign(page))?.mode).toBe("story");
  });
});

test.describe("QR entry", () => {
  test("a chapter deep link opens directly and says to move away", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);

    // Exactly what a printed QR resolves to.
    await page.goto(`${CAMPAIGN}/chapter/the-favour`);

    await expect(page.getByText("Chapter unlocked")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Move away from the station" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The favour" })).toBeVisible();

    // The scan is what unlocks it, before anything is played.
    const progress = await readCampaign(page);
    expect(progress?.unlockedChapterIds).toContain("obm-c1");
    expect(progress?.completedChapterIds).toEqual([]);

    expect(errors).toEqual([]);
  });

  test("works on a device that has never opened SIDEQUEST", async ({ page }) => {
    // No seeded profile at all: this is somebody's first ever contact with the
    // product, standing at a station. Onboarding must not block them.
    const errors = trackConsoleErrors(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    await expect(page.getByText("Chapter unlocked")).toBeVisible();
    await expect(page.getByRole("button", { name: "Get started" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("survives a refresh mid-chapter", async ({ page }) => {
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/design-the-moment`);
    await expect(page.getByText("Chapter unlocked")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Chapter unlocked")).toBeVisible();
    expect((await readCampaign(page))?.unlockedChapterIds).toContain("obm-c3");
  });

  test("every station deep link resolves", async ({ page }) => {
    await seedProfile(page);
    for (const slug of ["the-favour", "everyone-would", "design-the-moment", "crew-shift"]) {
      await page.goto(`${CAMPAIGN}/chapter/${slug}`);
      await expect(page.getByText("Chapter unlocked"), slug).toBeVisible();
    }
  });
});

test.describe("station codes", () => {
  test("unlock a chapter when the QR cannot be scanned", async ({ page }) => {
    await seedProfile(page);
    await page.goto(CAMPAIGN);
    await page.getByRole("button", { name: "Start the Campaign" }).click();

    const field = page.getByPlaceholder("A7");
    await field.fill("ZZ");
    await page.getByRole("button", { name: "Unlock chapter" }).click();
    await expect(page.getByText(/No station with that code/)).toBeVisible();

    await field.fill("C9");
    await page.getByRole("button", { name: "Unlock chapter" }).click();

    await expect(page).toHaveURL(/design-the-moment$/);
    await expect(page.getByText("Chapter unlocked")).toBeVisible();
  });
});

test.describe("Crew Shift", () => {
  test("runs pass the phone and hides answers until everyone is in", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);

    await page.getByRole("button", { name: "Start chapter 4" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Three players.
    await expect(page.getByText("3 players")).toBeVisible();
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "Pass to player 1" }).click();

    for (let player = 1; player <= 3; player += 1) {
      await expect(page.getByRole("heading", { name: `Player ${player}` })).toBeVisible();
      await page.getByRole("button", { name: `I am player ${player}` }).click();
      await expect(page.getByText(`Player ${player}, private`)).toBeVisible();

      // Nothing from an earlier player may be on screen.
      await expect(page.getByText(/You all picked|You did not agree/)).toHaveCount(0);

      await page
        .getByRole("button", { name: player === 3 ? /Tell someone older/ : /One person talks/ })
        .click();
      await page.getByRole("button", { name: "Lock answer" }).click();
    }

    // Reveal only after the last answer is locked.
    await expect(page.getByText(/You did not agree|You all picked the same thing/)).toBeVisible();

    await page.getByRole("button", { name: "Talk about it" }).click();
    await expect(page.getByRole("progressbar", { name: "Discussion time remaining" })).toBeVisible();

    // The timer is skippable, never punitive.
    await page.getByRole("button", { name: /Skip ahead and decide|Decide/ }).click();
    await page.getByRole("button", { name: /Tell someone older/ }).click();

    await expect(page.getByText(/The group shifted|The group held/)).toBeVisible();
    await page.getByRole("button", { name: "Finish chapter" }).click();
    await expect(page.getByRole("heading", { name: "Chapter 4 complete" })).toBeVisible();

    const progress = await readCampaign(page);
    expect(progress?.completedChapterIds).toContain("obm-c4");
    expect((progress?.chapterResults as Record<string, { playerCount: number }>)["obm-c4"].playerCount).toBe(3);

    expect(errors).toEqual([]);
  });

  test("solo mode works and says the disagreement is the point", async ({ page }) => {
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);
    await playCrewShiftSolo(page);

    await expect(page.getByRole("heading", { name: "Chapter 4 complete" })).toBeVisible();
    expect((await readCampaign(page))?.completedChapterIds).toContain("obm-c4");
  });
});

test.describe("campaign progression", () => {
  test("completing a chapter awards XP once and shows what is left", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page, { xp: 0 });

    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);
    await playCrewShiftSolo(page);

    await expect(page.getByText("+90 XP")).toBeVisible();
    await expect(page.getByText(/2 more chapters open the finale/)).toBeVisible();
    expect((await readProfile(page)).xp).toBe(90);

    // Replaying the same chapter grants nothing.
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);
    await playCrewShiftSolo(page);
    await expect(page.getByText("Already counted. Replays do not add XP.")).toBeVisible();
    expect((await readProfile(page)).xp).toBe(90);

    expect(errors).toEqual([]);
  });

  test("the map reflects progress", async ({ page }) => {
    await seedProfile(page, { xp: 0 });
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);
    await playCrewShiftSolo(page);

    await page.goto(CAMPAIGN);
    await expect(page.getByText("1 of 4 chapters")).toBeVisible();
    await expect(page.getByText("Done").first()).toBeVisible();
  });

  test("the finale stays locked below three chapters", async ({ page }) => {
    await seedProfile(page, { xp: 0 });
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);
    await playCrewShiftSolo(page);

    await page.goto(`${CAMPAIGN}/finale`);
    await expect(page.getByRole("heading", { name: "The finale is not open" })).toBeVisible();
  });
});

test.describe("finale and follow-ups", () => {
  /** Seeds three completed chapters so the finale is reachable quickly. */
  async function seedThreeChapters(page: Page) {
    await seedProfile(page, {
      xp: 210,
      campaigns: {
        [CAMPAIGN_ID]: {
          campaignId: CAMPAIGN_ID,
          mode: "story",
          routeId: "route-a",
          startedAt: "2026-09-01T10:00:00.000Z",
          unlockedChapterIds: ["obm-c1", "obm-c2", "obm-c3"],
          completedChapterIds: ["obm-c1", "obm-c2", "obm-c3"],
          chapterResults: {},
          finaleCompleted: false,
          finaleOptionId: null,
          completedAt: null,
          completedFollowUpIds: [],
          awardedKeys: ["chapter:obm-c1", "chapter:obm-c2", "chapter:obm-c3"],
          demoHoursOffset: 0,
        },
      },
    });
  }

  test("three of four opens the finale and completing it pays once", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedThreeChapters(page);

    await page.goto(CAMPAIGN);
    await expect(page.getByText("The finale is open.")).toBeVisible();

    await page.getByRole("link", { name: /^Finale/ }).click();
    await page.getByRole("button", { name: "Answer him" }).click();
    await page.getByRole("button", { name: /Call 1799 and the bank tonight/ }).click();

    await expect(page.getByText("One small decision changes what happens next")).toBeVisible();
    await page.getByRole("button", { name: "Finish the Campaign" }).click();

    await expect(page.getByRole("heading", { name: "Campaign complete" })).toBeVisible();
    await expect(page.getByText("+120 XP")).toBeVisible();

    const profile = await readProfile(page);
    expect(profile.xp).toBe(330);

    const progress = await readCampaign(page);
    expect(progress?.finaleCompleted).toBe(true);
    expect(progress?.completedAt).toBeTruthy();

    expect(errors).toEqual([]);
  });

  test("completing all four adds the bonus", async ({ page }) => {
    await seedProfile(page, {
      xp: 280,
      campaigns: {
        [CAMPAIGN_ID]: {
          campaignId: CAMPAIGN_ID,
          mode: "quick",
          routeId: "route-a",
          startedAt: "2026-09-01T10:00:00.000Z",
          unlockedChapterIds: ["obm-c1", "obm-c2", "obm-c3", "obm-c4"],
          completedChapterIds: ["obm-c1", "obm-c2", "obm-c3", "obm-c4"],
          chapterResults: {},
          finaleCompleted: false,
          finaleOptionId: null,
          completedAt: null,
          completedFollowUpIds: [],
          awardedKeys: [
            "chapter:obm-c1",
            "chapter:obm-c2",
            "chapter:obm-c3",
            "chapter:obm-c4",
          ],
          demoHoursOffset: 0,
        },
      },
    });

    await page.goto(`${CAMPAIGN}/finale`);
    await page.getByRole("button", { name: "Answer him" }).click();
    await page.getByRole("button", { name: /Tell someone at home/ }).click();
    await expect(page.getByText(/You played all four stations/)).toBeVisible();
    await page.getByRole("button", { name: "Finish the Campaign" }).click();

    // 120 finale plus the 60 completion bonus.
    await expect(page.getByText("+180 XP")).toBeVisible();
    expect((await readProfile(page)).xp).toBe(460);
  });

  test("a follow-up is locked, then opens with the demo clock", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedThreeChapters(page);

    await page.goto(`${CAMPAIGN}/finale`);
    await page.getByRole("button", { name: "Answer him" }).click();
    await page.getByRole("button", { name: /Call 1799/ }).click();
    await page.getByRole("button", { name: "Finish the Campaign" }).click();
    await page.getByRole("button", { name: "See what comes next" }).click();

    await expect(page.getByRole("heading", { name: "After the event" })).toBeVisible();
    await expect(page.getByText(/Unlocks in \d+h|Unlocks tomorrow/).first()).toBeVisible();

    // Direct navigation must not bypass the lock.
    await page.goto(`${CAMPAIGN}/follow-up/aftermath`);
    await expect(page.getByRole("heading", { name: "Not open yet" })).toBeVisible();

    // The demo control is what makes this showable on stage.
    await page.goto(CAMPAIGN);
    await page.getByRole("button", { name: "Demo controls" }).click();
    await page.getByRole("button", { name: "Skip forward a day" }).click();

    const xpBefore = (await readProfile(page)).xp as number;

    await page.getByRole("link", { name: /Aftermath/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Next time say the quiet thing/ }).click();
    await page.getByRole("button", { name: "Finish" }).click();

    await expect(page.getByRole("heading", { name: "Follow-up complete" })).toBeVisible();
    await expect(page.getByText("+40 XP")).toBeVisible();
    expect((await readProfile(page)).xp).toBe(xpBefore + 40);

    // And it pays once.
    await page.goto(`${CAMPAIGN}/follow-up/aftermath`);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Ask him what he would say/ }).click();
    await page.getByRole("button", { name: "Finish" }).click();
    await expect(page.getByText("Already counted.")).toBeVisible();
    expect((await readProfile(page)).xp).toBe(xpBefore + 40);

    expect(errors).toEqual([]);
  });

  test("the weekly follow-up needs a week, not a day", async ({ page }) => {
    await seedThreeChapters(page);
    await page.goto(`${CAMPAIGN}/finale`);
    await page.getByRole("button", { name: "Answer him" }).click();
    await page.getByRole("button", { name: /Call 1799/ }).click();
    await page.getByRole("button", { name: "Finish the Campaign" }).click();

    await page.goto(CAMPAIGN);
    await page.getByRole("button", { name: "Demo controls" }).click();
    await page.getByRole("button", { name: "Skip forward a day" }).click();

    await page.goto(`${CAMPAIGN}/follow-up/one-week-later`);
    await expect(page.getByRole("heading", { name: "Not open yet" })).toBeVisible();

    await page.goto(CAMPAIGN);
    await page.getByRole("button", { name: "Demo controls" }).click();
    await page.getByRole("button", { name: "Skip forward a week" }).click();

    await page.goto(`${CAMPAIGN}/follow-up/one-week-later`);
    await expect(page.getByRole("heading", { name: "One week later" })).toBeVisible();
  });
});

test.describe("roadshow utilities", () => {
  test("station signs render a QR and a code for every station", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/stations`);

    await expect(page.getByRole("heading", { name: "Station signs" })).toBeVisible();

    for (const code of ["A7", "B4", "C9", "D2"]) {
      await expect(page.getByText(code, { exact: true })).toBeVisible();
    }

    // Generated locally, never fetched from an external QR service.
    const images = page.getByRole("img", { name: /QR code opening chapter/ });
    await expect(images).toHaveCount(4);
    const src = await images.first().getAttribute("src");
    expect(src?.startsWith("data:image/png;base64,")).toBe(true);

    expect(errors).toEqual([]);
  });

  test("impact view labels every figure as demo data", async ({ page }) => {
    await seedProfile(page);
    await page.goto(`${CAMPAIGN}/impact`);

    await expect(page.getByRole("heading", { name: "Demo data" })).toBeVisible();
    await expect(page.getByText(/Every figure on this page is invented/)).toBeVisible();
    await expect(page.getByText("Demo aggregate").first()).toBeVisible();
    await expect(page.getByText(/And what it would never record/)).toBeVisible();
  });
});

test.describe("campaign reset", () => {
  test("clears campaign state but keeps earned XP", async ({ page }) => {
    await seedProfile(page, { xp: 0 });
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);
    await playCrewShiftSolo(page);
    expect((await readProfile(page)).xp).toBe(90);

    await page.goto(CAMPAIGN);
    await page.getByRole("button", { name: "Demo controls" }).click();
    await page.getByRole("button", { name: "Reset this Campaign" }).click();

    await expect(page.getByRole("button", { name: "Start the Campaign" })).toBeVisible();
    expect(await readCampaign(page)).toBeUndefined();
    expect((await readProfile(page)).xp).toBe(90);
  });

  test("full demo reset also clears campaigns", async ({ page }) => {
    await seedProfile(page, { xp: 0 });
    await page.goto(`${CAMPAIGN}/chapter/crew-shift`);
    await playCrewShiftSolo(page);

    await page.goto("/settings");
    await page.getByRole("button", { name: "Reset demo" }).click();
    await page.getByRole("button", { name: "Yes, reset" }).click();

    const profile = await readProfile(page);
    expect(profile.campaigns).toEqual({});
    expect(profile.xp).toBe(0);
  });
});

test.describe("reused mechanics inside a campaign", () => {
  test("Norm Mirror runs with campaign questions and campaign XP", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page, { xp: 0 });
    await page.goto(`${CAMPAIGN}/chapter/everyone-would`);

    await playNormMirror(page);

    // Chapter XP, not the standalone mission's 90.
    await expect(page.getByRole("heading", { name: "Chapter 2 complete" })).toBeVisible();
    await expect(page.getByText("+60 XP")).toBeVisible();
    expect((await readProfile(page)).xp).toBe(60);

    // The standalone mission must be untouched by this.
    expect((await readProfile(page)).completedMissionIds).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("the standalone Norm Mirror still works independently", async ({ page }) => {
    await seedProfile(page, { xp: 0 });
    await page.goto("/play/mission-norm-mirror");
    await page.getByRole("button", { name: "Start" }).click();

    // Four questions here, three in the campaign chapter.
    await expect(page.getByText("Situation 1 of 4")).toBeVisible();
  });
});
