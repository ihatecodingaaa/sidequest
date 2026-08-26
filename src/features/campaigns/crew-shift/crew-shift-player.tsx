"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, EyeOff, Minus, Plus, Timer, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { StoryView } from "@/features/campaigns/story-view";
import { SidekickLine } from "@/features/campaigns/sidekick";
import { usePrefersReducedMotion } from "@/hooks/use-profile";
import {
  MAX_CREW_PLAYERS,
  MIN_CREW_PLAYERS,
  type CrewShiftRound,
} from "@/data/campaigns/crew-shift";
import type { MissionHost } from "@/features/missions/engine/mission-host";
import type { AwardResult } from "@/lib/xp";

type Step =
  | "setup"
  | "situation"
  | "handoff"
  | "private"
  | "locked"
  | "reveal"
  | "discuss"
  | "final"
  | "shift"
  | "complete";

export interface CrewShiftOutcome {
  playerCount: number;
  shifted: boolean;
  finalOptionId: string;
}

/**
 * CREW SHIFT.
 *
 * One phone, passed around. Everybody commits privately, nobody sees anyone
 * else's answer until all of them are in, then the group argues for a short
 * window and commits to one decision together.
 *
 * There is no score and no right answer. The only thing measured is whether
 * the group ended up somewhere different from where its members started, which
 * is the behavioural point: peer influence is usually invisible, and this makes
 * it visible for about ninety seconds.
 *
 * No backend and no realtime layer. Pass-the-phone is not a compromise here,
 * it is the correct mechanic for four people standing in the same place.
 */
