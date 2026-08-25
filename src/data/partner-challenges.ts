import type { DataProvenance } from "@/types/core";

/**
 * Partner Challenges.
 *
 * NO ORGANISATION HAS COMMISSIONED ANY OF THESE. `owner` describes the *kind*
 * of organisation that would plausibly set the brief, and `isConfirmedPartner`
 * is false everywhere. Every surface that renders a challenge shows the
 * "Prototype Partner Challenge" label.
 */

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
