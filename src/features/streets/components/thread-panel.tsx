"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_BORDER, ACCENT_TEXT } from "@/lib/accent";
import { SIGNAL_MODES } from "@/data/signals";
import { getMission } from "@/data/missions";
import type { PreventionThread, ThreadStep } from "@/data/prevention-threads";
import type { StreetsBridge } from "@/features/streets/game/quest-bridge";
import type { AwardResult } from "@/lib/xp";

/**
 * One step of a Prevention Thread, played in the world's own dialogue sheet.
 *
 * The debrief contract, which the rest of the product is being moved onto:
 *
 * > **Play first. One takeaway. Detail on request.**
 *
 * Visible by default is the consequence, one line of takeaway, the XP and the
 * way out. The source and the mechanism sit behind a disclosure, because a
 * thirty second street encounter that ends in four paragraphs is where a game
 * stops being a game.
 *
 * Nothing here scores anybody. Every option gets an honest outcome, none costs
 * XP, and the option marked safest is named as what worked rather than as the
 * right answer, because these are rehearsals and punishing a fictional choice
 * teaches people to stop making them out loud.
 */
export function ThreadPanel({
  thread,
  step,
  bridge,
  onClose,
}: {
  thread: PreventionThread;
  step: ThreadStep;
  bridge: StreetsBridge;
  onClose: () => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [award, setAward] = useState<AwardResult | null>(null);
  const [why, setWhy] = useState(false);

  const mode = SIGNAL_MODES[step.mode];
  const choice = chosen ? step.choices?.find((entry) => entry.id === chosen) : undefined;
  const banked = award !== null;

  /* Completing the last required step finishes the story. */
  const state = bridge.threadState(thread.id);
  const finished = banked && state.complete;

  const bank = (choiceId?: string) => {
    setAward(bridge.completeStep(thread, step, choiceId) ?? { awarded: false } as AwardResult);
  };

  const take = (choiceId: string) => {
    setChosen(choiceId);
    bank(choiceId);
  };

  const mission = step.kind === "hero-mission" && step.missionId ? getMission(step.missionId) : null;

  return (
    <div className="mt-4">
      {/*
        The mode, in words.
        Colour carries this in the world; here it is a label, which is the
        channel that survives a colour vision deficiency and the one a screen
        reader can actually reach.
      */}
      <p
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.1em] uppercase",
          ACCENT_BG_SOFT[mode.accent],
          ACCENT_BORDER[mode.accent],
          ACCENT_TEXT[mode.accent],
        )}
      >
        {mode.label}
        <span className="sr-only">. {mode.means}</span>
      </p>

      {!banked ? (
        <>
          {step.choices ? (
            <div className="mt-3 space-y-2.5">
              {step.choices.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => take(entry.id)}
                  className="sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-[0.95rem] leading-snug font-medium text-chalk hover:bg-white/7"
                >
                  <span className="flex-1">{entry.label}</span>
                  <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
                </button>
              ))}
            </div>
          ) : mission ? (
            <div className="mt-3 space-y-2.5">
              <p className="text-sm leading-relaxed text-muted">
                This step is {mission.title}. It opens the real thing and picks up here after.
              </p>
              <button
                type="button"
                onClick={() => {
                  bank();
                  bridge.open({ kind: "mission", missionId: mission.id });
                }}
                className="sq-pressable flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-volt-500 px-4 text-sm font-bold text-ink-900"
              >
                Play {mission.title}
                <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => bank()}
              className="sq-pressable mt-3 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-volt-500 px-4 text-sm font-bold text-ink-900"
            >
              Got it
              <ArrowRight aria-hidden className="size-4" />
            </button>
          )}
        </>
      ) : (
        <div className="animate-rise">
          {choice ? (
            <p className="mt-3 text-[1.05rem] leading-relaxed text-chalk">{choice.outcome}</p>
          ) : null}

          {step.followUp ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">{step.followUp}</p>
          ) : null}

          {finished ? (
            <p className="mt-4 rounded-2xl border border-volt-500/25 bg-volt-500/8 px-4 py-3 text-sm leading-relaxed font-semibold text-volt-300">
              {thread.completion.takeaway}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {award?.awarded ? (
              <p className="inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-3.5 py-1.5 text-sm font-bold text-volt-300">
                <Check aria-hidden className="size-4" strokeWidth={3} />+{award.xpGained} XP
              </p>
            ) : (
              <p className="text-xs text-muted">Already counted. Replays add nothing.</p>
            )}
            <p className="text-xs text-faint">
              {finished
                ? thread.completion.worldChange
                : `Step ${state.done} of ${state.total}`}
            </p>
          </div>

          {/* Detail on request. The source is one tap away, not four lines down. */}
          <button
            type="button"
            onClick={() => setWhy((open) => !open)}
            aria-expanded={why}
            className="sq-pressable mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mist hover:text-chalk"
          >
            Why this
            <ChevronDown aria-hidden className={cn("size-4 transition-transform", why && "rotate-180")} />
          </button>
          {why ? (
            <p className="mt-1 text-xs leading-relaxed text-faint">
              <span className="font-bold text-mist">{thread.source.label}.</span>{" "}
              {thread.source.body}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="sq-pressable mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
          >
            Back to the block
          </button>
        </div>
      )}
    </div>
  );
}
