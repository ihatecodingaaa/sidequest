import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile } from "./helpers";

/**
 * Orientation geometry, and rotation during play.
 *
 * These are measurements rather than behaviour checks, and they exist because
 * an emulated screenshot never rotates. The defect that produced this file was
 * invisible in every static viewport and appeared the moment a real person
 * turned their phone: the two JSX trees differed by position, React unmounted
 * the canvas, and the engine went on drawing into a detached node.
 *
 * So the rotation tests below are the important half of this file. The
 * geometry assertions are the half that stops the thin strip coming back.
 */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };
const seedPlayer = (page: Page) => seedProfile(page, { streetsAvatar: AVATAR, xp: 200 });

interface Geometry {
  orientation: string;
  rootW: number;
  rootH: number;
  worldPct: number;
  padLeft: number;
  padTop: number;
  interactRight: number;
  interactTop: number;
  mapRight: number;
  mapTop: number;
}

async function geometry(page: Page): Promise<Geometry> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="streets-root"]') as HTMLElement;
    const world = document.querySelector('[data-testid="streets-world"]') as HTMLElement;
    const pad = document.querySelector('[role="application"]') as HTMLElement;
    const buttons = [...document.querySelectorAll("button")];
    const interact = buttons.find((button) =>
      /Talk|Go in|Step out|Nothing in reach/.test(button.textContent ?? button.ariaLabel ?? ""),
    ) as HTMLElement;
    const map = document.querySelector('[role="img"][aria-label^="Map of District"]') as HTMLElement;

    const r = root.getBoundingClientRect();
    const w = world.getBoundingClientRect();
    const p = pad.getBoundingClientRect();
    const i = interact.getBoundingClientRect();
    const m = map ? map.getBoundingClientRect() : null;

    return {
      orientation: root.dataset.orientation ?? "",
      rootW: r.width,
      rootH: r.height,
      worldPct: (w.height / r.height) * 100,
      padLeft: p.left,
      padTop: p.top,
      interactRight: r.width - i.right,
      interactTop: i.top,
      mapRight: m ? r.width - m.right : -1,
      mapTop: m ? m.top : -1,
    };
  });
}

/* ---------------------------------------------------------- Geometry */

const PORTRAIT = [
  ["iPhone 13", 390, 844],
  ["iPhone 14 Pro", 393, 852],
  ["iPhone Pro Max", 430, 932],
] as const;

const LANDSCAPE = [
  ["iPhone 13", 844, 390],
  ["iPhone 14 Pro", 852, 393],
  ["iPhone Pro Max", 932, 430],
  ["short, tall browser chrome", 844, 320],
] as const;

test.describe("portrait keeps the world above reachable controls", () => {
  for (const [name, width, height] of PORTRAIT) {
    test(`${name} at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await seedPlayer(page);
      await page.goto("/streets");
      await expect(page.getByTestId("streets-canvas")).toBeVisible();
      await page.waitForTimeout(300);

      const g = await geometry(page);
      expect(g.orientation).toBe("portrait");
      // The world is the majority of the screen, and controls sit under it.
      expect(g.worldPct).toBeGreaterThanOrEqual(55);
      expect(g.padTop).toBeGreaterThan(g.rootH * 0.5);
    });
  }
});

test.describe("landscape gives the world the screen", () => {
  for (const [name, width, height] of LANDSCAPE) {
    test(`${name} at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await seedPlayer(page);
      await page.goto("/streets");
      await expect(page.getByTestId("streets-canvas")).toBeVisible();
      await page.waitForTimeout(300);

      const g = await geometry(page);
      expect(g.orientation).toBe("landscape");

      /*
       * The whole point of rotating. Controls overlap the world rather than
       * displacing it, so the world owns effectively the entire height.
       */
      expect(g.worldPct).toBeGreaterThanOrEqual(90);

      // Thumbs. Pad in the lower left, interact in the lower right.
      expect(g.padLeft).toBeLessThan(g.rootW * 0.25);
      expect(g.padTop).toBeGreaterThan(g.rootH * 0.4);
      expect(g.interactRight).toBeLessThan(g.rootW * 0.25);
      expect(g.interactTop).toBeGreaterThan(g.rootH * 0.4);

      // Nothing sits in the middle, which is where the world is.
      expect(g.padLeft + 112).toBeLessThan(g.rootW * 0.4);

      // The minimap stays in the upper right and clear of the top bar.
      expect(g.mapRight).toBeLessThan(g.rootW * 0.2);
      expect(g.mapTop).toBeGreaterThan(20);
      expect(g.mapTop).toBeLessThan(g.rootH * 0.5);

      // And the controls are inside the visible area, not below it.
      expect(g.padTop + 112).toBeLessThanOrEqual(g.rootH + 1);
    });
  }
});

