import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { resolveEchoStyle } from "@/data/echo-styles";
import { getMission } from "@/data/missions";
import { NPCS, STREET_CHECKS, type Npc, type NpcAction } from "@/features/streets/streets-data";
import {
  PREVENTION_THREADS,
  getThread,
  requiredSteps,
  stepKey,
  threadKey,
  type PreventionThread,
  type ThreadStep,
} from "@/data/prevention-threads";
import { crewRole, type CrewRole } from "@/lib/crew-roles";
import { withOrigin } from "@/lib/experience-origin";
import type { SignalMarker } from "@/features/streets/game/world-engine";
import type { AwardResult } from "@/lib/xp";
import type { UserProfile } from "@/types/profile";
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

  /* ------------------------------------------------- Prevention Threads */

  /** Step keys already banked, as `threadId:stepId`. */
  threadSteps: string[];
  /** Which option was taken where, for the world to react to. */
  threadChoices: Record<string, string>;
  /** Progress on one thread. */
  threadState: (threadId: string) => ThreadState;
  /** The step this NPC is currently offering, if any. */
  stepFor: (npc: Npc) => { thread: PreventionThread; step: ThreadStep } | null;
  /** Banks one step. Idempotent, and never scaled by signal mode. */
  completeStep: (
    thread: PreventionThread,
    step: ThreadStep,
    choiceId?: string,
  ) => AwardResult | null;

  /* ------------------------------------------------------------ Signals */

  /**
   * Every live Signal, keyed by whoever raises it.
   *
   * Derived rather than stored, so a resolved situation cannot leave a marker
   * behind and a marker cannot exist without a situation to belong to.
   */
  signals: Record<string, SignalMarker>;

  /** The Crew role this profile currently reads as. A view, not a rank. */
  role: CrewRole;
}

export interface ThreadState {
  started: boolean;
  complete: boolean;
  /** Required steps banked, over required steps total. */
  done: number;
  total: number;
  /** Steps available right now. More than one means a genuine branch. */
  available: ThreadStep[];
}

/**
 * Whether this person's situation is resolved, from a profile alone.
 *
 * Pure, and outside the hook, because two surfaces need the same answer and
 * were giving different ones. Home counted only hero missions, so a player
 * with five live thread steps and three unplayed checks was told nobody wanted
 * a word. The world and the front door now disagree about nothing.
 */
export function npcDone(profile: UserProfile, npc: Npc): boolean {
  const action = npc.action;
  if (action.kind === "mission") return profile.completedMissionIds.includes(action.missionId);
  if (action.kind === "check") return (profile.streetChecksDone ?? []).includes(action.checkId);
  if (action.kind === "thread") {
    const thread = getThread(action.threadId);
    if (!thread) return false;
    const banked = profile.threadSteps ?? [];
    return requiredSteps(thread).every((step) => banked.includes(stepKey(thread.id, step.id)));
  }
  if (action.kind === "campaign") {
    return Object.values(profile.campaigns ?? {}).some(
      (entry) => (entry?.completedChapterIds?.length ?? 0) > 0,
    );
  }
  /*
   * Safe is a service, never a completion, and it has no done state ever.
   * Neither does a noticeboard or the rewards counter: reading something twice
   * is not a thing to tick off.
   */
  return false;
}

/** Anything that can be finished, so a count of what is waiting means something. */
export const COUNTABLE_ACTIONS = new Set(["mission", "campaign", "check", "thread"]);

export function waitingCount(profile: UserProfile): number {
  return waitingPeople(profile).length;
}

/**
 * The actual people with something unresolved, in world order.
 *
 * A count is a number and a name is a reason. "Three people want a word" tells
 * somebody the size of a backlog, which is the language of a task list; "Wei
 * is still at the minimart" tells them there is a person there, which is the
 * language of a place. The count is still available and still used where a
 * number is genuinely the right unit, but the front door now leads with a
 * name, and prefers somebody already met over a stranger, because being owed
 * an answer is a stronger reason to go back than being offered a new one.
 *
 * Machines are excluded. A self checkout does not want a word.
 */
export function waitingPeople(profile: UserProfile): Npc[] {
  return NPCS.filter(
    (npc) =>
      (npc.figure ?? "person") === "person" &&
      COUNTABLE_ACTIONS.has(npc.action.kind) &&
      !npcDone(profile, npc),
  );
}

/**
 * One person to mention on Home, or nobody.
 *
 * Deterministic: the first unresolved neighbour the player has already met,
 * falling back to the first unresolved neighbour at all. No rotation, no
 * randomness and no recency, so the front door says the same thing until the
 * player changes something, and what changes it is always legible.
 */
export function whoIsWaiting(profile: UserProfile): Npc | null {
  const waiting = waitingPeople(profile);
  if (waiting.length === 0) return null;
  const met = new Set(profile.metNpcs ?? []);
  return waiting.find((npc) => met.has(npc.id)) ?? waiting[0];
}

