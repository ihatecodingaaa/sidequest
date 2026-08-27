"use client";

import type { ReactNode } from "react";

import { useAppStore } from "@/store/app-store";
import { useExperienceOrigin } from "@/lib/experience-origin";
import { MissionComplete } from "./mission-complete";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";

/**
 * The seam between a mission mechanic and whatever is running it.
 *
 * Every player does exactly three context-specific things: it awards XP, it
 * knows where its close button goes, and it renders something at the end.
 * Pulling those three out means REWIND, Norm Mirror and BREAKSAFE can be
 * driven by a Campaign chapter without a single line of their logic being
 * copied, and without their standalone routes changing at all.
 *
 * A player with no host behaves exactly as it did before this existed.
 */
export interface MissionHost {
  /** Where the close control in the mission shell points. */
  exitHref: string;
  /**
   * Records completion and returns what was awarded. Implementations must be
   * idempotent: a replayed mission grants nothing the second time.
   */
  complete: () => AwardResult;
  /** Rendered in place of the default completion screen. */
  renderComplete: (result: AwardResult, summary?: string) => ReactNode;
}

/**
 * The standalone behaviour: award against the mission catalogue, and go back
 * to wherever the player came from.
 *
 * **Origin aware.** Sending every completion to the missions directory is what
 * broke the Streets loop: somebody walked up to a neighbour, played the
 * mission that neighbour opened, and was dropped in a list. The destination
 * now comes from a key in the URL, resolved through a table in code, with the
 * old behaviour as the default. One mechanism, and every player that already
 * used this host inherits it without changing.
 */
export function useStandaloneHost(mission: Mission): MissionHost {
  const completeMission = useAppStore((state) => state.completeMission);
  const origin = useExperienceOrigin(`/missions/${mission.id}`);

  return {
    /*
     * The close control. It leaves without completing, which is a different
     * thing from finishing and must never award anything: this is a link, so
     * it cannot.
     */
    exitHref: origin.closeTo,
    complete: () => completeMission(mission.id),
    renderComplete: (result, summary) => (
      <MissionComplete mission={mission} result={result} summary={summary} origin={origin} />
    ),
  };
}

/**
 * Resolves the host a player should use.
 *
 * The standalone host is always constructed, because hooks cannot be called
 * conditionally. Building it is free: it subscribes to one store selector and
 * returns three closures.
 */
export function useMissionHost(mission: Mission, provided?: MissionHost): MissionHost {
  const standalone = useStandaloneHost(mission);
  return provided ?? standalone;
}
