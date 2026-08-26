"use client";

import { useState } from "react";
import { ArrowRight, Info, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { MissionWorld } from "@/components/mission/mission-world";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { ShiftReveal } from "@/components/reveal/shift-reveal";
import {
  useMissionHost,
  type MissionHost,
} from "@/features/missions/engine/mission-host";
import { NORM_QUESTIONS, NORM_SAMPLE_NOTE, type NormQuestion } from "@/data/norm-mirror";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";

type Step = "intro" | "predict" | "choose" | "reveal" | "summary" | "complete";

interface Answer {
  questionId: string;
  prediction: number;
  personalChoice: "yes" | "no";
}

/**
 * NORM MIRROR.
 *
 * Order matters and is fixed: predict the peer rate first, commit to your own
 * choice second, see the aggregate third. Asking for the prediction before the
 * personal choice is what stops the prediction being rationalised backwards.
 *
 * Every aggregate on screen is labelled "Demo aggregate" and the note under it
 * says plainly that these are placeholders, not survey results.
 */
export function NormMirrorPlayer({
  mission,
  questions = NORM_QUESTIONS,
  host: providedHost,
  onResult,
}: {
  mission: Mission;
  /** Campaign chapters supply their own set. Defaults to the standalone one. */
  questions?: NormQuestion[];
  host?: MissionHost;
  onResult?: (result: { overestimates: number; questionCount: number }) => void;
}) {
  const host = useMissionHost(mission, providedHost);

  const [step, setStep] = useState<Step>("intro");
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState(50);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<AwardResult | null>(null);

  const question = questions[index];
  const total = questions.length;
  const exitHref = host.exitHref;

  const progress =
    step === "intro"
      ? 0
      : step === "complete"
        ? 1
        : step === "summary"
          ? 0.94
          : Math.min(0.9, (index + (step === "reveal" ? 1 : 0.5)) / total);

  const recordChoice = (personalChoice: "yes" | "no") => {
    setAnswers((current) => [
      ...current.filter((answer) => answer.questionId !== question.id),
      { questionId: question.id, prediction, personalChoice },
    ]);
    setStep("reveal");
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setPrediction(50);
      setStep("predict");
    } else {
      setStep("summary");
    }
  };

  /** A gap of 12 points or more counts as an overestimate. Shared so the
   *  summary screen and the Campaign result can never disagree. */
  const countOverestimates = () =>
    answers.filter((answer) => {
      const source = questions.find((entry) => entry.id === answer.questionId);
      return source ? answer.prediction - source.demoAggregate >= 12 : false;
    }).length;

  const finish = () => {
    onResult?.({ overestimates: countOverestimates(), questionCount: total });
    setResult(host.complete());
    setStep("complete");
  };

  /* ------------------------------------------------------------- Intro */

  if (step === "intro") {
    return (
      <MissionShell
        title="Norm Mirror"
        accent="volt"
        progress={0}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setStep("predict")}>
            Start
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-6">
          {/*
            The gap, drawn, before the gap is described.

            The scene is a crowd you imagine set against the handful actually
            measured, across a mirror line that is bent rather than straight.
            It carries no numbers and no axis on purpose: the aggregates behind
            this mission are prototype data, the provenance note below says so,
            and a drawing that looked like a chart would quietly claim more
            than the data can support.
          */}
          <MissionWorld art="norm-mirror" accent="volt" scale="intro" className="mb-6" />

          <Chip accent="volt">Hero Mission</Chip>
          <h1 className="mt-4 text-balance-tight font-display text-[2.1rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
            What you think everyone does
          </h1>
          <p className="mt-4 text-base leading-relaxed text-mist">
            For each situation: guess what most people your age would do, then say what you would
            do. The gap between those two is usually the interesting part.
          </p>

          <div className="sq-card mt-8 flex gap-3 p-4">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-400" />
            <p className="text-sm leading-relaxed text-mist">
              <span className="font-semibold text-gold-400">Demo aggregate.</span> {NORM_SAMPLE_NOTE}
            </p>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Predict */

  if (step === "predict") {
    return (
      <MissionShell
        title="Norm Mirror"
        accent="volt"
        progress={progress}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setStep("choose")}>
            Lock in {prediction}%
          </Button>
        }
      >
        <div key={question.id} className="animate-rise py-2">
          <QuestionHeader index={index} total={total} question={question} />

          <p className="mt-8 text-sm font-semibold text-chalk">
            Out of 100 people your age, how many would do this?
          </p>

          <p className="mt-6 text-center font-display text-6xl font-extrabold tabular-nums text-volt-300">
            {prediction}
            <span className="text-3xl">%</span>
          </p>

          <label className="mt-6 block">
            <span className="sr-only">Percentage of peers you think would do this</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={prediction}
              onChange={(event) => setPrediction(Number(event.target.value))}
              className="h-11 w-full cursor-pointer accent-[#b4ff3d]"
            />
          </label>
          <div className="flex justify-between px-1 text-xs font-semibold text-faint">
            <span>Nobody</span>
            <span>Everybody</span>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------ Choose */

  if (step === "choose") {
    return (
      <MissionShell title="Norm Mirror" accent="volt" progress={progress} exitHref={exitHref}>
        <div key={question.id} className="animate-rise py-2">
          <QuestionHeader index={index} total={total} question={question} />

          <p className="mt-8 text-sm font-semibold text-chalk">And you? No wrong answer here.</p>

          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              onClick={() => recordChoice("yes")}
              className="sq-pressable flex min-h-14 w-full items-center rounded-2xl border border-white/10 bg-white/4 px-4 text-left text-base font-medium text-chalk hover:border-coral-500/40 hover:bg-white/7"
            >
              {question.choiceYes}
            </button>
            <button
              type="button"
              onClick={() => recordChoice("no")}
              className="sq-pressable flex min-h-14 w-full items-center rounded-2xl border border-white/10 bg-white/4 px-4 text-left text-base font-medium text-chalk hover:border-volt-500/40 hover:bg-white/7"
            >
              {question.choiceNo}
            </button>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------ Reveal */

  if (step === "reveal") {
    const answer = answers.find((entry) => entry.questionId === question.id);
    const guess = answer?.prediction ?? prediction;
    /*
     * Never call this "actual". It is an invented number standing in for a
     * study nobody has run, and a variable name is exactly how that slips into
     * a template and out onto the screen.
     */
    const aggregate = question.demoAggregate;
    const gap = guess - aggregate;

    return (
      <MissionShell
        title="Norm Mirror"
        accent="volt"
        progress={progress}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={next}>
            {index + 1 < total ? "Next situation" : "See the pattern"}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div key={question.id} className="animate-rise py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">
            {question.behaviour}
          </p>

          <ShiftReveal
            className="mt-6"
            accent="volt"
            beforeLabel="You predicted"
            afterLabel="Prototype aggregate"
            connector={<Users aria-hidden className="size-4" />}
            before={<Bar value={guess} accent="quest" />}
            after={<Bar value={aggregate} accent="volt" tagged />}
          />

          <div className="sq-card mt-7 p-4">
            <p className="font-display text-lg leading-tight font-bold text-chalk">
              {gap >= 12
                ? `You thought this was about ${Math.round(gap)} points more common than the prototype figure.`
                : gap <= -12
                  ? `You thought this was about ${Math.abs(Math.round(gap))} points less common than the prototype figure.`
                  : "Your guess landed close to the prototype figure."}
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-mist">{question.insight}</p>
          </div>

          <div className="mt-4 flex gap-3 rounded-2xl border border-volt-500/20 bg-volt-500/8 p-4">
            <Users aria-hidden className="mt-0.5 size-4 shrink-0 text-volt-300" />
            <p className="text-sm leading-relaxed text-mist">{question.action}</p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-faint">{NORM_SAMPLE_NOTE}</p>
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Summary */

  if (step === "summary") {
    const overestimates = countOverestimates();

    return (
      <MissionShell
        title="Norm Mirror"
        accent="volt"
        progress={progress}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={finish}>
            Finish mission
          </Button>
        }
      >
        <div className="animate-rise py-4">
          <h1 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-chalk">
            {overestimates >= 3
              ? "You expected more people to take the risk than the aggregate showed."
              : overestimates >= 1
                ? `You overestimated on ${overestimates} of ${total}.`
                : "Your picture of your peers was close to the aggregate."}
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-mist">
            This is the mechanism the mission is testing. When people believe a risky choice is
            common, it stops feeling like a choice and starts feeling like the default. Correcting
            the picture is one of the few prevention levers that works without telling anyone what
            to do.
          </p>

          <ul className="mt-6 space-y-3">
            {answers.map((answer) => {
              const source = questions.find((entry) => entry.id === answer.questionId);
              if (!source) return null;
              const delta = answer.prediction - source.demoAggregate;
              return (
                <li key={answer.questionId} className="sq-card-flat p-3.5">
                  <p className="text-sm font-semibold text-chalk">{source.behaviour}</p>
                  <p className="mt-1 text-xs text-muted tabular-nums">
                    You guessed {answer.prediction}%, aggregate {source.demoAggregate}%
                    {Math.abs(delta) >= 12
                      ? delta > 0
                        ? " (you expected more)"
                        : " (you expected fewer)"
                      : " (close)"}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="sq-card mt-6 flex gap-3 p-4">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-400" />
            <p className="text-sm leading-relaxed text-mist">
              <span className="font-semibold text-gold-400">Read this bit.</span> {NORM_SAMPLE_NOTE}{" "}
              The direction of the effect is well documented. These specific figures are ours, and
              they are placeholders until a real study replaces them.
            </p>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ---------------------------------------------------------- Complete */

  if (step === "complete" && result) {
    return (
      <MissionShell title="Norm Mirror" accent="volt" progress={1} exitHref={exitHref}>
        {host.renderComplete(
          result,
          "You compared what you assumed about your peers with what the aggregate said.",
        )}
      </MissionShell>
    );
  }

  return null;
}

function QuestionHeader({
  index,
  total,
  question,
}: {
  index: number;
  total: number;
  question: NormQuestion;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">
        Situation {index + 1} of {total}
      </p>
      <p className="mt-3 text-lg leading-relaxed text-chalk">{question.situation}</p>
    </>
  );
}

/**
 * One bar of the prediction comparison. The state label is `ShiftReveal`'s job.
 * The prototype tag is not: it stays welded to the bar it describes, because
 * that is the surface making the claim and a footnote further down the page is
 * easy to read past.
 */
function Bar({
  value,
  accent,
  tagged,
}: {
  value: number;
  accent: "quest" | "volt";
  tagged?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-mist">
          {tagged ? (
            <span className="rounded-full border border-gold-500/30 bg-gold-500/12 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-gold-400">
              Prototype data
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            "font-display text-xl font-extrabold tabular-nums",
            accent === "volt" ? "text-volt-300" : "text-quest-300",
          )}
        >
          {value}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-1000 ease-out",
            accent === "volt" ? "bg-volt-500" : "bg-quest-500",
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
