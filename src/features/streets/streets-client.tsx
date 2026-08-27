"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { List, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/use-profile";
import { useAppStore } from "@/store/app-store";
import { useStreetsBridge } from "@/features/streets/game/quest-bridge";
import { DialogueOverlay } from "@/features/streets/components/dialogue-overlay";
import { TouchPad } from "@/features/streets/components/touch-pad";
import { QuestList } from "@/features/streets/components/quest-list";
import { AvatarSetup } from "@/features/streets/components/avatar-setup";
import {
  DEFAULT_AVATAR,
  LANDMARKS,
  NPCS,
  type AvatarLook,
  type Npc,
} from "@/features/streets/streets-data";
import type { WorldEngine } from "@/features/streets/game/world-engine";

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
  const bridge = useStreetsBridge();
  /*
   * Destructured because the effects below depend on these two specifically,
   * not on the bridge object, which is rebuilt every render. Listing `bridge`
   * would restart the engine on every keystroke.
   */
  const { ready: bridgeReady, equippedEcho, isNpcDone } = bridge;
  const setStreetsAvatar = useAppStore((state) => state.setStreetsAvatar);
  const storedLook = useAppStore((state) => state.profile.streetsAvatar);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<WorldEngine | null>(null);
  const keysRef = useRef<Set<string>>(new Set());

  const [engineReady, setEngineReady] = useState(false);
  const [near, setNear] = useState<Npc | null>(null);
  const [talkingTo, setTalkingTo] = useState<Npc | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [hint, setHint] = useState(true);

  const look: AvatarLook = storedLook ?? DEFAULT_AVATAR;
  const needsAvatar = bridgeReady && !storedLook;

  /* --------------------------------------------------------- Engine boot */

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
        look,
        echo: equippedEcho,
        npcs: NPCS.map((npc) => ({ npc, done: isNpcDone(npc) })),
        reducedMotion: reduced,
        onNear: setNear,
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
    // Rebuilding on look or Echo change is correct: both change what is drawn.
  }, [bridgeReady, needsAvatar, look, equippedEcho, reduced, isNpcDone]);

  /* Keep NPC done-state live without rebuilding the engine. */
  useEffect(() => {
    engineRef.current?.update({
      npcs: NPCS.map((npc) => ({ npc, done: isNpcDone(npc) })),
      echo: equippedEcho,
    });
  }, [isNpcDone, equippedEcho]);

  /* Resize with the viewport. */
  useEffect(() => {
    const onResize = () => engineRef.current?.resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  /* ------------------------------------------------------------- Input */

  const applyKeys = useCallback(() => {
    const keys = keysRef.current;
    const x = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
    const y = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);
    engineRef.current?.setInput(x, y);
    if (x !== 0 || y !== 0) setHint(false);
  }, []);

  const interact = useCallback(() => {
    const npc = engineRef.current?.target ?? null;
    if (!npc) return;
    engineRef.current?.setInput(0, 0);
    keysRef.current.clear();
    setTalkingTo(npc);
    setHint(false);
  }, []);

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
      if (talkingTo || listOpen) return;

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
  }, [applyKeys, interact, talkingTo, listOpen]);

  /* Movement stops whenever something is on top of the world. */
  useEffect(() => {
    if (talkingTo || listOpen) {
      keysRef.current.clear();
      engineRef.current?.setInput(0, 0);
    }
  }, [talkingTo, listOpen]);

  /* ------------------------------------------------------------ Render */

  if (needsAvatar) {
    return (
      <AvatarSetup
        onDone={(chosen) => setStreetsAvatar(chosen)}
        onSkip={() => setStreetsAvatar(DEFAULT_AVATAR)}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#1a2a1e]" data-testid="streets-root">
      {/* Top bar: exit, XP, and the list alternative, all real controls. */}
      <div className="relative z-20 flex items-center gap-2 px-3 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2">
        <Link
          href="/"
          aria-label="Leave Streets"
          className="sq-pressable grid size-11 place-items-center rounded-full bg-black/45 text-chalk backdrop-blur"
        >
          <X aria-hidden className="size-5" />
        </Link>

        <p className="rounded-full bg-black/45 px-3 py-1.5 text-sm font-bold text-volt-300 tabular-nums backdrop-blur">
          {bridge.xp} XP
        </p>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setListOpen(true)}
          className="sq-pressable flex min-h-11 items-center gap-2 rounded-full bg-black/45 px-3.5 text-sm font-bold text-chalk backdrop-blur"
        >
          <List aria-hidden className="size-4" />
          Quests
        </button>
      </div>

      {/* The district. */}
      <div className="relative min-h-0 flex-1">
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

        {hint && engineReady ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-chalk backdrop-blur">
            Move with the pad. Someone is waiting nearby.
          </p>
        ) : null}
      </div>

      {/* Controls sit below the world, never over the dialogue. */}
      {!talkingTo && !listOpen ? (
        <TouchPad
          near={near}
          onMove={(x, y) => {
            engineRef.current?.setInput(x, y);
            if (x !== 0 || y !== 0) setHint(false);
          }}
          onInteract={interact}
        />
      ) : null}

      {talkingTo ? (
        <DialogueOverlay
          npc={talkingTo}
          done={bridge.isNpcDone(talkingTo)}
          bridge={bridge}
          onClose={() => setTalkingTo(null)}
        />
      ) : null}

      {listOpen ? (
        <QuestList
          bridge={bridge}
          onClose={() => setListOpen(false)}
          onWalkTo={(npc) => {
            const landmark = LANDMARKS.find((entry) => entry.id === npc.landmarkId);
            engineRef.current?.moveTo(npc.x, npc.y + 2);
            setListOpen(false);
            setHint(false);
            void landmark;
          }}
          onTalkTo={(npc) => {
            setListOpen(false);
            setTalkingTo(npc);
          }}
        />
      ) : null}
    </div>
  );
}

export { cn };
