/** Shared vocabulary used across content, missions and progression. */

export type AgeBand = "13-15" | "16-18" | "19-25" | "26+";

export const AGE_BANDS: readonly AgeBand[] = ["13-15", "16-18", "19-25", "26+"] as const;

export type ContentCategory =
  | "scams"
  | "cyber"
  | "youth"
  | "community"
  | "safety"
  | "singapore";

export type Interest =
  | "scams"
  | "cyber"
  | "peer-pressure"
  | "design"
  | "volunteering"
  | "events"
  | "news"
  | "radio";

/**
 * Honesty labels. Every surface that renders seeded or invented material must
 * carry one of these so a judge can never mistake prototype data for live data.
 */
export type DataProvenance =
  | "official-source" // links out to a real, authoritative external service
  | "seeded" // written by the team for the prototype, based on public advisories
  | "demo-aggregate" // synthetic numbers standing in for a real study
  | "partner-concept"; // a proposal, not a confirmed commercial arrangement

export type SkillId =
  | "decision-making"
  | "peer-intervention"
  | "scam-awareness"
  | "safety-design"
  | "community-action"
  | "leadership"
  | "communication";

export interface SkillAward {
  skillId: SkillId;
  points: number;
}
