import type { Scenario } from "@/types/scenario";

export const JOB_SCAM_SCENARIO: Scenario = {
  id: "mission-job-scam",
  intro: {
    kicker: "Quick Quest",
    title: "$400 a day, work from home",
    setup:
      "Term break starts on Friday. A message lands from an account you do not follow.",
  },
  startBeatId: "dm",
  beats: [
    {
      id: "dm",
      slug: "Thursday, 4:02pm",
      speaker: "Recruiter",
      lines: [
        "Hi! We are hiring part time assistants for a marketing agency. Fully remote, phone only.",
        "$350 to $400 a day depending on how many tasks you clear. Are you free to start this week?",
      ],
      choices: [
        {
          id: "interested",
          label: "Ask what the work actually is",
          next: "tasks",
          tone: "neutral",
          isPreferred: true,
        },
        {
          id: "company",
          label: "Ask for the company name and website",
          next: "company",
          tone: "safe",
          isPreferred: true,
        },
        { id: "ignore", label: "Ignore it", next: "ignored", tone: "safe" },
      ],
    },
    {
      id: "company",
      speaker: "Recruiter",
      lines: [
        "We work with several brands so we cannot name clients here. You will get the details after onboarding.",
        "Everything is handled through this chat. Shall I add you to the team group?",
      ],
      choices: [
        {
          id: "push",
          label: "Push again: which company employs me?",
          reaction: "The reply takes eleven minutes and does not answer the question.",
          next: "tasks",
          tone: "safe",
          isPreferred: true,
        },
        { id: "accept", label: "Fine, add me to the group", next: "tasks", tone: "neutral" },
      ],
    },
    {
      id: "tasks",
      slug: "Friday, day one",
      speaker: "Team group",
      lines: [
        "The first tasks are simple: rate some product listings, screenshot the results.",
        "Twenty minutes of work. At 6pm, $60 arrives in your account. It is real money and it clears.",
      ],
      choices: [
        {
          id: "continue",
          label: "Keep going, it is paying",
          next: "deposit",
          tone: "neutral",
        },
        {
          id: "question",
          label: "Ask why rating listings is worth $180 an hour",
          reaction: "Nobody answers directly. Someone posts a payout screenshot instead.",
          next: "deposit",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "deposit",
      slug: "Saturday",
      speaker: "Team group",
      lines: [
        "To unlock the higher tier tasks, members top up $200 into the task wallet. You get it back with the payout.",
        "Also, one of our clients pays by bank transfer. We will send it to your account, you forward it on. Standard for the role.",
      ],
      choices: [
        {
          id: "topup",
          label: "Top up $200, the first payment was real",
          next: "lost",
          tone: "risky",
        },
        {
          id: "forward",
          label: "Say no to the top up, but agree to forward the transfer",
          next: "mule",
          tone: "risky",
        },
        {
          id: "stop",
          label: "Stop here and leave the group",
          next: "stopped",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "ignored",
      lines: ["You do not reply. Three days later the account no longer exists."],
      outcome: {
        kind: "good",
        headline: "The cheapest possible outcome",
        body:
          "Not replying is a complete defence, and it costs nothing. A real employer with a real vacancy will still be reachable tomorrow.",
        takeaways: [
          "Unsolicited offers with daily pay rates are a category, not a coincidence.",
          "Accounts that disappear were never a company.",
        ],
      },
    },
    {
      id: "stopped",
      lines: [
        "You leave the group. The messages continue for a day, then stop.",
        "You are out $0, and you keep the $60.",
      ],
      outcome: {
        kind: "good",
        headline: "You spotted the turn",
        body:
          "The early payment is the investment the scam makes in you. Everything before the top up request is designed to make that request feel reasonable.",
        takeaways: [
          "The first payment is not proof. It is the setup.",
          "A job never requires you to pay in, and never routes client money through your account.",
        ],
      },
    },
    {
      id: "lost",
      lines: [
        "The $200 goes in. The tier unlocks. The next task requires $500 to release your accumulated balance.",
        "You stop replying. So does the group.",
      ],
      outcome: {
        kind: "poor",
        headline: "The balance was never yours",
        body:
          "The wallet, the tiers and the accumulated earnings existed only on a screen. The escalation is the model: each top up is justified by the money you are told you have already made.",
        takeaways: [
          "Once you have paid in, the pressure to pay again gets stronger, not weaker.",
          "Report it at 1799 or through ScamShield. Doing it early makes a difference.",
        ],
      },
    },
    {
      id: "mule",
      lines: [
        "The transfer arrives. You forward it as instructed and keep a small cut.",
        "Eleven days later your bank freezes the account, and the Police want to talk to you about where the money came from.",
      ],
      outcome: {
        kind: "poor",
        headline: "Your account, your name, your problem",
        body:
          "Letting money pass through your account is what a money mule does, and in Singapore that is treated seriously even when the person genuinely did not know. The trail leads to the account holder.",
        takeaways: [
          "No legitimate job needs your personal bank account to receive or forward client funds.",
          "Not knowing is not a defence that undoes the trail.",
          "If this has already happened, contact your bank and the Police immediately.",
        ],
      },
    },
  ],
  debrief: {
    title: "What this rehearsed",
    mechanism:
      "Job scams work by putting a real reward now in front of a cost you cannot see yet. The mission makes that gap visible while it is still an exercise.",
    points: [
      "The pay rate is the first signal, and it is visible in the very first message.",
      "The real turn is the top up or the transfer, not the offer.",
      "A first payment that clears is the most expensive part of the setup, and the most convincing.",
    ],
  },
  skillAwards: [
    { skillId: "scam-awareness", points: 22 },
    { skillId: "decision-making", points: 12 },
  ],
};
