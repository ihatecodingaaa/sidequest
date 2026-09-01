"use client";

import { Clock } from "lucide-react";

import { cn } from "@/lib/cn";
import { WorldSheet } from "@/features/streets/components/world-sheet";
import type { MemoryEntry, MemoryType } from "@/features/streets/district-memory";

/**
 * What has happened to you here.
 *
 * ---
 *
 * ## Why this is a sheet and not a screen
 *
 * The design law is "you have history here", and history is something you
 * notice about a place while standing in it, not something you go to a
 * dashboard to review. So it opens from the place name, over the world, in the
 * same sheet a conversation uses, and closing it puts you back where you were
 * standing.
 *
 * It is deliberately small. Four to six lines is a memory; twenty is a log,
 * and a log is what this system exists instead of.
 *
 * ## Why there is no number on it
 *
 * There is a count on the affordance that opens it, because that is what makes
 * somebody curious enough to tap. There is no percentage, no bar and no
 * "3 of 7 complete" inside, because the moment history becomes a completion
 * target it stops being history. Several of these entries describe things a
 * player may reasonably never do, and that is fine: an empty line in your own
 * past is not a task.
 */

const VERB: Record<MemoryType, string> = {
  met: "Met",
  helped: "Helped",
  discovered: "Noticed",
  changed: "Changed",
  created: "Made",
  visited: "Been",
};

/**
 * Colour is the last channel, never the only one.
 *
 * Each type already carries a word. The tint is there so a list of six reads
 * as varied rather than as a wall, and it is legible with the colour removed.
 */
const TINT: Record<MemoryType, string> = {
  met: "text-quest-300",
  helped: "text-volt-300",
  discovered: "text-pulse-300",
  changed: "text-gold-400",
  created: "text-quest-300",
  visited: "text-mist",
};

export function HistorySheet({
  placeName,
  entries,
  landscape,
  onClose,
}: {
  placeName: string;
  entries: MemoryEntry[];
  landscape: boolean;
  onClose: () => void;
}) {
  return (
    <WorldSheet
      label={`What has happened at ${placeName}`}
      landscape={landscape}
      onClose={onClose}
      closeLabel="Close"
    >
      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-faint uppercase">
        <Clock aria-hidden className="size-3.5" />
        {placeName}
      </p>

      <h2 className="mt-1 font-display text-xl leading-tight font-extrabold tracking-tight text-chalk">
        {entries.length > 0 ? "You have history here" : "Nothing has happened here yet"}
      </h2>

      {entries.length > 0 ? (
        <ul className="mt-4 space-y-2.5">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-3">
              {/*
                A hairline rather than a card. Six entries in six boxes is the
                card soup the rest of this product spends its rules avoiding,
                and a list of things that happened wants to read as a list.
              */}
              <span
                aria-hidden
                className={cn("mt-2 h-px w-4 shrink-0 bg-current opacity-50", TINT[entry.type])}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-[0.6rem] font-bold tracking-[0.12em] uppercase",
                    TINT[entry.type],
                  )}
                >
                  {VERB[entry.type]}
                </span>
                <span className="mt-0.5 block text-[0.95rem] leading-snug text-chalk">
                  {entry.title}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Talk to somebody, look at something, or do what one of them needs. This is where it ends
          up.
        </p>
      )}

      <button
        type="button"
        onClick={onClose}
        className="sq-pressable mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
      >
        Back to the block
      </button>
    </WorldSheet>
  );
}
