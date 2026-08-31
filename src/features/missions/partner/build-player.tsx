"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Info, PenLine, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip, ProvenanceTag } from "@/components/ui/primitives";
import { ChoiceCards } from "@/components/interaction";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { MissionComplete } from "@/features/missions/engine/mission-complete";
import { formatDeadline, sanitiseText } from "@/lib/format";
import { composeEntry, getChallengeForMission } from "@/data/partner-challenges";
import { useAppStore } from "@/store/app-store";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";

/**
 * The Partner Challenge builder.
 *
 * ---
 *
 * ## Why the blank box went
 *
 * This mission used to open on a title field and a six row, forty character
 * minimum textarea. Testers named typing as the thing that made SIDEQUEST feel
 * tedious, and this was the longest single piece of required typing anywhere in
 * the product. It also asked more of the player than the brief actually wanted:
 * a blank box asks somebody to invent the problem *and* the answer with nothing
 * to push against, which is a harder creative task than a design one.
 *
 * The mission is now three choices: what is wrong, what you would change, and
 * which idea that leans on. Those are the three questions a design submission
 * consists of, and a young person answering them has authored the same thing
 * the form was asking them to write out longhand.
 *
 * ## What had to survive
 *
 * The mission's `behaviouralHook` is self-efficacy: producing a solution rather
 * than receiving one changes how capable somebody believes they are. That only
 * holds if the player is genuinely producing something, so the combination is
 * theirs. Four frictions against six changes is twenty-four pairings, the entry
 * names both halves, and "Add my own words" sits one tap away on the preview
 * for anybody who wants to say something the options could not hold.
 *
 * ## No option here works by watching people
 *
 * The brief forbids identifying shoppers, and BREAKSAFE spends a whole mission
 * on why. Offering facial recognition as a selectable design move here would
 * have quietly contradicted both, so there is no such option. The constraints
 * on the brief screen still say it out loud.
 */

type Step = "brief" | "problem" | "move" | "principle" | "preview" | "complete";

