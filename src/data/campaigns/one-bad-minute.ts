import type { Campaign } from "@/types/campaign";
import { says } from "@/types/story";

/**
 * ONE BAD MINUTE. The flagship Campaign.
 *
 * Title note: three candidates were considered against the existing SIDEQUEST
 * voice, which is short, blunt and slightly clipped (REWIND, Norm Mirror,
 * BREAKSAFE). "Shortcut" was too soft and read as productivity. "The Long Way
 * Home" was evocative but did not say what the thing is about. "One Bad
 * Minute" survives because it states the premise in three words and matches
 * the language REWIND already uses about a decision lasting one second.
 *
 * The story follows four friends across one ordinary day. Nobody is solving a
 * crime and nobody is hunting an offender. The participant is learning to spot
 * the moments where a situation can still change direction.
 *
 * All four station chapters run on mechanics that already exist in SIDEQUEST,
 * except Crew Shift, which is the one genuinely new interaction.
 */

export const ONE_BAD_MINUTE: Campaign = {
  id: "campaign-one-bad-minute",
  slug: "one-bad-minute",
  title: "ONE BAD MINUTE",
  subtitle: "Four friends, one ordinary day",
  /*
   * Four short lines, not a paragraph. This is the first thing anybody reads
   * after scanning a QR code at a roadshow, and the old version spent five
   * sentences explaining what the Campaign was for before saying what happens
   * in it. What it is for becomes obvious by playing it.
   */
  description: "Four friends. One ordinary day. Four decisions that look smaller than they are.",
  premise: "Small decisions change the direction of a situation.",
  status: "available",
  ageBands: ["13-15", "16-18", "19-25"],
  categories: ["youth", "scams", "safety"],
  estimatedMinutes: 18,
  accent: "coral",
  provenance: "seeded",
  locationType: "roadshow",
  minimumChaptersForFinale: 3,
  fullCompletionBonusXp: 60,
  completionRewardId: "reward-passport-feature",

  routes: [
    {
      id: "route-a",
      label: "Route A",
      orderedChapterIds: ["obm-c1", "obm-c2", "obm-c3", "obm-c4"],
    },
    {
      id: "route-b",
      label: "Route B",
      orderedChapterIds: ["obm-c2", "obm-c3", "obm-c4", "obm-c1"],
    },
    {
      id: "route-c",
      label: "Route C",
      orderedChapterIds: ["obm-c3", "obm-c4", "obm-c1", "obm-c2"],
    },
    {
      id: "route-d",
      label: "Route D",
      orderedChapterIds: ["obm-c4", "obm-c1", "obm-c2", "obm-c3"],
    },
  ],

  chapters: [
    {
      id: "obm-c1",
      campaignId: "campaign-one-bad-minute",
      slug: "the-favour",
      chapterNumber: 1,
      chapterType: "station",
      title: "The favour",
      shortDescription: "Ken asks Ilyas for a favour, in front of everyone.",
      config: { mechanic: "rewind", scenarioId: "campaign-quick-money" },
      accent: "coral",
      brief: "Play the forty seconds before he says yes. Then take them back.",
      intro: {
        slug: "Thursday, 4:12pm",
        lines: [
          "Four of you. A void deck near the interchange. Nothing happening.",
          says("ken", "Ken", "So. Random question.", "uncertain"),
        ],
      },
      outro: {
        lines: [
          "Whatever you said, the group moves on within a minute.",
          "That is the thing about these moments. They do not announce themselves.",
        ],
      },
      behaviouralMechanism:
        "Decision rehearsal and implementation intentions, plus peer intervention. The ask comes from inside the group, which is where it comes from in reality.",
      behaviouralObjective:
        "Practise a low-conflict intervention while the situation is still easy to reverse.",
      xp: 70,
      skillRewards: [
        { skillId: "peer-intervention", points: 22 },
        { skillId: "decision-making", points: 14 },
      ],
      estimatedMinutes: 3,
      isPhysicalStation: true,
      stationCode: "A7",
      signText: "Scan to start Chapter 1. Then move away and play on your phone.",
    },
    {
      id: "obm-c2",
      campaignId: "campaign-one-bad-minute",
      slug: "everyone-would",
      chapterNumber: 2,
      chapterType: "station",
      title: "Everyone would do it",
      shortDescription: "What you think your friends would do, against what they said.",
      config: { mechanic: "norm-mirror", questionSetId: "everyone-would" },
      accent: "volt",
      brief: "Guess the room first. Then answer for yourself.",
      intro: {
        slug: "Thursday, 6:40pm",
        lines: [
          "Ken says it like it is obvious: anyone would have taken it.",
          "Rina is not so sure.",
          "Neither of them has actually asked anybody.",
        ],
      },
      outro: {
        lines: [
          "Nobody in the group changes their mind out loud.",
          "But the number sits there for the rest of the evening.",
        ],
      },
      behaviouralMechanism:
        "Perceived versus reported social norms, and pluralistic ignorance.",
      behaviouralObjective:
        "Challenge the assumption that a risky choice is automatically the normal one.",
      xp: 60,
      skillRewards: [
        { skillId: "decision-making", points: 16 },
        { skillId: "communication", points: 12 },
      ],
      estimatedMinutes: 3,
      isPhysicalStation: true,
      stationCode: "B4",
      signText: "Scan to start Chapter 2. Then move away and play on your phone.",
    },
    {
      id: "obm-c3",
      campaignId: "campaign-one-bad-minute",
      slug: "design-the-moment",
      chapterNumber: 3,
      chapterType: "station",
      title: "Design the moment",
      shortDescription: "The same person, in a system that makes the safe thing hard.",
      config: { mechanic: "breaksafe" },
      accent: "quest",
      brief: "Find what makes the honest action difficult. Then change it.",
      intro: {
        slug: "Friday, 7:05pm",
        lines: [
          "Supermarket near the station. Ken is at a self-checkout that has beeped twice and confirmed nothing.",
          "There is a queue behind him and the help button turns on a light above his head.",
          "He puts the item in the bag and keeps going.",
        ],
      },
      outro: {
        lines: [
          "Ken did not decide to take anything.",
          "He decided not to be the person holding up the queue, and the machine did the rest.",
        ],
      },
      behaviouralMechanism:
        "Situational crime prevention and choice architecture. Change the environment, not the person.",
      behaviouralObjective:
        "Understand that prevention can redesign a system instead of profiling individuals.",
      xp: 80,
      skillRewards: [
        { skillId: "safety-design", points: 26 },
        { skillId: "decision-making", points: 10 },
      ],
      estimatedMinutes: 4,
      isPhysicalStation: true,
      stationCode: "C9",
      signText: "Scan to start Chapter 3. Then move away and play on your phone.",
    },
    {
      id: "obm-c4",
      campaignId: "campaign-one-bad-minute",
      slug: "crew-shift",
      chapterNumber: 4,
      chapterType: "station",
      title: "Crew Shift",
      shortDescription: "Everyone answers privately, talks, then answers again.",
      config: { mechanic: "crew-shift", roundId: "who-tells-ilyas" },
      accent: "pulse",
      brief: "Pass the phone. Nobody sees anyone else's answer until all of them are in.",
      intro: {
        slug: "Saturday, 8:20pm",
        lines: [
          "There is a second offer, and this time Ilyas has not mentioned it in the chat.",
          "He is inside getting drinks. You have about four minutes.",
        ],
      },
      outro: {
        lines: [
          "He comes back out with the drinks.",
          "Whatever the group decided, somebody now has to actually do it.",
        ],
      },
      behaviouralMechanism:
        "Peer discussion, social influence and collective decision-making. Private commitment before group reveal.",
      behaviouralObjective:
        "Make peer influence visible, and practise disagreeing constructively with friends.",
      xp: 90,
      skillRewards: [
        { skillId: "peer-intervention", points: 20 },
        { skillId: "leadership", points: 18 },
        { skillId: "communication", points: 16 },
      ],
      estimatedMinutes: 5,
      isPhysicalStation: true,
      stationCode: "D2",
      signText: "Scan to start Chapter 4. Grab your friends. Then move away from the station.",
    },
  ],

  finale: {
    id: "obm-finale",
    campaignId: "campaign-one-bad-minute",
    title: "One bad minute",
    intro: {
      slug: "Sunday, 11:48pm",
      lines: [
        "It is late and Ilyas is calling, which he never does.",
        "The account is frozen. There is a letter. He has not told anyone at home.",
        "He is asking you what he should do, right now, tonight.",
      ],
      messages: [
        { from: "Ilyas", text: "can you just tell me what to say to them" },
        { from: "Ilyas", text: "i cant tell my mum" },
      ],
    },
    question: "What do you tell him?",
    options: [
      {
        id: "call-now",
        label: "Call 1799 and the bank tonight, before anything else",
        theme: "urgency",
      },
      {
        id: "tell-home",
        label: "Tell someone at home, and do it with him",
        theme: "peers",
      },
      {
        id: "not-alone",
        label: "Tell him this happens to plenty of people, then help him report it",
        theme: "norms",
      },
      {
        id: "write-down",
        label: "Get everything written down first, then report it properly tomorrow",
        theme: "design",
      },
    ],
    outcomes: {
      urgency: {
        headline: "You moved first on the thing that is time sensitive",
        body:
          "Reporting early genuinely changes what can be recovered and how the situation is treated. Of everything on that list, this is the part that gets worse by waiting.",
      },
      peers: {
        headline: "You made sure he was not doing it alone",
        body:
          "The reason he called you at midnight is that telling someone at home felt impossible. Going with him removes the exact barrier that keeps people quiet until it is much worse.",
      },
      norms: {
        headline: "You took the shame out of it",
        body:
          "People delay reporting because they think they are uniquely stupid. They are not, and telling him so is what makes the next step possible. Then you still have to take the step.",
      },
      design: {
        headline: "You made the next conversation easier to have",
        body:
          "Having the dates, the messages and the amounts written down turns a panicked call into something manageable. It is the least dramatic answer here and it is genuinely useful, as long as it does not become a reason to wait.",
      },
    },
    closing: {
      headline: "One small decision changes what happens next",
      body:
        "Nobody in this story planned anything. There was an offer, a group that did not say much, a machine that did not confirm anything, and a night that got away from everyone. Every chapter you played was a place where it could still have gone differently, and none of them required being brave. They required having said the sentence once before.",
    },
    fullCompletionNote:
      "You played all four stations, so you saw the whole shape of it: the offer, the assumption, the system and the group. Most people at this event will have seen three.",
    xp: 120,
    skillRewards: [
      { skillId: "decision-making", points: 20 },
      { skillId: "peer-intervention", points: 16 },
      { skillId: "communication", points: 12 },
    ],
  },

  followUps: [
    {
      id: "obm-followup-aftermath",
      campaignId: "campaign-one-bad-minute",
      slug: "aftermath",
      title: "Aftermath",
      description: "What happened the next morning, and one thing you can still get right.",
      unlockAfterHours: 20,
      config: { mechanic: "story", storyId: "aftermath" },
      accent: "coral",
      brief: "Ninety seconds. Picks up where the finale left off.",
      intro: {
        slug: "Monday, 7:30am",
        lines: [
          "Ilyas made the call. His mother came with him in the end, which he did not expect.",
          "Ken has been quiet all morning. He was the one who said take it.",
        ],
      },
      behaviouralMechanism:
        "Retrieval practice. Recalling the decision a day later is what moves it from a thing you did once into a thing you know.",
      xp: 40,
      skillRewards: [{ skillId: "peer-intervention", points: 10 }],
      estimatedMinutes: 2,
    },
    {
      id: "obm-followup-week",
      campaignId: "campaign-one-bad-minute",
      slug: "one-week-later",
      title: "One week later",
      description: "A different offer, a different friend, and no story to lean on.",
      unlockAfterHours: 168,
      config: { mechanic: "story", storyId: "one-week-later" },
      accent: "quest",
      brief: "A new situation. Same forty seconds.",
      intro: {
        slug: "The following Thursday",
        lines: [
          "Different group chat. Someone you barely know posts a job: three hundred a day, phone only, start this week.",
          "Two people have already replied asking for details.",
        ],
      },
      behaviouralMechanism:
        "Spaced retrieval and transfer. The test is whether the pattern shows up when the story is not there to signal it.",
      xp: 50,
      skillRewards: [
        { skillId: "scam-awareness", points: 14 },
        { skillId: "communication", points: 8 },
      ],
      estimatedMinutes: 2,
    },
  ],
};
