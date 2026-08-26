/**
 * Protective factors: what made the difference in a scenario outcome.
 *
 * Deliberately a closed union rather than a free string. A scenario author can
 * only attribute an outcome to a factor that already exists in the shared
 * vocabulary, which keeps the debriefs comparable across missions and stops
 * the list drifting into per-mission prose.
 */
export type ProtectiveFactorId =
  | "private-challenge"
  | "face-saving-exit"
  | "norm-corrected"
  | "delay-inserted"
  | "environment-changed"
  | "adult-brought-in"
  | "shared-responsibility"
  | "stayed-close";

export interface ProtectiveFactor {
  id: ProtectiveFactorId;
  /** What the player reads. Describes the story, never the player. */
  label: string;
  /** One sentence of plain language under the label. */
  description: string;
  /**
   * Internal only. The behavioural idea the factor is drawn from, written for
   * the team and the behaviour docs. Nothing renders this.
   */
  mechanism: string;
}
