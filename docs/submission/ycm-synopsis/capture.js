/**
 * Screenshot capture for the YCM synopsis document.
 *
 * Every image in the PDF comes from here. Nothing is photographed, nothing is
 * cropped by hand, and nothing enters the document without a manifest entry.
 *
 * ---
 *
 * ## Why Playwright rather than a handset
 *
 * A previous attempt photographed a real phone. Every image carried the iOS
 * status bar, the Safari address bar and the Safari toolbar, so roughly a
 * quarter of each picture was browser rather than product. Headless Chromium
 * has no chrome to capture: the viewport is the whole image by construction,
 * which is a stronger guarantee than a rule telling somebody to crop.
 *
 * ## Why state is seeded rather than played
 *
 * A capture that depends on somebody walking to the right place is a capture
 * that differs every run. Two hooks make the world deterministic:
 *
 * - `localStorage["sidequest.profile.v1"]` is the persisted profile. Writing it
 *   before the app boots clears the onboarding gate and fixes progress.
 * - `sessionStorage["sidequest.streets.here"]` is the world's return-to-place
 *   memory. Writing it before navigation puts the player on an exact tile in
 *   the first painted frame, with no visible jump from the spawn point.
 *
 * Both are read by the product itself. Nothing here reaches into internals the
 * application does not already expose.
 *
 * ## What is recorded
 *
 * `manifest.json` records, per image: the route, the viewport, the device scale
 * factor, the capture timestamp, the git commit, whether the source was the
 * live deployment or a local build, and the state that was seeded. An image
 * with no manifest entry has no provenance, and a screenshot with no
 * provenance is an unestablished claim.
 *
 * Usage:  node docs/submission/ycm-synopsis/capture.js [--local] [--only=id,id]
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const { chromium } = require("playwright");
const sharp = require("sharp");

/* ------------------------------------------------------------- Settings */

const HERE = __dirname;
const SHOTS = path.join(HERE, "assets", "screenshots");
const LIVE_URL = "https://sidequest-q81t.vercel.app";
const LOCAL_URL = "http://127.0.0.1:3100";

const args = process.argv.slice(2);
const useLocal = args.includes("--local");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").map((s) => s.trim()) : null;

const BASE = useLocal ? LOCAL_URL : LIVE_URL;
const SOURCE = useLocal ? "local" : "live";

/** Print scale. Text has to survive being placed at 70mm on a 300dpi page. */
const DSF = 3;

const PORTRAIT = { width: 390, height: 844 };
const LANDSCAPE = { width: 844, height: 390 };

const PROFILE_KEY = "sidequest.profile.v1";
const PLACE_KEY = "sidequest.streets.here";

/** How long to let the world settle after its ready signal, in milliseconds. */
const SETTLE_WORLD = 1600;
/** How long to let a DOM screen settle. Shorter: nothing is animating at rest. */
const SETTLE_DOM = 700;

const MAX_ATTEMPTS = 3;

/* -------------------------------------------------------------- Profiles */

const AVATAR = { skin: "#c98d5f", hair: "#5a3a22", hairStyle: "swept", top: "#22cde6" };

/** An onboarded player who has done nothing yet. */
const FRESH = {
  displayName: "Sam",
  ageBand: "16-18",
  interests: ["peer-pressure", "shop-theft", "design"],
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
  streetsAvatar: AVATAR,
};

/**
 * A player part way through.
 *
 * Used only where an empty screen would be a worse capture than a populated
 * one: the passport and the rewards counter. The numbers are demonstration
 * state, they are recorded in the manifest, and the document never presents
 * them as a real participant.
 */
const PROGRESSED = {
  ...FRESH,
  xp: 480,
  streakDays: 4,
  completedMissionIds: ["mission-rewind", "mission-norm-mirror", "mission-otp"],
  skillPoints: {
    "decision-making": 3,
    "peer-intervention": 2,
    communication: 2,
    "safety-design": 1,
  },
};

/* --------------------------------------------------------------- Helpers */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function commitSha() {
  return execSync("git rev-parse HEAD", { cwd: path.join(HERE, "..", "..", "..") })
    .toString()
    .trim();
}

/** Clicks a button by its exact visible label. */
async function tap(page, label, { timeout = 8000 } = {}) {
  const button = page.getByRole("button", { name: label, exact: true }).last();
  await button.waitFor({ state: "visible", timeout });
  await button.click();
  await sleep(450);
}

