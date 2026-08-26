import { expect, test } from "@playwright/test";

import { readProfile, seedProfile, trackConsoleErrors } from "./helpers";

test.describe("app shell", () => {
  test("first run shows onboarding and lands on Home", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /SIDEQUEST/ })).toBeVisible();
    await page.getByRole("button", { name: "Get started" }).click();

    await expect(page.getByRole("heading", { name: "A bit about you" })).toBeVisible();
    await page.getByRole("button", { name: /13-15/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "What are you into?" })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Where do you spend time?" })).toBeVisible();
    await page.getByRole("button", { name: "Tampines", exact: true }).click();
    await page.getByRole("button", { name: "Enter SIDEQUEST" }).click();

    await expect(page.getByRole("heading", { name: "ONE BAD MINUTE" })).toBeVisible();

    const profile = await readProfile(page);
    expect(profile.onboardedAt).toBeTruthy();
    expect(profile.ageBand).toBe("13-15");
    expect(profile.neighbourhood).toBe("Tampines");
    expect(errors).toEqual([]);
  });

  test("every primary destination renders", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);

    for (const [path, heading] of [
      ["/", "ONE BAD MINUTE"],
      ["/pulse", "Pulse"],
      ["/missions", "Missions"],
      ["/safe", "What do you need?"],
      ["/you", "Safety Passport"],
      ["/radio", "Radio"],
      ["/rewards", "Rewards"],
      ["/crew", "Crew"],
      ["/settings", "Settings"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("navigation moves between pillars", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/");

    // The rail and the bottom bar are both labelled "Primary" and only one is
    // visible at a time. The rail's accessible names also carry each tab's
    // description, so match on the label prefix rather than the whole string.
    const nav = page.getByRole("navigation", { name: "Primary" }).first();

    const steps: [string, RegExp][] = [
      ["Pulse", /\/pulse$/],
      ["Missions", /\/missions$/],
      ["Safe", /\/safe$/],
      ["You", /\/you$/],
      ["Home", /\/$/],
    ];

    for (const [label, url] of steps) {
      await nav
        .getByRole("link", { name: new RegExp(`^${label}\\b`) })
        .first()
        .click();
      await expect(page).toHaveURL(url);
    }
  });

  test("no route scrolls sideways", async ({ page }) => {
    await seedProfile(page);

    for (const path of ["/", "/pulse", "/missions", "/safe", "/you", "/rewards", "/crew"]) {
      await page.goto(path);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflows, `${path} scrolls horizontally`).toBe(false);
    }
  });

  test("a deep link refreshes cleanly", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/missions/mission-breaksafe");
    await expect(page.getByRole("heading", { name: "BREAKSAFE" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "BREAKSAFE" })).toBeVisible();
  });
});

test.describe("PWA", () => {
  test("serves a valid manifest and icons", async ({ page, request }) => {
    await seedProfile(page);
    await page.goto("/");

    const href = await page.getAttribute('link[rel="manifest"]', "href");
    expect(href).toBeTruthy();

    const response = await request.get(href!);
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBe("SIDEQUEST");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable")).toBe(
      true,
    );

    for (const icon of manifest.icons) {
      const iconResponse = await request.get(icon.src);
      expect(iconResponse.status(), icon.src).toBe(200);
      expect(iconResponse.headers()["content-type"]).toContain("image/png");
    }

    const apple = await request.get("/icons/apple-touch-icon.png");
    expect(apple.status()).toBe(200);
  });
});

test.describe("Safe", () => {
  test("links out to official services and takes no reports", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/safe");

    await expect(page.getByRole("link", { name: /Emergency/ })).toHaveAttribute(
      "href",
      "tel:999",
    );
    await expect(page.getByRole("link", { name: /Scam help/ })).toHaveAttribute(
      "href",
      "tel:1799",
    );

    const scamShield = page.getByRole("link", { name: /ScamShield/ });
    await expect(scamShield).toHaveAttribute("href", "https://www.scamshield.gov.sg");
    await expect(scamShield).toHaveAttribute("target", "_blank");
    await expect(scamShield).toHaveAttribute("rel", /noopener/);

    // SIDEQUEST must never collect an incident report itself.
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.locator("textarea")).toHaveCount(0);
  });

  test("every outbound link is https or tel", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/safe");

    const hrefs = await page.locator("a[href]").evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href") ?? ""),
    );

    for (const href of hrefs) {
      const external = href.startsWith("http") || href.startsWith("tel:");
      if (!external) continue;
      expect(href.startsWith("https://") || href.startsWith("tel:"), href).toBe(true);
    }
  });
});
