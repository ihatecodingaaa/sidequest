"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, EyeOff, MessagesSquare, Minus, Plus, Timer, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { StoryView, useSegment } from "@/features/campaigns/story-view";
import { storyBeatLabel } from "@/components/story/story-beat";
import { SidekickLine } from "@/features/campaigns/sidekick";
import { ShiftReveal, TallyBars, type TallyRow } from "@/components/reveal/shift-reveal";
import { WhatChanged } from "@/components/reveal/what-changed";
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
  | "reveal"
  | "discuss"
  | "tiebreak"
  | "shift"
  | "complete";

export interface CrewShiftOutcome {
  playerCount: number;
  shifted: boolean;
  finalOptionId: string;
  /** How many seats answered differently the second time. Never which seats. */
  movedCount: number;
  /**
   * True when this was a Solo Preview.
   *
   * Carried so nothing downstream can mistake a worked example for group
   * participation. Crew progression, crew metrics and any claim about peer
   * influence are all conditional on this being false.
   */
  preview?: boolean;
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
  // Above the early returns: hooks cannot live behind a conditional.
  const situationBeat = useSegment(round.situation);

  const [step, setStep] = useState<Step>("setup");
  const [playerCount, setPlayerCount] = useState(3);
  /**
   * Solo Preview.
   *
   * A judge, or a young person on their own, needs to be able to see what this
   * mechanic does. The alternative is a mechanic nobody ever understands
   * because it cannot be shown, and removing it would lose the one interaction
   * in the product that makes peer influence visible.
   *
   * The rules are absolute: it says PREVIEW on every screen, the other answers
   * are labelled as prototype, and no crew progression is recorded. It never
   * says "your crew changed their minds", because there is no crew.
   */
  const [preview, setPreview] = useState(false);
  const previewSeats = round.preview.first.length;
  const [currentPlayer, setCurrentPlayer] = useState(1);
  /** Round 1 runs before the discussion, round 2 after it. */
  const [voteRound, setVoteRound] = useState<1 | 2>(1);
  const [firstAnswers, setFirstAnswers] = useState<Record<number, string>>({});
  const [secondAnswers, setSecondAnswers] = useState<Record<number, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [finalOptionId, setFinalOptionId] = useState<string | null>(null);
  const [result, setResult] = useState<AwardResult | null>(null);

  const isSolo = playerCount === 1 && !preview;
  /** In preview the real person is seat one, and the rest are the worked example. */
  const seats = preview ? previewSeats + 1 : playerCount;

  /** Counts per option, in the order the options are declared. Never re-sorted. */
  const tallyFor = (source: Record<number, string>): TallyRow[] =>
    round.options.map((option) => ({
      id: option.id,
      label: option.label,
      note: option.tradeoff,
      count: Object.values(source).filter((value) => value === option.id).length,
    }));

  /**
   * Winning options for a round. Returns every option tied at the top, because
   * a two-two split is a real result the crew has to resolve out loud, not
   * something to resolve silently by declaration order.
   */
  const leadersOf = (source: Record<number, string>): string[] => {
    const rows = tallyFor(source);
    const best = Math.max(0, ...rows.map((row) => row.count));
    if (best === 0) return [];
    return rows.filter((row) => row.count === best).map((row) => row.id);
  };

  /** Seats that answered differently the second time. The count only, never the seat. */
  const movedCount = (): number => {
    let moved = 0;
    for (let seat = 1; seat <= seats; seat += 1) {
      const before = firstAnswers[seat];
      const after = secondAnswers[seat];
      if (before && after && before !== after) moved += 1;
    }
    return moved;
  };

  const finish = (optionId: string, second: Record<number, string>) => {
    let moved = 0;
    for (let seat = 1; seat <= seats; seat += 1) {
      if (firstAnswers[seat] && second[seat] && firstAnswers[seat] !== second[seat]) moved += 1;
    }
    setFinalOptionId(optionId);
    onResult?.({
      playerCount: preview ? 1 : playerCount,
      shifted: moved > 0,
      finalOptionId: optionId,
      movedCount: moved,
      preview,
    });
    setStep("shift");
  };

  const lockAnswer = () => {
    if (!pending) return;
    const answer = pending;
    setPending(null);

    if (voteRound === 1) {
      /*
       * In preview the player answers once and the written example fills the
       * rest. No phone is passed, because there is nobody to pass it to.
       */
      const first = preview
        ? {
            ...firstAnswers,
            1: answer,
            ...Object.fromEntries(round.preview.first.map((id, i) => [i + 2, id])),
          }
        : { ...firstAnswers, [currentPlayer]: answer };
      setFirstAnswers(first);
      if (!preview && currentPlayer < playerCount) {
        setCurrentPlayer(currentPlayer + 1);
        setStep("handoff");
      } else {
        setStep("reveal");
      }
      return;
    }

    const next = preview
      ? {
          ...secondAnswers,
          1: answer,
          ...Object.fromEntries(round.preview.second.map((id, i) => [i + 2, id])),
        }
      : { ...secondAnswers, [currentPlayer]: answer };
    setSecondAnswers(next);
    if (!preview && currentPlayer < playerCount) {
      setCurrentPlayer(currentPlayer + 1);
      setStep("handoff");
      return;
    }

    const leaders = leadersOf(next);
    if (leaders.length === 1) finish(leaders[0], next);
    else setStep("tiebreak");
  };

