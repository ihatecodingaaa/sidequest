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
