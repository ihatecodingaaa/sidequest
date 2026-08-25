import type { Scenario } from "@/types/scenario";

export const MARKETPLACE_SCENARIO: Scenario = {
  id: "mission-marketplace",
  intro: {
    kicker: "Quick Quest",
    title: "Two tickets, one very keen seller",
    setup:
      "The show sold out in nine minutes. A listing appears at face value, which is already unusual.",
  },
  startBeatId: "listing",
  beats: [
    {
      id: "listing",
      slug: "Resale platform",
      speaker: "Seller",
      lines: [
        "Hi! Yes still available. 2 tickets, Cat 2, selling at face value because my friend cancelled.",
        "Can we continue on chat? Easier for me to send the photos there.",
      ],
      choices: [
        {
          id: "stay",
          label: "Stay here, the platform chat is fine",
          next: "pressure",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "move",
          label: "Sure, move to the other app",
          next: "offplatform",
          tone: "risky",
        },
      ],
    },
    {
      id: "pressure",
      speaker: "Seller",
      lines: [
        "Ok but I have two other people asking. I can hold it for 15 minutes only.",
        "If you can transfer a $50 deposit now I will mark it sold.",
      ],
      choices: [
        {
          id: "deposit",
          label: "Send the $50 deposit to hold them",
          next: "deposit-gone",
          tone: "risky",
        },
        {
          id: "platform-pay",
          label: "Offer to pay in full through the platform's protected checkout",
          next: "refuses",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "walk",
          label: "Walk away from the countdown",
          next: "walked",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "offplatform",
      slug: "Private chat",
      speaker: "Seller",
      lines: [
        "Great. Here is the payment link, it goes through a secure delivery service.",
        "Just sign in with your bank details on the page and the tickets release automatically.",
      ],
      choices: [
        {
          id: "click",
          label: "Open the link and sign in",
          next: "phished",
          tone: "risky",
        },
        {
          id: "refuse-link",
          label: "Refuse the link and go back to the platform",
          next: "walked",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "refuses",
      speaker: "Seller",
      lines: [
        "Platform takes a fee and holds the money for 7 days. Direct transfer is faster for both of us.",
        "Trust me, I have done many deals.",
      ],
      outcome: {
        kind: "good",
        headline: "The excuse names the reason",
        body:
          "The fee and the hold are the protection. A seller explaining why you should give up the hold is explaining why you should give up your recourse.",
        takeaways: [
          "Protected checkout exists so that a dispute has somewhere to go.",
          "Reluctance to use it is information about the seller, not about the platform.",
        ],
      },
    },
    {
      id: "walked",
      lines: [
        "You stop replying. The listing is gone by the evening, and the account with it.",
      ],
      outcome: {
        kind: "good",
        headline: "The countdown was the product",
        body:
          "The urgency was doing the work, not the tickets. Removing the time pressure removes almost all of the leverage.",
        takeaways: [
          "A fifteen minute hold is a pressure device, not a business practice.",
          "Missing out on a real listing costs you a show. The alternative costs you money and your bank details.",
        ],
      },
    },
    {
      id: "deposit-gone",
      lines: [
        "The $50 goes through. The seller asks for the balance before releasing the tickets.",
        "You ask for a photo of the confirmation email instead. The account blocks you.",
      ],
      outcome: {
        kind: "mixed",
        headline: "You lost $50 and learned the shape",
        body:
          "A deposit is the smallest amount a fake seller can ask for while still getting paid. The real risk was the next step, which you did not take.",
        takeaways: [
          "Direct transfer outside the platform has no dispute process attached to it.",
          "Report the listing. It usually catches the next person, not you.",
        ],
      },
    },
    {
      id: "phished",
      lines: [
        "The page looks like a bank login. You enter your details.",
        "There are no tickets. The following morning there are two transfers out of your account.",
      ],
      outcome: {
        kind: "poor",
        headline: "The link was the whole scam",
        body:
          "Nothing about the tickets ever mattered. The listing existed to get you onto a page that collects credentials, and the private chat existed to get you off a platform that would have flagged it.",
        takeaways: [
          "Never sign in through a link somebody sends you. Open your banking app yourself.",
          "Moving the conversation is the moment to stop, not the moment to relax.",
          "Call 1799 and your bank immediately if it has already happened.",
        ],
      },
    },
  ],
  debrief: {
    title: "What this rehearsed",
    mechanism:
      "The mission trains attention on the channel rather than the offer. Deciding in advance that you do not leave the platform removes the judgement call at the moment it is hardest.",
    points: [
      "The request to move chat is the earliest reliable signal, and it arrives before any money.",
      "Urgency and a small deposit are a pair. One softens you up for the other.",
      "A login page reached through someone else's link should be treated as fake by default.",
    ],
  },
  skillAwards: [
    { skillId: "scam-awareness", points: 20 },
    { skillId: "decision-making", points: 8 },
  ],
};
