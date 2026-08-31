"use client";

import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/cn";
import type { OrderCard } from "@/types/interaction";

/**
 * Put it in order.
 *
 * ---
 *
 * ## Why there is no drag here
 *
 * The obvious build is drag and drop. It is also the build that excludes the
 * most people: a drag is unavailable to a keyboard user, unreliable for anyone
 * with a motor impairment, fights the page scroll on a phone, and needs a
 * library. The accessibility guidance in this codebase is that every
 * interaction has a non-drag path, and the cheapest way to guarantee that is
 * not to have a drag path at all.
 *
 * So ordering is **tap to place**. Cards start unplaced; each tap puts the
 * next one in the sequence. That is one gesture, it is the same gesture as
 * every other interaction in the product, it works with a screen reader, and
 * it needs no instructions beyond the running "1, 2, 3" the cards acquire as
 * they are placed.
 *
 * ## What ordering is for, and what it is not for
 *
 * It is for sequences where the order genuinely changes the outcome: distance
 * before help, check the person before you deal with the situation. It is not
 * a memory test and it is not a way to make a list feel like a game. If the
 * three steps would work in any order, this is the wrong mechanic and the
 * content should be a choice instead.
 *
 * There is no failure state. An order that is not the recommended one still
 * gets a consequence explaining what that sequence would actually produce,
 * exactly as a choice does, because these are rehearsals.
 */
export function OrderCards({
  cards,
  placed,
  onPlace,
  onReset,
  /** Locked once the player has committed, so the debrief cannot be edited. */
  locked = false,
  className,
}: {
  cards: readonly OrderCard[];
  /** Ids in the order they were placed. */
  placed: readonly string[];
  onPlace: (id: string) => void;
  onReset: () => void;
  locked?: boolean;
  className?: string;
}) {
  const remaining = cards.filter((card) => !placed.includes(card.id));

  return (
    <div className={cn("space-y-3", className)}>
      {/* Placed, in order. This is the answer taking shape. */}
      {placed.length > 0 ? (
        <ol className="space-y-2">
          {placed.map((id, index) => {
            const card = cards.find((entry) => entry.id === id);
            if (!card) return null;
            return (
              <li
                key={id}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-volt-500/30 bg-volt-500/8 px-4 py-3"
              >
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-volt-500 text-sm font-bold text-ink-900 tabular-nums"
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 text-[0.95rem] leading-snug font-medium text-chalk">
                  <span className="sr-only">Step {index + 1}. </span>
                  {card.label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      {/* Still to place. */}
      {!locked && remaining.length > 0 ? (
        <div role="group" aria-label="Actions still to place" className="space-y-2">
          {remaining.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onPlace(card.id)}
              aria-label={`${card.label}. Place as step ${placed.length + 1}.`}
              className="sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-[0.95rem] leading-snug font-medium text-chalk hover:bg-white/7"
            >
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-full border border-dashed border-white/25 text-xs font-bold text-faint"
              >
                {placed.length + 1}
              </span>
              <span className="min-w-0 flex-1">{card.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/*
        Undo, not a score.

        Somebody who places the wrong card first should be able to change their
        mind without the product treating it as an attempt. Start again is one
        control rather than per-card removal because with three cards it is
        fewer taps and far less to explain.
      */}
      {!locked && placed.length > 0 ? (
        <button
          type="button"
          onClick={onReset}
          className="sq-pressable inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-chalk"
        >
          <RotateCcw aria-hidden className="size-3.5" />
          Start again
        </button>
      ) : null}
    </div>
  );
}
