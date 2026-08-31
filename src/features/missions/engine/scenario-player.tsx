"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Lightbulb, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChoiceCards } from "@/components/interaction";
import { Chip } from "@/components/ui/primitives";
import { OutcomeCard } from "@/components/reveal/outcome-card";
import { MissionShell } from "./mission-shell";
import { StoryBeat, useStoryBeat } from "@/components/story/story-beat";
import { WhyThisWorks } from "@/components/reveal/why-this-works";
import { toStoryLines } from "@/types/story";
import { useMissionHost, type MissionHost } from "./mission-host";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";
import type { Scenario, ScenarioBeat, ScenarioChoice } from "@/types/scenario";

type Phase = "intro" | "playing" | "outcome" | "debrief" | "complete";

/*
 * `tone` used to tint the hover border: green for safe, coral for risky.
 *
 * It has been removed rather than ported to `ChoiceCards`, because it was a
 * tell. An option that glows a different colour when you point at it has told
 * you which one the product approves of, before you have chosen, in a mission
 * whose entire premise is finding out what somebody would actually do. It only
 * ever appeared on desktop, since a phone has no hover, so it was also a tell
 * that half the audience never got. The field stays on the data for the
 * debrief; nothing renders it before a choice is made.
 */

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

          {/*
            One line, not a boxed card. The reassurance matters, but it was
            competing with the title for the eye on a screen whose only job is
            to make somebody press Start.
          */}
          <p className="mt-6 flex items-center gap-2.5 text-sm text-muted">
            <Lightbulb aria-hidden className="size-4 shrink-0 text-gold-400" />
            No trick answers. Pick what you would actually do.
          </p>
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Outcome */

  if (phase === "outcome" && beat?.outcome) {
    const outcome = beat.outcome;

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
          {/*
            The outcome beat is a conclusion rather than a scene, so it arrives
            whole. Nothing here is a chat thread, but narrowing the type keeps
            that assumption honest instead of implicit.
          */}
          {toStoryLines(beat.lines).map((line, index) =>
            line.kind === "thread" || line.kind === "exchange" ? null : (
              <p key={index} className="mb-3 text-base leading-relaxed text-mist">
                {line.text}
              </p>
            ),
          )}

          {/*
            One card, one takeaway visible, the rest one tap away.

            This markup existed here and in the other outcome screen, and it
            was the largest single block of text in the product: the audit
            measured 102 to 140 words arriving at once at the end of a branch.
            `OutcomeCard` carries the reasoning.
          */}
          <OutcomeCard outcome={outcome} className="mt-6" />
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

          <WhyThisWorks>{scenario.debrief.mechanism}</WhyThisWorks>
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

      {/*
        The scene plays out one idea at a time and the choices only appear once
        it has finished, so a player cannot answer a question they have not
        finished reading. That ordering is the point: the old version printed
        the whole beat and the options together, which is what made a decision
        feel like the bottom of an essay.
      */}
      {/* Keyed on the beat so a new scene restarts its own reveal. */}
      <BeatScene key={beat.id} lines={beat.lines}>
        {beat.choices?.length ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
              {choiceHint ?? "What do you do?"}
            </p>
            {/*
              A branch already taken stays visible and disabled rather than
              disappearing, because REWIND is about seeing that the path was
              there. `hint` carries that, so the state is in text rather than
              only in opacity.
            */}
            <ChoiceCards
              options={beat.choices.map((choice) => ({
                id: choice.id,
                label: choice.label,
                disabled: disabledChoiceIds.includes(choice.id),
                hint: disabledChoiceIds.includes(choice.id) ? "Taken" : undefined,
              }))}
              legend={choiceHint ?? "What do you do?"}
              onChoose={(id) => {
                const choice = beat.choices?.find((entry) => entry.id === id);
                if (choice) onChoose(choice);
              }}
            />
          </div>
        ) : null}
      </BeatScene>
    </div>
  );
}


/**
 * One scenario beat. The scene plays out an idea at a time and the choices only
 * appear once it has finished, so nobody is asked a question they have not read
 * to the end of. The old version printed the whole beat and the options
 * together, which is what made a decision feel like the bottom of an essay.
 *
 * The advance control is inline here rather than in a footer, because a
 * scenario beat's choices live in the body and adding a second control in the
 * action bar would give the same scene two different ways forward.
 */
function BeatScene({
  lines,
  children,
}: {
  lines: ScenarioBeat["lines"];
  children?: React.ReactNode;
}) {
  const beat = useStoryBeat(lines);
  return (
    <StoryBeat beat={beat} inlineAdvance>
      {children}
    </StoryBeat>
  );
}
