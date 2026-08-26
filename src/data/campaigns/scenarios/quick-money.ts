import type { Scenario } from "@/types/scenario";

/**
 * ONE BAD MINUTE, chapter 1. Runs on the existing REWIND mechanic.
 *
 * Track B alignment note. This chapter used to open with an outside recruiter
 * messaging Ilyas with a job offer, which framed him as a scam victim. The
 * challenge is youth crime prevention through peer-driven approaches, and the
 * behavioural drivers it names are peer pressure, impulsive decision-making,
 * desire for social acceptance and limited understanding of consequences.
 *
 * So the ask now comes from Ken, standing right there, as a favour between
 * friends. Nothing external pressures Ilyas: his friend does, in front of the
 * group, and the thing being asked for is his identity. That is the same
 * offence pathway with the actual youth mechanism restored.
 *
 * It contains no operational detail about how account misuse works, because
 * that is not what is being rehearsed. What is being rehearsed is the sentence
 * you say in the forty seconds before your friend agrees.
 */

export const QUICK_MONEY_SCENARIO: Scenario = {
  id: "campaign-quick-money",
  intro: {
    kicker: "Chapter 1",
    title: "The favour",
    setup:
      "Thursday, 4:12pm. Void deck near the interchange. Ken has been building up to asking something for about ten minutes.",
  },
  startBeatId: "offer",
  beats: [
    {
      id: "offer",
      slug: "4:12pm",
      lines: [
        "Ken finally says it. He needs an account that is not his, just for a week.",
        "Something about reselling, and his own account being a problem, and it being completely fine.",
        "He is looking at Ilyas when he says it.",
      ],
      choices: [{ id: "on", label: "Keep listening", next: "pivot", tone: "neutral" }],
    },
    {
      id: "pivot",
      slug: "4:13pm",
      isPivot: true,
      lines: [
        "Ken: bro it is literally nothing. I will give you a cut.",
        "Jas laughs and says Ilyas is scared. Ilyas says he is not scared.",
        "He starts typing his details into Ken's phone. It will take him about forty seconds.",
        "He glances up at you.",
      ],
      choices: [
        {
          id: "check",
          label: "Ask Ken, out loud, what the money actually is",
          reaction: "You keep it flat, like curiosity rather than an accusation.",
          next: "check-1",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "pull",
          label: "Say you need Ilyas for something and walk him away",
          reaction: "You stand up. He follows without thinking about it.",
          next: "pull-1",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "callout",
          label: "Tell Ilyas he is being used",
          reaction: "It lands louder than you meant. Ken's face changes. So does Ilyas's.",
          next: "callout-1",
          tone: "neutral",
        },
        {
          id: "joke",
          label: "Laugh and ask for a cut too",
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
        "Ken says it is complicated. Then he says it is not his business to explain. Then he changes the subject.",
        "Nobody says anything for a second, which is long enough.",
        "Ilyas stops typing and hands the phone back.",
      ],
      outcome: {
        kind: "good",
        headline: "You made Ken answer instead of making Ilyas refuse",
        body:
          "The pressure was on the wrong person. One question moved it onto the person who was actually asking, and he could not answer it in front of everyone. Ilyas never had to say no.",
        takeaways: [
          "A question is much harder to push back on than a warning.",
          "Move the burden to whoever is asking. They usually cannot explain it out loud.",
        ],
      },
    },

    {
      id: "pull-1",
      slug: "4:14pm",
      lines: [
        "Twenty metres away, with nobody watching, he says it himself: it is a bit weird, right.",
        "By the time you walk back, he has changed his mind and nobody makes him explain why.",
      ],
      outcome: {
        kind: "good",
        headline: "You removed the audience",
        body:
          "Nothing you said changed his mind. Taking away the three people watching him decide did. He was never really choosing about an account, he was choosing about not looking scared.",
        takeaways: [
          "People decide differently when nobody is watching them decide.",
          "Changing the setting is often the cheapest intervention available to you.",
        ],
      },
    },

    {
      id: "callout-1",
      slug: "4:14pm",
      lines: [
        "Ilyas: I am not being used. Relax.",
        "Ken: yeah, relax.",
        "Now backing out means agreeing with you in front of everyone. He finishes typing.",
      ],
      outcome: {
        kind: "mixed",
        headline: "You were right, and it made it harder",
        body:
          "The moment it became public, Ilyas stopped choosing between safe and unsafe and started choosing between backing down and holding his ground. You picked the argument he could not lose gracefully.",
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
        "The cut arrived. Forty dollars, which felt like proof it was fine.",
        "Then the account froze, and there is a letter, and Ilyas's mother is asking you what happened because he will not say.",
        "Ken has stopped replying to the group chat.",
      ],
      outcome: {
        kind: "poor",
        headline: "It was his account, so it is his name",
        body:
          "Money that moves through an account leads back to whoever owns it. Not knowing what it was does not undo the trail, and in Singapore that is taken seriously even when somebody genuinely did not know. Ken is not the one being asked to explain it.",
        takeaways: [
          "Lending your identity is not a favour, it is a transfer of blame.",
          "The person asking is never the person it lands on.",
          "If it has already happened, tell someone and call the bank early. Early makes a difference.",
        ],
      },
    },
  ],
  debrief: {
    title: "The forty seconds",
    mechanism:
      "Decision rehearsal. The whole chapter lives inside the time it took Ilyas to type his details. Saying the sentence once here makes it available later, which is the only thing that helps at speed.",
    points: [
      "Every option was available inside the same forty seconds.",
      "The two that worked did not require Ilyas to admit anything in front of his friends.",
      "You never had to be the person who was right. You only had to make the other option easy.",
    ],
  },
  skillAwards: [
    { skillId: "peer-intervention", points: 22 },
    { skillId: "decision-making", points: 14 },
  ],
};
