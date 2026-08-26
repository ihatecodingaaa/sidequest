/**
 * Whole-product visual audit harness.
 *
 * Renders every significant screen at four widths into a labelled directory so
 * before and after can be compared honestly. Also reports horizontal overflow,
 * console errors, and whether any content ends up underneath the fixed bottom
 * navigation, which a screenshot alone will not tell you.
 *
 *   node scripts/audit-shots.mjs before
 *   node scripts/audit-shots.mjs after
 */

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.SQ_BASE ?? "http://localhost:3000";
const LABEL = process.argv[2] ?? "current";
const OUT = resolve(process.cwd(), "artifacts", `ux-${LABEL}`);

const WIDTHS = [
  { id: "390", width: 390, height: 844 },
  { id: "430", width: 430, height: 932 },
  { id: "768", width: 768, height: 1024 },
  { id: "1440", width: 1440, height: 900 },
];

const CAMPAIGN_ID = "campaign-one-bad-minute";

/** A profile with enough progress that every screen has real content in it. */
const SEED = {
  state: {
    profile: {
      displayName: "Lucas",
      ageBand: "16-18",
      interests: ["scams", "peer-pressure", "design"],
      neighbourhood: "Tampines",
      xp: 415,
      streakDays: 4,
      completedMissionIds: ["mission-otp", "mission-marketplace", "mission-crew-relay"],
      savedPulseIds: ["pulse-job-scams"],
      crewId: "crew-clubhouse",
      skillPoints: {
        "scam-awareness": 52,
        "decision-making": 30,
        communication: 24,
        "peer-intervention": 8,
      },
      submissions: [],
      rewardClaims: [],
      onboardedAt: "2026-08-20T10:00:00.000Z",
      campaigns: {
        [CAMPAIGN_ID]: {
          campaignId: CAMPAIGN_ID,
          mode: "story",
          routeId: "route-a",
          startedAt: "2026-09-01T10:00:00.000Z",
          unlockedChapterIds: ["obm-c1", "obm-c2"],
          completedChapterIds: ["obm-c1", "obm-c2"],
          chapterResults: {},
          finaleCompleted: false,
          finaleOptionId: null,
          completedAt: null,
          completedFollowUpIds: [],
          awardedKeys: ["chapter:obm-c1", "chapter:obm-c2"],
          demoHoursOffset: 0,
        },
      },
    },
  },
  version: 1,
};

const ROUTES = [
  ["home", "/"],
  ["pulse", "/pulse"],
  ["pulse-detail", "/pulse/pulse-job-scams"],
  ["missions", "/missions"],
  ["mission-detail", "/missions/mission-breaksafe"],
  ["campaigns", "/campaigns"],
  ["campaign", "/campaigns/one-bad-minute"],
  ["safe", "/safe"],
  ["you", "/you"],
  ["rewards", "/rewards"],
  ["crew", "/crew"],
  ["radio", "/radio"],
  ["settings", "/settings"],
  ["partner", "/partner"],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const size of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  await context.addInitScript((seed) => {
    if (!window.localStorage.getItem("sidequest.profile.v1")) {
      window.localStorage.setItem("sidequest.profile.v1", JSON.stringify(seed));
    }
  }, SEED);

  const page = await context.newPage();
  page.on("pageerror", (error) => problems.push(`${size.id} pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`${size.id} console: ${message.text()}`);
  });

  for (const [name, path] of ROUTES) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#main", { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(500);

    await page.screenshot({
      path: resolve(OUT, `${size.id}-${name}.png`),
      fullPage: true,
    });

    const checks = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflow = doc.scrollWidth > doc.clientWidth + 1;

      // Anything the fixed bottom navigation is sitting on top of, at the very
      // bottom of the scroll. A screenshot cannot show this.
      const nav = document.querySelector("nav[aria-label='Primary']");
      let occluded = false;
      if (nav && getComputedStyle(nav).position === "fixed") {
        window.scrollTo(0, doc.scrollHeight);
        const navBox = nav.getBoundingClientRect();
        const main = document.querySelector("#main");
        if (main) {
          const mainBox = main.getBoundingClientRect();
          occluded = mainBox.bottom > navBox.top + 2;
        }
      }
      return { overflow, occluded };
    });

    if (checks.overflow) problems.push(`${size.id} ${path}: horizontal overflow`);
    if (checks.occluded) problems.push(`${size.id} ${path}: content under bottom nav`);
  }

  await context.close();
  console.log(`captured ${size.id}px`);
}

console.log(
  problems.length ? `\nProblems:\n  ${problems.join("\n  ")}` : "\nNo layout problems detected.",
);
console.log(`\nScreenshots in ${OUT}`);
await browser.close();
