import type { DiscoveryLink, PulseItem } from "@/types/content";

/**
 * Seeded Pulse content.
 *
 * Every summary here is written by the SIDEQUEST team. No article text is
 * copied and no headline is attributed to a publisher that did not write it.
 * Each item links out to a real page owned by the authority it names, so a
 * reader can always reach the primary source in one tap.
 *
 * Provenance is "seeded" across the board: this is prototype content built
 * from publicly available Singapore advisories, not a live feed.
 */

export const PULSE_ITEMS: PulseItem[] = [
  {
    id: "pulse-job-scams",
    title: "Job offers that pay too well, land too fast",
    summary:
      "Fake recruiters are reaching young people through messaging apps with high daily pay and almost no interview. The catch usually arrives later.",
    context: [
      "The offer normally starts as a short, friendly message: flexible hours, work from your phone, a few hundred dollars a day. There is rarely a proper interview and almost never a company you can look up.",
      "The first tasks are real and the first payment often lands, which is the point. Once you trust the arrangement you are asked to pay a deposit to unlock higher earnings, or to receive money in your own bank account and pass it on.",
      "Receiving and moving money for someone else is how people end up as money mules. It is treated seriously in Singapore even when the person genuinely did not know where the money came from.",
    ],
    source: "Singapore Police Force advisories",
    sourceUrl: "https://www.police.gov.sg/Advisories",
    sourceLabel: "Read the official advisories",
    category: "scams",
    publishedOffsetHours: 30,
    region: "Singapore",
    relatedMissionId: "mission-job-scam",
    relevance: "Job scams disproportionately target students and first jobbers.",
    provenance: "seeded",
    signals: [
      "Pay is described per day, not per month",
      "The interview is a chat, or there is none",
      "You are asked to pay before you earn",
      "Your own bank account is part of the job",
    ],
    actions: [
      {
        label: "Never move money for an employer",
        detail:
          "A real job does not need your personal bank account to receive or forward customer funds.",
      },
      {
        label: "Check the company exists",
        detail: "Search the company name plus the word scam before you reply to anything.",
      },
      {
        label: "Talk to one person first",
        detail: "Say the offer out loud to a friend or family member. Most scams do not survive it.",
      },
    ],
  },
  {
    id: "pulse-otp",
    title: "Nobody legitimate needs your OTP",
    summary:
      "One-time passwords are the last lock on your accounts. Every request for one, however official the caller sounds, is a request to open that lock.",
    context: [
      "An OTP exists so that knowing your password is not enough. That is why it is the single thing scammers work hardest to get.",
      "The pressure is usually social rather than technical: a delivery that needs confirming, a bank checking a suspicious transaction, a friend locked out of an account asking you to receive a code for them.",
      "Banks, government agencies and delivery companies in Singapore do not ask you to read out an OTP. If someone does, the call itself is the problem.",
    ],
    source: "ScamShield",
    sourceUrl: "https://www.scamshield.gov.sg",
    sourceLabel: "Open ScamShield",
    category: "scams",
    publishedOffsetHours: 44,
    region: "Singapore",
    relatedMissionId: "mission-otp",
    relevance: "The fastest quest in SIDEQUEST, and the one people fail most.",
    provenance: "seeded",
    signals: [
      "Urgency: it has to be right now",
      "The caller already knows some of your details",
      "You did not start the transaction",
      "Helping a friend is the reason given",
    ],
    actions: [
      {
        label: "Hang up and call back",
        detail: "Use the number on the back of your card or the agency's official website.",
      },
      {
        label: "Read the SMS, not the caller",
        detail: "The message that carries the OTP usually says exactly what it is authorising.",
      },
    ],
  },
  {
    id: "pulse-marketplace",
    title: "Deals that only work if you leave the app",
    summary:
      "On resale platforms, the request to continue the chat somewhere else is the moment the protection ends.",
    context: [
      "Marketplace listings for concert tickets, sneakers, consoles and phones attract a steady stream of fake sellers. The listing looks normal. The pressure starts in the chat.",
      "Moving to a private messaging app removes the platform's payment protection, dispute process and record of the conversation. That is the reason for the move, not convenience.",
      "The follow up is usually a link to a payment page that looks like a bank or a delivery service. The page is the scam.",
    ],
    source: "ScamShield",
    sourceUrl: "https://www.scamshield.gov.sg",
    sourceLabel: "Check a suspicious link or number",
    category: "scams",
    publishedOffsetHours: 52,
    region: "Singapore",
    relatedMissionId: "mission-marketplace",
    relevance: "Peak season for event tickets means peak season for fake sellers.",
    provenance: "seeded",
    signals: [
      "Seller wants to move to a private chat",
      "Price is well under everything else listed",
      "You are sent a payment link instead of using the app",
      "The seller is leaving the country tomorrow",
    ],
    actions: [
      {
        label: "Stay inside the platform",
        detail: "Pay through the app so the dispute process still applies if it goes wrong.",
      },
      {
        label: "Never sign in through a link",
        detail: "Open your banking app yourself. Do not follow a link into a login page.",
      },
    ],
  },
  {
    id: "pulse-peer-pressure",
    title: "The quiet cost of going along with it",
    summary:
      "Most young people who end up in trouble did not plan anything. They were with a group, said nothing, and the moment passed.",
    context: [
      "Group situations compress decisions. There is little time, an audience, and a strong pull towards not being the person who makes it awkward.",
      "Research on bystander behaviour consistently finds that people are far more likely to act when someone else moves first, and far less likely when everyone is quietly waiting.",
      "The useful skill is not courage in the abstract. It is having one sentence ready that lets you and your friend leave a situation without either of you losing face.",
    ],
    source: "National Crime Prevention Council",
    sourceUrl: "https://www.ncpc.org.sg",
    sourceLabel: "Crime prevention resources",
    category: "youth",
    publishedOffsetHours: 3,
    region: "Singapore",
    relatedMissionId: "mission-rewind",
    relevance: "The behavioural core of SIDEQUEST, rehearsed rather than lectured.",
    provenance: "seeded",
    featured: true,
    signals: [
      "It happens fast and in front of people",
      "Nobody wants to be the first to object",
      "Leaving feels harder than staying",
    ],
    actions: [
      {
        label: "Have a line ready",
        detail: "A prepared sentence works because you do not have to invent one under pressure.",
      },
      {
        label: "Change the setting, not the person",
        detail: "Suggesting you all leave is easier to accept than telling someone they are wrong.",
      },
    ],
  },
  {
    id: "pulse-selfcheckout",
    title: "When the machine makes the honest thing hard",
    summary:
      "Self-checkout errors are mostly a design problem. Unclear feedback and awkward help pathways cause more losses than intent does.",
    context: [
      "A shopper who cannot tell whether an item scanned, and who would have to raise a hand in front of a queue to find out, is being asked to choose between confusion and embarrassment.",
      "Retail research into self-checkout consistently separates deliberate theft from unintentional non-scanning, and the second group is large. Design changes address both; surveillance mostly addresses one.",
      "The prevention question is therefore not who to watch, but what to fix so the safe action is the easy one.",
    ],
    source: "National Crime Prevention Council",
    sourceUrl: "https://www.ncpc.org.sg",
    sourceLabel: "Crime prevention resources",
    category: "safety",
    publishedOffsetHours: 9,
    region: "Singapore",
    relatedMissionId: "mission-breaksafe",
    relevance: "Sets up BREAKSAFE, where you redesign the environment instead of the person.",
    provenance: "seeded",
    signals: [
      "No clear confirmation that an item scanned",
      "Asking for help means interrupting a queue",
      "Correcting a mistake looks like admitting one",
    ],
    actions: [
      {
        label: "Design for the honest majority",
        detail: "Most people want to do the right thing. Make that path shorter than the wrong one.",
      },
    ],
  },
  {
    id: "pulse-account-sharing",
    title: "The account you lent out is still yours",
    summary:
      "Lending a bank account, a SIM or a game login feels like a small favour. Legally and practically, what happens next stays attached to your name.",
    context: [
      "Requests to borrow an account often come from someone you know, with a reason that sounds temporary and specific.",
      "Once money or messages pass through an account, the trail leads to the account holder. Explaining that you were only helping a friend does not undo the trail.",
      "This is one of the routes by which young people in Singapore end up assisting scam operations without ever intending to.",
    ],
    source: "Singapore Police Force advisories",
    sourceUrl: "https://www.police.gov.sg/Advisories",
    sourceLabel: "Read the official advisories",
    category: "youth",
    publishedOffsetHours: 20,
    region: "Singapore",
    relatedMissionId: "mission-norm-mirror",
    relevance: "The situation behind Norm Mirror, where what people assume differs from what they do.",
    provenance: "seeded",
    signals: [
      "It is framed as a one time favour",
      "There is a reason you cannot verify",
      "You are told nothing will touch you",
    ],
    actions: [
      {
        label: "Say no to the account, not the person",
        detail: "You can offer to help another way without handing over anything in your name.",
      },
    ],
  },
  {
    id: "pulse-deepfake",
    title: "A familiar voice is no longer proof",
    summary:
      "Short audio clips are enough to imitate someone you know. The old test, that it sounded like them, has stopped working.",
    context: [
      "Voice and video imitation has moved from novelty to a practical tool. A few seconds of public audio is enough for a convincing approximation.",
      "The scam still depends on the same thing it always did: urgency, plus a request for money or a code before you have time to check.",
      "The replacement for recognising a voice is a second channel. Call the person back on the number you already have.",
    ],
    source: "ScamShield",
    sourceUrl: "https://www.scamshield.gov.sg",
    sourceLabel: "Open ScamShield",
    category: "cyber",
    publishedOffsetHours: 68,
    region: "Singapore",
    relatedMissionId: "mission-otp",
    relevance: "Explains why verification now has to be a habit rather than a judgement call.",
    provenance: "seeded",
    signals: [
      "Urgent request from someone close to you",
      "They cannot talk long or take a call back",
      "Money or a code is needed immediately",
    ],
    actions: [
      {
        label: "Use a second channel",
        detail: "End the call, then reach them on the number already saved in your phone.",
      },
      {
        label: "Agree a family word",
        detail: "A phrase only your household knows costs nothing and settles the question fast.",
      },
    ],
  },
  {
    id: "pulse-community",
    title: "Prevention that happens on a Saturday morning",
    summary:
      "Community safety programmes need volunteers far more often than they need audiences. Turning up counts.",
    context: [
      "Roadshows, neighbourhood briefings and school programmes run regularly across Singapore, and most of them are short of people rather than short of material.",
      "Volunteering also changes what prevention feels like: you stop being someone the advice is aimed at and become someone delivering it.",
      "SIDEQUEST surfaces verified opportunities and gets out of the way. The organisation running the programme remains the one you sign up with.",
    ],
    source: "National Crime Prevention Council",
    sourceUrl: "https://www.ncpc.org.sg",
    sourceLabel: "Programmes and resources",
    category: "community",
    publishedOffsetHours: 90,
    region: "Singapore",
    relatedMissionId: "mission-service",
    relevance: "The step after playing: contributing.",
    provenance: "seeded",
    actions: [
      {
        label: "Start with one session",
        detail: "Most programmes accept a single-session volunteer without any long commitment.",
      },
    ],
  },
];

