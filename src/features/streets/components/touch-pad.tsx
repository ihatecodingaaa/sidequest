"use client";

import { useCallback, useRef } from "react";

import { cn } from "@/lib/cn";
import type { Npc } from "@/features/streets/streets-data";

/**
 * Mobile movement and the interact control.
 *
 * A thumb pad rather than a four-button cross: analogue input from one contact
 * point means no corner cases where two buttons are half pressed, and it lets
 * somebody drift diagonally without thinking about it. Movement here is for
 * exploring, so the control should be forgiving rather than precise.
 *
 * Every target is at least 44 CSS pixels. The pad sits below the world and the
 * interact button beside it, so neither ever covers dialogue: the overlay
 * unmounts this entirely while somebody is reading.
 */
export function TouchPad({
  near,
  onMove,
  onInteract,
}: {
  near: Npc | null;
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

  return (
    <div className="relative z-20 flex items-end justify-between gap-4 px-5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        ref={padRef}
        role="application"
        aria-label="Movement pad. Arrow keys and WASD also work."
        className="relative size-32 touch-none rounded-full border border-white/15 bg-black/35 backdrop-blur"
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
        <span aria-hidden className="absolute inset-x-0 top-2 text-center text-[0.6rem] font-bold text-white/45">
          MOVE
        </span>
      </div>

      <button
        type="button"
        onClick={onInteract}
        disabled={!near}
        className={cn(
          "sq-pressable grid size-20 shrink-0 place-items-center rounded-full text-center text-sm font-extrabold transition-colors",
          near
            ? "bg-volt-500 text-ink-900 shadow-[0_10px_30px_-8px_rgba(182,242,74,0.8)]"
            : "cursor-not-allowed bg-black/35 text-white/35 backdrop-blur",
        )}
      >
        {near ? (
          <span className="leading-tight">
            Talk
            <span className="block text-[0.65rem] font-bold">{near.name}</span>
          </span>
        ) : (
          <span className="text-[0.7rem] leading-tight font-semibold">Nobody
            <span className="block">nearby</span>
          </span>
        )}
      </button>
    </div>
  );
}