test.describe("a tablet held sideways is landscape too", () => {
  test("uses the overlay layout at 1180x820", async ({ page }) => {
    /*
     * The old rule was a media query with a 600px height bound, so an iPad in
     * landscape got the one-handed portrait layout and gave three quarters of
     * its screen to a world it had room to fill. The rule is now a measured
     * aspect ratio, which has no opinion about what kind of device this is.
     */
    await page.setViewportSize({ width: 1180, height: 820 });
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await page.waitForTimeout(300);

    const g = await geometry(page);
    expect(g.orientation).toBe("landscape");
    expect(g.worldPct).toBeGreaterThanOrEqual(90);
  });

  test("keeps a portrait tablet stacked at 820x1180", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await page.waitForTimeout(300);

    expect((await geometry(page)).orientation).toBe("portrait");
  });
});

/* ---------------------------------------------------------- Rotation */

test.describe("rotating never costs the player anything", () => {
  /** Is the world still being drawn into the canvas that is in the document? */
  async function alive(page: Page) {
    const canvas = page.getByTestId("streets-canvas");
    const before = await canvas.getAttribute("data-residents");
    await page.waitForTimeout(1500);
    const after = await canvas.getAttribute("data-residents");
    const painted = await page.evaluate(() => {
      const node = document.querySelector('[data-testid="streets-canvas"]') as HTMLCanvasElement;
      const ctx = node.getContext("2d");
      if (!ctx) return 0;
      const pixel = ctx.getImageData(Math.floor(node.width / 2), Math.floor(node.height / 2), 1, 1);
      return pixel.data[3] ?? 0;
    });
    return { moving: before !== null && before !== after, painted };
  }

  test("keeps drawing, and keeps the player where they were", async ({ page }) => {
    /*
     * The regression this whole file exists for. Before the fix, one rotation
     * left the engine drawing into a detached canvas: no attributes, nothing
     * moving, and a fully transparent centre pixel.
     */
    await page.setViewportSize({ width: 390, height: 844 });
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(400);
    await page.keyboard.up("ArrowUp");
    await page.waitForTimeout(200);
    const before = await page.getByTestId("streets-canvas").getAttribute("data-player-tile");
    expect(before).toBeTruthy();

    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(600);

    expect(await page.getByTestId("streets-canvas").getAttribute("data-player-tile")).toBe(before);
    const state = await alive(page);
    expect(state.painted, "canvas is transparent after rotating").toBeGreaterThan(0);
    expect(state.moving, "world stopped animating after rotating").toBe(true);
  });

  test("survives a rotation back, and a second one", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await page.waitForTimeout(300);
    const tile = await page.getByTestId("streets-canvas").getAttribute("data-player-tile");

    for (const size of [
      { width: 844, height: 390 },
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(400);
    }

    expect(await page.getByTestId("streets-canvas").getAttribute("data-player-tile")).toBe(tile);
    expect((await alive(page)).painted).toBeGreaterThan(0);
  });

  test("keeps an open conversation open, and grants nothing twice", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedProfile(page, { streetsAvatar: AVATAR, xp: 0 });
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page
      .locator("li")
      .filter({ hasText: "Devi" })
      .first()
      .getByRole("button", { name: "Go there" })
      .click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /^Talk/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Got it" }).click();
    expect((await readProfile(page)).xp).toBe(30);

    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);

    // The conversation is still open, and rotating banked nothing extra.
    await expect(page.getByRole("button", { name: "Back to the block" })).toBeVisible();
    expect((await readProfile(page)).xp).toBe(30);
  });

  test("keeps you inside a building", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page
      .locator("li")
      .filter({ hasText: "Bea" })
      .first()
      .getByRole("button", { name: "Go there" })
      .click();
    await expect(page.getByText("Sunrise Minimart")).toBeVisible();

    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);

    await expect(page.getByText("Sunrise Minimart")).toBeVisible();
    expect((await alive(page)).painted).toBeGreaterThan(0);
  });
});

/* ---------------------------------------------- Landscape conversations */

test.describe("a conversation in landscape leaves the world visible", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test("opens as a side panel rather than a wall", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await page.getByRole("button", { name: /Quests/ }).click();
    await page
      .locator("li")
      .filter({ hasText: "Devi" })
      .first()
      .getByRole("button", { name: "Go there" })
      .click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /^Talk/ }).click();

    const panel = page.getByRole("dialog", { name: /Talking to Devi/ });
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    /*
     * Half the point of having these conversations in a world is that a person
     * remembers where they had them. A full width sheet across a landscape
     * screen turns Streets back into a dark app with a form in it.
     */
    expect(box!.width).toBeLessThan(844 * 0.55);
    expect(box!.x).toBeGreaterThan(844 * 0.35);
  });
});
