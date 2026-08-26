import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { seedProfile } from "./helpers";

/**
 * Accessibility coverage.
 *
 * Automated checks catch a useful slice of WCAG, not all of it. This suite
 * runs axe across every route at the AA level, then adds two checks axe cannot
 * make on its own: that every interactive control has an accessible name, and
 * that touch targets are large enough to hit on a phone.
 */

const ROUTES = [
  "/",
  "/pulse",
  "/pulse/pulse-job-scams",
  "/missions",
  "/missions/mission-breaksafe",
  "/safe",
  "/you",
  "/rewards",
  "/crew",
  "/settings",
  "/radio",
  "/partner",
  "/campaigns",
  "/campaigns/one-bad-minute",
  "/campaigns/one-bad-minute/stations",
  "/campaigns/one-bad-minute/impact",
  "/campaigns/one-bad-minute/chapter/the-favour",
];

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await seedProfile(page, { xp: 415 });
      await page.goto(route);
      await page.waitForSelector("#main");

      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      const summary = results.violations.map(
        (violation) =>
          `${violation.id} (${violation.impact}): ${violation.nodes.length} node(s) - ${violation.help}`,
      );

      expect(summary, summary.join("\n")).toEqual([]);
    });
  }

  test("mission players have no axe violations", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/play/mission-breaksafe");
    await page.waitForSelector("#main");

    const intro = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(intro.violations.map((violation) => violation.id)).toEqual([]);

    await page.getByRole("button", { name: "Open the terminal" }).click();
    const terminal = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(terminal.violations.map((violation) => violation.id)).toEqual([]);
  });

  test("every interactive control has an accessible name", async ({ page }) => {
    await seedProfile(page, { xp: 415 });

    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForSelector("#main");

      const unnamed = await page.evaluate(() => {
        const problems: string[] = [];
        const nodes = document.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea");

        for (const node of nodes) {
          if (node.hasAttribute("aria-hidden")) continue;
          if (node.offsetParent === null && node.tagName !== "INPUT") continue;

          const name =
            node.getAttribute("aria-label") ??
            (node.getAttribute("aria-labelledby")
              ? (document.getElementById(node.getAttribute("aria-labelledby")!)?.textContent ?? "")
              : "") ??
            "";

          const labelled =
            node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT"
              ? Boolean(node.closest("label")) || Boolean(name.trim())
              : Boolean(name.trim()) || Boolean(node.textContent?.trim());

          if (!labelled) problems.push(`${node.tagName}: ${node.outerHTML.slice(0, 90)}`);
        }

        return problems;
      });

      expect(unnamed, `${route}\n${unnamed.join("\n")}`).toEqual([]);
    }
  });

  test("touch targets are large enough on a phone", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Touch target sizing is a phone concern.");

    await seedProfile(page, { xp: 415 });

    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForSelector("#main");

      const small = await page.evaluate(() => {
        const problems: string[] = [];
        const nodes = document.querySelectorAll<HTMLElement>("a[href], button");

        for (const node of nodes) {
          if (node.offsetParent === null) continue;
          // The skip link is visually hidden until focused, at which point it
          // is full size. Measuring it at rest is meaningless.
          if (node.classList.contains("sr-only")) continue;

          const rect = node.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          // Inline links inside a paragraph are exempt: WCAG 2.2 target size
          // has an inline exception, and padding them out would wreck the text.
          const inline = window.getComputedStyle(node).display === "inline";
          if (inline) continue;

          if (rect.height < 40 || rect.width < 40) {
            problems.push(
              `${Math.round(rect.width)}x${Math.round(rect.height)} :: ${node.outerHTML.slice(0, 80)}`,
            );
          }
        }

        return problems;
      });

      expect(small, `${route}\n${small.join("\n")}`).toEqual([]);
    }
  });

  test("keyboard focus reaches the main content and the navigation", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/");

    // The skip link must be the first thing a keyboard user reaches.
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(first).toBe("Skip to content");

    // And it must actually go somewhere.
    const target = await page.evaluate(
      () => (document.activeElement as HTMLAnchorElement | null)?.getAttribute("href"),
    );
    expect(target).toBe("#main");
    await expect(page.locator("#main")).toBeVisible();
  });

  test("reduced motion is respected", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedProfile(page);
    await page.goto("/play/mission-otp");

    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: /Hang up$/ }).click();
    await page.getByRole("button", { name: "What this means" }).click();
    await page.getByRole("button", { name: "Finish mission" }).click();

    // With motion reduced the XP counter shows its final value immediately
    // rather than counting up from zero.
    await expect(page.getByText("+40 XP")).toBeVisible();
  });
});
