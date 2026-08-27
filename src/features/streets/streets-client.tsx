"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { List, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/use-profile";
import { useAppStore } from "@/store/app-store";
import { useStreetsBridge } from "@/features/streets/game/quest-bridge";
import { useStreetsLayout } from "@/features/streets/game/use-orientation";
import { DialogueOverlay } from "@/features/streets/components/dialogue-overlay";
import { Minimap } from "@/features/streets/components/minimap";
import { CrewHub } from "@/features/streets/components/crew-hub";
import { RewardsCounter } from "@/features/streets/components/rewards-counter";
import { TouchPad } from "@/features/streets/components/touch-pad";
import { QuestList } from "@/features/streets/components/quest-list";
import { AvatarSetup } from "@/features/streets/components/avatar-setup";
import {
  DEFAULT_AVATAR,
  DISTRICT_ID,
  MAPS,
  NPCS,
  SPAWN,
  type AvatarLook,
  type Door,
  type Npc,
} from "@/features/streets/streets-data";
import type { EngineOptions, WorldEngine } from "@/features/streets/game/world-engine";

/**
 * SIDEQUEST Streets.
 *
 * The canvas draws the district. Everything a person needs to read, choose or
 * operate is DOM on top of it. That split is not a stylistic preference: a
 * `<canvas>` exposes no semantics at all, so anything drawn inside it is
 * invisible to a screen reader, unreachable by keyboard focus and unaffected by
 * text sizing. The world can be a canvas. The product cannot be.
 *
 * Which is also why the Quest List is a peer of the map rather than a hidden
 * fallback: every experience reachable by walking is reachable without walking.
 * A prevention product must never gate its learning behind dexterity.
 */
