import { expect, test } from "@playwright/test";

import { playScene, readProfile, seedProfile, trackConsoleErrors } from "./helpers";

test.describe("information to action", () => {
  test("a Pulse story leads into its mission and back out to the source", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto("/");

    // The signature interaction, straight off Home. The featured story is a
    // peer pressure piece and it hands off to REWIND.
    await page.getByRole("link", { name: /^Play REWIND/ }).click();
    await expect(page).toHaveURL(/\/missions\/mission-rewind$/);
    await expect(page.getByRole("heading", { name: "REWIND" })).toBeVisible();

    // And the same journey from the Pulse detail page.
    await page.goto("/pulse/pulse-job-scams");
    const source = page.getByRole("link", { name: /Read the official advisories/ });
    await expect(source).toHaveAttribute("href", "https://www.police.gov.sg/Advisories");
    await expect(source).toHaveAttribute("target", "_blank");

    await page.getByRole("link", { name: /Try the related quest/ }).click();
    await expect(page).toHaveURL(/\/missions\/mission-job-scam$/);

    expect(errors).toEqual([]);
  });

  test("saving a story persists across a reload", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/pulse/pulse-otp");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();

    const profile = await readProfile(page);
    expect(profile.savedPulseIds).toContain("pulse-otp");

    await page.reload();
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  });
});

test.describe("Quick Quest", () => {
  test("completing a scenario grants XP exactly once", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto("/play/mission-otp");

    await page.getByRole("button", { name: "Start" }).click();
    await playScene(page);
    await page.getByRole("button", { name: /Hang up$/ }).click();

    await expect(page.getByText("Nothing happened, which was the point")).toBeVisible();
    await page.getByRole("button", { name: "What this means" }).click();
    await page.getByRole("button", { name: "Finish mission" }).click();

    await expect(page.getByRole("heading", { name: "Mission complete" })).toBeVisible();
    await expect(page.getByText("+40 XP")).toBeVisible();

    const profile = await readProfile(page);
    expect(profile.xp).toBe(40);
    expect(profile.completedMissionIds).toContain("mission-otp");

    // Replaying must not add XP again.
    await page.goto("/play/mission-otp");
    await page.getByRole("button", { name: "Start" }).click();
    await playScene(page);
    await page.getByRole("button", { name: /Hang up$/ }).click();
    await page.getByRole("button", { name: "What this means" }).click();
    await page.getByRole("button", { name: "Finish mission" }).click();

    await expect(page.getByText("Already counted. Replays do not add XP.")).toBeVisible();
    expect((await readProfile(page)).xp).toBe(40);
    expect(errors).toEqual([]);
  });

  test("XP and level appear on Home and in the passport", async ({ page }) => {
    await seedProfile(page, { xp: 415, completedMissionIds: ["mission-otp"] });

    await page.goto("/");
    // Home shows a compact level chip; the full readout lives on You.
    const main = page.locator("#main");
    await expect(main.getByText("415", { exact: true }).first()).toBeVisible();
    await expect(main.getByText("Lv 3")).toBeVisible();

    await page.goto("/you");
    await expect(page.getByRole("heading", { name: "Safety Passport" })).toBeVisible();
    await expect(page.locator("#main").getByText("Responder")).toBeVisible();
    await expect(page.getByText("Would you send the OTP?")).toBeVisible();
  });
});

test.describe("REWIND", () => {
  test("plays through, rewinds to the pivot, and changes the outcome", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto("/play/mission-rewind");

    await page.getByRole("button", { name: "Start" }).click();
    // Each scene plays out an idea at a time before its choices appear.
    await playScene(page);
    await page.getByRole("button", { name: "Keep watching" }).click();
    await playScene(page);

    // First run: say nothing, and see where that leads.
    await page.getByRole("button", { name: /Say nothing and look away/ }).click();
    await playScene(page);
    await page.getByRole("button", { name: "Two weeks later" }).click();
    await expect(page.getByText("The gap between noticing and acting")).toBeVisible();

    await page.getByRole("button", { name: /Rewind to the decision/ }).click();

    // Second run starts at the pivot with the first choice locked out.
    await expect(page.getByText("Second run")).toBeVisible({ timeout: 10_000 });
    await playScene(page);
    await expect(page.getByRole("button", { name: /Say nothing and look away/ })).toBeDisabled();

    await page.getByRole("button", { name: /say something only he can hear/ }).click();
    await playScene(page);
    await page.getByRole("button", { name: "Leave it there" }).click();
    await expect(page.getByText("It cost him nothing to change his mind")).toBeVisible();

    await page.getByRole("button", { name: "Compare the two runs" }).click();
    await expect(
      page.getByRole("heading", { name: /Same night\. Same people\./ }),
    ).toBeVisible();
    await expect(page.getByText("First run")).toBeVisible();
    await expect(page.getByText("After the rewind")).toBeVisible();

    // The debrief names what the ending turned on, in plain language, and
    // never in the behavioural vocabulary the factor is drawn from.
    await expect(page.getByRole("heading", { name: "What changed the outcome?" })).toBeVisible();
    await expect(page.getByText("Someone raised it privately")).toBeVisible();
    await expect(page.getByText(/audience effects/i)).toHaveCount(0);

    // The comparison screen now finishes the mission. The separate debrief
    // taught the same lesson a third time, after the outcome and the compare.
    await page.getByRole("button", { name: "Finish mission" }).click();

    await expect(page.getByRole("heading", { name: "Mission complete" })).toBeVisible();
    expect((await readProfile(page)).xp).toBe(120);
    expect(errors).toEqual([]);
  });
});

