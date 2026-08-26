import type { ProtectiveFactor, ProtectiveFactorId } from "@/types/protective";

/**
 * The protective factors a SIDEQUEST scenario can attribute an outcome to.
 *
 * These exist so a debrief can say what made the difference without repeating
 * the same paragraph in four components, and so the vocabulary stays small
 * enough to mean something. Adding a factor should feel expensive.
 *
 * Two rules hold this honest.
 *
 * First, `label` is what a player reads and it describes the *story*, not the
 * player: "A friend raised it privately", never "You showed good judgement".
 * The previous pass removed assessment from the Safety Passport and a debrief
 * that grades the reader would put it straight back.
 *
 * Second, `mechanism` is internal. It names the situational-prevention or
 * social-psychology idea the factor is drawn from and it is written for the
 * team and for `docs/CAMPAIGN_BEHAVIOUR.md`, not for the interface. Nothing
 * renders it. A fictional branching scenario cannot demonstrate a mechanism,
 * it can only illustrate one, and putting the jargon on screen would blur that
 * line.
 */
export const PROTECTIVE_FACTORS: Record<ProtectiveFactorId, ProtectiveFactor> = {
  "private-challenge": {
    id: "private-challenge",
    label: "Someone raised it privately",
    description:
      "The question got asked away from the group, so answering it honestly did not cost anybody face.",
    mechanism:
      "Reduces audience effects on the person being challenged. Public correction triggers commitment to the stated position; a private one does not.",
  },
  "face-saving-exit": {
    id: "face-saving-exit",
    label: "There was a way out that cost nothing",
    description:
      "Someone handed over an excuse that let the plan drop without anyone having to admit they were wrong.",
    mechanism:
      "Provides a low-cost off-ramp. Compliance is often sustained by the absence of a graceful exit rather than by belief in the plan.",
  },
  "norm-corrected": {
    id: "norm-corrected",
    label: "Somebody said out loud that they were not up for it",
    description:
      "One stated objection is usually enough to show the agreement was never as solid as it looked.",
    mechanism:
      "Breaks pluralistic ignorance. A single dissenter collapses the assumption of unanimity that keeps a group moving.",
  },
  "delay-inserted": {
    id: "delay-inserted",
    label: "The decision got slowed down",
    description:
      "A few minutes between the idea and the action was enough for it to stop feeling obvious.",
    mechanism:
      "Interrupts the hot-state decision window. Delay is one of the few interventions that works without changing anyone's beliefs.",
  },
  "environment-changed": {
    id: "environment-changed",
    label: "The situation was changed, not the person",
    description:
      "The honest option was made the easy one, so nobody had to be talked into it.",
    mechanism:
      "Situational crime prevention. Alters the opportunity structure rather than attempting to alter disposition.",
  },
  "adult-brought-in": {
    id: "adult-brought-in",
    label: "Someone who could actually help was told",
    description:
      "The problem got handed to a person with the standing to do something about it.",
    mechanism:
      "Escalation to a capable guardian. Peer groups can notice a problem but often lack the authority to resolve it.",
  },
  "shared-responsibility": {
    id: "shared-responsibility",
    label: "It stopped being one person's job",
    description:
      "More than one person owned the decision, so it did not depend on the bravest one speaking first.",
    mechanism:
      "Counters diffusion of responsibility. Explicit allocation removes the bystander assumption that somebody else will act.",
  },
  "stayed-close": {
    id: "stayed-close",
    label: "Nobody left them on their own",
    description:
      "The situation was not fixed, but the person was not isolated with it either.",
    mechanism:
      "Maintains social connection under risk. Isolation is a precondition for escalation in most youth offending pathways.",
  },
};

/** Resolves ids to factors, dropping unknown ids and duplicates. */
export function resolveProtectiveFactors(
  ids: readonly ProtectiveFactorId[] | undefined,
): ProtectiveFactor[] {
  if (!ids || ids.length === 0) return [];
  const seen = new Set<ProtectiveFactorId>();
  const out: ProtectiveFactor[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const factor = PROTECTIVE_FACTORS[id];
    if (!factor) continue;
    seen.add(id);
    out.push(factor);
  }
  return out.slice(0, MAX_FACTORS_SHOWN);
}

/**
 * Three is the cap. A debrief listing five things that mattered is a debrief
 * that has not decided what mattered.
 */
export const MAX_FACTORS_SHOWN = 3;
