"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { usePrefersReducedMotion } from "@/hooks/use-profile";
import { EchoMascot } from "@/components/echo/echo-mascot";
import { resolveEchoStyle, type EchoStyle } from "@/data/echo-styles";

/**
 * A new Echo, announced as an event.
 *
 * The last pass recorded unlocks correctly and surfaced them nowhere: you
 * finished BREAKSAFE and Echo Architect quietly became selectable on a
 * different screen. An unlock discovered later is not an unlock, it is a
 * database write, so this is the moment it was missing.
 *
 * It is emphatic once and then still. The mascot arrives with a single pop, the
 * ring behind it does not loop, and there is no confetti: the reward for
 * thinking clearly about a friend getting into trouble should be warm, not a
 * fanfare. Equipping happens right here, because sending somebody to another
 * screen to wear the thing they just earned is how the moment gets lost.
 */
export function EchoUnlock({ style, className }: { style: EchoStyle; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const { profile, ready } = useProfile();
  const setEchoStyle = useAppStore((state) => state.setEchoStyle);

  const equipped = ready && resolveEchoStyle(profile).id === style.id;

  return (
    <section
      aria-labelledby="echo-unlock"
      className={cn(
        "relative overflow-hidden rounded-3xl border border-quest-500/30 bg-quest-500/8 px-5 py-6 text-center",
        className,
      )}
    >
      {/* A soft field behind the character. Static: it sets a stage, it does not perform. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 mx-auto size-48 rounded-full bg-quest-500/20 blur-3xl"
      />

      <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-quest-300">
        New Echo unlocked
      </p>

      <EchoMascot
        expression="proud"
        style={style.id}
        size={104}
        className={cn("relative mx-auto mt-4", style.ring, !reduced && "animate-pop")}
      />

      <h2
        id="echo-unlock"
        className="relative mt-3 font-display text-2xl font-extrabold tracking-tight text-chalk"
      >
        {style.name}
      </h2>
      <p className="relative mt-1 text-sm text-mist">{style.description}</p>

      <button
        type="button"
        onClick={() => setEchoStyle(style.id)}
        disabled={equipped}
        className={cn(
          "sq-pressable relative mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold transition-colors",
          equipped
            ? "bg-white/8 text-mist"
            : "bg-quest-500 text-white hover:bg-quest-400",
        )}
      >
        {equipped ? (
          <>
            <Check aria-hidden className="size-4" strokeWidth={3} />
            Wearing it
          </>
        ) : (
          "Wear it"
        )}
      </button>
    </section>
  );
}