/**
 * Outbound discovery. These tiles carry no invented headlines: each one names a
 * publisher and opens a section that publisher actually maintains.
 */
export const DISCOVERY_LINKS: DiscoveryLink[] = [
  {
    id: "discover-cna-singapore",
    label: "CNA Singapore",
    description: "National news, straight from the newsroom.",
    url: "https://www.channelnewsasia.com/singapore",
    publisher: "CNA",
    accent: "pulse",
    provenance: "reported",
  },
  {
    id: "discover-cna-scams",
    label: "CNA scam coverage",
    description: "CNA's running coverage of scams in Singapore.",
    url: "https://www.channelnewsasia.com/topic/scams",
    publisher: "CNA",
    accent: "gold",
    provenance: "reported",
  },
  {
    id: "discover-spf",
    label: "Police advisories",
    description: "The primary source for current crime and scam advisories.",
    url: "https://www.police.gov.sg/Advisories",
    publisher: "Singapore Police Force",
    accent: "quest",
    provenance: "official-source",
  },
  {
    id: "discover-scamshield",
    label: "ScamShield",
    description: "Check a number, a link or a message.",
    url: "https://www.scamshield.gov.sg",
    publisher: "ScamShield",
    accent: "volt",
    provenance: "official-source",
  },
];

export function getPulseItem(id: string): PulseItem | undefined {
  return PULSE_ITEMS.find((item) => item.id === id);
}

export function getFeaturedPulseItem(): PulseItem {
  return PULSE_ITEMS.find((item) => item.featured) ?? PULSE_ITEMS[0];
}
