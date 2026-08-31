import { expect, test, type Page } from "@playwright/test";

import { readProfile, seedProfile } from "./helpers";

/**
 * The living world: sound, and things in it worth stopping at.
 *
 * ---
 *
 * Two claims are being pinned here and both were previously unfalsifiable.
 *
 * "Safe is silent" was true only by accident: leaving Streets unmounts the
 * world, which stops the music, so arriving at Safe happened to be quiet.
 * Emergent properties rot, so the provider now forces it on the route and
 * publishes the result on the document element, which is what these tests
 * read. That attribute exists for the same reason `data-player-tile` does: an
 * AudioContext is not inspectable from a test, so without it the claim is
 * about a class nobody can reach.
 *
 * "The world is worth walking around in" is the other, and the honest test of
 * it is that a player with no objective can find something, look at it, and
 * keep it. That is what the prop tests do, on foot, with no quest list.
 */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };

const seedPlayer = (page: Page, extra: Record<string, unknown> = {}) =>
  seedProfile(page, { streetsAvatar: AVATAR, ...extra });

/** Walks in one direction in short bursts until a control appears. */
async function reach(page: Page, label: RegExp, key: string, tries = 10) {
  for (let i = 0; i < tries; i += 1) {
    if (await page.getByRole("button", { name: label }).isVisible().catch(() => false)) return true;
    await page.keyboard.down(key);
    await page.waitForTimeout(220);
    await page.keyboard.up(key);
    await page.waitForTimeout(90);
  }
  return page.getByRole("button", { name: label }).isVisible().catch(() => false);
}

/* --------------------------------------------------------------- Sound */

test.describe("sound is asked for once, and never assumed", () => {
  test("offers the choice on the first visit and remembers a no", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    const prompt = page.getByRole("group", { name: "Sound" });
    await expect(prompt).toBeVisible();

    await page.getByRole("button", { name: "Keep it quiet" }).click();
    await expect(prompt).toHaveCount(0);

    /* And it stays answered across a reload. A prompt that returns was never a question. */
    await page.reload();
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await expect(page.getByRole("group", { name: "Sound" })).toHaveCount(0);
  });

  test("never starts audio without a gesture", async ({ page }) => {
    /*
     * The autoplay rule, asserted rather than assumed. Nothing may be playing
     * on arrival, however the player answered last time, because a browser
     * will refuse it anyway and a product that tries is one that will
     * eventually succeed on some platform and surprise somebody on a bus.
     */
    await seedPlayer(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "sidequest.audio.v1",
        JSON.stringify({ enabled: true, music: true, ambience: true, sfx: true }),
      );
    });
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    await expect(page.locator("html")).not.toHaveAttribute("data-audio-scene", "streets");
  });

  test("puts the controls in the world and in settings", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    await page.getByRole("button", { name: /Sound settings/ }).click();
    await expect(page.getByRole("dialog", { name: "Sound" })).toBeVisible();
    /* Three categories, separately controllable, as the guidelines ask. */
    for (const label of ["Sound effects", "Music", "Ambience"]) {
      await expect(page.getByRole("switch", { name: new RegExp(label) })).toBeVisible();
    }
    await expect(page.getByText(/Everything SIDEQUEST tells you is on the screen too/)).toBeVisible();
    await page.getByRole("button", { name: "Back to the block" }).click();

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Sound" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Turn sound on" })).toBeVisible();
  });
});

/* ---------------------------------------------------------------- Safe */

