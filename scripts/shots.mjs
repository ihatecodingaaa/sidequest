/**
 * Visual QA harness.
 *
 * Drives a real browser at fixed viewports and writes screenshots to a scratch
 * directory. Used during development to check every screen at phone width
 * without relying on a manually resized window. Not part of the build.
 *
 *   node scripts/shots.mjs                 all screens at 390px
 *   node scripts/shots.mjs --desktop       all screens at 1440px
 *   node scripts/shots.mjs /pulse /safe    just those routes
 */

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.SQ_BASE ?? "http://localhost:3000";
const OUT = process.env.SQ_SHOTS ?? resolve(process.cwd(), ".shots");

const args = process.argv.slice(2);
const desktop = args.includes("--desktop");
const routes = args.filter((arg) => arg.startsWith("/"));

const DEFAULT_ROUTES = [
  "/",
  "/pulse",
  "/pulse/pulse-job-scams",
  "/missions",
  "/missions/mission-rewind",
  "/radio",
  "/safe",
  "/you",
  "/rewards",
  "/crew",
  "/settings",
  "/streets",
];

const viewport = desktop ? { width: 1440, height: 900 } : { width: 390, height: 844 };

/** Seeds a completed onboarding so screens render past the gate. */
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
      /*
       * Enough history that the returning-player surfaces render.
       *
       * The seed used to describe somebody who had played three missions and
       * never been outside, so every screen added in the district passes was
       * photographed in its empty state. These are the same shape of facts,
       * just for a player who has actually been on the block.
       */
      metNpcs: ["npc-wei", "npc-ken", "npc-lek", "npc-bea"],
      districtMoments: ["moment-court", "moment-bench", "moment-planter", "moment-shelf"],
      threadSteps: ["thread-favour:hear-devi"],
      pinnedSticker: "sticker-first-light",
      crewBanner: { emblem: "ring", pattern: "plain", accent: "quest" },
      onboardedAt: "2026-08-20T10:00:00.000Z",
    },
  },
  version: 1,
};

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: 2,
  colorScheme: "dark",
});

await context.addInitScript((seed) => {
  window.localStorage.setItem("sidequest.profile.v1", JSON.stringify(seed));
}, SEED);

const page = await context.newPage();

const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`${page.url()} :: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`${page.url()} :: ${error.message}`));

for (const route of routes.length ? routes : DEFAULT_ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#main", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(700);
  const name = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
  const file = resolve(OUT, `${desktop ? "desktop" : "mobile"}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  console.log(`${overflow ? "OVERFLOW " : "ok       "} ${route} -> ${file}`);
}

if (errors.length) {
  console.log("\nConsole errors:");
  for (const error of errors) console.log("  " + error);
} else {
  console.log("\nNo console errors.");
}

await browser.close();
