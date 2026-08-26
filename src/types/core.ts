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
 *
 * The field is required wherever it appears, never optional and never
 * defaulted. Pennycook, Bear, Collins and Rand (2020), "The Implied Truth
 * Effect", Management Science 66(11), found that warning a *subset* of items
 * raises the perceived accuracy of the items left unwarned. A partially
 * labelled feed is therefore worse than an unlabelled one: it teaches the
 * reader that anything without a tag has been checked. Exhaustive within a
 * class, or not at all.
 */
export type DataProvenance =
  | "official-source" // links out to a real, authoritative external service
  | "reported" // summarises journalism, and names the publisher who did the reporting
  | "seeded" // written by the team for the prototype, based on public advisories
  | "demo-aggregate" // synthetic numbers standing in for a real study
  | "partner-concept" // a proposal, not a confirmed commercial arrangement
  | "pilot"; // measurements from a real SIDEQUEST pilot

/*
 * `pilot` has no legitimate use yet: no pilot has been run, so no data can
 * honestly wear it. It exists in the vocabulary so the day a real dataset
 * arrives nobody has to invent a label under deadline, and an integrity test
 * fails the build if it appears in `src/data` before then.
 *
 * `verified` was considered and rejected. The codebase has no verification
 * procedure, so the word would describe nothing.
 */

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
