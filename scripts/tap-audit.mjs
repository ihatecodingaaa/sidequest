/*
 * Counts taps from entering a mission to the first real decision.
 *
 * Two numbers, and neither is "smaller is better" on its own.
 *
 *   taps  how many times you press before the first real decision.
 *   step  the most new words that ever arrive between two consecutive presses.
 *
 * `step` is the one that matches the complaint. The testers did not object to
 * pressing things; they objected to being handed a page at a time. Total words
 * on screen is the wrong measure, because revealed lines accumulate on purpose
 * so a scene can be re-read, so the end state barely moves under segmenting and
 * measuring it would flatter nothing and prove nothing.
 *
 * Taps is the guard rail on the other side. Segmenting is meant to pace a
 * story, not turn it into paperwork, so a big fall in `step` bought with a
 * tripling of `taps` is a bad trade, not a win.
 *
 *   node scripts/tap-audit.mjs
 *
 * Needs a server on :3000.
 */

import { chromium, devices } from "playwright";

const BASE = process.env.SQ_BASE ?? "http://localhost:3000";

const PROFILE = {
  displayName: "Lucas",
  ageBand: "16-18",
  interests: ["scams", "peer-pressure", "design"],
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
};

/** Anything whose only job is "show me the next bit". */
const ADVANCE = /^(tap to continue|continue|start|start chapter \d|next|keep watching|keep listening|answer him|pass to player 1|your call)$/i;

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 7"] });
await ctx.addInitScript((profile) => {
  const key = "sidequest.profile.v1";
  if (window.localStorage.getItem(key)) return;
  window.localStorage.setItem(key, JSON.stringify({ state: { profile }, version: 1 }));
}, PROFILE);

const page = await ctx.newPage();

async function measure(label, url) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  let taps = 0;
  let maxStep = 0;
  let previous = 0;

  for (let step = 0; step < 30; step += 1) {
    // How much prose is on screen right now, ignoring buttons and chrome.
    const words = await page.evaluate(() => {
      const root = document.querySelector("main") ?? document.body;
      let total = 0;
      for (const p of root.querySelectorAll("p")) {
        if (p.closest("button, a, nav, header")) continue;
        const rect = p.getBoundingClientRect();
        if (rect.height === 0) continue;
        total += (p.textContent ?? "").trim().split(/\s+/).filter(Boolean).length;
      }
      return total;
    });
    /*
     * New words since the last press. A drop means the screen replaced its
     * content rather than adding to it, in which case everything on it is new.
     */
    maxStep = Math.max(maxStep, words >= previous ? words - previous : words);
    previous = words;

    const buttons = page.getByRole("button");
    const labels = (await buttons.allInnerTexts()).map((l) => l.trim().split("\n")[0].trim());
    const idx = labels.findIndex((l) => ADVANCE.test(l));

    if (idx === -1) {
      const options = labels.filter((l) => l && !/^(exit|close|back)$/i.test(l));
      console.log(
        `${label.padEnd(24)} ${String(taps).padStart(2)} taps  ` +
          `worst step ${String(maxStep).padStart(3)}w  ` +
          `${options.length} options`,
      );
      return;
    }

    await buttons.nth(idx).click();
    taps += 1;
    await page.waitForTimeout(220);
  }
  console.log(`${label.padEnd(26)} did not reach a decision in 30 taps`);
}

await measure("ONE BAD MINUTE ch1", "/campaigns/one-bad-minute/chapter/the-favour");
await measure("REWIND", "/play/mission-rewind");
await measure("Crew Shift", "/campaigns/one-bad-minute/chapter/crew-shift");

await browser.close();
