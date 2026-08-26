"use client";

import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { Sidekick } from "@/features/campaigns/sidekick";
import {
  ECHO_STYLES,
  ECHO_STYLE_ORDER,
  resolveEchoStyle,
  unlockedEchoStyles,
} from "@/data/echo-styles";

/**
 * The Echo collection.
 *
 * Five variants, each earned by an action that actually happened. Locked ones
 * stay visible and say exactly what unlocks them, which is the whole reason
 * this is a collection and not a loot table: you can read the deal before you
 * take it, and taking it always works.
 *
 * Nothing here is bought, random, timed or scarce, and choosing a style changes
 * how Echo looks and nothing else. Locked entries are rendered as disabled
 * buttons rather than hidden, because a collection you cannot see is not a
 * collection, and the store refuses a locked selection regardless.
 */
export function EchoCollection({ className }: { className?: string }) {
  const { profile, ready } = useProfile();
  const setEchoStyle = useAppStore((state) => state.setEchoStyle);

  const unlocked = ready ? unlockedEchoStyles(profile) : new Set(["core"]);
  const current = ready ? resolveEchoStyle(profile) : ECHO_STYLES.core;

  return (
    <section className={className} aria-labelledby="echo-collection">
      <h2 id="echo-collection" className="text-lg font-bold tracking-tight text-chalk">
        Echo
      </h2>
      <p className="mt-0.5 mb-3 text-sm text-muted">
        {unlocked.size} of {ECHO_STYLE_ORDER.length} unlocked. Looks only.
      </p>

      <ul className="space-y-2">
        {ECHO_STYLE_ORDER.map((id) => {
          const style = ECHO_STYLES[id];
          const isUnlocked = unlocked.has(id);
          const isCurrent = current.id === id;

          return (
            <li key={id}>
              <button
                type="button"
                disabled={!isUnlocked}
                aria-pressed={isCurrent}
                onClick={() => setEchoStyle(id)}
                className={cn(
                  "sq-card sq-pressable flex min-h-16 w-full items-center gap-3.5 p-3 text-left",
                  isCurrent && "border-quest-500/40 bg-quest-500/8",
                  !isUnlocked && "cursor-not-allowed opacity-55",
                )}
              >
                <Sidekick
                  mood="neutral"
                  size={40}
                  style={isUnlocked ? style : undefined}
                  className={cn(!isUnlocked && "opacity-40 grayscale")}
                />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-chalk">{style.name}</span>
                  <span className="block text-xs leading-snug text-muted">
                    {isUnlocked ? style.description : style.unlockHint}
                  </span>
                </span>

                {isCurrent ? (
                  <Check aria-hidden className="size-4 shrink-0 text-quest-300" strokeWidth={3} />
                ) : !isUnlocked ? (
                  <Lock aria-hidden className="size-4 shrink-0 text-faint" />
                ) : null}

                {/* The state in words, for anyone not reading the icons. */}
                <span className="sr-only">
                  {isCurrent ? "Selected" : isUnlocked ? "Tap to select" : "Locked"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
