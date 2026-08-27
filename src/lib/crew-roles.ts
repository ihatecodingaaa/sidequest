import type { SkillId } from "@/types/core";
import type { UserProfile } from "@/types/profile";
import type { Accent } from "@/lib/accent";

/**
 * Community Safety Crew roles.
 *
 * The brief's raw idea was "work for an agency to fight crime". That is not
 * what this is, and the distance matters more than almost anything else in the
 * product.
 *
 * The Crew is a fictional youth prevention crew. It has **roles, not ranks**,
 * it has no powers, and nobody in it is police or pretending to be. Its verbs
 * are notice, support, connect, redirect, design and create, which are the
 * things a member of the public can actually do.
 *
 * ---
 *
 * ## A role is a view, not a new progression system
 *
 * Every role reads a capability the profile has stored since long before any
 * of this existed. Nothing new is persisted, nothing is unlocked, and a role
 * cannot be lost. It is an answer to "what am I like in this", which is an
 * identity question, and identity is what the motivation literature says is
 * doing the work here rather than the number.
 *
 * Which role shows is simply whichever capability is furthest along, with a
 * stable tie-break so it never flickers.
 */

export type CrewRoleId = "scout" | "ally" | "connector" | "designer" | "creator";

export interface CrewRole {
  id: CrewRoleId;
  name: string;
  /** What this person does, in the plainest words available. */
  blurb: string;
  /** The existing capability this reads. No new ledger. */
  skillId: SkillId;
  accent: Accent;
}

export const CREW_ROLES: CrewRole[] = [
  {
    id: "scout",
    name: "Scout",
    blurb: "Notices a situation early, while it is still small enough to change.",
    skillId: "decision-making",
    accent: "pulse",
  },
  {
    id: "ally",
    name: "Ally",
    blurb: "Stays with the person it is happening to, which is usually what they needed.",
    skillId: "peer-intervention",
    accent: "coral",
  },
  {
    id: "connector",
    name: "Connector",
    blurb: "Brings in the adult, the staff member or the official channel.",
    skillId: "communication",
    accent: "quest",
  },
  {
    id: "designer",
    name: "Designer",
    blurb: "Changes the place so the situation is less likely next time.",
    skillId: "safety-design",
    accent: "volt",
  },
  {
    id: "creator",
    name: "Creator",
    blurb: "Makes the version of this that other young people will actually watch.",
    skillId: "community-action",
    accent: "gold",
  },
];

/**
 * The role a profile currently reads as.
 *
 * Ties break by the order above rather than by chance, so the answer is stable
 * between renders and between sessions. A brand new profile is a Scout, which
 * is the honest starting point: everybody starts by noticing.
 */
export function crewRole(profile: Pick<UserProfile, "skillPoints">): CrewRole {
  const points = profile.skillPoints ?? {};
  let best = CREW_ROLES[0] as CrewRole;
  let bestPoints = points[best.skillId] ?? 0;
  for (const role of CREW_ROLES) {
    const value = points[role.skillId] ?? 0;
    if (value > bestPoints) {
      best = role;
      bestPoints = value;
    }
  }
  return best;
}

/** Every role with its current standing, for the Crew board. */
export function crewStanding(
  profile: Pick<UserProfile, "skillPoints">,
): { role: CrewRole; points: number }[] {
  const points = profile.skillPoints ?? {};
  return CREW_ROLES.map((role) => ({ role, points: points[role.skillId] ?? 0 }));
}
