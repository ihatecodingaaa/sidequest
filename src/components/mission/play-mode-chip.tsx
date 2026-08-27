import { User, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import type { PlayMode } from "@/types/mission";

/**
 * How many people this wants, before it opens.
 *
 * This exists because of a real tester, who played Crew Shift and said it
 * needed a few people and might not be very viable. They were right about the
 * information problem and wrong about the fix: the mechanic is the one part of
 * SIDEQUEST that makes peer influence visible, so the answer is to tell people
 * what they are opening, not to remove it.
 *
 * Compact on purpose. A card with six labels on it has none.
 */
export function PlayModeChip({
  mode,
  crewSize,
  className,
}: {
  mode: PlayMode;
  crewSize?: string;
  className?: string;
}) {
  const crew = mode === "crew";
  const label = crew ? "Crew" : mode === "either" ? "Solo or crew" : "Solo";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        crew ? "text-pulse-300" : "text-faint",
        className,
      )}
    >
      {mode === "solo" ? (
        <User aria-hidden className="size-3.5" />
      ) : (
        <Users aria-hidden className="size-3.5" />
      )}
      {label}
      {crewSize && mode !== "solo" ? (
        <span className={crew ? "text-pulse-300/80" : "text-faint"}>{crewSize}</span>
      ) : null}
      {crew ? <span className="sr-only">. Needs {crewSize ?? "two or more"} people</span> : null}
    </span>
  );
}
