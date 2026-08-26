import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { seedProfile, trackConsoleErrors } from "./helpers";

/**
 * The elevated Safe control.
 *
 * Safe is a destination, not an action. Apple's guidance is explicit that a tab
 * bar is for navigation and not for performing actions, and that distinction is
 * the whole design: tapping Safe opens a screen and does nothing else. These
 * tests exist to stop that drifting.
 *
 * They also pin the geometry, because the value of a centre item is that its
 * position never changes and never has to be remembered.
 */

const MOBILE_ONLY = "The bottom bar is a phone concern; desktop uses the rail.";


test.describe("bottom navigation", () => {
  test("Safe is the centre tab, labelled, and third of five", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", MOBILE_ONLY);

    await seedProfile(page);
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Primary" });
    const tabs = nav.getByRole("link");
    await expect(tabs).toHaveCount(5);

    for (const [index, label] of ["Home", "Updates", "Safe", "Missions", "You"].entries()) {
      await expect(tabs.nth(index), `tab ${index} should be ${label}`).toHaveAccessibleName(
        new RegExp(`^${label}`),
      );
    }

    // Every tab keeps a text label. Wiedenbeck's comparison found label-only
    // and icon-plus-label performed alike and both beat icon-only: the label
    // is what carries the meaning, so the elevated tab keeps one too.
    await expect(nav.getByRole("link", { name: /^Safe/ })).toBeVisible();
  });

  test("Safe sits horizontally centred and does not overlap its neighbours", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", MOBILE_ONLY);

    await seedProfile(page);
    await page.goto("/");

    const boxes = await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
        }),
      );

    const viewport = page.viewportSize()!;
    const safe = boxes[2];

    // Centred within a couple of pixels of the viewport midpoint.
    const safeCentre = safe.left + safe.width / 2;
    expect(Math.abs(safeCentre - viewport.width / 2)).toBeLessThan(3);

    // No column overlaps the next one.
    for (let i = 0; i < boxes.length - 1; i += 1) {
      expect(boxes[i].right, `tab ${i} overlaps tab ${i + 1}`).toBeLessThanOrEqual(
        boxes[i + 1].left + 0.5,
      );
    }

    // Comfortably beyond the 24px WCAG 2.2 AA minimum and the 44px AAA figure.
    // Bottom-of-screen targets are the least accurately hit, so this one is
    // deliberately the tallest thing in the bar.
    expect(safe.width).toBeGreaterThanOrEqual(44);
    expect(safe.height).toBeGreaterThanOrEqual(44);
  });

  test("the raised mark does not hide page content", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", MOBILE_ONLY);

    await seedProfile(page);

    for (const path of ["/", "/pulse", "/missions", "/you", "/safe"]) {
      await page.goto(path);
      await page.waitForSelector("#main");

      const occluded = await page.evaluate(() => {
        const doc = document.documentElement;
        window.scrollTo(0, doc.scrollHeight);
        const nav = Array.from(document.querySelectorAll("nav[aria-label='Primary']")).find((n) => n.getBoundingClientRect().height > 0);
        const main = document.querySelector("#main");
        if (!nav || !main) return false;

        // The raised mark protrudes above the bar, so clearance is measured
        // from the mark rather than from the bar's own top edge.
        let top = nav.getBoundingClientRect().top;
        for (const mark of nav.querySelectorAll("span")) {
          const rect = mark.getBoundingClientRect();
          if (rect.height > 40) top = Math.min(top, rect.top);
        }

        // main carries the clearance as padding, so its own box is expected to
        // extend under the bar. What must not be occluded is real content.
        const last = main.lastElementChild?.lastElementChild ?? main.lastElementChild;
        if (!last) return false;
        return last.getBoundingClientRect().bottom > top + 2;
      });

      expect(occluded, `${path} has content under the bottom bar`).toBe(false);
    }
  });

  test("Safe navigates and marks itself current, on every route", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", MOBILE_ONLY);

    await seedProfile(page);

    for (const from of ["/", "/pulse", "/missions", "/you"]) {
      await page.goto(from);
      const safe = page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: /^Safe/,
      });
      await expect(safe).not.toHaveAttribute("aria-current", "page");
      await safe.click();
      await expect(page).toHaveURL(/\/safe$/);
      await expect(
        page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /^Safe/ }),
      ).toHaveAttribute("aria-current", "page");
    }
  });

  test("Safe is reachable by keyboard", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", MOBILE_ONLY);

    await seedProfile(page);
    await page.goto("/");

    const safe = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: /^Safe/ });

    await safe.focus();
    await expect(safe).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/safe$/);
  });

  test("Safe does not animate at rest", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", MOBILE_ONLY);

    await seedProfile(page);
    await page.goto("/");

    // Wait for the bar to settle before sampling: a still-animating entrance
    // elsewhere on the page made this flaky under parallel load.
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /^Safe/ }),
    ).toBeVisible();
    await page.waitForTimeout(600);

    // A control that pulses forever in peripheral vision cannot be ignored,
    // and permanent motion on a safety affordance produces exactly the alarm
    // fatigue it is meant to avoid.
    const animated = await page.evaluate(() => {
      const nav = Array.from(document.querySelectorAll("nav[aria-label='Primary']")).find((n) => n.getBoundingClientRect().height > 0);
      if (!nav) return true;
      return Array.from(nav.querySelectorAll("*")).some((node) => {
        const name = getComputedStyle(node).animationName;
        return name && name !== "none";
      });
    });

    expect(animated).toBe(false);
  });
});

test.describe("Safe screen", () => {
  test("offers four categorised paths, urgency first", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await seedProfile(page);
    await page.goto("/safe");

    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();

    for (const label of ["Emergency", "Scam help", "Report something", "Police services"]) {
      await expect(page.getByRole("link", { name: new RegExp(label) }).first()).toBeVisible();
    }

    // Exactly one path is red. If everything is urgent, nothing is.
    const emergency = page.getByRole("link", { name: /Emergency/ }).first();
    await expect(emergency).toHaveAttribute("href", "tel:999");

    expect(errors).toEqual([]);
  });

  test("survives a direct refresh", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/safe");
    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();
  });

  test("works on a device that has never opened SIDEQUEST", async ({ page }) => {
    // No seeded profile. Safe must not depend on XP, campaign state, crew or
    // anything else that could be missing or broken.
    await page.goto("/safe");
    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Emergency/ }).first()).toHaveAttribute(
      "href",
      "tel:999",
    );
  });

  test("has no axe violations", async ({ page }) => {
    await seedProfile(page);
    await page.goto("/safe");
    await page.waitForSelector("#main");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});
