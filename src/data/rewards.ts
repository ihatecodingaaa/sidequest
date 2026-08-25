import type { Reward } from "@/types/rewards";

/**
 * Reward store.
 *
 * Two hard rules, both enforced by the data rather than by the UI:
 *
 * 1. No organisation is described as a partner. Where a category of partner is
 *    plausible it is named as a *potential* partner and marked "partner-concept".
 * 2. No claim produces a code with monetary value. Claiming in the prototype
 *    records an entry in the Safety Passport and says so plainly.
 *
 * Recognition rewards sit at the top of the list on purpose: the product should
 * not read as a voucher farm, and the cheapest rewards are the non-commercial ones.
 */

export const REWARDS: Reward[] = [
  {
    id: "reward-crew-badge",
    title: "Crew banner",
    description: "A banner your crew carries on the weekly board for the rest of the season.",
    xpCost: 150,
    rewardType: "crew",
    provenance: "seeded",
    inventoryStatus: "available",
    accent: "quest",
    footnote: "Recognition inside SIDEQUEST. No monetary value.",
  },
  {
    id: "reward-passport-feature",
    title: "Passport spotlight",
    description:
      "Your best Build Quest submission is featured on the Safety Passport of everyone in your crew.",
    xpCost: 220,
    rewardType: "recognition",
    provenance: "seeded",
    inventoryStatus: "available",
    accent: "volt",
    footnote: "Recognition inside SIDEQUEST. No monetary value.",
  },
  {
    id: "reward-workshop",
    title: "Safety design workshop seat",
    description:
      "A seat at a hands-on session on designing systems that make the safe choice the easy one.",
    xpCost: 400,
    rewardType: "experience",
    potentialPartner: "Community or tertiary institution, to be arranged",
    provenance: "partner-concept",
    inventoryStatus: "limited",
    accent: "pulse",
    footnote:
      "Prototype reward. No workshop is currently scheduled and no organisation has committed to host one.",
  },
  {
    id: "reward-grocery",
    title: "S$5 grocery eVoucher",
    description: "A small everyday reward, the kind a sponsor would realistically fund.",
    xpCost: 500,
    rewardType: "voucher",
    potentialPartner: "Grocery retailer, potential sponsor",
    provenance: "partner-concept",
    inventoryStatus: "waitlist",
    accent: "gold",
    footnote:
      "Prototype reward concept. No retailer has agreed to this and no voucher is issued. No monetary value in prototype.",
  },
  {
    id: "reward-bookstore",
    title: "S$10 bookstore voucher",
    description: "For crews that finish a season challenge together.",
    xpCost: 700,
    rewardType: "voucher",
    potentialPartner: "Bookstore, potential sponsor",
    provenance: "partner-concept",
    inventoryStatus: "waitlist",
    accent: "coral",
    footnote:
      "Prototype reward concept. No retailer has agreed to this and no voucher is issued. No monetary value in prototype.",
  },
  {
    id: "reward-showcase",
    title: "Showcase your challenge entry",
    description:
      "Present your Partner Challenge submission to the organisation that set the brief.",
    xpCost: 900,
    rewardType: "access",
    potentialPartner: "Challenge owner, to be arranged",
    provenance: "partner-concept",
    inventoryStatus: "waitlist",
    accent: "quest",
    footnote:
      "Prototype reward concept. Depends on a partner arrangement that does not yet exist.",
  },
];

export function getReward(id: string): Reward | undefined {
  return REWARDS.find((reward) => reward.id === id);
}