export function BuildPlayer({ mission }: { mission: Mission }) {
  const challenge = getChallengeForMission(mission.id);
  const addSubmission = useAppStore((state) => state.addSubmission);
  const completeMission = useAppStore((state) => state.completeMission);

  const [step, setStep] = useState<Step>("brief");
  const [problemId, setProblemId] = useState<string | null>(null);
  const [moveId, setMoveId] = useState<string | null>(null);
  const [principleId, setPrincipleId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [result, setResult] = useState<AwardResult | null>(null);

  const exitHref = `/missions/${mission.id}`;

  if (!challenge) {
    return (
      <MissionShell title={mission.title} exitHref={exitHref}>
        <p className="py-10 text-center text-sm text-muted">This challenge is not available.</p>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------- Brief */

  if (step === "brief") {
    return (
      <MissionShell
        title={mission.title}
        accent="gold"
        progress={0.2}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setStep("problem")}>
            Design your answer
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip accent="gold">Prototype Partner Challenge</Chip>
            <ProvenanceTag provenance={challenge.provenance} compact />
          </div>

          <h1 className="mt-4 text-balance-tight font-display text-[2rem] leading-[1.1] font-extrabold tracking-tight text-chalk">
            {challenge.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-mist">{challenge.question}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-faint">
            <span>Set by: {challenge.owner}</span>
            <span aria-hidden>&middot;</span>
            <span>{formatDeadline(challenge.deadline)}</span>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-coral-500/25 bg-coral-500/8 p-4">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-coral-300" />
            <p className="text-sm leading-relaxed text-mist">
              No organisation has commissioned this challenge. It is a prototype brief written by
              the SIDEQUEST team to show how a partner challenge would work.
            </p>
          </div>

          <Section title="Context">
            {challenge.context.map((line) => (
              <p key={line} className="text-sm leading-relaxed text-mist">
                {line}
              </p>
            ))}
          </Section>

          <Section title="Constraints">
            <ul className="space-y-2">
              {challenge.constraints.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-mist">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-400" />
                  {line}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Behavioural notes">
            <ul className="space-y-2">
              {challenge.behaviouralNotes.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-mist">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-quest-400" />
                  {line}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Reward concept">
            <p className="text-sm leading-relaxed text-mist">{challenge.rewardConcept}</p>
          </Section>

          <Section title="What others submitted">
            <p className="mb-2.5 text-xs text-faint">
              Prototype entries, written for the demo. Not real submissions.
            </p>
            <ul className="space-y-2">
              {challenge.sampleEntries.map((entry) => (
                <li key={entry.title} className="sq-card-flat p-3.5">
                  <p className="text-sm font-semibold text-chalk">{entry.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{entry.author}</p>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------- Three choices */

  const problem = challenge.problems.find((entry) => entry.id === problemId) ?? null;
  const composed = problemId && moveId ? composeEntry(challenge, problemId, moveId) : null;
  const principle = challenge.principles.find((entry) => entry.id === principleId) ?? null;

  if (step === "problem") {
    return (
      <BuildStep
        mission={mission}
        exitHref={exitHref}
        index={0}
        title="What is going wrong?"
        lede="Pick the friction you want to design against."
      >
        <ChoiceCards
          options={challenge.problems.map((entry) => ({ id: entry.id, label: entry.label }))}
          legend="What is going wrong?"
          onChoose={(id) => {
            setProblemId(id);
            /* A different friction has a different set of plausible answers. */
            setMoveId(null);
            setStep("move");
          }}
        />
      </BuildStep>
    );
  }

  if (step === "move" && problem) {
    /*
     * Situation-sensitive first, everything else underneath.
     *
     * The changes that answer this particular friction lead, because that is
     * the design judgement the step is asking for. The rest stay visible
     * rather than hidden, because an unexpected pairing is sometimes the
     * interesting entry and a build mission should not rule it out.
     */
    const preferred = problem.moveIds
      .map((id) => challenge.moves.find((entry) => entry.id === id))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    const others = challenge.moves.filter((entry) => !problem.moveIds.includes(entry.id));

    return (
      <BuildStep
        mission={mission}
        exitHref={exitHref}
        index={1}
        title="What would you change?"
        lede="Change the situation, not the person."
        onBack={() => setStep("problem")}
      >
        <ChoiceCards
          options={preferred.map((entry) => ({ id: entry.id, label: entry.label }))}
          legend="What would you change?"
          onChoose={(id) => {
            setMoveId(id);
            setStep("principle");
          }}
        />
        {others.length > 0 ? (
          <>
            <p className="mt-5 text-xs font-semibold tracking-[0.12em] text-faint uppercase">
              Other changes
            </p>
            <ChoiceCards
              className="mt-2.5"
              options={others.map((entry) => ({ id: entry.id, label: entry.label }))}
              legend="Other changes"
              onChoose={(id) => {
                setMoveId(id);
                setStep("principle");
              }}
            />
          </>
        ) : null}
      </BuildStep>
    );
  }

  if (step === "principle") {
    return (
      <BuildStep
        mission={mission}
        exitHref={exitHref}
        index={2}
        title="Which idea is it leaning on?"
        lede="There is more than one defensible answer here."
        onBack={() => setStep("move")}
      >
        <ChoiceCards
          options={challenge.principles.map((entry) => ({
            id: entry.id,
            label: entry.label,
            hint: entry.description,
          }))}
          legend="Which idea is it leaning on?"
          onChoose={(id) => {
            setPrincipleId(id);
            setStep("preview");
          }}
        />
      </BuildStep>
    );
  }

  /* ------------------------------------------------------------- Preview */

  if (step === "preview" && composed && principle && problemId && moveId) {
    const title = sanitiseText(customTitle, 90) || composed.title;
    const note = sanitiseText(customNote, 200);
    const solution = note ? `${composed.solution} ${note}` : composed.solution;

    const submit = () => {
      addSubmission({
        challengeId: challenge.id,
        title,
        solution,
        principleId: principle.id,
        problemId,
        moveId,
      });
      setResult(completeMission(mission.id));
      setStep("complete");
    };

    return (
      <MissionShell
        title={mission.title}
        accent="gold"
        progress={0.9}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={submit}>
            <Send aria-hidden className="size-4" />
            Submit your entry
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep("principle")}
              aria-label="Back a step"
              className="sq-pressable -ml-2 grid size-11 shrink-0 place-items-center rounded-full text-faint hover:text-chalk"
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>
            <p className="text-xs font-bold tracking-[0.12em] text-faint uppercase">Your entry</p>
          </div>

          <div className="sq-card mt-3 p-4">
            <h1 className="font-display text-xl leading-tight font-extrabold tracking-tight text-chalk">
              {title}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-mist">{solution}</p>
            <p className="mt-3 text-xs font-semibold text-gold-400">{principle.label}</p>
          </div>

          {/*
            Honesty about what just happened. A template is not a writer, and a
            screen that lets somebody believe three taps were turned into prose
            by something clever is lying about the part of the product a young
            person might repeat to a friend.

            Said as what it is rather than as what it is not, for the reason
            written out in `quest-builder.tsx`: a disclaimer answers a question
            nobody asked, and naming the template carries the same guarantee.
          */}
          <p className="mt-2.5 flex items-start gap-2 text-xs leading-relaxed text-faint">
            <Sparkles aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            Built from your three choices with a fixed template, and saved on this device.
          </p>

          {!customOpen ? (
            <button
              type="button"
              onClick={() => setCustomOpen(true)}
              className="sq-pressable mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/12 text-sm font-semibold text-mist hover:text-chalk"
            >
              <PenLine aria-hidden className="size-4" />
              Add my own words
            </button>
          ) : (
            <div className="mt-4 space-y-3 rounded-2xl border border-white/12 bg-white/3 p-3.5">
              <p className="text-xs leading-relaxed text-muted">
                Both optional. The entry above is already complete.
              </p>
              <ShortField
                label="Call it something else"
                value={customTitle}
                placeholder={composed.title}
                max={90}
                onChange={setCustomTitle}
              />
              <ShortField
                label="Add a line of your own"
                value={customNote}
                placeholder="The bit the options did not cover"
                max={200}
                onChange={setCustomNote}
              />
            </div>
          )}
        </div>
      </MissionShell>
    );
  }

  /* ---------------------------------------------------------- Complete */

  if (step === "complete" && result) {
    return (
      <MissionShell title={mission.title} accent="gold" progress={1} exitHref={exitHref}>
        <MissionComplete
          mission={mission}
          result={result}
          summary="Submitted. Your entry is now in your Safety Passport."
        />
      </MissionShell>
    );
  }

  return null;
}

/* ------------------------------------------------------------- Internals */

const BUILD_STEPS = ["What is wrong", "What changes", "Which idea"];

function BuildStep({
  mission,
  exitHref,
  index,
  title,
  lede,
  onBack,
  children,
}: {
  mission: Mission;
  exitHref: string;
  index: number;
  title: string;
  lede: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <MissionShell
      title={mission.title}
      accent="gold"
      progress={0.35 + index * 0.18}
      exitHref={exitHref}
    >
      <div className="animate-rise py-2">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back a step"
              className="sq-pressable -ml-2 grid size-11 shrink-0 place-items-center rounded-full text-faint hover:text-chalk"
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>
          ) : null}
          <p className="text-xs font-bold tracking-[0.12em] text-faint uppercase">
            Step {index + 1} of {BUILD_STEPS.length}
          </p>
        </div>

        <h1 className="mt-1 font-display text-2xl leading-tight font-extrabold tracking-tight text-chalk">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{lede}</p>

        {/* Progress by shape and position. Colour is never the only channel. */}
        <div aria-hidden className="mt-3 mb-5 flex gap-1.5">
          {BUILD_STEPS.map((label, position) => (
            <span
              key={label}
              className={
                position <= index
                  ? "h-1 flex-1 rounded-full bg-gold-500"
                  : "h-1 flex-1 rounded-full bg-white/10"
              }
            />
          ))}
        </div>

        {children}
      </div>
    </MissionShell>
  );
}

/**
 * One short line, offered rather than required.
 *
 * `data-input-role` is what `tests/unit/integrity.test.ts` reads to prove this
 * is optional creator expression and not a gameplay requirement that has crept
 * back in. An input without that attribute fails the build.
 */
function ShortField({
  label,
  value,
  placeholder,
  max,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  max: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-[0.08em] text-faint uppercase">{label}</span>
      <input
        data-input-role="optional-creator"
        value={value}
        placeholder={placeholder}
        maxLength={max}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-12 w-full rounded-xl border border-white/12 bg-white/4 px-3.5 text-base text-chalk placeholder:text-faint focus:border-gold-500/60 focus:outline-none"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
        {title}
      </h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}
