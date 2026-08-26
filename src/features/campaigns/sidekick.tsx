import { cn } from "@/lib/cn";

/**
 * ECHO, the Campaign guide.
 *
 * Deliberately not a mascot and deliberately not a police character. Echo is a
 * signal shape: a ring with a pulse through it, the same mark language as the
 * SIDEQUEST shield. It reacts to what happened and then gets out of the way.
 *
 * Kept as pure SVG so there is nothing to load at a roadshow with bad wifi,
 * and so the character survives without commissioned artwork. Four expressions
 * is enough to carry continuity; anything more is scope creep.
 */

export type SidekickMood = "neutral" | "thinking" | "pleased" | "concerned";

const MOOD_STROKE: Record<SidekickMood, string> = {
  neutral: "text-quest-300",
  thinking: "text-pulse-300",
  pleased: "text-volt-300",
  concerned: "text-coral-300",
};

/** The inner mark changes shape by mood. No faces, no eyes, no cartoon. */
const MOOD_PATH: Record<SidekickMood, string> = {
  // A steady line.
  neutral: "M9 16h14",
  // A rising step, mid-thought.
  thinking: "M9 19l4-4 3 3 5-6",
  // A check.
  pleased: "M10 16.5l3.5 3.5L22 12",
  // A pause bar.
  concerned: "M13 11v10M19 11v10",
};

export function Sidekick({
  mood = "neutral",
  className,
  size = 40,
}: {
  mood?: SidekickMood;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0", MOOD_STROKE[mood], className)}
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <circle cx="16" cy="16" r="13" fill="currentColor" opacity="0.08" />
      <path
        d={MOOD_PATH[mood]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A short line from Echo. Used to open a chapter and to react once after a
 * decision, never to narrate over the top of the story.
 */
export function SidekickLine({
  mood = "neutral",
  children,
  className,
}: {
  mood?: SidekickMood;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Sidekick mood={mood} size={36} />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-3.5 py-2.5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-faint">Echo</p>
        <p className="mt-1 text-sm leading-relaxed text-mist">{children}</p>
      </div>
    </div>
  );
}
