import type { CampaignProgress } from "@/types/campaign";
import type { UserProfile } from "@/types/profile";

/**
 * The Echo collection.
 *
 * The testers wanted more character identity. Birk, Atkins, Bowey and Mandryk
 * (CHI 2016) tie that to avatar *identification*, and identification is what
 * carries the motivational effect, not the size of the customisation menu. So
 * this is five variants, not a builder, and each one is earned by an action
 * that actually happened.
 *
 * Rules, and each of them is a decision rather than a limitation.
 *
 * Every unlock is **deterministic and legible**. You can read what unlocks a
 * style before you do it, and doing it always works. Nothing here is random,
 * nothing is bought, nothing expires and nothing is scarce, because those are
 * the mechanisms at the manipulative end of the range and this product is for
 * teenagers.
 *
 * It is cosmetic only. A style changes Echo's ring, never what Echo says, and
 * never anything about XP, missions or progress.
 *
 * It is not a human avatar builder. Representation in a Singapore youth product
 * is a serious design problem, and a badly done inclusive avatar system is
 * worse than none.
 */

export type EchoStyleId = "core" | "shift" | "signal" | "scout" | "architect";

export interface EchoStyle {
  id: EchoStyleId;
  name: string;
  /** What it looks like, in one line. */
  description: string;
  /** What earns it, phrased so it can be read before it is done. */
  unlockHint: string;
  /** Tailwind text colour for the ring. Literal strings: Tailwind scans source. */
  ring: string;
  /** A second ring, drawn dashed and offset, or null for the plain mark. */
  halo: string | null;
}

export const ECHO_STYLES: Record<EchoStyleId, EchoStyle> = {
  core: {
    id: "core",
    name: "Echo Core",
    description: "The original signal ring.",
    unlockHint: "Yours from the start.",
    ring: "text-quest-300",
    halo: null,
  },
  shift: {
    id: "shift",
    name: "Echo Shift",
    description: "A second ring, slightly out of step with the first.",
    unlockHint: "Play Crew Shift with your crew.",
    ring: "text-pulse-300",
    halo: "text-pulse-500/40",
  },
  signal: {
    id: "signal",
    name: "Echo Signal",
    description: "Brighter, and steadier.",
    unlockHint: "Finish REWIND.",
    ring: "text-volt-300",
    halo: null,
  },
  scout: {
    id: "scout",
    name: "Echo Scout",
    description: "Marked for going outside.",
    unlockHint: "Finish a Field Quest.",
    ring: "text-gold-400",
    halo: "text-gold-500/35",
  },
  architect: {
    id: "architect",
    name: "Echo Architect",
    description: "Squared off, like the systems it redesigns.",
    unlockHint: "Finish BREAKSAFE.",
    ring: "text-coral-300",
    halo: "text-coral-500/35",
  },
};

export const ECHO_STYLE_ORDER: EchoStyleId[] = ["core", "shift", "signal", "scout", "architect"];

/**
 * Which styles this profile has earned.
 *
 * Derived from progress rather than stored, so it can never drift out of sync
 * with what was actually done, and so a demo reset cannot leave a style behind.
 */
export function unlockedEchoStyles(profile: UserProfile): Set<EchoStyleId> {
  const unlocked = new Set<EchoStyleId>(["core"]);
  const done = new Set(profile.completedMissionIds);

  if (done.has("mission-rewind")) unlocked.add("signal");
  if (done.has("mission-breaksafe")) unlocked.add("architect");
  if (done.has("mission-field-quest")) unlocked.add("scout");

  const campaigns: CampaignProgress[] = Object.values(profile.campaigns ?? {});
  const playedCrewShift = campaigns.some((campaign) => {
    const result = campaign.chapterResults?.["obm-c4"];
    return result?.mechanic === "crew-shift" && result.playerCount > 1;
  });
  if (playedCrewShift) unlocked.add("shift");

  return unlocked;
}

/** Falls back to Core if a stored selection is not (or no longer) unlocked. */
export function resolveEchoStyle(profile: UserProfile): EchoStyle {
  const selected = profile.echoStyleId;
  if (selected && unlockedEchoStyles(profile).has(selected)) return ECHO_STYLES[selected];
  return ECHO_STYLES.core;
}

/**
 * Which style a mission earns, if any.
 *
 * The completion screen needs this to turn an unlock into a *moment*. An
 * unlock that is merely recorded, and discovered later on a different screen,
 * has happened in storage rather than in the experience.
 *
 * Kept beside the unlock rules it mirrors, so the two cannot drift: if a
 * mission stops granting a style, both sides change in the same file.
 */
export const MISSION_UNLOCKS: Record<string, EchoStyleId> = {
  "mission-rewind": "signal",
  "mission-breaksafe": "architect",
  "mission-field-quest": "scout",
};

/** The style this mission grants, or null. */
export function styleUnlockedByMission(missionId: string): EchoStyle | null {
  const id = MISSION_UNLOCKS[missionId];
  return id ? ECHO_STYLES[id] : null;
}
