"use client";

import { Check, Plus } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT, type Accent } from "@/lib/accent";
import type { HotspotIntent, HotspotSpot } from "@/types/interaction";

/**
 * Tap the part of the scene that matters.
 *
 * ---
 *
 * ## Why a hotspot rather than a fifth list of options
 *
 * "Which of these is a crime prevention vulnerability?" is a trivia question
 * wearing a scene. "Something here makes the easy choice harder" is a search
 * task, and the difference is that the second one requires looking at the
 * situation rather than at four sentences about it.
 *
 * It is also the only primitive here that puts the *environment* in the
 * player's hands, which is the whole of situational crime prevention. BREAKSAFE
 * already proved the mechanic works at this scale; what it did not do was make
 * it reusable, so the interaction lived inside one mission's bespoke terminal
 * mock and could not be used by a Prevention Thread. This is that same
 * mechanic with the artwork passed in.
 *
 * ## Accessibility is the reason this is DOM and not canvas
 *
 * Every spot is a real `<button>` with a real accessible name, in document
 * order, reachable by tab, announced by a screen reader, and hit-testable by
 * the browser rather than by our own arithmetic. A canvas hotspot would have
 * been fewer lines and would have been unusable by anybody not using a
 * pointer, which is the trade the rest of this codebase already refuses (see
 * `dialogue-overlay.tsx`: all dialogue is DOM, because a canvas has no
 * semantics).
 *
 * The scene artwork behind the buttons is `aria-hidden` and the buttons carry
 * the meaning, so nothing depends on seeing the drawing. Position is one
 * channel; the label is the one that always arrives.
 */
export function HotspotScene({
  /** Original SVG, drawn in code. Decorative: the buttons carry the meaning. */
  scene,
  spots,
  intent,
  onInspect,
  /** Ids already tapped. Marked so the player can see where they have been. */
  foundIds = [],
  accent = "quest",
  /** Accessible name for the whole scene. */
  label,
  className,
}: {
  scene: ReactNode;
  spots: readonly HotspotSpot[];
  intent: HotspotIntent;
  onInspect: (spot: HotspotSpot) => void;
  foundIds?: readonly string[];
  accent?: Accent;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-ink-850",
        className,
      )}
    >
      <div aria-hidden className="absolute inset-0">
        {scene}
      </div>

      {spots.map((spot) => {
        const found = foundIds.includes(spot.id);
        return (
          <button
            key={spot.id}
            type="button"
            onClick={() => onInspect(spot)}
            /*
             * The accessible name says what the thing is and what tapping it
             * does, because "Bagging area" alone tells a screen reader user
             * nothing about why it is a control.
             */
            aria-label={
              intent === "change"
                ? `${spot.label}. Change this.`
                : `${spot.label}. Take a closer look.`
            }
            aria-pressed={found}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            className={cn(
              /*
               * 44px, centred on the coordinate. The visible ring is smaller
               * than the target on purpose: a marker large enough to be
               * comfortable to hit would cover the thing it is pointing at.
               */
              "sq-pressable absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-400",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-7 place-items-center rounded-full border-2 backdrop-blur-[1px] transition-colors",
                found
                  ? "border-volt-400 bg-volt-500/85 text-ink-900"
                  : "border-white/70 bg-ink-900/70 text-chalk",
              )}
            >
              {found ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : (
                <Plus className={cn("size-3.5", ACCENT_TEXT[accent])} strokeWidth={3} />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * What a tapped spot says.
 *
 * Separate from the scene so a host can place it wherever its layout has room,
 * which on a 390px screen is usually below the artwork rather than floating
 * over it.
 */
export function HotspotFinding({
  spot,
  className,
}: {
  spot: HotspotSpot;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "animate-rise rounded-2xl border p-4",
        spot.counts
          ? "border-volt-500/30 bg-volt-500/8"
          : "border-white/12 bg-white/4",
        className,
      )}
    >
      <p className="text-sm font-bold text-chalk">{spot.finding}</p>
      <p className="mt-1 text-sm leading-relaxed text-mist">{spot.explanation}</p>
    </div>
  );
}
