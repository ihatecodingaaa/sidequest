"use client";

import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { EchoMascot } from "@/components/echo/echo-mascot";
import {
  ECHO_STYLES,
  ECHO_STYLE_ORDER,
  resolveEchoStyle,
  unlockedEchoStyles,
} from "@/data/echo-styles";

/**
 * The Echo collection.
 *
 * The last pass shipped this as a vertical list of five rows, each a 40px mark,
 * a name and a line of text, below a passport on a screen that already scrolls
 * a long way. Everything worked. Nobody could tell it existed, which is a
 * different failure from "it is broken" and needed a different fix.
 *
 * Ownership is felt through display rather than possession. An enumerated list
 * reads as configuration; a grid of tiles at a size where the characters are
 * actually visible reads as a collection. The gaps do as much work as the
 * items: a locked tile that is visibly a slot invites completion in a way a
 * greyed row does not, which is why locked entries keep their full tile, show
 * the silhouette dimmed, and state their condition in text.
 *
 * What is deliberately unchanged from the last pass: five variants, unlocks
 * derived from progress rather than stored, nothing random, nothing bought,
 * nothing scarce, and cosmetic only.
 */
export function EchoCollection({ className }: { className?: string }) {
  const { profile, ready } = useProfile();
  const setEchoStyle = useAppStore((state) => state.setEchoStyle);

  const unlocked = ready ? unlockedEchoStyles(profile) : new Set(["core"]);
  const current = ready ? resolveEchoStyle(profile) : ECHO_STYLES.core;

  return (
    <section className={className} aria-labelledby="echo-collection">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="echo-collection" className="text-lg font-bold tracking-tight text-chalk">
            Echo
          </h2>
          <p className="mt-0.5 text-sm text-muted">Your companion. Looks only, no stats.</p>
        </div>
        <p className="shrink-0 font-display text-sm font-extrabold text-quest-300 tabular-nums">
          {unlocked.size}/{ECHO_STYLE_ORDER.length}
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-2.5">
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
                /*
                 * The visible label drops the "Echo " prefix because five tiles
                 * that all start with the same word is noise. The accessible
                 * name keeps it, along with the state, so a screen reader gets
                 * "Echo Signal, locked. Finish REWIND." rather than "Signal".
                 */
                aria-label={`${style.name}. ${
                  isCurrent ? "Equipped" : isUnlocked ? "Tap to wear" : `Locked. ${style.unlockHint}`
                }`}
                onClick={() => setEchoStyle(id)}
                className={cn(
                  "sq-pressable flex h-full w-full flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-colors",
                  isCurrent
                    ? "border-quest-400/60 bg-quest-500/12"
                    : isUnlocked
                      ? "border-white/10 bg-white/4 hover:border-white/20"
                      : "cursor-not-allowed border-dashed border-white/12 bg-white/2",
                )}
              >
                <span className="relative">
                  <EchoMascot
                    style={id}
                    expression={isCurrent ? "pleased" : "neutral"}
                    size={56}
                    className={cn(isUnlocked ? style.ring : "text-white/12")}
                  />
                  {isCurrent ? (
                    <span className="absolute -right-1 -bottom-0.5 grid size-5 place-items-center rounded-full bg-quest-500 text-white">
                      <Check aria-hidden className="size-3" strokeWidth={3.5} />
                    </span>
                  ) : !isUnlocked ? (
                    <span className="absolute -right-1 -bottom-0.5 grid size-5 place-items-center rounded-full bg-ink-700 text-faint">
                      <Lock aria-hidden className="size-2.5" />
                    </span>
                  ) : null}
                </span>

                <span
                  className={cn(
                    "text-[0.7rem] leading-tight font-bold",
                    isUnlocked ? "text-chalk" : "text-faint",
                  )}
                >
                  {style.name.replace("Echo ", "")}
                </span>

                {/*
                  Locked tiles say what earns them, before it is earned. That is
                  the whole reason this is a collection and not a loot table.
                */}
                <span className="text-[0.65rem] leading-snug text-muted">
                  {isUnlocked ? (isCurrent ? "Equipped" : "Tap to wear") : style.unlockHint}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
