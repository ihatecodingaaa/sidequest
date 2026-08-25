import type { Scenario } from "@/types/scenario";

/**
 * Crew Quest, run asynchronously.
 *
 * There is deliberately no realtime layer. The crew's contributions are seeded
 * and shown alongside yours, which produces the social pull without a backend.
 * The screen says plainly that the other entries are prototype content.
 */

export const CREW_RELAY_SCENARIO: Scenario = {
  id: "mission-crew-relay",
  intro: {
    kicker: "Crew Quest",
    title: "Scam Relay",
    setup:
      "Your crew is building one shared list: the signals that show up before any money moves. Three members have gone. Your turn.",
  },
  startBeatId: "brief",
  beats: [
    {
      id: "brief",
      slug: "Mickey's Clubhouse",
      speaker: "Crew board",
      lines: [
        "Rina: If they need it in the next two minutes, that urgency is the product.",
        "Danish: A first payment that clears is the setup, not the proof.",
        "Jia Cheng: The moment they move the chat off the platform, your protection is gone.",
        "Your entry completes the set. Which signal are you taking?",
      ],
      choices: [
        {
          id: "verify",
          label: "Nobody legitimate asks you to read out a code",
          next: "verify",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "channel",
          label: "Verify on a channel they did not give you",
          next: "channel",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "account",
          label: "Your account in someone else's plan is still your account",
          next: "account",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "verify",
      lines: [
        "You post it. Rina adds: and the SMS usually tells you what it is really authorising.",
        "The set now covers urgency, false proof, channel switching and verification.",
      ],
      outcome: {
        kind: "good",
        headline: "Four signals, one list",
        body:
          "The crew's list is more useful than any one member's, because each of you had to compress a signal into a sentence somebody else would repeat.",
        takeaways: [
          "Explaining a risk to a peer holds better than being told it.",
          "A short list gets shared. A long one gets closed.",
        ],
      },
    },
    {
      id: "channel",
      lines: [
        "You post it. Danish adds: the number on the back of your card counts, a number they text you does not.",
        "The set now covers urgency, false proof, channel switching and independent verification.",
      ],
      outcome: {
        kind: "good",
        headline: "Four signals, one list",
        body:
          "Between you the crew has described the whole arc of a scam without naming a single specific scam, which is what makes the list transfer to the next one.",
        takeaways: [
          "Patterns transfer. Individual stories do not.",
          "The crew's version is the one people will actually repeat.",
        ],
      },
    },
    {
      id: "account",
      lines: [
        "You post it. Jia Cheng adds: including a SIM, a game login and a bank account.",
        "The set now covers urgency, false proof, channel switching and account lending.",
      ],
      outcome: {
        kind: "good",
        headline: "Four signals, one list",
        body:
          "You took the signal the other three missed. Account lending is how a lot of people end up involved in something they never chose.",
        takeaways: [
          "Lending an account puts your name on whatever happens next.",
          "Covering the gap in the crew's list is worth more than repeating a strong entry.",
        ],
      },
    },
  ],
  debrief: {
    title: "Why a crew version exists",
    mechanism:
      "Peer explanation. Compressing a risk into one sentence for people you know produces better retention than receiving the same warning from an authority, and it moves the norm sideways instead of downwards.",
    points: [
      "Everyone contributes one thing, so nobody has to be the expert.",
      "The output is a list the crew can actually use, not a score.",
      "Crew entries in this prototype are seeded content, not messages from real accounts.",
    ],
  },
  skillAwards: [
    { skillId: "communication", points: 24 },
    { skillId: "scam-awareness", points: 14 },
  ],
};