export function useStreetsBridge(): StreetsBridge {
  const router = useRouter();
  const { profile, ready } = useProfile();
  const completeStreetCheck = useAppStore((state) => state.completeStreetCheck);
  const completeThreadStep = useAppStore((state) => state.completeThreadStep);

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

  /*
   * One rule, shared with Home. Before hydration nothing is done, which keeps
   * the first paint identical on the server and the client.
   */
  const isNpcDone = useCallback(
    (npc: Npc) => (ready ? npcDone(profile, npc) : false),
    [ready, profile],
  );

  const open = useCallback(
    (action: NpcAction) => {
      switch (action.kind) {
        case "mission": {
          /*
           * `/play/:id` is the existing full-screen player. Nothing is rebuilt.
           *
           * The origin travels with it so finishing comes back here rather
           * than to the missions directory, which is what broke the world
           * loop. It is a key, not a path: nothing from the URL is ever
           * navigated to.
           */
          const mission = getMission(action.missionId);
          router.push(mission ? withOrigin(`/play/${mission.id}`, "streets") : "/missions");
          break;
        }
        case "campaign":
          router.push(`/campaigns/${action.slug}`);
          break;
        case "safe":
          router.push("/safe");
          break;
        case "check":
        case "rewards":
        case "info":
        case "thread":
        case "hub":
          /*
           * Handled inside the world by the dialogue overlay rather than by a
           * route change. Claiming a reward at the counter runs the store's
           * existing `claimReward`, unchanged: the counter is a place to stand,
           * not a second economy.
           */
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

  /* --------------------------------------------------- Prevention Threads */

  const threadSteps = useMemo(
    () => (ready ? (profile.threadSteps ?? []) : []),
    [ready, profile.threadSteps],
  );
  const threadChoices = useMemo(
    () => (ready ? (profile.threadChoices ?? {}) : {}),
    [ready, profile.threadChoices],
  );

  /**
   * Where a thread has got to.
   *
   * A step is available once every **required** step before it is banked. That
   * is what makes the optional trusted-adult conversation a real branch rather
   * than a detour: it and the next required step become available together, so
   * a player can go straight to the hard conversation or go and find out what
   * actually happens first.
   */
  const threadState = useCallback(
    (threadId: string): ThreadState => {
      const thread = getThread(threadId);
      if (!thread) {
        return { started: false, complete: false, done: 0, total: 0, available: [] };
      }
      const required = requiredSteps(thread);
      const isDone = (step: ThreadStep) => threadSteps.includes(stepKey(threadId, step.id));
      const done = required.filter(isDone).length;
      const complete = done === required.length;

      const available = complete
        ? []
        : thread.steps.filter((step) => {
            if (isDone(step)) return false;
            const index = thread.steps.indexOf(step);
            return thread.steps
              .slice(0, index)
              .filter((earlier) => !earlier.optional)
              .every(isDone);
          });

      return {
        started: thread.steps.some(isDone),
        complete,
        done,
        total: required.length,
        available,
      };
    },
    [threadSteps],
  );

  const stepFor = useCallback(
    (npc: Npc) => {
      if (npc.action.kind !== "thread") return null;
      const thread = getThread(npc.action.threadId);
      if (!thread) return null;
      const step = threadState(thread.id).available.find((entry) => entry.npcId === npc.id);
      return step ? { thread, step } : null;
    },
    [threadState],
  );

  const completeStep = useCallback(
    (thread: PreventionThread, step: ThreadStep, choiceId?: string) =>
      completeThreadStep({
        threadId: thread.id,
        stepId: step.id,
        xp: step.xp,
        skillId: step.skillId,
        choiceId,
      }),
    [completeThreadStep],
  );

  /* ---------------------------------------------------------- Signals */

  /**
   * Which situations are live, and what each of them needs.
   *
   * Two sources, and neither of them is a person. Standing encounters raise a
   * Signal until their linked experience is finished. Threads raise one at
   * whichever step is currently available, which is what makes the marker move
   * through the story rather than sit on somebody's head forever.
   */
  const signals = useMemo(() => {
    const live: Record<string, SignalMarker> = {};

    for (const npc of NPCS) {
      if (!npc.signal) continue;
      if (npc.action.kind === "thread") continue;
      if (isNpcDone(npc)) continue;
      live[npc.id] = { mode: npc.signal };
    }

    for (const thread of PREVENTION_THREADS) {
      for (const step of threadState(thread.id).available) {
        live[step.npcId] = { mode: step.mode };
      }
    }

    return live;
  }, [isNpcDone, threadState]);

  return {
    ready,
    equippedEcho: ready ? resolveEchoStyle(profile).id : null,
    completedMissionIds,
    checksDone,
    xp: ready ? profile.xp : 0,
    isNpcDone,
    open,
    completeCheck,
    threadSteps,
    threadChoices,
    threadState,
    stepFor,
    completeStep,
    signals,
    role: crewRole(profile),
  };
}

/** Ledger key for a finished thread, re-exported so screens can read it. */
export { threadKey };
