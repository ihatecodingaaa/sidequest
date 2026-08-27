import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { resolveEchoStyle } from "@/data/echo-styles";
import { getMission } from "@/data/missions";
import { NPCS, STREET_CHECKS, type Npc, type NpcAction } from "@/features/streets/streets-data";
import type { AwardResult } from "@/lib/xp";
import type { EchoStyleId } from "@/data/echo-styles";

/**
 * The one bridge between the world and SIDEQUEST.
 *
 * The rule this exists to enforce is non-negotiable: **the game does not own
 * product state.** XP, mission completion, Echo unlocks, campaign progress and
 * the Safety Passport all stay in the existing store, which stays canonical.
 * The world reads that state, asks the product to do things, and reflects what
 * came back. If Streets were deleted tomorrow, every piece of progression a
 * player earned through it would still be valid, because none of it was ever
 * stored here.
 *
 * That is also why this is one narrow typed surface rather than the world
 * reaching into `localStorage` from a dozen places. Every crossing of the
 * boundary goes through a function on this object.
 */

export interface StreetsBridge {
  /** True once the persisted profile has hydrated. */
  ready: boolean;
  /** Which Echo the player has equipped, or null before hydration. */
  equippedEcho: EchoStyleId | null;
  /** Completed hero missions, read from the profile. */
  completedMissionIds: string[];
  /** Street Checks already banked. */
  checksDone: string[];
  /** Total XP, for the HUD. */
  xp: number;
  /** Has this NPC's linked experience been finished? */
  isNpcDone: (npc: Npc) => boolean;
  /** Leaves the world for the experience an NPC opens. */
  open: (action: NpcAction) => void;
  /** Banks a Street Check. Idempotent: a replay grants nothing. */
  completeCheck: (checkId: string) => AwardResult | null;
}

export function useStreetsBridge(): StreetsBridge {
  const router = useRouter();
  const { profile, ready } = useProfile();
  const completeStreetCheck = useAppStore((state) => state.completeStreetCheck);

  const completedMissionIds = useMemo(
    () => (ready ? profile.completedMissionIds : []),
    [ready, profile.completedMissionIds],
  );

  /*
   * Street Checks keep their own ledger on the profile, run through the same
   * `awardMission` engine as everything else. The once-only rule therefore
   * comes for free rather than being reimplemented here.
   */
  const checksDone = useMemo(
    () => (ready ? (profile.streetChecksDone ?? []) : []),
    [ready, profile.streetChecksDone],
  );

  const isNpcDone = useCallback(
    (npc: Npc) => {
      const action = npc.action;
      if (action.kind === "mission") return completedMissionIds.includes(action.missionId);
      if (action.kind === "check") return checksDone.includes(action.checkId);
      if (action.kind === "campaign") {
        const campaigns = profile.campaigns ?? {};
        return Object.values(campaigns).some(
          (entry) => (entry?.completedChapterIds?.length ?? 0) > 0,
        );
      }
      // Safe is a service, never a completion. It has no done state, ever.
      return false;
    },
    [completedMissionIds, checksDone, profile.campaigns],
  );

  const open = useCallback(
    (action: NpcAction) => {
      switch (action.kind) {
        case "mission": {
          // `/play/:id` is the existing full-screen player. Nothing is rebuilt.
          const mission = getMission(action.missionId);
          router.push(mission ? `/play/${mission.id}` : "/missions");
          break;
        }
        case "campaign":
          router.push(`/campaigns/${action.slug}`);
          break;
        case "safe":
          router.push("/safe");
          break;
        case "check":
          // Handled in the world by the dialogue overlay, not a route change.
          break;
      }
    },
    [router],
  );

  const completeCheck = useCallback(
    (checkId: string) => {
      const check = STREET_CHECKS[checkId];
      if (!check) return null;
      return completeStreetCheck({ id: check.id, xp: check.xp });
    },
    [completeStreetCheck],
  );

  return {
    ready,
    equippedEcho: ready ? resolveEchoStyle(profile).id : null,
    completedMissionIds,
    checksDone,
    xp: ready ? profile.xp : 0,
    isNpcDone,
    open,
    completeCheck,
  };
}

/** Every destination in the district, for the Quest List. */
export function districtDestinations() {
  return NPCS.map((npc) => ({
    npc,
    check: npc.action.kind === "check" ? STREET_CHECKS[npc.action.checkId] : undefined,
  }));
}
