/**
 * BREAKSAFE.
 *
 * The mission is situational crime prevention: you are asked to change the
 * environment, never to identify a person. Every patch option is scored on
 * privacy and fairness alongside prevention, and the options that work by
 * profiling people score badly on purpose and say why.
 *
 * Nothing here describes how to defeat a self-checkout. The findings are all
 * about ambiguity and social cost, which is the honest description of why
 * unintentional non-scanning happens at scale.
 */

export interface CheckoutHotspot {
  id: string;
  label: string;
  /** Position on the mock terminal, as percentages. */
  x: number;
  y: number;
  /** True when this is a genuine design problem worth finding. */
  isDesignIssue: boolean;
  finding: string;
  explanation: string;
}

export const CHECKOUT_HOTSPOTS: CheckoutHotspot[] = [
  {
    id: "scan-feedback",
    label: "Scan area",
    x: 26,
    y: 62,
    isDesignIssue: true,
    finding: "You cannot tell whether an item scanned",
    explanation:
      "The beep is inconsistent and the item list is below the fold. A shopper who is unsure has no cheap way to check, so they move on and hope.",
  },
  {
    id: "basket-state",
    label: "Item list",
    x: 68,
    y: 30,
    isDesignIssue: true,
    finding: "The basket state is hidden",
    explanation:
      "Only the last two items are visible and the running count is in small grey text. There is no moment where the shopper sees what the machine thinks they have.",
  },
  {
    id: "help-button",
    label: "Assistance",
    x: 78,
    y: 72,
    isDesignIssue: true,
    finding: "Asking for help is socially expensive",
    explanation:
      "The help button triggers a light and a queue-wide pause. It is designed as an exception, so using it feels like admitting a mistake in public.",
  },
  {
    id: "correction",
    label: "Remove item",
    x: 44,
    y: 78,
    isDesignIssue: true,
    finding: "Correcting a mistake looks like admitting one",
    explanation:
      "Removing a wrongly scanned item requires staff approval, so the honest correction path is slower and more visible than doing nothing.",
  },
  {
    id: "weight-alarm",
    label: "Bagging area",
    x: 20,
    y: 34,
    isDesignIssue: true,
    finding: "The weight alarm fires on the wrong people",
    explanation:
      "It triggers on reusable bags, on a bag put down early, on a child leaning on the tray. Frequent false alarms train everyone to ignore the one real one.",
  },
  {
    id: "camera",
    label: "Overhead camera",
    x: 52,
    y: 10,
    isDesignIssue: false,
    finding: "A camera is not a design fix",
    explanation:
      "It records what went wrong after it has gone wrong. It does nothing about the shopper who genuinely could not tell whether the item scanned, and it treats everyone in the queue as a subject.",
  },
  {
    id: "shopper",
    label: "The shopper",
    x: 12,
    y: 16,
    isDesignIssue: false,
    finding: "The person is not the problem to solve",
    explanation:
      "BREAKSAFE never asks who is likely to do something. Prevention that works on the environment applies to everybody equally and does not require guessing about anyone.",
  },
];

export const REQUIRED_FINDINGS = 3;

export interface PatchScores {
  /** All 1 to 5. Higher is better, including for privacy and fairness. */
  prevention: number;
  privacy: number;
  experience: number;
  cost: number;
  fairness: number;
}

export interface PatchOption {
  id: string;
  title: string;
  description: string;
  scores: PatchScores;
  /** Shown after selection. Explains the trade-off honestly. */
  verdict: string;
  /** True when the option works by watching or classifying people. */
  profilesPeople: boolean;
  /** Part of the strongest combination. */
  isStrong: boolean;
  accent: "quest" | "pulse" | "volt" | "coral" | "gold";
}

export const PATCH_OPTIONS: PatchOption[] = [
  {
    id: "patch-confirmation",
    title: "Make the scan unmistakable",
    description:
      "Large item name and price on screen for each scan, a consistent sound, and the full basket always visible.",
    scores: { prevention: 5, privacy: 5, experience: 5, cost: 4, fairness: 5 },
    verdict:
      "The strongest single change. It removes the ambiguity that produces most unintentional non-scanning, costs a software update, and applies identically to every shopper.",
    profilesPeople: false,
    isStrong: true,
    accent: "volt",
  },
  {
    id: "patch-rescan",
    title: "No-fault rescan",
    description:
      "A visible button that lets anyone re-scan or remove an item themselves, with no staff approval and no alarm.",
    scores: { prevention: 4, privacy: 5, experience: 5, cost: 5, fairness: 5 },
    verdict:
      "Makes the honest correction the fastest available action. Cheap, and it removes the reason people quietly move on after a doubtful scan.",
    profilesPeople: false,
    isStrong: true,
    accent: "quest",
  },
  {
    id: "patch-help",
    title: "Help without an audience",
    description:
      "Replace the flashing tower light with a discreet request that brings staff over without pausing the queue.",
    scores: { prevention: 4, privacy: 5, experience: 5, cost: 3, fairness: 5 },
    verdict:
      "Removes the social cost of asking. The embarrassment was doing real work in pushing people towards saying nothing.",
    profilesPeople: false,
    isStrong: true,
    accent: "pulse",
  },
  {
    id: "patch-weight",
    title: "Tighten the weight alarm",
    description: "Lower the tolerance so more discrepancies trigger a hold.",
    scores: { prevention: 3, privacy: 4, experience: 1, cost: 4, fairness: 2 },
    verdict:
      "Catches more, and annoys far more. False alarms fall hardest on people with reusable bags, children or mobility aids, and a queue that is used to alarms stops treating them as meaningful.",
    profilesPeople: false,
    isStrong: false,
    accent: "gold",
  },
  {
    id: "patch-cameras",
    title: "Add more cameras",
    description: "Increase overhead coverage across the self-checkout bank.",
    scores: { prevention: 2, privacy: 2, experience: 3, cost: 2, fairness: 3 },
    verdict:
      "Documents the problem rather than preventing it, and it acts after the fact. The shopper who could not tell whether the item scanned is in exactly the same position as before.",
    profilesPeople: false,
    isStrong: false,
    accent: "coral",
  },
  {
    id: "patch-face",
    title: "Add facial recognition",
    description: "Identify shoppers at the terminal and flag individuals against a watch list.",
    scores: { prevention: 2, privacy: 1, experience: 2, cost: 1, fairness: 1 },
    verdict:
      "SIDEQUEST will not build this and neither should the shop. It turns every customer into a subject of identification to address a problem that is mostly caused by unclear feedback, and it decides in advance who is worth suspecting. Prevention should not require knowing who anybody is.",
    profilesPeople: true,
    isStrong: false,
    accent: "coral",
  },
];

export const MAX_PATCHES = 3;

export const BREAKSAFE_REVEAL = {
  headline: "SAME PERSON. SAME PRODUCT. DIFFERENT ENVIRONMENT.",
  body: "We changed the environment, not the person.",
  detail:
    "Nothing about the shopper changed between the two versions. What changed is whether the machine told them the truth about what it had recorded, and whether fixing a mistake was easier than ignoring it.",
};

export const SCORE_LABELS: { key: keyof PatchScores; label: string }[] = [
  { key: "prevention", label: "Prevention" },
  { key: "privacy", label: "Privacy" },
  { key: "experience", label: "Experience" },
  { key: "cost", label: "Cost" },
  { key: "fairness", label: "Fairness" },
];