  /** Moves from the discussion into the second private round. */
  const startSecondRound = () => {
    setVoteRound(2);
    setCurrentPlayer(1);
    setPending(null);
    setStep(!preview && playerCount > 1 ? "handoff" : "private");
  };

  const grant = () => {
    setResult(host.complete());
    setStep("complete");
  };

  /**
   * The preview banner.
   *
   * On every screen of a preview run, not just the first, because the screen a
   * judge photographs is rarely the one they started on.
   */
  const previewBanner = preview ? (
    <p className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-gold-300">
      <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.1em] uppercase">
        Solo preview
      </span>
      <span className="text-mist">
        The other three answers are a written example. Nobody else answered these.
      </span>
    </p>
  ) : null;

  const shell = (
    children: React.ReactNode,
    options: { progress: number; footer?: React.ReactNode },
  ) => (
    <MissionShell
      title={preview ? "Crew Shift preview" : "Crew Shift"}
      accent={accent}
      progress={options.progress}
      exitHref={host.exitHref}
      footer={options.footer}
    >
      {previewBanner}
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

        {/*
          On your own, and want to see what it does?

          The honest answer to "this needs a few people" is not to fake a few
          people. It is to show the mechanic with a worked example and say so
          in the same breath.
        */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-4">
          <p className="text-sm font-bold text-chalk">On your own right now?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            See how Crew Shift works using a written example group. It is labelled throughout, it
            does not pretend anybody answered, and it counts for nothing.
          </p>
          <button
            type="button"
            onClick={() => {
              setPreview(true);
              setStep("situation");
            }}
            className="sq-pressable mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gold-500/40 bg-gold-500/10 text-sm font-bold text-gold-300"
          >
            Solo preview
            <ArrowRight aria-hidden className="size-4" />
          </button>
        </div>
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
        <StoryView segment={round.situation} beat={situationBeat} />
      </div>,
      {
        progress: 0.15,
        footer: (
          <Button
            variant="volt"
            size="lg"
            full
            onClick={() =>
              situationBeat.complete
                ? setStep(playerCount > 1 ? "handoff" : "private")
                : situationBeat.advance()
            }
          >
            {storyBeatLabel(situationBeat, playerCount > 1 ? "Pass to player 1" : "Your call")}
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
            {voteRound === 1
              ? "Pass the phone. Do not let anyone else see the screen."
              : "Second time round. Same rule: nobody else sees the screen."}
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
          {isSolo
            ? voteRound === 1
              ? "Your answer"
              : "Your answer, again"
            : `Player ${currentPlayer}, ${voteRound === 1 ? "private" : "second answer"}`}
        </p>

        <h1 className="mt-4 text-balance-tight font-display text-2xl leading-tight font-extrabold text-chalk">
          {voteRound === 1 ? round.prompt : round.secondRoundPrompt}
        </h1>

        {voteRound === 2 ? (
          <p className="mt-2 text-sm text-muted">
            Changing your mind is not losing. Neither is keeping it.
          </p>
        ) : null}

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
    const rows = tallyFor(firstAnswers);
    const chosen = rows.filter((row) => row.count > 0);
    const unanimous = chosen.length === 1;

    return shell(
      <div className="animate-rise py-2">
        <h1 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-chalk">
          {preview
            ? "Where the example group started"
            : isSolo
              ? "Your answer"
              : unanimous
                ? "You all picked the same thing"
                : "You did not agree"}
        </h1>
        <p className="mt-2 text-sm text-mist">
          {preview
            ? "Your answer plus three written ones. This is the before picture."
            : isSolo
              ? "Nothing to compare against yet. Answer again after you have thought about it."
              : "No score, and nobody is wrong. This is just where the group actually is."}
        </p>

        <div className="mt-6">
          <TallyBars rows={rows} total={seats} accent="pulse" showNotes />
        </div>
      </div>,
      {
        progress: 0.55,
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
        onDone={startSecondRound}
      />,
      { progress: 0.65 },
    );
  }

  /* ----------------------------------------------------------- Tiebreak */

  /*
   * A genuine split. Rather than resolving it by declaration order behind the
   * scenes, the crew has to resolve it out loud, which is the most honest
   * thing this mechanic can do with a tie.
   */
  if (step === "tiebreak") {
    const tied = leadersOf(secondAnswers);
    const tiedOptions = round.options.filter((option) => tied.includes(option.id));

    return shell(
      <div className="animate-rise py-2">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400">
          <Users aria-hidden className="size-3.5" />
          Still split
        </p>

        <h1 className="mt-4 text-balance-tight font-display text-2xl leading-tight font-extrabold text-chalk">
          {round.finalPrompt}
        </h1>
        <p className="mt-2 text-sm text-mist">
          You came out level. Settle it between you, then tap it once.
        </p>

        <div className="mt-6 space-y-2.5">
          {tiedOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => finish(option.id, secondAnswers)}
              className="sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-[0.95rem] leading-snug font-medium text-chalk hover:border-volt-500/40 hover:bg-white/7"
            >
              <span className="flex-1">{option.label}</span>
              <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
            </button>
          ))}
        </div>
      </div>,
      { progress: 0.9 },
    );
  }

  /* -------------------------------------------------------------- Shift */

  if (step === "shift" && finalOptionId) {
    const outcome = round.outcomes[finalOptionId];
    const moved = movedCount();
    const beforeRows = tallyFor(firstAnswers);
    const afterRows = tallyFor(secondAnswers);
    const totalsChanged = beforeRows.some(
      (row, index) => row.count !== afterRows[index].count,
    );

    return shell(
      <div className="animate-rise py-2">
        <h1 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-chalk">
          {preview ? "This is what a shift looks like" : shiftHeadline(isSolo, moved, totalsChanged)}
        </h1>

        <ShiftReveal
          className="mt-6"
          accent="volt"
          beforeLabel={isSolo ? "Before you thought about it" : "Before discussion"}
          afterLabel={isSolo ? "After" : "After discussion"}
          connector={<MessagesSquare aria-hidden className="size-4" />}
          before={<TallyBars rows={beforeRows} total={seats} accent="pulse" />}
          after={
            <TallyBars rows={afterRows} total={seats} accent="volt" animate={!reduced} />
          }
          summary={
            preview
              ? "Two distributions, one discussion between them. With a real crew this is the group's own before and after, and it is theirs rather than an example."
              : isSolo
                ? round.soloNote
                : moved > 0
                  ? round.shiftedNote
                  : round.heldNote
          }
        />

        {preview ? (
          <p className="mt-3 text-sm text-muted">
            In this written example, {moved === 1 ? "one answer" : `${moved} answers`} changed
            between the rounds. Nobody actually answered them, and none of this counts towards
            anything.
          </p>
        ) : !isSolo ? (
          <p className="mt-3 text-sm text-muted">{movedLine(moved, playerCount)}</p>
        ) : null}

        <div className="sq-card mt-7 p-5">
          <p className="font-display text-xl leading-tight font-extrabold text-pulse-300">
            {outcome.headline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mist">{outcome.body}</p>
        </div>

        <WhatChanged factorIds={outcome.protectiveFactorIds} />

        <SidekickLine mood={moved > 0 ? "thinking" : "pleased"} className="mt-6">
          {preview
            ? "That is the mechanic. The version that means something has your actual friends in it."
            : echoLine(isSolo, moved, totalsChanged)}
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

/* -------------------------------------------------------------- Copy */

/*
 * Every line below is chosen from state the app actually captured: how many
 * seats answered differently, and whether the totals moved. Nothing here knows
 * who changed, who spoke, or who convinced anyone, because none of that is
 * recorded and inferring it would be both unsupported and a way of pointing at
 * a person. The four cases are exhaustive, so there is no fallback that could
 * quietly become a fifth, vaguer claim.
 */

function shiftHeadline(solo: boolean, moved: number, totalsChanged: boolean): string {
  if (solo) return moved > 0 ? "You changed your mind" : "You stayed where you were";
  if (moved === 0) return "Your crew held its position";
  if (totalsChanged) return "Your crew shifted";
  return "Same split, different people";
}

function movedLine(moved: number, playerCount: number): string {
  if (moved === 0) return `All ${playerCount} of you answered the same way twice.`;
  if (moved === 1) return "One answer changed between the two rounds.";
  return `${moved} answers changed between the two rounds.`;
}

function echoLine(solo: boolean, moved: number, totalsChanged: boolean): string {
  if (solo) {
    return moved > 0
      ? "You argued yourself round. That is harder alone than it is in a group."
      : "Same answer twice, with thinking in between. That is not the same as never having questioned it.";
  }
  if (moved === 0) return "Nobody moved. Strong consensus, or a short argument.";
  if (totalsChanged)
    return "That is peer influence. Usually it runs the other way and nobody notices it happening.";
  return "The totals look identical and they are not. People swapped places.";
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
