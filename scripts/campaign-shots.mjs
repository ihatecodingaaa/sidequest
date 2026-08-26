/**
 * Visual QA for the Campaign surfaces. Drives the real flows at phone width.
 * Not part of the build.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.SQ_BASE ?? "http://localhost:3000";
const OUT = resolve(process.cwd(), ".shots");
const desktop = process.argv.includes("--desktop");
mkdirSync(OUT, { recursive: true });

const CAMPAIGN_ID = "campaign-one-bad-minute";
const seed = (extra = {}) => ({
  state: {
    profile: {
      displayName: "Lucas", ageBand: "16-18", interests: ["scams"], neighbourhood: "Tampines",
      xp: 210, streakDays: 4, completedMissionIds: [], savedPulseIds: [], crewId: "crew-clubhouse",
      skillPoints: {}, submissions: [], rewardClaims: [], onboardedAt: "2026-08-20T10:00:00.000Z",
      campaigns: {}, ...extra,
    },
  },
  version: 1,
});

const THREE_DONE = {
  campaigns: {
    [CAMPAIGN_ID]: {
      campaignId: CAMPAIGN_ID, mode: "story", routeId: "route-b",
      startedAt: "2026-09-01T10:00:00.000Z",
      unlockedChapterIds: ["obm-c1", "obm-c2", "obm-c3"],
      completedChapterIds: ["obm-c1", "obm-c2", "obm-c3"],
      chapterResults: {}, finaleCompleted: false, finaleOptionId: null,
      completedAt: null, completedFollowUpIds: [],
      awardedKeys: ["chapter:obm-c1", "chapter:obm-c2", "chapter:obm-c3"],
      demoHoursOffset: 0,
    },
  },
};

const browser = await chromium.launch();
const errors = [];

async function session(name, profileExtra, steps) {
  const ctx = await browser.newContext({
    viewport: desktop ? { width: 1440, height: 900 } : { width: 390, height: 844 },
    deviceScaleFactor: 2, colorScheme: "dark",
  });
  await ctx.addInitScript((s) => {
    if (!window.localStorage.getItem("sidequest.profile.v1")) {
      window.localStorage.setItem("sidequest.profile.v1", JSON.stringify(s));
    }
  }, seed(profileExtra));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(name + ": " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(name + ": " + m.text()); });

  const shot = async (label) => {
    await page.waitForTimeout(450);
    const prefix = desktop ? "desktop" : "mobile";
    await page.screenshot({ path: resolve(OUT, `${prefix}-camp-${label}.png`), fullPage: true });
    const of = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    console.log(`${of ? "OVERFLOW " : "ok       "} ${label}`);
  };
  const open = async (path) => {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#main", { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(400);
  };

  await steps(page, shot, open);
  await ctx.close();
}

await session("list", {}, async (page, shot, open) => {
  await open("/campaigns"); await shot("1-list");
  await open("/campaigns/one-bad-minute"); await shot("2-start");
  await page.getByRole("button", { name: "Start the Campaign" }).click();
  await shot("3-map");
});

await session("chapter", {}, async (page, shot, open) => {
  await open("/campaigns/one-bad-minute/chapter/crew-shift"); await shot("4-unlock");
  await page.getByRole("button", { name: "Start chapter 4" }).click(); await shot("5-intro");
  await page.getByRole("button", { name: "Continue" }).click(); await shot("6-crew-setup");
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Pass to player 1" }).click(); await shot("7-handoff");
  await page.getByRole("button", { name: "I am player 1" }).click(); await shot("8-private");
  await page.getByRole("button", { name: /One person talks/ }).click();
  await page.getByRole("button", { name: "Lock answer" }).click();
  await page.getByRole("button", { name: "I am player 2" }).click();
  await page.getByRole("button", { name: /Tell someone older/ }).click();
  await page.getByRole("button", { name: "Lock answer" }).click();
  await page.getByRole("button", { name: "I am player 3" }).click();
  await page.getByRole("button", { name: /All of you say something/ }).click();
  await page.getByRole("button", { name: "Lock answer" }).click(); await shot("9-reveal");
  await page.getByRole("button", { name: "Talk about it" }).click(); await shot("10-discuss");
  await page.getByRole("button", { name: /Skip ahead and decide|Decide/ }).click();
  await page.getByRole("button", { name: /Tell someone older/ }).click(); await shot("11-shift");
  await page.getByRole("button", { name: "Finish chapter" }).click(); await shot("12-complete");
});

await session("finale", THREE_DONE, async (page, shot, open) => {
  await open("/campaigns/one-bad-minute"); await shot("13-map-ready");
  await open("/campaigns/one-bad-minute/finale"); await shot("14-finale-intro");
  await page.getByRole("button", { name: "Answer him" }).click(); await shot("15-finale-decide");
  await page.getByRole("button", { name: /Call 1799/ }).click(); await shot("16-finale-outcome");
  await page.getByRole("button", { name: "Finish the Campaign" }).click(); await shot("17-campaign-complete");
  await page.getByRole("button", { name: "See what comes next" }).click(); await shot("18-followups");
});

await session("utils", {}, async (page, shot, open) => {
  await open("/campaigns/one-bad-minute/stations"); await page.waitForTimeout(900); await shot("19-stations");
  await open("/campaigns/one-bad-minute/impact"); await shot("20-impact");
});

console.log(errors.length ? "\nErrors:\n  " + errors.join("\n  ") : "\nNo console errors.");
await browser.close();
