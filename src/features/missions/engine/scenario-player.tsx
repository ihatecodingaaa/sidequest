"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Lightbulb, MessageSquare } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { MissionShell } from "./mission-shell";
import { useMissionHost, type MissionHost } from "./mission-host";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";
import type { Scenario, ScenarioBeat, ScenarioChoice } from "@/types/scenario";

type Phase = "intro" | "playing" | "outcome" | "debrief" | "complete";

const TONE_RING: Record<NonNullable<ScenarioChoice["tone"]>, string> = {
  safe: "hover:border-volt-500/40",
  risky: "hover:border-coral-500/40",
  neutral: "hover:border-white/20",
};

/**
 * The shared branching player.
 *
 * Every non-hero mission runs on this, driven entirely by data, so adding a
 * new scenario is a fixture change rather than a component.
 */
export function ScenarioPlayer({
  mission,
  scenario,
  host: providedHost,
}: {
  mission: Mission;
  scenario: Scenario;
  /** Supplied by a Campaign chapter. Absent means the standalone route. */
  host?: MissionHost;
}) {
  const host = useMissionHost(mission, providedHost);

  const [phase, setPhase] = useState<Phase>("intro");
  const [beatId, setBeatId] = useState(scenario.startBeatId);
  const [history, setHistory] = useState<string[]>([]);
  const [reaction, setReaction] = useState<string | null>(null);
  const [result, setResult] = useState<AwardResult | null>(null);

  const beatMap = useMemo(
    () => new Map(scenario.beats.map((beat) => [beat.id, beat])),
    [scenario.beats],
  );
  const beat = beatMap.get(beatId);

  const progress = useMemo(() => {
    if (phase === "intro") return 0;
    if (phase === "complete") return 1;
    if (phase === "debrief") return 0.92;
    if (phase === "outcome") return 0.8;
    // Rough, and honest about it: scenarios are short and the bar only needs
    // to signal forward motion.
    return Math.min(0.75, 0.15 + history.length * 0.2);
  }, [phase, history.length]);

  const choose = (choice: ScenarioChoice) => {
    const next = beatMap.get(choice.next);
    setHistory((current) => [...current, choice.id]);
    setReaction(choice.reaction ?? null);
    setBeatId(choice.next);
    if (next?.outcome) setPhase("outcome");
  };

  const finish = () => {
    setResult(host.complete());
    setPhase("complete");
  };

  const restart = () => {
    setPhase("playing");
    setBeatId(scenario.startBeatId);
    setHistory([]);
    setReaction(null);
    setResult(null);
  };

  /* ------------------------------------------------------------- Intro */

  if (phase === "intro") {
    return (
      <MissionShell
        title={mission.title}
        accent={mission.accent}
        progress={progress}
        exitHref={host.exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setPhase("playing")}>
            Start
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-6">
          <Chip accent={mission.accent}>{scenario.intro.kicker}</Chip>
          <h1 className="mt-4 text-balance-tight font-display text-3xl leading-tight font-extrabold tracking-tight text-chalk">
            {scenario.intro.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-mist">{scenario.intro.setup}</p>

          <div className="sq-card mt-8 flex gap-3 p-4">
            <Lightbulb aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-400" />
            <p className="text-sm leading-relaxed text-mist">
              There is no trick answer. Pick what you would actually do, then read what it leads to.
            </p>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Outcome */

  if (phase === "outcome" && beat?.outcome) {
    const outcome = beat.outcome;
    const toneColour =
      outcome.kind === "good"
        ? "text-volt-300"
        : outcome.kind === "mixed"
          ? "text-gold-400"
          : "text-coral-300";

    return (
      <MissionShell
        title={mission.title}
        accent={mission.accent}
        progress={progress}
        exitHref={host.exitHref}
        footer={
          <div className="flex gap-2.5">
            <Button variant="secondary" size="lg" onClick={restart}>
              Try again
            </Button>
            <Button size="lg" full className="flex-1" onClick={() => setPhase("debrief")}>
              What this means
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </div>
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
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Debrief */

  if (phase === "debrief") {
    return (
      <MissionShell
        title={mission.title}
        accent={mission.accent}
        progress={progress}
        exitHref={host.exitHref}
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
                <span
                  aria-hidden
                  className="mt-1 size-1.5 shrink-0 rounded-full bg-quest-400"
                />
                <span className="text-sm leading-relaxed text-mist">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </MissionShell>
    );
  }

  /* ---------------------------------------------------------- Complete */

  if (phase === "complete" && result) {
    return (
      <MissionShell
        title={mission.title}
        accent={mission.accent}
        progress={1}
        exitHref={host.exitHref}
      >
        {host.renderComplete(result)}
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------ Beat */

  if (!beat) {
    return (
      <MissionShell title={mission.title} exitHref={host.exitHref}>
        <p className="py-10 text-center text-sm text-muted">
          This scenario branch is missing. Head back and try again.
        </p>
      </MissionShell>
    );
  }

  return (
    <MissionShell
      title={mission.title}
      accent={mission.accent}
      progress={progress}
      exitHref={host.exitHref}
    >
      <BeatView beat={beat} reaction={reaction} onChoose={choose} />
    </MissionShell>
  );
}

export function BeatView({
  beat,
  reaction,
  onChoose,
  disabledChoiceIds = [],
  choiceHint,
}: {
  beat: ScenarioBeat;
  reaction: string | null;
  onChoose: (choice: ScenarioChoice) => void;
  /** Used by REWIND to grey out the path already taken. */
  disabledChoiceIds?: string[];
  choiceHint?: string;
}) {
  return (
    <div key={beat.id} className="animate-rise py-2">
      {beat.slug ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-faint">
          {beat.slug}
        </p>
      ) : null}

      {reaction ? (
        <p className="mb-5 flex gap-2.5 rounded-2xl border border-white/8 bg-white/4 p-3.5 text-sm leading-relaxed text-mist">
          <MessageSquare aria-hidden className="mt-0.5 size-4 shrink-0 text-faint" />
          {reaction}
        </p>
      ) : null}

      {beat.speaker ? (
        <p className="mb-2.5 text-sm font-bold text-quest-300">{beat.speaker}</p>
      ) : null}

      <div className="space-y-3.5">
        {beat.lines.map((line, index) => (
          <p key={index} className="text-lg leading-relaxed text-chalk">
            {line}
          </p>
        ))}
      </div>

      {beat.choices?.length ? (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
            {choiceHint ?? "What do you do?"}
          </p>
          <div className="space-y-2.5">
            {beat.choices.map((choice) => {
              const disabled = disabledChoiceIds.includes(choice.id);
              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChoose(choice)}
                  className={cn(
                    "sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-[0.95rem] leading-snug font-medium text-chalk",
                    disabled
                      ? "cursor-not-allowed opacity-35"
                      : cn("hover:bg-white/7", TONE_RING[choice.tone ?? "neutral"]),
                  )}
                >
                  <span className="flex-1">{choice.label}</span>
                  {disabled ? (
                    <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-wide text-faint">
                      Taken
                    </span>
                  ) : (
                    <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