test.describe("Norm Mirror", () => {
  test("predicts, chooses, reveals a labelled aggregate, and awards once", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto("/play/mission-norm-mirror");

    await page.getByRole("button", { name: "Start" }).click();

    for (let question = 0; question < 4; question += 1) {
      await expect(page.getByText(`Situation ${question + 1} of 4`)).toBeVisible();

      const slider = page.getByRole("slider");
      await slider.fill("70");
      await page.getByRole("button", { name: /Lock in 70%/ }).click();

      await page.getByRole("button", { name: /I'd|I wouldn't/ }).first().click();

      // The comparison now uses the shared reveal grammar, so the two states
      // are labelled by ShiftReveal rather than by the bars themselves. What
      // must not move is the prototype tag: it stays welded to the aggregate
      // bar, because that is the surface making the claim.
      await expect(page.getByText("You predicted")).toBeVisible();
      await expect(page.getByText("Prototype aggregate")).toBeVisible();
      await expect(page.getByText("Prototype data", { exact: true })).toBeVisible();
      await expect(page.getByText(/illustrative placeholders/i).first()).toBeVisible();

      await page
        .getByRole("button", { name: question < 3 ? "Next situation" : "See the pattern" })
        .click();
    }

    await page.getByRole("button", { name: "Finish mission" }).click();
    await expect(page.getByRole("heading", { name: "Mission complete" })).toBeVisible();
    expect((await readProfile(page)).xp).toBe(90);
    expect(errors).toEqual([]);
  });
});

test.describe("BREAKSAFE", () => {
  test("finds design problems, applies a patch, and reveals the point", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto("/play/mission-breaksafe");

    await page.getByRole("button", { name: "Open the terminal" }).click();

    await page.getByRole("button", { name: "Inspect: Scan area" }).click();
    await expect(page.getByText("You cannot tell whether an item scanned")).toBeVisible();

    // The decoys explain why they are not the answer, and do not count.
    await page.getByRole("button", { name: "Inspect: The shopper" }).click();
    await expect(page.getByText("The person is not the problem to solve")).toBeVisible();

    await page.getByRole("button", { name: "Inspect: Item list" }).click();
    await page.getByRole("button", { name: "Inspect: Assistance" }).click();

    await page.getByRole("button", { name: "Now change something" }).click();

    await page.getByRole("button", { name: /Make the scan unmistakable/ }).click();
    await expect(page.getByText(/The strongest single change/)).toBeVisible();
    await page.getByRole("button", { name: /No-fault rescan/ }).click();

    await page.getByRole("button", { name: "Rebuild the terminal" }).click();

    // Same reveal grammar as REWIND, Norm Mirror and Crew Shift: two labelled
    // states, both on screen, side by side because this content is spatial.
    await expect(page.getByText("Before", { exact: true })).toBeVisible();
    await expect(page.getByText("After", { exact: true })).toBeVisible();

    await expect(
      page.getByText("SAME PERSON. SAME PRODUCT. DIFFERENT ENVIRONMENT."),
    ).toBeVisible();
    await expect(page.getByText("We changed the environment, not the person.")).toBeVisible();
    await expect(page.getByText(/without identifying a single person/)).toBeVisible();

    await page.getByRole("button", { name: "Finish mission" }).click();
    await expect(page.getByRole("heading", { name: "Mission complete" })).toBeVisible();
    expect((await readProfile(page)).xp).toBe(150);
    expect(errors).toEqual([]);
  });

  test("warns when a profiling patch is chosen", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/play/mission-breaksafe");

    await page.getByRole("button", { name: "Open the terminal" }).click();
    for (const label of ["Scan area", "Item list", "Assistance"]) {
      await page.getByRole("button", { name: `Inspect: ${label}` }).click();
    }
    await page.getByRole("button", { name: "Now change something" }).click();

    await page.getByRole("button", { name: /Add facial recognition/ }).click();
    await expect(page.getByText(/SIDEQUEST will not build this/)).toBeVisible();

    await page.getByRole("button", { name: "Rebuild the terminal" }).click();
    await expect(page.getByText(/works by identifying people/)).toBeVisible();
  });
});

