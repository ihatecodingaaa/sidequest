import type { Scenario } from "@/types/scenario";

export const OTP_SCENARIO: Scenario = {
  id: "mission-otp",
  intro: {
    kicker: "Quick Quest",
    title: "Would you send the OTP?",
    setup:
      "It is 9:14pm. You are on the bus. Your phone rings from a number you do not recognise.",
  },
  startBeatId: "call",
  beats: [
    {
      id: "call",
      slug: "9:14pm, on the bus",
      speaker: "Unknown number",
      lines: [
        "Hi, this is from the bank's fraud team. We have flagged a card transaction on your account for $842 at an electronics store.",
        "Did you authorise that?",
      ],
      choices: [
        { id: "no", label: "No, I didn't", next: "hook", tone: "neutral" },
        { id: "how", label: "How do I know this is really the bank?", next: "verify-early", tone: "safe", isPreferred: true },
        { id: "hangup", label: "Hang up", next: "hangup", tone: "safe", isPreferred: true },
      ],
    },
    {
      id: "hook",
      speaker: "Unknown number",
      lines: [
        "Understood. I will stop the transaction now, but the window is about ninety seconds.",
        "I am sending a verification code to your phone. Read it back to me and I will block the payment.",
      ],
      choices: [
        {
          id: "send",
          label: "Read out the code",
          reaction: "You read the six digits. The line goes quiet for a second.",
          next: "sent",
          tone: "risky",
        },
        {
          id: "read-sms",
          label: "Open the SMS and read what it actually says",
          reaction: "The message says: do not share this code. It is authorising a new payee.",
          next: "caught",
          tone: "safe",
          isPreferred: true,
        },
        {
          id: "callback",
          label: "Say you will call the bank back yourself",
          next: "callback",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "verify-early",
      speaker: "Unknown number",
      lines: [
        "I can confirm the last four digits of your card. It ends 4471, correct?",
        "Now, I am sending a code to secure the account. Just read it to me.",
      ],
      choices: [
        {
          id: "convinced",
          label: "They knew my card digits, so read the code",
          reaction: "Card digits leak in data breaches all the time. They prove nothing.",
          next: "sent",
          tone: "risky",
        },
        {
          id: "hangup2",
          label: "Hang up and call the number on my card",
          next: "callback",
          tone: "safe",
          isPreferred: true,
        },
      ],
    },
    {
      id: "hangup",
      lines: [
        "You end the call. Thirty seconds later an SMS arrives with a six digit code you did not request.",
        "Nobody calls back.",
      ],
      outcome: {
        kind: "good",
        headline: "Nothing happened, which was the point",
        body:
          "The code arrived because someone was already trying to get into your account. Without you reading it out, the attempt stopped there.",
        takeaways: [
          "An unrequested OTP is a signal that something is in progress, not a glitch.",
          "Hanging up costs nothing. A real bank will still be there in two minutes.",
        ],
      },
    },
    {
      id: "callback",
      lines: [
        "You end the call and dial the number printed on the back of your card.",
        "The bank confirms there is no flagged transaction, and no one from their team called you.",
      ],
      outcome: {
        kind: "good",
        headline: "You changed the channel, and the scam did not survive it",
        body:
          "Scams depend on staying inside the call they started. Calling back on a number you already had removes their control of the conversation.",
        takeaways: [
          "Verification means using a channel they did not give you.",
          "Knowing your card digits or your name proves nothing. That information circulates.",
        ],
      },
    },
    {
      id: "caught",
      lines: [
        "You read the message properly. It is not a block on a payment.",
        "It is authorising a new payee.",
        "You end the call.",
      ],
      outcome: {
        kind: "good",
        headline: "The SMS told you the truth the caller would not",
        body:
          "The text that carries an OTP almost always states what it is authorising. The caller was describing a completely different action.",
        takeaways: [
          "Read the message, not the person.",
          "If the caller's story and the SMS disagree, the SMS is the one telling you what is about to happen.",
        ],
      },
    },
    {
      id: "sent",
      lines: [
        "The call ends politely.",
        "Four minutes later your banking app shows a transfer you did not make.",
      ],
      outcome: {
        kind: "poor",
        headline: "The code was the last lock",
        body:
          "Nothing here required technical skill. The whole approach was built on ninety seconds of urgency and a request that felt like cooperation.",
        takeaways: [
          "No bank, agency or delivery company in Singapore asks you to read out an OTP.",
          "Urgency is the tell. A real fraud team does not run on a countdown.",
          "If it happens, call 1799 and your bank straight away. Speed matters afterwards too.",
        ],
      },
    },
  ],
  debrief: {
    title: "What this rehearsed",
    mechanism:
      "The mission compresses the decision into the same time window a real call uses. Practising a refusal once makes it far more available when the pressure is real.",
    points: [
      "The request always sounds like helping, not like handing something over.",
      "Details about you are cheap. They are not evidence of who is calling.",
      "The reliable move is switching channel: hang up, call back on a number you already trust.",
    ],
  },
  skillAwards: [
    { skillId: "scam-awareness", points: 18 },
    { skillId: "decision-making", points: 10 },
  ],
};
