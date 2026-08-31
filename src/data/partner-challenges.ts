import type { DataProvenance } from "@/types/core";

/**
 * Partner Challenges.
 *
 * NO ORGANISATION HAS COMMISSIONED ANY OF THESE. `owner` describes the *kind*
 * of organisation that would plausibly set the brief, and `isConfirmedPartner`
 * is false everywhere. Every surface that renders a challenge shows the
 * "Prototype Partner Challenge" label.
 */

/**
 * One of the real frictions in the brief, offered as a tappable starting point.
 *
 * A Partner Challenge used to open with a blank 600 character box, which asked
 * a sixteen year old to invent both the problem and the answer with nothing to
 * push against. That is a harder creative task than the brief actually wants,
 * and testers reported the typing itself as the barrier. Naming the frictions
 * makes the mission what it was always meant to be: pick the thing that is
 * wrong, decide what to change about it, and say which idea that leans on.
 *
 * The frictions here are the ones the brief's own context section already
 * describes. Nothing new is being claimed.
 */
export interface ChallengeProblem {
  id: string;
  /** Button label. What is wrong, in a young person's words. */
  label: string;
  /** Opens the generated entry. One sentence. */
  statement: string;
  /** Which changes are a plausible answer to this friction. Display order. */
  moveIds: string[];
}

/**
 * A change somebody could make. Becomes the title of the entry.
 *
 * Every one of these is a change to the *environment*. There is deliberately
 * no option here that works by watching, identifying or classifying a shopper:
 * the brief forbids it, `BREAKSAFE` teaches why, and offering it as a
 * selectable design move in a build mission would undo both.
 */
export interface ChallengeMove {
  id: string;
  /** Button label, and the title of the generated entry. */
  label: string;
  /** The second sentence of the generated entry. What actually changes. */
  change: string;
}

export interface DesignPrinciple {
  id: string;
  label: string;
  description: string;
}

export interface PartnerChallenge {
  id: string;
  missionId: string;
  title: string;
  question: string;
  owner: string;
  isConfirmedPartner: boolean;
  provenance: DataProvenance;
  context: string[];
  constraints: string[];
  behaviouralNotes: string[];
  deadline: string;
  rewardConcept: string;
  principles: DesignPrinciple[];
  /** Tap-first composition. What is wrong, and what you would change. */
  problems: ChallengeProblem[];
  moves: ChallengeMove[];
  /** Seeded entries shown as prototype content, clearly labelled in the UI. */
  sampleEntries: { author: string; title: string; principleId: string }[];
}

export const DESIGN_PRINCIPLES: DesignPrinciple[] = [
  {
    id: "principle-easy",
    label: "Make the safe action easier",
    description: "Shorten the path to the right thing instead of blocking the wrong one.",
  },
  {
    id: "principle-visible",
    label: "Make the state visible",
    description: "People cannot do the right thing if the system will not tell them where they are.",
  },
  {
    id: "principle-facesaving",
    label: "Remove the social cost",
    description: "Asking for help or fixing a mistake should not require an audience.",
  },
  {
    id: "principle-noprofiling",
    label: "Fix the system, not the person",
    description: "The change should work without identifying, scoring or watching anybody.",
  },
  {
    id: "principle-default",
    label: "Change the default",
    description: "Whatever happens when nobody does anything is the outcome you actually chose.",
  },
];

