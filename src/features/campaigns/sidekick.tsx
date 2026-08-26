"use client";

import { cn } from "@/lib/cn";
import { resolveEchoStyle, type EchoStyle } from "@/data/echo-styles";
import { EchoMascot, type EchoExpression } from "@/components/echo/echo-mascot";
import { useProfile } from "@/hooks/use-profile";

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


/** Moods map onto the mascot's expression set. */
const MOOD_EXPRESSION: Record<SidekickMood, EchoExpression> = {
  neutral: "neutral",
  thinking: "thinking",
  pleased: "pleased",
  concerned: "concerned",
};

/**
 * Echo, at any size.
 *
 * This used to draw a ring with a stroke through it. It now renders the mascot,
 * keeping the same `mood` API so every existing caller was upgraded without
 * being touched. The style comes from the collection when one is equipped.
 */
export function Sidekick({
  mood = "neutral",
  className,
  size = 40,
  style,
}: {
  mood?: SidekickMood;
  className?: string;
  size?: number;
  style?: EchoStyle;
}) {
  return (
    <EchoMascot
      expression={MOOD_EXPRESSION[mood]}
      style={style?.id ?? "core"}
      size={size}
      className={cn(style ? style.ring : MOOD_STROKE[mood], className)}
    />
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
  /*
   * Echo wears the collected style wherever Echo speaks, which is the point of
   * collecting one. Until the profile has hydrated it falls back to Core, so
   * the server render and the first client paint agree.
   */
  const { profile, ready } = useProfile();
  const style = ready ? resolveEchoStyle(profile) : undefined;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Sidekick mood={mood} size={36} style={style} />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-3.5 py-2.5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-faint">Echo</p>
        <p className="mt-1 text-sm leading-relaxed text-mist">{children}</p>
      </div>
    </div>
  );
}
