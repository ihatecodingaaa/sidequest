import type { Scenario } from "@/types/scenario";

/**
 * ONE BAD MINUTE, chapter 1. Runs on the existing REWIND mechanic.
 *
 * Deliberately shorter than the standalone REWIND: this one is played at a
 * roadshow, standing up, with friends waiting. Setup, pivot, outcome, rewind.
 *
 * Content note: the scenario describes a request and a decision. It contains
 * no operational detail about how account misuse works, because that is not
 * the thing being rehearsed. What is being rehearsed is the sentence you say
 * in the four seconds before your friend agrees.
 */

export const QUICK_MONEY_SCENARIO: Scenario = {
  id: "campaign-quick-money",
  intro: {
    kicker: "Chapter 1",
    title: "Quick money",
    setup:
      "Thursday, 4:12pm. Void deck near the interchange. Ilyas has been quiet since lunch, and now he is smiling at his phone.",
  },
  startBeatId: "offer",
  beats: [
    {
      id: "offer",
      slug: "4:12pm",
      lines: [
        "Ilyas turns his phone round so you can see it.",
        "Three hundred dollars. Today. All he has to do is let someone use his bank account for one transfer.",
        "He says the guy is a friend of his cousin.",
      ],
      choices: [{ id: "on", label: "Keep listening", next: "pivot", tone: "neutral" }],
    },
    {
      id: "pivot",
      slug: "4:13pm",
      isPivot: true,
      lines: [
        "Ilyas: my account is just sitting there anyway.",
        "Ken: bro three hundred. Take it.",
        "He starts typing his details into the chat. It will take him about forty seconds.",
        "He glances up at you.",
      ],
      choices: [
        {
          id: "check",
          label: "Ask him to send you the number first, so you can check it",
          reaction: "You say it flatly, like a favour rather than a warning.",
          next: "check-1",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "pull",
          label: "Say you need him for something and walk him away from the group",
          reaction: "You stand up. He follows without thinking about it.",
          next: "pull-1",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "callout",
          label: "Say out loud that it is a mule scam",
          reaction: "Ken snorts. Ilyas's jaw sets.",
          next: "callout-1",
          tone: "neutral",
        },
        {
          id: "joke",
          label: "Laugh and tell him to split it with you",
          reaction: "Everyone laughs. He keeps typing.",
          next: "sent",
          tone: "risky",
        },
        {
          id: "nothing",
          label: "Say nothing",
          reaction: "You look at your own phone.",
          next: "sent",
          tone: "risky",
        },
      ],
    },

    {
      id: "check-1",
      slug: "4:14pm",
      lines: [
        "He sends you the number. You type it into ScamShield while he watches.",
        "It comes back flagged.",
        "He does not say much. He also stops typing.",
      ],
      outcome: {
        kind: "good",
        headline: "You gave him a reason, not a lecture",
        body:
          "Checking a number is a two-tap action that costs Ilyas nothing socially. He did not have to admit he was wrong in front of Ken, and he still got to make the decision himself.",
        takeaways: [
          "Verifying is a task, not an accusation. It is much easier to accept.",
          "The answer came from a tool, not from you, so there was nothing to argue with.",
        ],
      },
    },

    {
      id: "pull-1",
      slug: "4:14pm",
      lines: [
        "Twenty metres away, with nobody watching, he says it out loud himself: it is a bit weird, right.",
        "By the time you walk back he has stopped replying to the chat.",
      ],
      outcome: {
        kind: "good",
        headline: "You removed the audience",
        body:
          "Nothing you said changed his mind. Taking away the three hundred dollars of peer approval standing next to him did.",
        takeaways: [
          "People decide differently when nobody is watching them decide.",
          "Changing the setting is often the lowest cost intervention available to you.",
        ],
      },
    },

    {
      id: "callout-1",
      slug: "4:14pm",
      lines: [
        "Ilyas: you think I am stupid?",
        "Ken: relax lah, so serious.",
        "Now backing out means agreeing with you in front of everyone. He finishes typing.",
      ],
      outcome: {
        kind: "mixed",
        headline: "You were right, and it made it harder",
        body:
          "The moment it became public, Ilyas stopped choosing between safe and unsafe and started choosing between backing down and holding his ground. You picked the fight he could not lose gracefully.",
        takeaways: [
          "Being correct and being effective are different problems.",
          "There is almost always a quieter version of the same sentence.",
        ],
      },
    },

    {
      id: "sent",
      slug: "Eleven days later",
      lines: [
        "The three hundred arrived. So did two more offers.",
        "Then the account froze, and there is a letter, and Ilyas's mother is asking you what happened because he will not say.",
      ],
      outcome: {
        kind: "poor",
        headline: "It was his account, so it is his name",
        body:
          "Money that passes through an account leads back to whoever owns it. Not knowing where it came from does not undo the trail, and in Singapore that is taken seriously even when somebody genuinely did not know.",
        takeaways: [
          "No real arrangement needs your bank account to move somebody else's money.",
          "The offer looked like income. It was rented liability.",
          "If it has already happened, call 1799 and the bank straight away. Early makes a difference.",
        ],
      },
    },
  ],
  debrief: {
    title: "The forty seconds",
    mechanism:
      "Decision rehearsal. The whole chapter lives inside the time it took Ilyas to type his details. Saying the sentence once here makes it retrievable later, which is the only thing that helps at speed.",
    points: [
      "Every option was available inside the same forty seconds.",
      "The two that worked cost Ilyas no face at all.",
      "You never had to be the person who was right. You only had to make the other option easy.",
    ],
  },
  skillAwards: [
    { skillId: "peer-intervention", points: 22 },
    { skillId: "decision-making", points: 14 },
  ],
};