test.describe("Safe stays out of the game layer", () => {
  test("carries no music, no ambience and no sound controls", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/safe");
    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();

    await expect(page.locator("html")).toHaveAttribute("data-audio-scene", "none");
    await expect(page.getByRole("group", { name: "Sound" })).toHaveCount(0);
    await expect(page.getByRole("switch", { name: /Music/ })).toHaveCount(0);
  });

  test("silences the world layer on arrival from Streets", async ({ page }) => {
    /*
     * The path that matters: somebody in the middle of the world taps Safe.
     * Whatever was playing has to stop, and it has to stop because a rule says
     * so rather than because unmounting happened to do it.
     */
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();

    await page.goto("/safe");
    await expect(page.getByRole("heading", { name: "What do you need?" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-audio-scene", "none");
  });
});

/* --------------------------------------------------------------- Props */

test.describe("the world is worth walking around in", () => {
  test("something can be found, looked at and kept, with no objective at all", async ({ page }) => {
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await page.getByRole("button", { name: "Keep it quiet" }).click();

    /*
     * On foot, and deliberately not through the Quest List. The claim being
     * tested is that walking around is itself worth doing, and a test that
     * teleported would be testing the opposite.
     */
    const found = await reach(page, /^Look/, "ArrowDown");
    expect(found, "nothing to look at within a short walk of spawn").toBe(true);

    await page.getByRole("button", { name: /^Look/ }).click();
    await expect(page.getByRole("dialog", { name: /^Looking at/ })).toBeVisible();

    /* A discovery is announced where it is found, never later on another screen. */
    await expect(page.getByText(/^Kept: /)).toBeVisible();
    const profile = await readProfile(page);
    expect((profile.districtMoments as string[]).length).toBe(1);

    await page.getByRole("button", { name: "Back to the block" }).click();
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
  });

  test("keeps a moment once, and pays no XP for it", async ({ page }) => {
    /*
     * The reward rule. Looking at benches must never become a way to earn,
     * because that scales the economy with the number of props and turns a
     * neighbourhood into a field to be harvested.
     */
    await seedPlayer(page, { xp: 0 });
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await page.getByRole("button", { name: "Keep it quiet" }).click();

    await reach(page, /^Look/, "ArrowDown");
    await page.getByRole("button", { name: /^Look/ }).click();
    await page.getByRole("button", { name: "Back to the block" }).click();

    /* Looking again says nothing new and still pays nothing. */
    await page.getByRole("button", { name: /^Look/ }).click();
    await expect(page.getByText(/^Kept: /)).toHaveCount(0);

    const profile = await readProfile(page);
    expect(profile.xp).toBe(0);
    expect((profile.districtMoments as string[]).length).toBe(1);
  });

  test("a person always wins the interact button", async ({ page }) => {
    /*
     * Somebody waiting to talk to you matters more than a planter. If a prop
     * could ever take the button from a person, a player would have to walk
     * away from a conversation to clear an object out of the way.
     */
    await seedPlayer(page);
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await page.getByRole("button", { name: "Keep it quiet" }).click();

    const reached = await reach(page, /^Talk/, "ArrowUp");
    expect(reached).toBe(true);
    await expect(page.getByRole("button", { name: /^Look/ })).toHaveCount(0);
  });
});

/* ----------------------------------------------------- World consequence */

test.describe("finishing something changes the district", () => {
  test("moves the person whose situation resolved", async ({ page }) => {
    /*
     * The claim the brief calls a priority: after a prevention action,
     * something in Streets should change, and not only a flag in storage.
     *
     * Devi stands at 14,12 while her thread is live and at 17,13 once it is
     * done. Asserted through where the world walks the player, which is the
     * one position fact reachable from outside a canvas. Landing beside the
     * old spot would mean the district had not noticed.
     */
    await seedPlayer(page, {
      threadSteps: [
        "thread-favour:step-hear",
        "thread-favour:step-ask",
        "thread-favour:step-choose",
        "thread-favour:step-after",
      ],
    });
    await page.goto("/streets");
    await expect(page.getByTestId("streets-canvas")).toBeVisible();
    await page.getByRole("button", { name: "Keep it quiet" }).click();

    await page.getByRole("button", { name: /Quests/ }).click();
    await page
      .locator("li")
      .filter({ hasText: /^Devi/ })
      .first()
      .getByRole("button", { name: "Go there" })
      .click();

    const tile = await page.getByTestId("streets-canvas").getAttribute("data-player-tile");
    const [x, y] = (tile ?? "0,0").split(",").map(Number);

    const toOld = Math.hypot(x - 14, y - 12);
    const toNew = Math.hypot(x - 17, y - 13);
    expect(toNew, `landed at ${tile}, which is still beside where she was`).toBeLessThan(toOld);

    /* And she says the line that belongs to the world having changed. */
    await expect(page.getByRole("button", { name: /^Talk/ })).toBeEnabled();
    await page.getByRole("button", { name: /^Talk/ }).click();
    await expect(page.getByText("He asked me again. I had the words ready that time.")).toBeVisible();
  });
});

/* ------------------------------------------------------------ Geometry */

/**
 * The new surfaces at every width the product supports.
 *
 * The sound sheet is a new overlay in a world that already has to survive two
 * orientations, and the switches are the first controls in the product whose
 * hit area is a row rather than a button, so both are checked at all six rather
 * than at the two the rest of the suite runs.
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

    test("the sound sheet and the collection fit without sideways scroll", async ({ page }) => {
      await seedPlayer(page);
      await page.goto("/streets");
      await expect(page.getByTestId("streets-canvas")).toBeVisible();
      expect(await overflows(page), `${size.name} streets`).toBe(false);

      await page.getByRole("button", { name: /Sound settings/ }).click();
      await expect(page.getByRole("dialog", { name: "Sound" })).toBeVisible();
      expect(await overflows(page), `${size.name} sound sheet`).toBe(false);

      /* Every switch stays a real touch target at every width. */
      for (const label of ["Sound effects", "Music", "Ambience"]) {
        const box = await page
          .getByRole("switch", { name: new RegExp(label) })
          .boundingBox();
        expect(box!.height, `${size.name} ${label}`).toBeGreaterThanOrEqual(44);
      }

      await page.goto("/you");
      await expect(page.getByRole("heading", { name: "District moments" })).toBeVisible();
      expect(await overflows(page), `${size.name} you`).toBe(false);

      await page.goto("/settings");
      await expect(page.getByRole("heading", { name: "Sound" })).toBeVisible();
      expect(await overflows(page), `${size.name} settings`).toBe(false);
    });
  });
}
