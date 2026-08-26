import type { Page } from "@playwright/test";

export const STORAGE_KEY = "sidequest.profile.v1";

/**
 * Skips onboarding by writing the persisted profile before the app boots.
 * Onboarding itself has its own test, so every other spec starts from a
 * known, already-onboarded state.
 *
 * Init scripts run on every navigation, so this seeds only when storage is
 * empty. Overwriting on each `goto` would silently erase whatever the test
 * just did, which is exactly the persistence these specs are checking.
 */
export async function seedProfile(
  page: Page,
  overrides: Record<string, unknown> = {},
): Promise<void> {
  await page.addInitScript(
    ([key, patch]) => {
      if (window.localStorage.getItem(key as string)) return;

      const profile = {
        displayName: "Lucas",
        ageBand: "16-18",
        interests: ["scams", "peer-pressure", "design"],
        neighbourhood: "Tampines",
        xp: 0,
        streakDays: 1,
        completedMissionIds: [],
        savedPulseIds: [],
        crewId: "crew-clubhouse",
        skillPoints: {},
        submissions: [],
        rewardClaims: [],
        onboardedAt: "2026-08-20T10:00:00.000Z",
        ...(patch as Record<string, unknown>),
      };
      window.localStorage.setItem(
        key as string,
        JSON.stringify({ state: { profile }, version: 1 }),
      );
    },
    [STORAGE_KEY, overrides] as const,
  );
}

/** Reads the persisted profile straight out of localStorage. */
export async function readProfile(page: Page): Promise<Record<string, unknown>> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
  if (!raw) return {};
  return JSON.parse(raw).state.profile as Record<string, unknown>;
}

/** Collects console errors so specs can assert a clean run. */
export function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/**
 * Plays a story scene out to its end.
 *
 * Narrative surfaces now reveal one idea at a time instead of printing the
 * whole segment, so a walkthrough has to press through the scene before the
 * choices exist. This presses the single advance control until it is gone,
 * which is exactly what a player does, and it deliberately stops at anything
 * that is not an advance control so a test can never tap past a decision.
 */
export async function playScene(page: Page, limit = 12): Promise<number> {
  let taps = 0;
  for (let i = 0; i < limit; i += 1) {
    const next = page.getByRole("button", { name: /^(Tap to continue|Continue)$/ }).first();

    /*
     * `isVisible()` does not auto-wait, so calling it straight after a
     * navigation reports false for a control that is about to exist and the
     * whole scene gets skipped. Waiting briefly first is the difference
     * between "no scene here" and "the scene has not rendered yet". The same
     * trap cost a day on the bottom-bar geometry test.
     */
    const appeared = await next
      .waitFor({ state: "visible", timeout: 2000 })
      .then(() => true)
      .catch(() => false);
    if (!appeared) return taps;

    await next.click();
    taps += 1;
  }
  return taps;
}