export function CrewShiftPlayer({
  round,
  accent = "pulse",
  host,
  onResult,
}: {
  round: CrewShiftRound;
  accent?: "quest" | "pulse" | "volt" | "coral" | "gold";
  host: MissionHost;
  onResult?: (outcome: CrewShiftOutcome) => void;
}) {
  const reduced = usePrefersReducedMotion();

  const [step, setStep] = useState<Step>("setup");
  const [playerCount, setPlayerCount] = useState(3);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [finalOptionId, setFinalOptionId] = useState<string | null>(null);
  const [result, setResult] = useState<AwardResult | null>(null);

  const isSolo = playerCount === 1;

  const lockAnswer = () => {
    if (!pending) return;
    setAnswers((current) => ({ ...current, [currentPlayer]: pending }));
    setPending(null);
    if (currentPlayer < playerCount) {
      setCurrentPlayer(currentPlayer + 1);
      setStep("handoff");
    } else {
      setStep("reveal");
    }
  };

  /** The most common private answer. Ties resolve to the first option listed. */
  const majorityOptionId = (): string | null => {
    const tally = new Map<string, number>();
    for (const optionId of Object.values(answers)) {
      tally.set(optionId, (tally.get(optionId) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestCount = 0;
    for (const option of round.options) {
      const count = tally.get(option.id) ?? 0;
      if (count > bestCount) {
        best = option.id;
        bestCount = count;
      }
    }
    return best;
  };

  const finish = (optionId: string) => {
    const shifted = !isSolo && majorityOptionId() !== optionId;
    setFinalOptionId(optionId);
    onResult?.({ playerCount, shifted, finalOptionId: optionId });
    setStep("shift");
  };

  const grant = () => {
    setResult(host.complete());
    setStep("complete");
  };

  const shell = (
    children: React.ReactNode,
    options: { progress: number; footer?: React.ReactNode },
  ) => (
    <MissionShell
      title="Crew Shift"
      accent={accent}
      progress={options.progress}
      exitHref={host.exitHref}
      footer={options.footer}
    >
      {children}
    </MissionShell>
  );

  /* -------------------------------------------------------------- Setup */

  if (step === "setup") {
    return shell(
      <div className="animate-rise py-4">
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-chalk">
          How many of you?
        </h1>
        <p className="mt-2 text-sm text-mist">
          One phone. Everyone answers privately, then you decide together.
        </p>

        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Fewer players"
            onClick={() => setPlayerCount((n) => Math.max(MIN_CREW_PLAYERS, n - 1))}
            disabled={playerCount <= MIN_CREW_PLAYERS}
            className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-chalk sq-pressable disabled:opacity-30"
          >
            <Minus aria-hidden className="size-5" />
          </button>

          <p
            aria-live="polite"
            className="min-w-20 text-center font-display text-6xl font-extrabold text-pulse-300 tabular-nums"
          >
            {playerCount}
          </p>

          <button
            type="button"
            aria-label="More players"
            onClick={() => setPlayerCount((n) => Math.min(MAX_CREW_PLAYERS, n + 1))}
            disabled={playerCount >= MAX_CREW_PLAYERS}
            className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-chalk sq-pressable disabled:opacity-30"
          >
            <Plus aria-hidden className="size-5" />
          </button>
        </div>

        <p className="mt-3 text-center text-sm text-muted">
          {isSolo ? "Solo. You can still play it through." : `${playerCount} players`}
        </p>

        <SidekickLine mood="neutral" className="mt-8">
          {isSolo
            ? "Solo works, but this one is built for arguing. Grab someone if you can."
            : "Nobody sees anyone else's answer until all of them are in. That is the whole trick."}
        </SidekickLine>
      </div>,
      {
        progress: 0.05,
        footer: (
          <Button variant="volt" size="lg" full onClick={() => setStep("situation")}>
            Start
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        ),
      },
    );
  }

  /* ---------------------------------------------------------- Situation */

  if (step === "situation") {
    return shell(
      <div className="animate-rise py-2">
        <StoryView segment={round.situation} />
      </div>,
      {
        progress: 0.15,
        footer: (
          <Button
            variant="volt"
            size="lg"
            full
            onClick={() => setStep(playerCount > 1 ? "handoff" : "private")}
          >
            {playerCount > 1 ? "Pass to player 1" : "Your call"}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        ),
      },
    );
  }

  /* ------------------------------------------------------------ Handoff */

  if (step === "handoff") {
    return shell(
      <div className="animate-rise grid min-h-[55dvh] place-items-center text-center">
        <div>
          <span className="mx-auto grid size-20 place-items-center rounded-full border border-pulse-500/30 bg-pulse-500/10">
            <Users aria-hidden className="size-9 text-pulse-300" />
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-chalk">
            Player {currentPlayer}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-base text-mist">
            Pass the phone. Do not let anyone else see the screen.
          </p>
        </div>
      </div>,
      {
        progress: 0.15 + (currentPlayer / playerCount) * 0.3,
        footer: (
          <Button variant="volt" size="lg" full onClick={() => setStep("private")}>
            I am player {currentPlayer}
          </Button>
        ),
      },
    );
  }

  /* ------------------------------------------------------------ Private */

  if (step === "private") {
    return shell(
      <div className="animate-rise py-2">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-pulse-500/30 bg-pulse-500/10 px-3 py-1 text-xs font-semibold text-pulse-300">
          <EyeOff aria-hidden className="size-3.5" />
          {isSolo ? "Your answer" : `Player ${currentPlayer}, private`}
        </p>

        <h1 className="mt-4 text-balance-tight font-display text-2xl leading-tight font-extrabold text-chalk">
          {round.prompt}
        </h1>

        <div className="mt-6 space-y-2.5">
          {round.options.map((option) => {
            const selected = pending === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPending(option.id)}
                className={cn(
                  "sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[0.95rem] leading-snug font-medium",
                  selected
                    ? "border-pulse-400 bg-pulse-500/12 text-chalk"
                    : "border-white/10 bg-white/4 text-chalk hover:bg-white/7",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border",
                    selected ? "border-pulse-400 bg-pulse-500 text-ink-900" : "border-white/25",
                  )}
                >
                  {selected ? <Check aria-hidden className="size-3" strokeWidth={3} /> : null}
                </span>
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>,
      {
        progress: 0.2 + (currentPlayer / playerCount) * 0.3,
        footer: (
          <Button
            variant={pending ? "volt" : "secondary"}
            size="lg"
            full
            disabled={!pending}
            onClick={lockAnswer}
          >
            {pending ? "Lock answer" : "Pick one"}
          </Button>
        ),
      },
    );
  }

  /* ------------------------------------------------------------- Reveal */

  if (step === "reveal") {
    const tally = round.options.map((option) => ({
      option,
      count: Object.values(answers).filter((value) => value === option.id).length,
    }));
    const chosen = tally.filter((entry) => entry.count > 0);
    const unanimous = chosen.length === 1;

    return shell(
      <div className="animate-rise py-2">
        <h1 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-chalk">
          {isSolo
            ? "Your answer"
            : unanimous
              ? "You all picked the same thing"
              : "You did not agree"}
        </h1>
        <p className="mt-2 text-sm text-mist">
          {isSolo
            ? "Nothing to compare against, so here is where you landed."
            : "No score, and nobody is wrong. This is just where the group actually is."}
        </p>

        <ul className="mt-6 space-y-2.5">
          {tally.map(({ option, count }) => (
            <li
              key={option.id}
              className={cn(
                "rounded-2xl border p-4 transition-colors",
                count > 0 ? "border-pulse-500/30 bg-pulse-500/8" : "border-white/8 bg-white/3",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    count > 0 ? "text-chalk" : "text-faint",
                  )}
                >
                  {option.label}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
                    count > 0 ? "bg-pulse-500/20 text-pulse-300" : "bg-white/6 text-faint",
                  )}
                >
                  {count}
                </span>
              </div>
              {count > 0 ? (
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{option.tradeoff}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>,
      {
        progress: 0.6,
        footer: (
          <Button variant="volt" size="lg" full onClick={() => setStep("discuss")}>
            {isSolo ? "Continue" : "Talk about it"}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        ),
      },
    );
  }

  /* ------------------------------------------------------------ Discuss */

  if (step === "discuss") {
    return shell(
      <DiscussionWindow
        round={round}
        reduced={reduced}
        solo={isSolo}
        onDone={() => setStep("final")}
      />,
      { progress: 0.72 },
    );
  }

  /* -------------------------------------------------------------- Final */

  if (step === "final") {
    return shell(
      <div className="animate-rise py-2">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-volt-500/30 bg-volt-500/10 px-3 py-1 text-xs font-semibold text-volt-300">
          <Users aria-hidden className="size-3.5" />
          {isSolo ? "Final answer" : "One decision, together"}
        </p>

        <h1 className="mt-4 text-balance-tight font-display text-2xl leading-tight font-extrabold text-chalk">
          {round.finalPrompt}
        </h1>

        <div className="mt-6 space-y-2.5">
          {round.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => finish(option.id)}
              className="sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-[0.95rem] leading-snug font-medium text-chalk hover:border-volt-500/40 hover:bg-white/7"
            >
              <span className="flex-1">{option.label}</span>
              <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
            </button>
          ))}
        </div>
      </div>,
      { progress: 0.85 },
    );
  }

  /* -------------------------------------------------------------- Shift */

  if (step === "shift" && finalOptionId) {
    const outcome = round.outcomes[finalOptionId];
    const majority = majorityOptionId();
    const shifted = !isSolo && majority !== finalOptionId;
    const majorityOption = round.options.find((option) => option.id === majority);

    return shell(
      <div className="animate-rise py-2">
        <div className="sq-card p-5">
          <p className="font-display text-xl leading-tight font-extrabold text-pulse-300">
            {outcome.headline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mist">{outcome.body}</p>
        </div>

        {!isSolo ? (
          <div
            className={cn(
              "animate-pop mt-5 rounded-2xl border p-4",
              shifted ? "border-volt-500/30 bg-volt-500/8" : "border-white/10 bg-white/4",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">
              {shifted ? "The group shifted" : "The group held"}
            </p>
            {shifted && majorityOption ? (
              <p className="mt-2 text-sm text-muted">
                Most of you started at: {majorityOption.label}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-mist">
              {shifted ? round.shiftedNote : round.heldNote}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4">
            <p className="text-sm leading-relaxed text-mist">{round.soloNote}</p>
          </div>
        )}

        <SidekickLine mood={shifted ? "thinking" : "pleased"} className="mt-5">
          {shifted
            ? "That is peer influence, working in the direction you chose. Usually it goes the other way and nobody notices."
            : "Holding a position after an argument is a different thing from holding it before one."}
        </SidekickLine>
      </div>,
      {
        progress: 0.95,
        footer: (
          <Button variant="volt" size="lg" full onClick={grant}>
            Finish chapter
          </Button>
        ),
      },
    );
  }

  /* ----------------------------------------------------------- Complete */

  if (step === "complete" && result) {
    return shell(
      host.renderComplete(
        result,
        isSolo
          ? "You worked the decision through on your own."
          : `${playerCount} of you answered privately, then decided once, together.`,
      ),
      { progress: 1 },
    );
  }

  return null;
}

/* -------------------------------------------------------- Discussion */

/**
 * The discussion window.
 *
 * The timer is a prompt, never a punishment: it can be skipped at any point,
 * running out simply moves things on, and the remaining time is announced to
 * assistive technology rather than existing only as a shrinking bar.
 */
function DiscussionWindow({
  round,
  reduced,
  solo,
  onDone,
}: {
  round: CrewShiftRound;
  reduced: boolean;
  solo: boolean;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(round.discussionSeconds);

  useEffect(() => {
    if (solo) return;
    const id = window.setInterval(() => {
      setRemaining((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [solo]);

  const fraction = remaining / round.discussionSeconds;

  return (
    <div className="animate-rise py-2">
      <div className="flex items-center gap-2.5">
        <Timer aria-hidden className="size-4 text-faint" />
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">
          {solo ? "Think it over" : "Talk it out"}
        </p>
      </div>

      {!solo ? (
        <>
          <p
            className="mt-4 text-center font-display text-6xl font-extrabold text-volt-300 tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {remaining}
            <span className="ml-1 text-2xl">s</span>
          </p>
          <div
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/8"
            role="progressbar"
            aria-valuenow={remaining}
            aria-valuemin={0}
            aria-valuemax={round.discussionSeconds}
            aria-label="Discussion time remaining"
          >
            <div
              className={cn(
                "h-full rounded-full bg-volt-500",
                !reduced && "transition-[width] duration-1000 ease-linear",
              )}
              style={{ width: `${Math.max(0, fraction) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-faint">
            Nothing happens when it runs out. It is only there to stop the silence.
          </p>
        </>
      ) : null}

      <ul className="mt-7 space-y-2.5">
        {round.discussionPrompts.map((prompt) => (
          <li key={prompt} className="sq-card-flat p-3.5">
            <p className="text-sm leading-relaxed text-mist">{prompt}</p>
          </li>
        ))}
      </ul>

      <Button variant="volt" size="lg" full className="mt-7" onClick={onDone}>
        {remaining > 0 && !solo ? "Skip ahead and decide" : "Decide"}
        <ArrowRight aria-hidden className="size-4" />
      </Button>
    </div>
  );
}
