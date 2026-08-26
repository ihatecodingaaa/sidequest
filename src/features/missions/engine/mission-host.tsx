"use client";

import type { ReactNode } from "react";

import { useAppStore } from "@/store/app-store";
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
 * The standalone behaviour: award against the mission catalogue, exit to the
 * mission detail page, and show the usual completion screen.
 */
export function useStandaloneHost(mission: Mission): MissionHost {
  const completeMission = useAppStore((state) => state.completeMission);

  return {
    exitHref: `/missions/${mission.id}`,
    complete: () => completeMission(mission.id),
    renderComplete: (result, summary) => (
      <MissionComplete mission={mission} result={result} summary={summary} />
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
