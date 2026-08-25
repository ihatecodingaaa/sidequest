import type { DataProvenance } from "./core";

export type RewardType =
  | "voucher"
  | "experience"
  | "access"
  | "recognition"
  | "crew";

export interface Reward {
  id: string;
  title: string;
  description: string;
  xpCost: number;
  rewardType: RewardType;
  /** Named only as a *potential* partner unless a deal is signed. */
  potentialPartner?: string;
  provenance: DataProvenance;
  inventoryStatus: "available" | "limited" | "waitlist";
  accent: "quest" | "pulse" | "volt" | "coral" | "gold";
  /** Displayed verbatim on the claim confirmation. */
  footnote: string;
}