/** Advances a story beat until the named control appears, or gives up. */
async function advanceUntil(page, label, limit = 24) {
  for (let i = 0; i < limit; i += 1) {
    const target = page.getByRole("button", { name: label, exact: true }).last();
    if (await target.isVisible().catch(() => false)) return true;

    const names = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button"))
        .filter((el) => el.offsetParent !== null && !el.disabled)
        .map((el) => (el.innerText || "").trim().replace(/\s+/g, " "))
        .filter((t) => t && !/^close mission$/i.test(t)),
    );
    if (!names.length) return false;
    await page
      .getByRole("button", { name: names[names.length - 1], exact: true })
      .last()
      .click()
      .catch(() => {});
    await sleep(600);
  }
  return false;
}

/** Opens the Quest List and clicks a row's primary control. */
async function questListAction(page, rowLabel) {
  await tap(page, "Quests");
  await sleep(500);
  await tap(page, rowLabel);
  await sleep(900);
}

/* ------------------------------------------------------------- Rejection */

/**
 * Reasons to throw a capture away.
 *
 * Run in the page, before the screenshot, so a bad frame is never written. The
 * blankness test runs on the file afterwards, because a canvas that painted
 * nothing looks perfectly healthy from the DOM.
 */
async function inspectPage(page) {
  return page.evaluate(() => {
    const problems = [];
    const text = document.body.innerText || "";

    if (/Loading SIDEQUEST|Loading the block/i.test(text)) {
      problems.push("loading placeholder still on screen");
    }

    /*
     * A spinner means the view has not finished. A progress bar does not: the
     * crew challenge and the level ring are both `role="progressbar"` and both
     * are the product working correctly. An earlier version of this check
     * conflated the two and threw away three good captures.
     */
    if (document.querySelector(".animate-spin")) problems.push("spinner visible");

    /*
     * Horizontal overflow of the document, which is the rule the product
     * actually holds itself to. Measuring per element instead reported every
     * absolutely positioned and transformed control as clipped, because
     * `scrollWidth` on a transformed box does not mean what it looks like it
     * means.
     */
    const doc = document.documentElement;
    if (doc.scrollWidth > window.innerWidth + 2) {
      problems.push(`page scrolls horizontally (${doc.scrollWidth} > ${window.innerWidth})`);
    }

    if (text.trim().length < 20) problems.push("almost no text on screen");

    return problems;
  });
}

/**
 * Rejects a frame that is nearly one flat colour.
 *
 * This is the "empty area of world with nothing happening" test. A street with
 * people, buildings and signals has plenty of tonal spread; an unpainted canvas
 * or a corner of empty grass does not.
 */
async function inspectImage(file) {
  const stats = await sharp(file).stats();
  const spread = Math.max(...stats.channels.map((c) => c.stdev));
  return spread < 12 ? [`image is nearly uniform (stdev ${spread.toFixed(1)})`] : [];
}

/* --------------------------------------------------------------- Targets */

/**
 * The capture list.
 *
 * `ready` is a selector that only exists once the view has actually rendered,
 * which is what the wait hangs on. `networkidle` is not used anywhere: this is
 * a client rendered application and an idle network says nothing about whether
 * React has painted.
 */