export const PARTNER_CHALLENGES: PartnerChallenge[] = [
  {
    id: "challenge-selfcheckout",
    missionId: "mission-partner-selfcheckout",
    title: "Make self-checkout safer",
    question:
      "How could we reduce missed scans while preserving customer privacy and keeping the queue moving?",
    owner: "Retail partner concept",
    isConfirmedPartner: false,
    provenance: "partner-concept",
    context: [
      "Self-checkout losses are a mix of deliberate theft and honest error, and the honest error group is large. Most measures aimed at the first group land on the second one.",
      "Shoppers who are unsure whether an item scanned face a choice between an awkward interruption and moving on. The design decides which one is cheaper.",
      "Any workable answer has to survive a Saturday queue, so it cannot slow anybody down.",
    ],
    constraints: [
      "No facial recognition and no identification of individual shoppers",
      "No change that adds more than three seconds to a normal basket",
      "Must work for someone using a reusable bag or shopping with a child",
      "Must be affordable to roll out across an existing terminal fleet",
    ],
    behaviouralNotes: [
      "Embarrassment is a real cost and people will pay a surprising amount to avoid it.",
      "Ambiguity is what turns a mistake into a decision.",
      "A correction path that requires staff approval will lose to doing nothing.",
    ],
    problems: [
      {
        id: "problem-unsure",
        label: "You cannot tell if it scanned",
        statement:
          "A shopper who is not sure whether an item went through has no cheap way to check, so they move on and hope.",
        moveIds: ["move-receipt", "move-sound", "move-rescan"],
      },
      {
        id: "problem-correction",
        label: "Fixing a mistake looks like admitting one",
        statement:
          "Correcting a wrong scan needs staff approval, so the honest fix is slower and more public than doing nothing.",
        moveIds: ["move-rescan", "move-quiethelp", "move-receipt"],
      },
      {
        id: "problem-audience",
        label: "Asking for help is embarrassing",
        statement:
          "The help button pauses the whole queue, so using it feels like announcing a mistake to everybody behind you.",
        moveIds: ["move-quiethelp", "move-rescan", "move-layout"],
      },
      {
        id: "problem-falsealarm",
        label: "The alarm goes off on the wrong people",
        statement:
          "The weight alarm fires on reusable bags and on a child leaning on the tray, so everyone learns to ignore it.",
        moveIds: ["move-tolerance", "move-layout", "move-receipt"],
      },
    ],
    moves: [
      {
        id: "move-receipt",
        label: "Show the basket like a receipt",
        change:
          "Keep the full running basket on screen the whole time, with the item name and the price for every scan, so there is never a moment where only the machine knows what it has.",
      },
      {
        id: "move-sound",
        label: "Make the confirmation unmistakable",
        change:
          "One consistent sound and one large item name for every successful scan, so an unsure shopper gets an answer without having to look for one.",
      },
      {
        id: "move-rescan",
        label: "Let anyone re-scan with no staff call",
        change:
          "A visible button that lets a shopper remove or re-scan an item themselves, with no approval and no alarm, so the honest correction is the fastest thing available.",
      },
      {
        id: "move-quiethelp",
        label: "Let people ask for help quietly",
        change:
          "Replace the flashing tower light with a discreet request that brings someone over without pausing the queue, so asking costs nothing socially.",
      },
      {
        id: "move-tolerance",
        label: "Stop the alarm crying wolf",
        change:
          "Tune the weight check so it stops firing on reusable bags and shopping with a child, so the alarms that remain are the ones worth reacting to.",
      },
      {
        id: "move-layout",
        label: "Give the bagging area room",
        change:
          "Lay the terminal out so a bag, a basket and a child all fit without touching the tray, so the machine stops treating an ordinary shop as a discrepancy.",
      },
    ],
    deadline: "2026-09-30T23:59:00+08:00",
    rewardConcept:
      "Concept: shortlisted entries presented to the organisation that set the brief, plus a workshop seat. Nothing is committed.",
    principles: DESIGN_PRINCIPLES,
    sampleEntries: [
      { author: "Rina, 17", title: "Show the basket like a receipt, always", principleId: "principle-visible" },
      { author: "Danish, 16", title: "One-tap rescan with no staff call", principleId: "principle-easy" },
      { author: "Kaiwen, 19", title: "Silent help request on the shopper's own phone", principleId: "principle-facesaving" },
    ],
  },
];

export function getPartnerChallenge(id: string): PartnerChallenge | undefined {
  return PARTNER_CHALLENGES.find((challenge) => challenge.id === id);
}

export function getChallengeForMission(missionId: string): PartnerChallenge | undefined {
  return PARTNER_CHALLENGES.find((challenge) => challenge.missionId === missionId);
}

export function getPrinciple(id: string): DesignPrinciple | undefined {
  return DESIGN_PRINCIPLES.find((principle) => principle.id === id);
}

/**
 * Assembles an entry from the taps.
 *
 * Deterministic, like the Quick Quest Builder's generator and for the same
 * reason: the same choices always produce the same entry, no model is
 * involved, and the screen says so rather than letting anybody assume
 * otherwise.
 */
export function composeEntry(
  challenge: PartnerChallenge,
  problemId: string,
  moveId: string,
): { title: string; solution: string } | null {
  const problem = challenge.problems.find((entry) => entry.id === problemId);
  const move = challenge.moves.find((entry) => entry.id === moveId);
  if (!problem || !move) return null;
  return { title: move.label, solution: `${problem.statement} ${move.change}` };
}