test.describe("Field Quest", () => {
  test("checks in with the manual code when there is no camera", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto("/play/mission-field-design-hunt");

    await page.getByRole("button", { name: "Check in" }).click();
    await expect(page.getByRole("heading", { name: "Check in" })).toBeVisible();

    const codeField = page.getByRole("textbox");
    await codeField.fill("WRONG-CODE");
    await page.getByRole("button", { name: "Check in" }).click();
    await expect(page.getByText("That code does not match this Field Quest.")).toBeVisible();

    await codeField.fill("SQ-TAMPINES");
    await page.getByRole("button", { name: "Check in" }).click();

    await expect(page.getByText("Checked in")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Three things to find" })).toBeVisible();

    for (const task of [
      /safe action is slower/,
      /cannot tell what the system thinks/,
      /asking for help would be embarrassing/,
    ]) {
      await page.getByRole("button", { name: task }).click();
    }

    await page.getByRole("button", { name: "Submit findings" }).click();
    await expect(page.getByRole("heading", { name: "Mission complete" })).toBeVisible();
    expect((await readProfile(page)).xp).toBe(140);
    expect(errors).toEqual([]);
  });
});

test.describe("Partner Challenge", () => {
  test("submits an idea that persists into the Safety Passport", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto("/play/mission-partner-selfcheckout");

    await expect(page.getByText("Prototype Partner Challenge")).toBeVisible();
    await expect(page.getByText(/No organisation has commissioned this challenge/)).toBeVisible();

    /*
     * Three choices, not a blank box.
     *
     * The mission used to open on a title field and a forty character minimum
     * textarea, which was the longest piece of required typing in the product.
     * It is now: what is wrong, what would you change, which idea is that. The
     * combination is still the player's, and the entry records both halves.
     */
    await page.getByRole("button", { name: "Design your answer" }).click();
    await page.getByRole("button", { name: /You cannot tell if it scanned/ }).click();
    await page.getByRole("button", { name: /Show the basket like a receipt/ }).click();
    await page.getByRole("button", { name: /Make the state visible/ }).click();

    // The entry is assembled before it is submitted, and says how.
    await expect(page.getByText(/No AI wrote this/)).toBeVisible();
    await page.getByRole("button", { name: "Submit your entry" }).click();

    await expect(page.getByRole("heading", { name: "Mission complete" })).toBeVisible();
    await expect(page.getByText("Submitted.")).toBeVisible();

    const profile = await readProfile(page);
    expect(Array.isArray(profile.submissions) && profile.submissions.length).toBe(1);

    await page.goto("/you");
    await expect(page.getByRole("heading", { name: "Your contributions" })).toBeVisible();
    await expect(page.getByText("Show the basket like a receipt")).toBeVisible();

    expect(errors).toEqual([]);
  });
});

test.describe("progression surfaces", () => {
  test("a reward can be claimed and is labelled as a prototype", async ({ page }) => {
    await seedProfile(page, { xp: 600 });
    await page.goto("/rewards");

    await expect(page.getByText(/no code and carries no monetary value/)).toBeVisible();

    await page.getByRole("button", { name: "Claim" }).first().click();
    await expect(page.getByText("Prototype reward claimed")).toBeVisible();

    const profile = await readProfile(page);
    expect(Array.isArray(profile.rewardClaims) && profile.rewardClaims.length).toBe(1);
    // Claiming records recognition. It never spends XP.
    expect(profile.xp).toBe(600);
  });

  test("locked rewards cannot be claimed", async ({ page }) => {
    await seedProfile(page, { xp: 0 });
    await page.goto("/rewards");
    await expect(page.getByRole("button", { name: "Locked" }).first()).toBeDisabled();
  });

  test("reset demo clears everything and returns to onboarding", async ({ page }) => {
    await seedProfile(page, { xp: 415, completedMissionIds: ["mission-otp"] });
    await page.goto("/settings");

    await page.getByRole("button", { name: "Reset demo" }).click();
    await page.getByRole("button", { name: "Yes, reset" }).click();

    await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();

    const profile = await readProfile(page);
    expect(profile.xp).toBe(0);
    expect(profile.onboardedAt).toBeNull();
    expect(profile.completedMissionIds).toEqual([]);
  });

  test("load demo progress produces the same state every time", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/settings");

    await page.getByRole("button", { name: "Load demo progress" }).click();
    const first = await readProfile(page);
    expect(first.xp).toBe(415);

    await page.reload();
    await page.getByRole("button", { name: "Load demo progress" }).click();
    const second = await readProfile(page);
    expect(second.xp).toBe(first.xp);
    expect(second.completedMissionIds).toEqual(first.completedMissionIds);
  });

  test("crew join code works", async ({ page }) => {
    await seedProfile(page, { crewId: null });
    await page.goto("/crew");

    await expect(page.getByText("You are not in a crew")).toBeVisible();
    await page.getByRole("textbox").fill("NRTH-118");
    await page.getByRole("button", { name: "Join crew" }).click();

    await expect(page.getByRole("heading", { name: "Northline" })).toBeVisible();
    expect((await readProfile(page)).crewId).toBe("crew-northline");
  });
});