const TARGETS = [
  {
    id: "01-streets-hero-landscape",
    what: "Streets, landscape, the block with residents and shopfronts. Cover hero.",
    route: "/streets",
    viewport: LANDSCAPE,
    profile: FRESH,
    // High enough up the map that all three shopfronts are whole. At y=9 the
    // camera clamp cut their roofs off at the top edge.
    place: { mapId: "district", x: 19, y: 7, facing: "down" },
    ready: '[data-testid="streets-canvas"]',
    settle: SETTLE_WORLD,
  },
  {
    id: "02-streets-district-landscape",
    what: "Streets, landscape, the south of the district: court, park, community post.",
    route: "/streets",
    viewport: LANDSCAPE,
    profile: FRESH,
    place: { mapId: "district", x: 20, y: 15, facing: "down" },
    ready: '[data-testid="streets-canvas"]',
    settle: SETTLE_WORLD,
  },
  {
    id: "03-streets-portrait-minimap",
    what: "Streets, portrait, one handed, minimap and touch pad visible.",
    route: "/streets",
    viewport: PORTRAIT,
    profile: FRESH,
    place: { mapId: "district", x: 17, y: 10, facing: "down" },
    ready: '[data-testid="streets-canvas"]',
    settle: SETTLE_WORLD,
  },
  {
    id: "04-streets-quest-list-landscape",
    what:
      "The Quest List: every Prevention Signal in words, and every destination " +
      "openable without walking.",
    route: "/streets",
    viewport: LANDSCAPE,
    profile: FRESH,
    place: { mapId: "district", x: 20, y: 11, facing: "down" },
    ready: '[data-testid="streets-canvas"]',
    settle: SETTLE_WORLD,
    async drive(page) {
      await tap(page, "Quests");
      await sleep(700);
    },
  },
  {
    id: "05-streets-interior-landscape",
    what: "Inside Sunrise Minimart. An interior a player can walk into.",
    route: "/streets",
    viewport: LANDSCAPE,
    profile: FRESH,
    place: { mapId: "minimart-in", x: 9, y: 14, facing: "right" },
    ready: '[data-testid="streets-canvas"]',
    settle: SETTLE_WORLD,
  },
  {
    id: "06-thread-devi-portrait",
    what: "Prevention Thread 'The favour', first step: Devi in the world.",
    route: "/streets",
    viewport: PORTRAIT,
    profile: FRESH,
    place: { mapId: "district", x: 14, y: 13, facing: "up" },
    ready: '[data-testid="streets-canvas"]',
    settle: SETTLE_WORLD,
    // The Quest List walks the player to Devi, so the seeded tile is a start
    // position, not the position the capture is taken at.
    movesPlayer: true,
    async drive(page) {
      await questListAction(page, "Hear her out");
    },
  },
  {
    id: "07-rewind-affordance-portrait",
    what: "REWIND, at the moment the rewind back to the decision is offered.",
    route: "/play/mission-rewind",
    viewport: PORTRAIT,
    profile: FRESH,
    ready: "text=REWIND",
    settle: SETTLE_DOM,
    async drive(page) {
      await tap(page, "Start");
      await advanceUntil(page, "Say nothing and look away");
      await tap(page, "Say nothing and look away");
      await advanceUntil(page, "Rewind to the decision");
    },
  },
  {
    id: "08-norm-mirror-reveal-portrait",
    what: "Norm Mirror reveal: predicted against the prototype figure, labelled as prototype data.",
    route: "/play/mission-norm-mirror",
    viewport: PORTRAIT,
    profile: FRESH,
    ready: "text=Norm Mirror",
    settle: SETTLE_DOM,
    async drive(page) {
      await tap(page, "Start");
      await tap(page, "Lock in 50%");
      await tap(page, "I'd say no");
      await sleep(900);
    },
  },
  {
    id: "09-breaksafe-terminal-portrait",
    what: "BREAKSAFE: the self checkout, with the design problems still to be found.",
    route: "/play/mission-breaksafe",
    viewport: PORTRAIT,
    profile: FRESH,
    ready: "text=BREAKSAFE",
    readyAfterDrive: "text=Find what makes the safe decision difficult",
    settle: SETTLE_DOM,
    async drive(page) {
      await tap(page, "Open the terminal");
      await sleep(700);
    },
  },
  {
    id: "10-crew-shift-setup-portrait",
    what: "Crew Shift setup inside Chapter 4 of ONE BAD MINUTE, showing Solo preview labelled.",
    route: "/campaigns/one-bad-minute/chapter/crew-shift",
    viewport: PORTRAIT,
    profile: FRESH,
    ready: "text=Crew Shift",
    settle: SETTLE_DOM,
    async drive(page) {
      await tap(page, "Start chapter 4");
      await advanceUntil(page, "Solo preview");
    },
  },
  {
    id: "11-crew-screen-portrait",
    what: "The Community Safety Crew screen with the weekly crew challenge.",
    route: "/crew",
    viewport: PORTRAIT,
    profile: PROGRESSED,
    ready: "text=This week's crew challenge",
    settle: SETTLE_DOM,
  },
  {
    id: "12-passport-portrait",
    what: "You: Echo, level and the Safety Passport.",
    route: "/you",
    viewport: PORTRAIT,
    profile: PROGRESSED,
    ready: "text=Safety Passport",
    settle: SETTLE_DOM,
    scrollToHeading: "Safety Passport",
    scrollOffset: 12,
  },
  {
    id: "13-rewards-counter-portrait",
    what:
      "The rewards counter inside the kopitiam: the reward ladder, what is " +
      "claimable at this XP, and the declaration that no retailer has agreed to any of it.",
    route: "/streets",
    viewport: PORTRAIT,
    profile: PROGRESSED,
    // Standing at the counter, so the strip of world above the sheet is the
    // room the claim is being made in. Walking somewhere is the point of
    // putting this in the world at all.
    place: { mapId: "kopitiam-in", x: 4, y: 3, facing: "up" },
    ready: '[data-testid="streets-canvas"]',
    settle: SETTLE_WORLD,
    readyAfterDrive: "text=XP earned",
    async drive(page) {
      await questListAction(page, "Open the counter");
    },
  },
];

/* --------------------------------------------------------------- Capture */

