/**
 * Visual QA for the mission players.
 *
 * The e2e suite proves these flows work. This drives them to the states that
 * matter visually and writes screenshots, because "passes" and "looks right"
 * are different questions. Not part of the build.
 */

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.SQ_BASE ?? "http://localhost:3000";
const OUT = resolve(process.cwd(), ".shots");

const SEED = {
  state: {
    profile: {
      displayName: "Lucas",
      ageBand: "16-18",
      interests: ["scams", "peer-pressure", "design"],
      neighbourhood: "Tampines",
      xp: 415,
      streakDays: 4,
      completedMissionIds: [],
      savedPulseIds: [],
      crewId: "crew-clubhouse",
      skillPoints: {},
      submissions: [],
      rewardClaims: [],
      onboardedAt: "2026-08-20T10:00:00.000Z",
    },
  },
  version: 1,
};

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
});
await context.addInitScript((seed) => {
  if (!window.localStorage.getItem("sidequest.profile.v1")) {
    window.localStorage.setItem("sidequest.profile.v1", JSON.stringify(seed));
  }
}, SEED);

const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const shot = async (name) => {
  await page.waitForTimeout(500);
  const file = resolve(OUT, `hero-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  ${name}`);
};

const open = async (path) => {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#main", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(500);
};

/* ------------------------------------------------------------- REWIND */
console.log("REWIND");
await open("/play/mission-rewind");
await shot("rewind-1-intro");
await page.getByRole("button", { name: "Start" }).click();
await page.getByRole("button", { name: "Keep watching" }).click();
await shot("rewind-2-pivot");
await page.getByRole("button", { name: /Say nothing and look away/ }).click();
await page.getByRole("button", { name: "Two weeks later" }).click();
await shot("rewind-3-outcome");
await page.getByRole("button", { name: /Rewind to the decision/ }).click();
await page.waitForTimeout(700);
await shot("rewind-4-rewinding");
await page.waitForTimeout(1800);
await shot("rewind-5-second-run");
await page.getByRole("button", { name: /say something only he can hear/ }).click();
await page.getByRole("button", { name: "Leave it there" }).click();
await page.getByRole("button", { name: "Compare the two runs" }).click();
await shot("rewind-6-compare");
await page.getByRole("button", { name: "What this trains" }).click();
await page.getByRole("button", { name: "Finish mission" }).click();
await shot("rewind-7-complete");

/* -------------------------------------------------------- Norm Mirror */
console.log("Norm Mirror");
await open("/play/mission-norm-mirror");
await shot("norm-1-intro");
await page.getByRole("button", { name: "Start" }).click();
await page.getByRole("slider").fill("62");
await shot("norm-2-predict");
await page.getByRole("button", { name: /Lock in/ }).click();
await shot("norm-3-choose");
await page.getByRole("button", { name: /I'd say no/ }).click();
await shot("norm-4-reveal");

/* ----------------------------------------------------------- BREAKSAFE */
console.log("BREAKSAFE");
await open("/play/mission-breaksafe");
await shot("breaksafe-1-intro");
await page.getByRole("button", { name: "Open the terminal" }).click();
await shot("breaksafe-2-terminal");
await page.getByRole("button", { name: "Inspect: Scan area" }).click();
await shot("breaksafe-3-finding");
await page.getByRole("button", { name: "Inspect: Item list" }).click();
await page.getByRole("button", { name: "Inspect: Assistance" }).click();
await page.getByRole("button", { name: "Now change something" }).click();
await shot("breaksafe-4-patches");
await page.getByRole("button", { name: /Make the scan unmistakable/ }).click();
await page.getByRole("button", { name: /No-fault rescan/ }).click();
await page.getByRole("button", { name: /Help without an audience/ }).click();
await page.getByRole("button", { name: "Rebuild the terminal" }).click();
await shot("breaksafe-5-reveal");

/* -------------------------------------------------------- Field Quest */
console.log("Field Quest");
await open("/play/mission-field-design-hunt");
await shot("field-1-brief");
await page.getByRole("button", { name: "Check in" }).click();
await shot("field-2-checkin");

/* ------------------------------------------------------ Build Quest */
console.log("Partner Challenge");
await open("/play/mission-partner-selfcheckout");
await shot("build-1-brief");
await page.getByRole("button", { name: "Write your answer" }).click();
await shot("build-2-form");

/* ---------------------------------------------------------- Quick Quest */
console.log("Quick Quest");
await open("/play/mission-job-scam");
await page.getByRole("button", { name: "Start" }).click();
await shot("quick-1-beat");

/* ------------------------------------------------------ Partner studio */
console.log("Partner studio");
await open("/partner");
await page.getByRole("button", { name: /Decision Scenario/ }).click();
await shot("partner-studio");

console.log(errors.length ? `\nConsole errors:\n  ${errors.join("\n  ")}` : "\nNo console errors.");
await browser.close();
