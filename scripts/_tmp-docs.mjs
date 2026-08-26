import { readFileSync, writeFileSync } from "node:fs";

function patch(file, pairs) {
  let s = readFileSync(file, "utf8");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      console.error("MISS " + file + " :: " + from.slice(0, 70));
      process.exit(1);
    }
    s = s.split(from).join(to);
  }
  writeFileSync(file, s);
  console.log("patched " + file);
}

/* --------------------------------------------------------- PRODUCT_SPEC */

patch("docs/PRODUCT_SPEC.md", [
  [
    "**Safe** is the plainest screen in the app.",
    [
      "**Campaigns** is the fourth surface, and the one that reaches into physical",
      "space. A Campaign turns a school activation or a roadshow into a single story",
      "told across four stations: scan an ordinary QR with the phone camera, walk",
      "away, play a short chapter, reach a finale, and receive follow-up chapters a",
      "day and a week later. It reuses the mission mechanics rather than duplicating",
      "them, adds one new peer interaction (Crew Shift), and is designed around the",
      "constraint every roadshow actually has, which is queueing. Full detail in",
      "`docs/CAMPAIGNS_SPEC.md`, deployment notes in `docs/CAMPAIGN_DEPLOYMENT.md`,",
      "and the behavioural rationale per chapter in `docs/CAMPAIGN_BEHAVIOUR.md`.",
      "",
      "**Safe** is the plainest screen in the app.",
    ].join("\n"),
  ],
  [
    "## 6. Progression and the Safety Passport",
    [
      "## 5b. Campaigns",
      "",
      "The flagship Campaign is **ONE BAD MINUTE**: four friends, one ordinary day,",
      "and four small decisions that decide how it ends. Nobody is solving a crime.",
      "The participant is learning to see the moments where a situation can still",
      "change direction.",
      "",
      "| Chapter | Mechanic | Behavioural point |",
      "| ------- | -------- | ----------------- |",
      "| Quick money | REWIND | Rehearse a low-conflict intervention before it is needed |",
      "| Everyone would do it | Norm Mirror | Separate what people assume from what they report |",
      "| Design the moment | BREAKSAFE | Change the system rather than watch the person |",
      "| Crew Shift | New | Make peer influence visible to the people in it |",
      "| Finale | Themed decision | Connect the four, end on something they chose |",
      "",
      "Three design decisions carry the whole thing:",
      "",
      "**Scan and Scatter.** The screen after a scan tells the participant to walk",
      "away from the station. The station is occupied for the two seconds a scan",
      "takes, not the four minutes a chapter takes.",
      "",
      "**Three of four.** The finale opens after any three chapters, so a torn sign",
      "or a crowded table cannot end somebody's experience.",
      "",
      "**Follow-ups.** Two chapters unlock after the event, on elapsed time, with no",
      "backend. The roadshow becomes episode one rather than the whole thing.",
      "",
      "## 6. Progression and the Safety Passport",
    ].join("\n"),
  ],
]);

/* ----------------------------------------------------------- PILOT_PLAN */

patch("docs/PILOT_PLAN.md", [
  [
    "## 4. Evaluation",
    [
      "## 3b. The Campaign pathway",
      "",
      "Campaigns give the pilot a second, more practical entry point than asking a",
      "school for curriculum time.",
      "",
      "**What it looks like.** One session, one hall or one corridor, four printed",
      "station signs, one or two facilitators, and roughly twenty minutes per",
      "participant. Nothing to install, no accounts, and no setup on anybody's",
      "phone. A cohort of 120 can pass through a drop-in format across a lunch",
      "period.",
      "",
      "**Why it fits a pilot better than a lesson.** It is repeatable without",
      "curriculum negotiation, it produces a natural comparison group (people who",
      "did three chapters against people who did four), and it generates the",
      "follow-up completion rate, which is the closest thing to a retention measure",
      "any of this can currently produce.",
      "",
      "**The single most valuable change the pilot makes to the product.** Running",
      "the Norm Mirror questions with the cohort *before* the event, then dropping",
      "their own answers into the chapter. A social norms intervention works only if",
      "the audience believes the number, and a local number from their own year",
      "group is the only version that earns that. Everything currently in the build",
      "is an invented placeholder and is labelled as one.",
      "",
      "**What would have to be agreed first.** The venue, consent for under-18",
      "participants, and a decision about whether the Crew Shift station is",
      "facilitated or left to self-organise. See `docs/CAMPAIGN_DEPLOYMENT.md`.",
      "",
      "## 4. Evaluation",
    ].join("\n"),
  ],
  [
    "| Build Quest submission quality             | Whether participation reaches creation              |",
    [
      "| Build Quest submission quality             | Whether participation reaches creation              |",
      "| Campaign chapters completed, 3 against 4   | Whether the resilience rule costs engagement        |",
      "| Crew Shift movement rate                   | Whether group discussion moved the decision         |",
      "| Follow-up completion at 1 day and 1 week   | Retention past the event                            |",
    ].join("\n"),
  ],
]);

/* ------------------------------------------------------------- CLAUDE.md */

patch("CLAUDE.md", [
  [
    "## Engineering",
    [
      "## Campaigns",
      "",
      "- Campaign routes live outside the `(app)` group so a QR scan is never blocked",
      "  by onboarding. A chapter must run on a completely cold device.",
      "- Campaign chapters drive the existing mission players through `MissionHost`.",
      "  Never copy mission logic into a Campaign component.",
      "- Campaign XP goes through `awardMission` and the per-campaign grant ledger.",
      "  One grant key, one payment, ever.",
      "- The finale opens on any three of four chapters. That rule is deployment",
      "  resilience, not difficulty tuning, and it should not be tightened.",
      "- Station codes are a permanent control on the Campaign screen, never an",
      "  error state. QR must never be a single point of failure.",
      "- Impact figures are invented and labelled as demo data. Never present them",
      "  as participant evidence.",
      "",
      "## Engineering",
    ].join("\n"),
  ],
  [
    "| `CLAUDE.md`              | Engineering rules for anyone working in this repo       |",
    "| `CLAUDE.md`              | Engineering rules for anyone working in this repo       |",
  ],
]);
