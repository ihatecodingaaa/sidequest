"use client";

import { useCallback, useRef, useState } from "react";
import { DoorOpen, MessageSquare } from "lucide-react";

import { cn } from "@/lib/cn";
import type { Door, Npc } from "@/features/streets/streets-data";

/**
 * Movement and the interact control.
 *
 * A thumb pad rather than a four-button cross: analogue input from one contact
 * point means no corner cases where two buttons are half pressed, and it lets
 * somebody drift diagonally without thinking about it. Movement here is for
 * exploring, so the control should be forgiving rather than precise.
 *
 * ---
 *
 * ## Two layouts, and why controls got quieter
 *
 * Held upright the phone is a one-handed device and the controls belong under
 * the world, where they never cover it. Held sideways both thumbs are already
 * at the outer edges and the middle of the screen is where nothing should ever
 * be placed, so the pad and the button move out to the corners and the world
 * fills the screen behind them.
 *
 * Real device feedback said the controls dominated. Two changes came from it,
 * and neither shrinks a touch target:
 *
 * - The pad's **visual** is lighter and slightly smaller. The contact area is
 *   the whole circle either way, and a pad you can see through is a pad you
 *   can see past.
 * - The interact button is **small and quiet when there is nothing to press**,
 *   and grows into the accent colour when something is in range. A large dead
 *   control that says "nobody nearby" spends the most valuable corner of the
 *   screen saying no.
 *
 * Safe area insets are respected on all four edges, which matters in landscape
 * where a notch and a home indicator are on the sides a thumb reaches for.
 */
export function TouchPad({
  near,
  door,
  layout,
  compact = false,
  onMove,
  onInteract,
}: {
  near: Npc | null;
  door: Door | null;
  layout: "stacked" | "edges";
  /**
   * A landscape screen with very little height.
   *
   * The pad gets quieter, never smaller in contact area. A thumb that has
   * found the pad once does not need it shouting, and the space a ring and a
   * label were using is district.
   */
  compact?: boolean;
  onMove: (x: number, y: number) => void;
  onInteract: () => void;
}) {
  const padRef = useRef<HTMLDivElement | null>(null);
  const activeId = useRef<number | null>(null);
  /** Only for the thumb marker. Movement itself never waits on React. */
  const [knob, setKnob] = useState<{ x: number; y: number } | null>(null);

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
        setKnob({ x: 0, y: 0 });
        return;
      }
      const scale = Math.min(1, dist / (radius * 0.8));
      onMove((dx / dist) * scale, (dy / dist) * scale);
      const reach = Math.min(dist, radius * 0.62);
      setKnob({ x: (dx / dist) * reach, y: (dy / dist) * reach });
    },
    [onMove],
  );

  const release = useCallback(() => {
    activeId.current = null;
    setKnob(null);
    onMove(0, 0);
  }, [onMove]);

  const edges = layout === "edges";
  /* A person beats a doorway: the engine already hands over whichever is
     nearer, and a person in range means the player walked up to them. */
  const target = near ? "npc" : door ? "door" : "none";
  const idle = target === "none";

  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4",
        edges
          ? "pointer-events-none px-[max(1rem,env(safe-area-inset-left))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))]"
          : "px-5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div
        ref={padRef}
        role="application"
        aria-label="Movement pad. Arrow keys and WASD also work."
        className={cn(
          "relative touch-none rounded-full border transition-colors",
          // The contact area is the same in both. Only the paint changes.
          compact
            ? "size-24 border-white/14 bg-black/22 backdrop-blur"
            : "size-28 border-white/12 bg-black/25 backdrop-blur",
          edges && "pointer-events-auto",
          knob && "border-white/25 bg-black/35",
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
        {/* The thumb marker follows the contact, so the pad reads as analogue. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15"
          style={knob ? { transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` } : undefined}
        />
        {/* The label teaches once. After that it is decoration on a thumb. */}
        {compact ? null : (
          <span
            aria-hidden
            className="absolute inset-x-0 top-2 text-center text-[0.55rem] font-bold tracking-[0.1em] text-white/35"
          >
            MOVE
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onInteract}
        disabled={idle}
        className={cn(
          "sq-pressable grid shrink-0 place-items-center rounded-full text-center font-extrabold transition-all duration-200",
          edges && "pointer-events-auto",
          idle
            ? cn(
                "cursor-default border border-white/10 text-white/30",
                compact ? "size-12 bg-black/28 backdrop-blur" : "size-14 bg-black/25 backdrop-blur",
              )
            : compact
              ? "size-[4.25rem] text-sm"
              : "size-20 text-sm",
          target === "npc" &&
            "bg-volt-500 text-ink-900 shadow-[0_10px_30px_-8px_rgba(182,242,74,0.8)]",
          target === "door" &&
            "bg-gold-500 text-ink-900 shadow-[0_10px_30px_-8px_rgba(245,185,63,0.75)]",
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
          <>
            <MessageSquare aria-hidden className="size-5" />
            <span className="sr-only">Nothing in reach. Walk up to somebody or a door.</span>
          </>
        )}
      </button>
    </div>
  );
}
