import { Check, Lock, Play } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * The state of one node on the Campaign map.
 *
 * The testers said they could not tell where they were in ONE BAD MINUTE. The
 * old map drew every chapter as an identical card and separated the states
 * almost entirely by the colour of a 24px dot, which fails twice: it asks the
 * eye to compare four small hues, and it leaves nothing at all for anyone who
 * cannot make that comparison.
 *
 * Each state is now carried by four things at once, so any one of them is
 * enough to read it:
 *
 *   shape    filled, ringed, outlined, dashed
 *   icon     tick, play, number, padlock
 *   label    a word on the row, in text
 *   position current is lifted out of the list entirely, above the map
 */
export type NodeState = "done" | "current" | "available" | "locked";

export const NODE_LABEL: Record<NodeState, string> = {
  done: "Done",
  current: "Up next",
  available: "Open",
  locked: "Scan at the station",
};

export function ChapterNode({
  state,
  index,
  className,
}: {
  state: NodeState;
  /** 1-based, shown when there is no icon more useful than the number. */
  index: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink-900",
        state === "done" && "bg-volt-500 text-ink-900",
        state === "current" && "bg-quest-500 text-white ring-2 ring-quest-300/50",
        state === "available" && "bg-ink-700 text-mist ring-1 ring-white/20",
        state === "locked" && "border-dashed border-white/20 bg-transparent text-faint",
        className,
      )}
    >
      {state === "done" ? (
        <Check aria-hidden className="size-3.5" strokeWidth={3} />
      ) : state === "current" ? (
        <Play aria-hidden className="size-3" fill="currentColor" />
      ) : state === "locked" ? (
        <Lock aria-hidden className="size-3" />
      ) : (
        <span className="text-[0.6rem] font-bold">{index}</span>
      )}
    </span>
  );
}