export function StreetsClient() {
  const reduced = usePrefersReducedMotion();
  const { ref: rootRef, overlay: landscape, height: viewportHeight } = useStreetsLayout();
  const bridge = useStreetsBridge();
  /*
   * Destructured because the effects below depend on these two specifically,
   * not on the bridge object, which is rebuilt every render. Listing `bridge`
   * would restart the engine on every keystroke.
   */
  const { ready: bridgeReady, equippedEcho, isNpcDone, signals } = bridge;
  const setStreetsAvatar = useAppStore((state) => state.setStreetsAvatar);
  const storedLook = useAppStore((state) => state.profile.streetsAvatar);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<WorldEngine | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  /** Everything about the engine that changes without the engine changing. */
  const liveRef = useRef<
    Pick<EngineOptions, "look" | "echo" | "npcs" | "signals" | "reducedMotion">
  >({
    look: DEFAULT_AVATAR,
    echo: null,
    npcs: [],
    signals: {},
    reducedMotion: false,
  });

  const [engineReady, setEngineReady] = useState(false);
  const [near, setNear] = useState<Npc | null>(null);
  const [doorway, setDoorway] = useState<Door | null>(null);
  const [placeId, setPlaceId] = useState<string>(DISTRICT_ID);
  const [tile, setTile] = useState(SPAWN);
  const [talkingTo, setTalkingTo] = useState<Npc | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [hint, setHint] = useState(true);

  const look: AvatarLook = storedLook ?? DEFAULT_AVATAR;
  const needsAvatar = bridgeReady && !storedLook;
  const place = MAPS[placeId] ?? MAPS[DISTRICT_ID];
  const busy = Boolean(talkingTo) || listOpen || counterOpen || hubOpen;

  /* --------------------------------------------------------- Engine boot */

  /*
   * Everything the engine reads every frame is pushed in, never rebuilt around.
   *
   * This effect is declared first on purpose: effects run in order on mount, so
   * the ref is populated before the boot effect below constructs the engine.
   *
   * The reason it matters is a real bug this replaced. Finishing a Street Check
   * changes the profile, which changes `isNpcDone`, which used to be a
   * dependency of the boot effect. The engine was therefore torn down and
   * rebuilt at the spawn point at the exact moment somebody finished a
   * conversation, and once buildings opened that meant being thrown out onto
   * the street mid-sentence.
   */
  useEffect(() => {
    const live = {
      look,
      echo: equippedEcho,
      npcs: NPCS.map((npc) => ({ npc, done: isNpcDone(npc) })),
      signals,
      reducedMotion: reduced,
    };
    liveRef.current = live;
    engineRef.current?.update(live);
  }, [look, equippedEcho, isNpcDone, signals, reduced]);

  useEffect(() => {
    if (!bridgeReady || needsAvatar) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let engine: WorldEngine | null = null;

    void (async () => {
      // The renderer is loaded only when the world is actually entered, so
      // Home, Safe and Updates never pay for it.
      const { WorldEngine: Engine } = await import("@/features/streets/game/world-engine");
      if (disposed) return;

      engine = new Engine(canvas, {
        ...liveRef.current,
        onNear: setNear,
        onDoor: setDoorway,
        onTile: setTile,
        onMap: (map) => setPlaceId(map.id),
      });
      engineRef.current = engine;
      engine.start();
      setEngineReady(true);
    })();

    return () => {
      disposed = true;
      engine?.stop();
      engineRef.current = null;
    };
  }, [bridgeReady, needsAvatar]);

  /*
   * Resize with the viewport, and reframe when the phone turns.
   *
   * The camera takes its shape from the container, so a rotation is a resize
   * as far as the engine is concerned. `landscape` is in the dependency list
   * because the layout around the canvas changes first and the canvas has to
   * measure itself again afterwards.
   */
  useEffect(() => {
    const onResize = () => engineRef.current?.resize();
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [landscape, engineReady]);

  /* ------------------------------------------------------------- Input */

  const applyKeys = useCallback(() => {
    const keys = keysRef.current;
    const x = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
    const y = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);
    engineRef.current?.setInput(x, y);
    if (x !== 0 || y !== 0) setHint(false);
  }, []);

  const openNpc = useCallback((npc: Npc) => {
    // The rewards counter is a screen of its own. Everybody else talks first.
    setTalkingTo(npc);
    setHint(false);
  }, []);

  /**
   * One button, whichever is nearer.
   *
   * The engine suppresses a person who is further away than a doorway, so this
   * only has to prefer the person it was given.
   */
  const interact = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setInput(0, 0);
    keysRef.current.clear();

    const npc = engine.target;
    if (npc) {
      openNpc(npc);
      return;
    }
    const door = engine.doorway;
    if (door) {
      engine.enter(door);
      setHint(false);
    }
  }, [openNpc]);

  useEffect(() => {
    const map: Record<string, string> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
      W: "up",
      S: "down",
      A: "left",
      D: "right",
    };

    const onDown = (event: KeyboardEvent) => {
      // Never steal a key from a control somebody is actually using.
      const target = event.target as HTMLElement | null;
      if (target && /^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (busy) return;

      const dir = map[event.key];
      if (dir) {
        event.preventDefault();
        keysRef.current.add(dir);
        applyKeys();
        return;
      }
      if (event.key === "Enter" || event.key === " " || event.key === "e" || event.key === "E") {
        event.preventDefault();
        interact();
      }
    };

    const onUp = (event: KeyboardEvent) => {
      const dir = map[event.key];
      if (!dir) return;
      keysRef.current.delete(dir);
      applyKeys();
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [applyKeys, interact, busy]);

  /* Movement stops whenever something is on top of the world. */
  useEffect(() => {
    if (busy) {
      keysRef.current.clear();
      engineRef.current?.setInput(0, 0);
    }
  }, [busy]);

  /** The Quest List's shortcut. Interiors open their door on the way. */
  const walkTo = useCallback((npc: Npc) => {
    const engine = engineRef.current;
    if (!engine) return;
    const mapId = npc.mapId ?? DISTRICT_ID;
    if (mapId === DISTRICT_ID) {
      engine.moveTo(npc.x, npc.y);
    } else {
      const door = MAPS[DISTRICT_ID]?.doors.find((entry) => entry.to === mapId);
      if (door) engine.enter(door);
    }
    // Close enough to talk. Arriving out of range and being told nobody is
    // nearby is the worst possible answer to "take me to this person".
    engine.approach(npc);
    setListOpen(false);
    setHint(false);
  }, []);

  /* ------------------------------------------------------------ Render */

  if (needsAvatar) {
    return (
      <AvatarSetup
        onDone={(chosen) => setStreetsAvatar(chosen)}
        onSkip={() => setStreetsAvatar(DEFAULT_AVATAR)}
      />
    );
  }

  /*
   * One tree, both orientations.
   *
   * The three children below are always the same three elements in the same
   * order, and only their classes change. That is not tidiness, it is the
   * whole fix: the previous version rendered a different JSX tree per
   * orientation, React reconciles children by position, and rotating the phone
   * therefore unmounted the canvas and mounted a fresh one. The engine kept
   * its reference to the old, detached node and went on drawing into nothing.
   *
   * A rotation is not a navigation event and must never cost the player their
   * position, the camera, or the frame.
   *
   * Stacking is stated explicitly rather than left to document order, because
   * in overlay mode the world comes after the top bar in the DOM.
   */
  const topBar = (
    <div
      className={cn(
        "z-20 flex items-center gap-2 px-3",
        landscape
          ? "pointer-events-none absolute inset-x-0 top-0 pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))]"
          : "relative pt-[max(0.6rem,env(safe-area-inset-top))] pb-2",
      )}
    >
      <Link
        href="/"
        aria-label="Leave Streets"
        className={cn(
          "sq-pressable grid size-11 place-items-center rounded-full bg-black/45 text-chalk backdrop-blur",
          landscape && "pointer-events-auto",
        )}
      >
        <X aria-hidden className="size-5" />
      </Link>

      <p className="shrink-0 rounded-full bg-black/45 px-3 py-1.5 text-sm font-bold whitespace-nowrap text-volt-300 backdrop-blur tabular-nums">
        {bridge.xp} XP
      </p>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setListOpen(true)}
        className={cn(
          "sq-pressable flex min-h-11 items-center gap-2 rounded-full bg-black/45 px-3.5 text-sm font-bold text-chalk backdrop-blur",
          landscape && "pointer-events-auto",
        )}
      >
        <List aria-hidden className="size-4" />
        Quests
      </button>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={cn("fixed inset-0 flex flex-col bg-[#1a2a1e]", landscape && "block")}
      /*
       * The height a person can actually see.
       *
       * `fixed inset-0` sizes to the layout viewport, which on iOS Safari is
       * taller than the visible area, so anything anchored to the bottom ends
       * up under the browser chrome. `100dvh` is the fallback for browsers
       * with no visualViewport.
       */
      style={{ height: viewportHeight ? `${viewportHeight}px` : "100dvh" }}
      data-testid="streets-root"
      data-orientation={landscape ? "landscape" : "portrait"}
    >
      {topBar}

      <div
        data-testid="streets-world"
        className={cn(landscape ? "absolute inset-0 z-0" : "relative z-0 min-h-0 flex-1")}
      >
        <canvas
          ref={canvasRef}
          data-testid="streets-canvas"
          aria-label="District 01. Use the quest list for a version without walking."
          role="img"
          className="absolute inset-0 size-full"
        />

        {!engineReady ? (
          <p className="absolute inset-0 grid place-items-center text-sm text-chalk/70">
            Loading the block...
          </p>
        ) : null}

        {/*
          Where you are, in words, opposite the minimap.
          It sits over the world rather than in the top bar because on a 390px
          phone the bar already carries three controls, and "Corner kopiti..."
          is not a place name.
        */}
        {engineReady ? (
          <p
            className={cn(
              "pointer-events-none absolute left-2 max-w-[52%] truncate rounded-full bg-black/45 px-3 py-1.5 text-sm font-semibold text-chalk backdrop-blur",
              landscape ? "top-14" : "top-2",
            )}
          >
            {place?.name ?? "District 01"}
          </p>
        ) : null}

        {/*
          The minimap is for the district. An eighteen by fourteen room does
          not need one, and drawing it anyway would be the debug-panel look
          this deliberately avoids.
        */}
        {engineReady && placeId === DISTRICT_ID ? (
          <Minimap
            tile={tile}
            npcs={NPCS.filter((npc) => !npc.mapId).map((npc) => ({ npc, done: isNpcDone(npc) }))}
            signals={signals}
            className={cn("absolute right-2", landscape ? "top-14 w-24" : "top-2 w-28")}
          />
        ) : null}

        {hint && engineReady ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-chalk backdrop-blur">
            Move with the pad. Doors open.
          </p>
        ) : null}
      </div>

      <div className={cn("z-20", landscape ? "absolute inset-x-0 bottom-0" : "relative")}>
        {!busy ? (
          <TouchPad
            near={near}
            door={doorway}
            layout={landscape ? "edges" : "stacked"}
            onMove={(x, y) => {
              engineRef.current?.setInput(x, y);
              if (x !== 0 || y !== 0) setHint(false);
            }}
            onInteract={interact}
          />
        ) : null}
      </div>

      {talkingTo ? (
        <DialogueOverlay
          npc={talkingTo}
          done={bridge.isNpcDone(talkingTo)}
          bridge={bridge}
          onClose={() => setTalkingTo(null)}
          onOpenRewards={() => {
            setTalkingTo(null);
            setCounterOpen(true);
          }}
          onOpenHub={() => {
            setTalkingTo(null);
            setHubOpen(true);
          }}
          landscape={landscape}
        />
      ) : null}

      {counterOpen ? (
        <RewardsCounter onClose={() => setCounterOpen(false)} landscape={landscape} />
      ) : null}

      {hubOpen ? (
        <CrewHub bridge={bridge} onClose={() => setHubOpen(false)} landscape={landscape} />
      ) : null}

      {listOpen ? (
        <QuestList
          bridge={bridge}
          landscape={landscape}
          onClose={() => setListOpen(false)}
          onWalkTo={walkTo}
          onTalkTo={(npc) => {
            setListOpen(false);
            if (npc.action.kind === "rewards") setCounterOpen(true);
            else if (npc.action.kind === "hub") setHubOpen(true);
            else openNpc(npc);
          }}
        />
      ) : null}
    </div>
  );
}

export { cn };
