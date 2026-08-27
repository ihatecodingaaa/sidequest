"use client";

import { useCallback, useRef } from "react";
import { DoorOpen } from "lucide-react";

import { cn } from "@/lib/cn";
import type { Door, Npc } from "@/features/streets/streets-data";

/**
 * Mobile movement and the interact control.
 *
 * A thumb pad rather than a four-button cross: analogue input from one contact
 * point means no corner cases where two buttons are half pressed, and it lets
 * somebody drift diagonally without thinking about it. Movement here is for
 * exploring, so the control should be forgiving rather than precise.
 *
 * Every target is at least 44 CSS pixels.
 *
 * Two layouts, because one cannot serve both orientations. Held upright the
 * phone is a one-handed device and the controls belong under the world, where
 * they never cover it. Held sideways both thumbs are already at the outer
 * edges and the middle of the screen is where nothing should ever be placed,
 * so the pad and the button move out to the corners and the world fills the
 * screen behind them.
 */
export function TouchPad({
  near,
  door,
  layout,
  onMove,
  onInteract,
}: {
  near: Npc | null;
  door: Door | null;
  layout: "stacked" | "edges";
  onMove: (x: number, y: number) => void;
  onInteract: () => void;
}) {
  const padRef = useRef<HTMLDivElement | null>(null);
  const activeId = useRef<number | null>(null);

  const apply = useCallback(
    (clientX: number, clientY: number) => {
      const pad = padRef.current;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const radius = rect.width / 2;

      // A small dead zone stops a resting thumb from drifting the player.
      const dist = Math.hypot(dx, dy);
      if (dist < radius * 0.18) {
        onMove(0, 0);
        return;
      }
      const scale = Math.min(1, dist / (radius * 0.8));
      onMove((dx / dist) * scale, (dy / dist) * scale);
    },
    [onMove],
  );

  const release = useCallback(() => {
    activeId.current = null;
    onMove(0, 0);
  }, [onMove]);

  const edges = layout === "edges";
  /* A person beats a doorway, because the engine already hands over whichever
     is nearer and a person in range means the player walked up to them. */
  const target = near ? "npc" : door ? "door" : "none";

  return (
    <div
      className={cn(
        "z-20 flex items-end justify-between",
        edges
          ? "pointer-events-none absolute inset-x-0 bottom-0 gap-4 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          : "relative gap-4 px-5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div
        ref={padRef}
        role="application"
        aria-label="Movement pad. Arrow keys and WASD also work."
        className={cn(
          "relative touch-none rounded-full border border-white/15 bg-black/35 backdrop-blur",
          edges ? "pointer-events-auto size-28" : "size-32",
        )}
        onPointerDown={(event) => {
          if (activeId.current !== null) return;
          activeId.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          apply(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (activeId.current !== event.pointerId) return;
          apply(event.clientX, event.clientY);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/18"
        />
        <span
          aria-hidden
          className="absolute inset-x-0 top-2 text-center text-[0.6rem] font-bold text-white/45"
        >
          MOVE
        </span>
      </div>

      <button
        type="button"
        onClick={onInteract}
        disabled={target === "none"}
        className={cn(
          "sq-pressable grid size-20 shrink-0 place-items-center rounded-full text-center text-sm font-extrabold transition-colors",
          edges && "pointer-events-auto",
          target === "npc"
            ? "bg-volt-500 text-ink-900 shadow-[0_10px_30px_-8px_rgba(182,242,74,0.8)]"
            : target === "door"
              ? "bg-gold-500 text-ink-900 shadow-[0_10px_30px_-8px_rgba(245,185,63,0.75)]"
              : "cursor-not-allowed bg-black/35 text-white/35 backdrop-blur",
        )}
      >
        {target === "npc" ? (
          <span className="leading-tight">
            Talk
            <span className="block text-[0.65rem] font-bold">{near?.name}</span>
          </span>
        ) : target === "door" ? (
          <span className="leading-tight">
            <DoorOpen aria-hidden className="mx-auto mb-0.5 size-4" />
            {door?.label}
            <span className="sr-only"> {door?.name}</span>
          </span>
        ) : (
          <span className="text-[0.7rem] leading-tight font-semibold">
            Nobody
            <span className="block">nearby</span>
          </span>
        )}
      </button>
    </div>
  );
}
