import type { SkillId } from "@/types/core";
import type { SafetySkill } from "@/types/profile";

/**
 * The Safety Passport tracks capability, not points.
 * Each skill answers "what can this person actually do", which is the claim we
 * want a school or a partner to be able to read at a glance.
 */

export const SAFETY_SKILLS: readonly SafetySkill[] = [
  {
    id: "decision-making",
    name: "Decision Making",
    blurb: "Choosing well when there is little time and other people are watching.",
    capability: "Pauses under pressure and picks the option they can defend later.",
  },
  {
    id: "peer-intervention",
    name: "Peer Intervention",
    blurb: "Stepping in for a friend without turning it into a confrontation.",
    capability: "Interrupts a bad moment in a way that lets everyone keep face.",
  },
  {
    id: "scam-awareness",
    name: "Scam Awareness",
    blurb: "Recognising the shape of a scam before the details are clear.",
    capability: "Spots urgency, verification requests and payment redirection early.",
  },
  {
    id: "safety-design",
    name: "Safety Design",
    blurb: "Changing an environment so the safe action is the easy one.",
    capability: "Diagnoses why a system pushes people towards the wrong choice.",
  },
  {
    id: "community-action",
    name: "Community Action",
    blurb: "Showing up for prevention work in the real world.",
    capability: "Contributes to programmes rather than only consuming advice.",
  },
  {
    id: "leadership",
    name: "Leadership",
    blurb: "Getting a group to move first when nobody wants to.",
    capability: "Sets the norm in a group instead of following it.",
  },
  {
    id: "communication",
    name: "Communication",
    blurb: "Explaining a risk so somebody else actually changes what they do.",
    capability: "Turns a warning into something a peer will act on.",
  },
] as const;

/** Points needed for each skill tier. Tiers read as capability, not score. */
export const SKILL_TIERS = [
  { min: 0, label: "Not started" },
  { min: 1, label: "Introduced" },
  { min: 30, label: "Practised" },
  { min: 70, label: "Confident" },
  { min: 130, label: "Coaching others" },
] as const;

export function skillTier(points: number): { index: number; label: string; nextAt: number | null } {
  let index = 0;
  for (let i = 0; i < SKILL_TIERS.length; i += 1) {
    if (points >= SKILL_TIERS[i].min) index = i;
  }
  const next = SKILL_TIERS[index + 1];
  return {
    index,
    label: SKILL_TIERS[index].label,
    nextAt: next ? next.min : null,
  };
}

export function getSkill(id: SkillId): SafetySkill | undefined {
  return SAFETY_SKILLS.find((skill) => skill.id === id);
}
