"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Lightbulb, RotateCcw } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { MissionComplete } from "@/features/missions/engine/mission-complete";
import { BeatView } from "@/features/missions/engine/scenario-player";
import { usePrefersReducedMotion } from "@/hooks/use-profile";
import { useAppStore } from "@/store/app-store";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";
import type { Scenario, ScenarioChoice, ScenarioOutcome } from "@/types/scenario";

type Phase =
  | "intro"
  | "run-one"
  | "outcome-one"
  | "rewinding"
  | "run-two"
  | "outcome-two"
  | "compare"
  | "debrief"
  | "complete";

/**
 * REWIND.
 *
 * The mechanic: play the scene, reach an outcome, then return to the single
 * decision that produced it and take a different route. The second run starts
 * at the pivot rather than the beginning, because the point is the decision,
 * not the story.
 *
 * The option taken on the first run is disabled on the second so the comparison
 * is always between two genuinely different responses.
 */
export function RewindPlayer({ mission, scenario }: { mission: Mission; scenario: Scenario }) {
  const completeMission = useAppStore((state) => state.completeMission);
  const reduced = usePrefersReducedMotion();

  const beatMap = useMemo(
    () => new Map(scenario.beats.map((beat) => [beat.id, beat])),
    [scenario.beats],
  );
  const pivot = useMemo(() => scenario.beats.find((beat) => beat.isPivot), [scenario.beats]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [beatId, setBeatId] = useState(scenario.startBeatId);
  const [reaction, setReaction] = useState<string | null>(null);
  const [firstPivotChoice, setFirstPivotChoice] = useState<ScenarioChoice | null>(null);
  const [secondPivotChoice, setSecondPivotChoice] = useState<ScenarioChoice | null>(null);
  const [firstOutcome, setFirstOutcome] = useState<ScenarioOutcome | null>(null);
  const [result, setResult] = useState<AwardResult | null>(null);

  const beat = beatMap.get(beatId);
  const isSecondRun = phase === "run-two" || phase === "outcome-two";

  const choose = (choice: ScenarioChoice) => {
    if (beat?.isPivot) {
      if (isSecondRun) setSecondPivotChoice(choice);
      else setFirstPivotChoice(choice);
    }

    const next = beatMap.get(choice.next);
    setReaction(choice.reaction ?? null);
    setBeatId(choice.next);

    if (next?.outcome) {
      if (isSecondRun) setPhase("outcome-two");
      else {
        setFirstOutcome(next.outcome);
        setPhase("outcome-one");
      }
    }
  };

  const startRewind = () => {
    setPhase("rewinding");
    // The pause is the whole beat. Reduced motion skips straight through.
    window.setTimeout(
      () => {
        setReaction(null);
        setBeatId(pivot?.id ?? scenario.startBeatId);
        setPhase("run-two");
      },
      reduced ? 0 : 1900,
    );
  };

  const finish = () => {
    setResult(completeMission(mission.id));
    setPhase("complete");
  };

  const progressFor = (): number => {
    switch (phase) {
      case "intro":
        return 0;
      case "run-one":
        return 0.2;
      case "outcome-one":
        return 0.42;
      case "rewinding":
        return 0.5;
      case "run-two":
        return 0.62;
      case "outcome-two":
        return 0.8;
      case "compare":
        return 0.88;
      case "debrief":
        return 0.95;
      default:
        return 1;
    }
  };

  const exitHref = `/missions/${mission.id}`;

  /* ------------------------------------------------------------- Intro */

  if (phase === "intro") {
    return (
      <MissionShell
        title="REWIND"
        accent="coral"
        progress={0}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setPhase("run-one")}>
            Start
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-6">
          <Chip accent="coral">{scenario.intro.kicker}</Chip>
          <h1 className="mt-4 text-balance-tight font-display text-[2.1rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
            {scenario.intro.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-mist">{scenario.intro.setup}</p>

          <div className="sq-card mt-8 flex gap-3 p-4">
            <RotateCcw aria-hidden className="mt-0.5 size-5 shrink-0 text-coral-300" />
            <p className="text-sm leading-relaxed text-mist">
              Play it the way it would actually go. Afterwards you get to go back to the one moment
              that mattered and do it differently.
            </p>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* --------------------------------------------------------- Rewinding */

  if (phase === "rewinding") {
    return (
      <MissionShell title="REWIND" accent="coral" progress={progressFor()} exitHref={exitHref}>
        <div className="grid min-h-[60dvh] place-items-center">
          <div className="text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-full border border-coral-500/30 bg-coral-500/10">
              <RotateCcw
                aria-hidden
                className={cn("size-9 text-coral-300", !reduced && "animate-spin [animation-duration:1.6s] [animation-direction:reverse]")}
              />
            </span>
            <p className="mt-6 font-display text-4xl font-extrabold tracking-tight text-chalk">
              REWIND
            </p>
            <p className="mt-2 text-sm text-mist">Back to 5:43pm.</p>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Outcomes */

  if ((phase === "outcome-one" || phase === "outcome-two") && beat?.outcome) {
    const outcome = beat.outcome;
    const isFirst = phase === "outcome-one";
    const toneColour =
      outcome.kind === "good"
        ? "text-volt-300"
        : outcome.kind === "mixed"
          ? "text-gold-400"
          : "text-coral-300";

    return (
      <MissionShell
        title="REWIND"
        accent="coral"
        progress={progressFor()}
        exitHref={exitHref}
        footer={
          isFirst ? (
            <Button variant="danger" size="lg" full onClick={startRewind}>
              <RotateCcw aria-hidden className="size-4" />
              Rewind to the decision
            </Button>
          ) : (
            <Button size="lg" full onClick={() => setPhase("compare")}>
              Compare the two runs
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          )
        }
      >
        <div className="animate-rise py-4">
          {beat.lines.map((line, index) => (
            <p key={index} className="mb-3 text-base leading-relaxed text-mist">
              {line}
            </p>
          ))}

          <div className="sq-card mt-6 p-5">
            <p className={cn("font-display text-xl leading-tight font-extrabold", toneColour)}>
              {outcome.headline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-mist">{outcome.body}</p>
            <ul className="mt-5 space-y-2.5">
              {outcome.takeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-2.5 text-sm leading-relaxed text-chalk">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-40" />
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>

          {isFirst ? (
            <p className="mt-6 text-center text-sm text-muted">
              One moment decided most of this. You are about to get it back.
            </p>
          ) : null}
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------ Compare */

  if (phase === "compare" && beat?.outcome && firstOutcome) {
    const second = beat.outcome;

    return (
      <MissionShell
        title="REWIND"
        accent="coral"
        progress={progressFor()}
        exitHref={exitHref}
        footer={
          <Button size="lg" full onClick={() => setPhase("debrief")}>
            What this trains
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-4">
          <h1 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-chalk">
            Same night. Same people. One different sentence.
          </h1>

          <div className="mt-6 space-y-3">
            <ComparisonRow
              label="First run"
              choice={firstPivotChoice?.label ?? ""}
              outcome={firstOutcome}
            />
            <div className="flex items-center gap-3 px-1">
              <span className="h-px flex-1 bg-white/10" />
              <RotateCcw aria-hidden className="size-4 text-coral-300" />
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <ComparisonRow
              label="After the rewind"
              choice={secondPivotChoice?.label ?? ""}
              outcome={second}
              highlight
            />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-mist">
            The gap between those two outcomes is about one second of real time. That is the whole
            argument for rehearsing it before it happens.
          </p>
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------ Debrief */

  if (phase === "debrief") {
    return (
      <MissionShell
        title="REWIND"
        accent="coral"
        progress={progressFor()}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={finish}>
            Finish mission
          </Button>
        }
      >
        <div className="animate-rise py-4">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-chalk">
            {scenario.debrief.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">{scenario.debrief.mechanism}</p>

          <ul className="mt-6 space-y-3">
            {scenario.debrief.points.map((point) => (
              <li key={point} className="sq-card-flat flex gap-3 p-3.5">
                <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-coral-400" />
                <span className="text-sm leading-relaxed text-mist">{point}</span>
              </li>
            ))}
          </ul>

          <div className="sq-card mt-6 flex gap-3 p-4">
            <Lightbulb aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-400" />
            <p className="text-sm leading-relaxed text-mist">
              SIDEQUEST never asks you to confront anyone. Every option that worked here was quiet,
              private or simply leaving.
            </p>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Complete */

  if (phase === "complete" && result) {
    return (
      <MissionShell title="REWIND" accent="coral" progress={1} exitHref={exitHref}>
        <MissionComplete
          mission={mission}
          result={result}
          summary="You played the moment twice and found the version that costs nobody anything."
        />
      </MissionShell>
    );
  }

  /* --------------------------------------------------------------- Beat */

  if (!beat) {
    return (
      <MissionShell title="REWIND" exitHref={exitHref}>
        <p className="py-10 text-center text-sm text-muted">
          This branch is missing. Head back and start again.
        </p>
      </MissionShell>
    );
  }

  return (
    <MissionShell title="REWIND" accent="coral" progress={progressFor()} exitHref={exitHref}>
      {isSecondRun && beat.isPivot ? (
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-coral-500/30 bg-coral-500/10 px-3 py-1 text-xs font-semibold text-coral-300">
          <RotateCcw aria-hidden className="size-3.5" />
          Second run
        </p>
      ) : null}

      <BeatView
        beat={beat}
        reaction={reaction}
        onChoose={choose}
        disabledChoiceIds={
          isSecondRun && beat.isPivot && firstPivotChoice ? [firstPivotChoice.id] : []
        }
        choiceHint={isSecondRun && beat.isPivot ? "Try a different response" : undefined}
      />
    </MissionShell>
  );
}

function ComparisonRow({
  label,
  choice,
  outcome,
  highlight,
}: {
  label: string;
  choice: string;
  outcome: ScenarioOutcome;
  highlight?: boolean;
}) {
  const tone =
    outcome.kind === "good"
      ? "text-volt-300"
      : outcome.kind === "mixed"
        ? "text-gold-400"
        : "text-coral-300";

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        highlight ? "border-volt-500/30 bg-volt-500/8" : "border-white/10 bg-white/4",
      )}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-faint">{label}</p>
      {choice ? <p className="mt-1.5 text-sm font-medium text-mist">{choice}</p> : null}
      <p className={cn("mt-2.5 font-display text-base leading-snug font-bold", tone)}>
        {outcome.headline}
      </p>
    </div>
  );
}
