import type { Scenario } from "@/types/scenario";

/**
 * REWIND.
 *
 * Behavioural design note: the pivot is deliberately a moment with an audience
 * and almost no time. The options are graded not by moral force but by how much
 * face they cost the other person, because that is what actually predicts
 * whether an intervention lands. Public correction is included and is honestly
 * modelled as the harder path, not as the wrong one.
 *
 * Outcomes stay realistic. No choice ends in an immediate arrest, because that
 * is not what usually happens and pretending otherwise teaches nothing.
 */

export const REWIND_SCENARIO: Scenario = {
  id: "mission-rewind",
  intro: {
    kicker: "Hero Mission",
    title: "The five minutes you would take back",
    setup:
      "Thursday, 5:40pm. Four of you, a shop near the interchange, twenty minutes before anyone has to be anywhere.",
  },
  startBeatId: "shop",
  beats: [
    {
      id: "shop",
      slug: "5:41pm, near the interchange",
      lines: [
        "Wei is holding a pair of earphones and reading the price for the third time.",
        "Jas is at the drinks fridge. Ken is filming something on his phone that will not be funny later.",
        "You are half watching, half thinking about dinner.",
      ],
      choices: [{ id: "on", label: "Keep watching", next: "pivot", tone: "neutral" }],
    },
    {
      id: "pivot",
      slug: "5:43pm",
      isPivot: true,
      lines: [
        "Wei looks up at the counter. The staff member is dealing with a queue.",
        "The earphones go into his jacket pocket. It takes about a second.",
        "Ken sees it and grins. Jas has not noticed.",
        "Wei catches your eye.",
      ],
      choices: [
        {
          id: "quiet",
          label: "Move next to him and say something only he can hear",
          reaction: "You step across and say it low: put it back, not worth it.",
          next: "quiet-1",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "leave",
          label: "Say you are all late and start walking out",
          reaction: "You look at the time and say it out loud. Nobody questions it.",
          next: "leave-1",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "callout",
          label: "Say it in front of everyone",
          reaction: "It comes out louder than you meant. Ken laughs. Wei's face changes.",
          next: "callout-1",
          tone: "neutral",
        },
        {
          id: "laugh",
          label: "Laugh it off",
          reaction: "You laugh. Ken laughs harder. It is now a thing the group did.",
          next: "laugh-1",
          tone: "risky",
        },
        {
          id: "nothing",
          label: "Say nothing and look away",
          reaction: "You look at the drinks fridge as if it is interesting.",
          next: "nothing-1",
          tone: "risky",
        },
      ],
    },

    {
      id: "quiet-1",
      slug: "5:43pm, one second later",
      lines: [
        "Wei does not answer. He walks two aisles down, and the earphones go back on a hook that is not the right hook.",
        "On the way out he says nothing to you. Ken asks what happened and Wei says he changed his mind.",
      ],
      choices: [
        {
          id: "after",
          label: "Leave it there",
          next: "quiet-good",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "message",
          label: "Message him that night",
          reaction: "You send: not a big deal, just didn't want you stuck over $29 earphones.",
          next: "quiet-best",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "quiet-good",
      lines: ["Nothing else happens. The four of you get food. It never comes up again."],
      outcome: {
        kind: "good",
        headline: "It cost him nothing to change his mind",
        body:
          "Saying it privately gave Wei a way out that did not require admitting anything in front of Ken. He got to make the decision look like his own, which is usually the only version people accept in the moment.",
        takeaways: [
          "Private beats public almost every time, because it protects the other person's standing in the group.",
          "You did not have to be right out loud. You only had to make the other option available.",
          "One second of intervention beat a much longer conversation later.",
        ],
      },
    },
    {
      id: "quiet-best",
      lines: [
        "He replies at 11pm: ya i know. was being stupid.",
        "Two weeks later he does the same thing for Ken, in a different shop.",
      ],
      outcome: {
        kind: "good",
        headline: "The norm moved sideways",
        body:
          "The follow up message did more than the moment did. It turned an awkward second into something that was allowed to be discussed, and that is what made it repeatable by someone else.",
        takeaways: [
          "Naming it afterwards, without making it heavy, is what stops it becoming a secret.",
          "Interventions spread. The person you help is the most likely next person to do it.",
          "Keeping it light was the reason it worked. Weight would have ended the conversation.",
        ],
      },
    },

    {
      id: "leave-1",
      slug: "5:44pm, outside",
      lines: [
        "Everyone follows. Wei is last out and the earphones are still in his pocket for about four steps.",
        "Then he goes back in, on his own, and comes out with empty hands.",
      ],
      outcome: {
        kind: "good",
        headline: "You changed the situation, not the person",
        body:
          "You never had to say the thing. Removing the audience and the opportunity was enough, and it left Wei with no reason to defend a position he had not committed to yet.",
        takeaways: [
          "Changing the setting is often the lowest cost intervention available.",
          "Nobody had to be corrected, so nobody had to push back.",
          "This is the same principle BREAKSAFE uses on a system: make the safe action the easy one.",
        ],
      },
    },

    {
      id: "callout-1",
      slug: "5:43pm",
      lines: [
        "Wei says: relax, chill. Ken says: wah, so scared.",
        "The earphones stay in the pocket. Now putting them back would be losing.",
      ],
      choices: [
        {
          id: "push",
          label: "Push harder",
          reaction: "It becomes an argument about you, not about the earphones.",
          next: "callout-bad",
          tone: "risky",
        },
        {
          id: "backoff",
          label: "Drop it and get everyone outside",
          next: "callout-mixed",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "callout-mixed",
      lines: [
        "Outside, the group is quiet in the way that means something happened.",
        "Wei keeps the earphones. He also does not do it again while you are around, which is a smaller win than it sounds.",
      ],
      outcome: {
        kind: "mixed",
        headline: "You were right, and it mostly did not help",
        body:
          "Saying it in front of Ken turned a decision into a status contest. Wei was no longer choosing between taking the earphones and not taking them, he was choosing between backing down publicly and not.",
        takeaways: [
          "Public correction adds a second cost, and that cost is usually what people actually respond to.",
          "Being right is not the same as being effective.",
          "Backing off and moving the group was the recovery. It was still available.",
        ],
      },
    },
    {
      id: "callout-bad",
      lines: [
        "The argument follows you to the bus stop. Ken records twenty seconds of it.",
        "Wei stops replying in the group chat for a week. The earphones are irrelevant by now.",
      ],
      outcome: {
        kind: "poor",
        headline: "The subject changed, and you lost the room",
        body:
          "Once it became a confrontation, the earphones stopped being what the conversation was about. Nobody in the group ends up safer, and the person you were trying to help is the one most invested in proving you wrong.",
        takeaways: [
          "Escalating in front of an audience reliably hardens the position you are trying to move.",
          "There is almost always a quieter version of the same sentence.",
        ],
      },
    },

    {
      id: "laugh-1",
      slug: "5:44pm, outside",
      lines: [
        "Nothing happens. That is the problem.",
        "It became a story, and Ken tells it twice on the bus.",
      ],
      choices: [
        {
          id: "later",
          label: "Two weeks later",
          next: "laugh-bad",
          tone: "neutral",
        },
      ],
    },
    {
      id: "laugh-bad",
      slug: "Two weeks later",
      lines: [
        "Different shop, bigger item, and this time Ken is doing it because it is now a thing the group does.",
        "A staff member stops them at the door. There is no drama, just a back office, a phone call, and a very long wait.",
        "Wei's parents arrive at 9:40pm.",
      ],
      outcome: {
        kind: "poor",
        headline: "Nothing happened, until it did",
        body:
          "Laughing was not neutral. It told everyone present that the group was fine with it, and a group norm is far more durable than one person's decision. The escalation took two weeks and nobody planned it.",
        takeaways: [
          "Silence and laughter both read as approval, and approval is what sets the norm.",
          "The first incident is the cheap one to interrupt. Every later one costs more.",
          "Most people who end up in trouble did not decide to. They were in a group that had already decided for them.",
        ],
      },
    },

    {
      id: "nothing-1",
      slug: "5:44pm, outside",
      lines: [
        "You get outside. Nobody says anything about it.",
        "You think about it on the bus for about four stops, then stop thinking about it.",
      ],
      choices: [
        { id: "later2", label: "Two weeks later", next: "nothing-bad", tone: "neutral" },
      ],
    },
    {
      id: "nothing-bad",
      slug: "Two weeks later",
      lines: [
        "It has happened twice more. You were there for one of them.",
        "This time a staff member follows them out. Wei runs, which turns a $29 problem into a much larger one.",
        "You are still standing outside the shop when the others are gone.",
      ],
      outcome: {
        kind: "poor",
        headline: "The gap between noticing and acting",
        body:
          "You saw it first and earliest, which made you the cheapest possible intervention. Doing nothing was a decision, and it was made in about the same second the other options were available.",
        takeaways: [
          "People are far more likely to act when someone else moves first, and far less likely when everyone is waiting.",
          "Being the first to move is the whole skill. It does not require being brave, only being prepared.",
          "You did not need a speech. Three words or a suggestion to leave would have been enough.",
        ],
      },
    },
  ],
  debrief: {
    title: "What REWIND is actually training",
    mechanism:
      "Decision rehearsal. Replaying the same pivot with a different response builds a script you can reach for at speed. People rarely fail these moments because they do not know what is right. They fail because they have never said the sentence before.",
    points: [
      "The pivot lasted about one second, and every option was available inside it.",
      "The options that worked protected the other person's standing. The ones that failed made them defend a position.",
      "Changing the setting, by leaving, was as effective as anything you could have said.",
      "Nothing here required confrontation, and SIDEQUEST never asks you to confront anyone.",
    ],
  },
  skillAwards: [
    { skillId: "peer-intervention", points: 30 },
    { skillId: "decision-making", points: 20 },
    { skillId: "communication", points: 12 },
  ],
};