async function capture(browser, target, sha) {
  const context = await browser.newContext({
    viewport: target.viewport,
    deviceScaleFactor: DSF,
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });

  /*
   * Take the scrollbar out of the layout, not just out of sight.
   *
   * Desktop Chromium reserves 15 CSS pixels for a classic scrollbar gutter. A
   * `position: fixed; inset: 0` layout therefore measured 829 wide inside an
   * 844 wide viewport, and every landscape capture carried a 15 pixel strip of
   * page background down its right edge. `--hide-scrollbars` alone was not
   * enough: it stops the scrollbar being painted and still reserves the gutter.
   * Zeroing `::-webkit-scrollbar` removes the gutter while leaving the document
   * scrollable, which the Safety Passport capture needs.
   *
   * This makes the capture match a phone, where scrollbars are overlays and
   * reserve nothing. It is not hiding a defect: the product has no horizontal
   * overflow, and `inspectPage` still fails a capture that does.
   */
  await context.addInitScript(() => {
    const install = () => {
      const style = document.createElement("style");
      style.textContent = "::-webkit-scrollbar{width:0!important;height:0!important}";
      (document.head || document.documentElement).appendChild(style);
    };
    if (document.documentElement) install();
    else document.addEventListener("DOMContentLoaded", install, { once: true });
  });

  await context.addInitScript(
    ([profileKey, profile, placeKey, place]) => {
      try {
        window.localStorage.setItem(
          profileKey,
          JSON.stringify({ state: { profile }, version: 1 }),
        );
        if (place) window.sessionStorage.setItem(placeKey, JSON.stringify(place));
        else window.sessionStorage.removeItem(placeKey);
      } catch {
        // Nothing to do. The capture will fail its own inspection instead.
      }
    },
    [PROFILE_KEY, target.profile, PLACE_KEY, target.place ?? null],
  );

  const page = await context.newPage();
  const file = path.join(SHOTS, `${target.id}.png`);

  try {
    await page.goto(`${BASE}${target.route}`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    // A real ready signal: an element that exists only once this view painted.
    await page.waitForSelector(target.ready, { state: "visible", timeout: 30000 });
    await sleep(target.settle);

    /*
     * Scroll a named section to a chosen height in the viewport.
     *
     * `scrollIntoViewIfNeeded` is the obvious call and it is the wrong one
     * here: it treated the Safety Passport as already visible while the fixed
     * bottom navigation was sitting on top of it, so the capture came back
     * unscrolled with the heading half hidden behind the tab bar. Scrolling to
     * an explicit offset is the only version that frames a section rather than
     * merely reaching it.
     */
    if (target.scrollToHeading) {
      const found = await page.evaluate(
        ([heading, offset]) => {
          const match = Array.from(document.querySelectorAll("h1, h2, h3")).find(
            (el) => (el.textContent || "").trim() === heading,
          );
          if (!match) return false;
          const top = match.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
          return true;
        },
        [target.scrollToHeading, target.scrollOffset ?? 40],
      );
      if (!found) throw new Error(`no heading "${target.scrollToHeading}" to scroll to`);
      await sleep(600);
    }
    if (target.drive) await target.drive(page);
    if (target.readyAfterDrive) {
      await page.waitForSelector(target.readyAfterDrive, { state: "visible", timeout: 20000 });
    }
    await sleep(target.settle);

    /*
     * Confirm the seeded tile actually took.
     *
     * `WorldEngine.restore` returns silently when the tile is not walkable, so
     * a mistyped coordinate does not fail: it leaves the player at the spawn
     * point and hands back a completely plausible screenshot of the wrong
     * place. The world writes its current tile back to the same key, so
     * reading it after the settle says where the player really is.
     */
    if (target.place && !target.movesPlayer) {
      const actual = await page.evaluate(
        (key) => window.sessionStorage.getItem(key),
        PLACE_KEY,
      );
      const here = actual ? JSON.parse(actual) : null;
      const want = target.place;
      if (!here || here.mapId !== want.mapId || here.x !== want.x || here.y !== want.y) {
        throw new Error(
          `seeded tile was rejected: wanted ${want.mapId} ${want.x},${want.y}, ` +
            `landed on ${here ? `${here.mapId} ${here.x},${here.y}` : "nothing"}`,
        );
      }
    }

    const problems = await inspectPage(page);
    if (problems.length) throw new Error(problems.join("; "));

    await page.screenshot({ path: file, animations: "disabled" });

    const imageProblems = await inspectImage(file);
    if (imageProblems.length) {
      fs.rmSync(file, { force: true });
      throw new Error(imageProblems.join("; "));
    }

    const meta = await sharp(file).metadata();
    return {
      file: `${target.id}.png`,
      what: target.what,
      route: target.route,
      url: `${BASE}${target.route}`,
      viewport: target.viewport,
      deviceScaleFactor: DSF,
      pixels: { width: meta.width, height: meta.height },
      capturedAt: new Date().toISOString(),
      commit: sha,
      source: SOURCE,
      seededState: {
        profile: {
          xp: target.profile.xp,
          completedMissionIds: target.profile.completedMissionIds,
        },
        place: target.place ?? null,
      },
      method: "playwright headless chromium, no browser chrome present by construction",
    };
  } finally {
    await context.close();
  }
}

/* ---------------------------------------------------------- Contact sheet */

/**
 * One image showing everything that was accepted, with filenames under each.
 *
 * Reviewing twelve separate files means holding twelve things in mind. One
 * sheet means pointing at the two that are wrong.
 */
async function contactSheet(entries) {
  const COLS = 4;
  const CELL_W = 460;
  const CELL_H = 400;
  const LABEL_H = 46;
  const PAD = 16;

  const rows = Math.ceil(entries.length / COLS);
  const sheetW = COLS * CELL_W + PAD * (COLS + 1);
  const sheetH = rows * (CELL_H + LABEL_H) + PAD * (rows + 1);

  const composites = [];

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const left = PAD + col * (CELL_W + PAD);
    const top = PAD + row * (CELL_H + LABEL_H + PAD);

    const thumb = await sharp(path.join(SHOTS, entry.file))
      .resize(CELL_W, CELL_H, { fit: "contain", background: "#0a0b12" })
      .toBuffer();

    composites.push({ input: thumb, left, top });

    const shape = `${entry.viewport.width}x${entry.viewport.height}`;
    const label = `
      <svg width="${CELL_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${CELL_W}" height="${LABEL_H}" fill="#12141f"/>
        <text x="8" y="19" font-family="Segoe UI, Arial, sans-serif" font-size="15"
              font-weight="700" fill="#e9ecf5">${entry.file}</text>
        <text x="8" y="38" font-family="Segoe UI, Arial, sans-serif" font-size="13"
              fill="#8b93a7">${shape} at ${DSF}x  ${entry.route}</text>
      </svg>`;
    composites.push({ input: Buffer.from(label), left, top: top + CELL_H });
  }

  const out = path.join(SHOTS, "contact-sheet.png");
  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 3,
      background: "#05060b",
    },
  })
    .composite(composites)
    .png()
    .toFile(out);

  return out;
}

/* ------------------------------------------------------------------ Main */

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  const sha = commitSha();
  const list = only ? TARGETS.filter((t) => only.includes(t.id)) : TARGETS;

  console.log(`SIDEQUEST synopsis capture`);
  console.log(`  source     ${SOURCE}  ${BASE}`);
  console.log(`  commit     ${sha}`);
  console.log(`  scale      ${DSF}x`);
  console.log(`  targets    ${list.length}\n`);

  const browser = await chromium.launch({ args: ["--hide-scrollbars"] });
  const accepted = [];
  const rejected = [];

  for (const target of list) {
    let entry = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        entry = await capture(browser, target, sha);
        console.log(`  OK      ${target.id}  (attempt ${attempt})`);
        break;
      } catch (error) {
        const reason = String(error.message).split("\n")[0].slice(0, 160);
        console.log(`  REJECT  ${target.id}  attempt ${attempt}: ${reason}`);
        rejected.push({ id: target.id, attempt, reason });
        await sleep(900);
      }
    }
    if (entry) accepted.push(entry);
    else console.log(`  FAILED  ${target.id}  gave up after ${MAX_ATTEMPTS} attempts`);
  }

  await browser.close();

  const manifest = {
    generatedAt: new Date().toISOString(),
    commit: sha,
    source: SOURCE,
    baseUrl: BASE,
    deviceScaleFactor: DSF,
    tool: "playwright headless chromium",
    playwrightVersion: require("playwright/package.json").version,
    note:
      "Every image in the synopsis PDF is listed here. Captures are headless " +
      "browser screenshots: no browser chrome, no device frame, no photography, " +
      "no retouching. Seeded state is recorded per image.",
    captures: accepted,
    rejections: rejected,
  };

  fs.writeFileSync(
    path.join(SHOTS, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  let sheet = null;
  if (accepted.length) sheet = await contactSheet(accepted);

  console.log(`\n  accepted   ${accepted.length}`);
  console.log(`  rejected   ${rejected.length}`);
  console.log(`  manifest   ${path.join(SHOTS, "manifest.json")}`);
  if (sheet) console.log(`  sheet      ${sheet}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
