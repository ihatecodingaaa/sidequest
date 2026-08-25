"use client";

import { useState } from "react";
import { ArrowRight, Check, Info, Send } from "lucide-react";
import { z } from "zod";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Chip, ProvenanceTag } from "@/components/ui/primitives";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { MissionComplete } from "@/features/missions/engine/mission-complete";
import { formatDeadline, sanitiseText } from "@/lib/format";
import { getChallengeForMission } from "@/data/partner-challenges";
import { useAppStore } from "@/store/app-store";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";

type Step = "brief" | "form" | "complete";

/** Validation runs on the client because there is no server to trust either. */
const SubmissionSchema = z.object({
  title: z.string().trim().min(6, "Give it a title of at least six characters.").max(90),
  solution: z
    .string()
    .trim()
    .min(40, "Say a bit more. Forty characters minimum, and it helps to be specific.")
    .max(600),
  principleId: z.string().min(1, "Pick the principle your idea leans on."),
});

export function BuildPlayer({ mission }: { mission: Mission }) {
  const challenge = getChallengeForMission(mission.id);
  const addSubmission = useAppStore((state) => state.addSubmission);
  const completeMission = useAppStore((state) => state.completeMission);

  const [step, setStep] = useState<Step>("brief");
  const [title, setTitle] = useState("");
  const [solution, setSolution] = useState("");
  const [principleId, setPrincipleId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AwardResult | null>(null);

  const exitHref = `/missions/${mission.id}`;

  if (!challenge) {
    return (
      <MissionShell title={mission.title} exitHref={exitHref}>
        <p className="py-10 text-center text-sm text-muted">This challenge is not available.</p>
      </MissionShell>
    );
  }

  const submit = () => {
    const parsed = SubmissionSchema.safeParse({ title, solution, principleId });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    addSubmission({
      challengeId: challenge.id,
      title: parsed.data.title,
      solution: parsed.data.solution,
      principleId: parsed.data.principleId,
    });
    setResult(completeMission(mission.id));
    setStep("complete");
  };

  /* ------------------------------------------------------------- Brief */

  if (step === "brief") {
    return (
      <MissionShell
        title={mission.title}
        accent="gold"
        progress={0.2}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setStep("form")}>
            Write your answer
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

  /* -------------------------------------------------------------- Form */

  if (step === "form") {
    return (
      <MissionShell
        title={mission.title}
        accent="gold"
        progress={0.7}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={submit}>
            <Send aria-hidden className="size-4" />
            Submit
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <h1 className="font-display text-2xl leading-tight font-extrabold text-chalk">
            Your answer
          </h1>
          <p className="mt-2 text-sm text-muted">
            Short is fine. Specific beats clever. This is saved on your device and added to your
            Safety Passport.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-semibold text-chalk">Idea title</span>
            <input
              value={title}
              onChange={(event) => {
                setTitle(sanitiseText(event.target.value, 90));
                setErrors((current) => ({ ...current, title: "" }));
              }}
              placeholder="Show the basket like a receipt"
              maxLength={90}
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-chalk placeholder:text-faint focus:border-gold-500 focus:outline-none"
            />
            {errors.title ? (
              <span role="alert" className="mt-1.5 block text-sm text-coral-300">
                {errors.title}
              </span>
            ) : null}
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-chalk">How it works</span>
            <textarea
              value={solution}
              onChange={(event) => {
                setSolution(sanitiseText(event.target.value, 600));
                setErrors((current) => ({ ...current, solution: "" }));
              }}
              rows={6}
              maxLength={600}
              placeholder="What changes, who it helps, and why it does not need to identify anybody."
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-base leading-relaxed text-chalk placeholder:text-faint focus:border-gold-500 focus:outline-none"
            />
            <span className="mt-1 block text-right text-xs text-faint tabular-nums">
              {solution.length}/600
            </span>
            {errors.solution ? (
              <span role="alert" className="mt-1 block text-sm text-coral-300">
                {errors.solution}
              </span>
            ) : null}
          </label>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-chalk">
              Which principle is it leaning on?
            </legend>
            <div className="mt-3 space-y-2">
              {challenge.principles.map((principle) => {
                const selected = principleId === principle.id;
                return (
                  <button
                    key={principle.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setPrincipleId(principle.id);
                      setErrors((current) => ({ ...current, principleId: "" }));
                    }}
                    className={cn(
                      "sq-pressable flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left",
                      selected
                        ? "border-gold-500/50 bg-gold-500/10"
                        : "border-white/10 bg-white/4 hover:bg-white/7",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                        selected ? "border-gold-500 bg-gold-500 text-ink-900" : "border-white/20",
                      )}
                    >
                      {selected ? <Check aria-hidden className="size-3" strokeWidth={3} /> : null}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-chalk">
                        {principle.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {principle.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.principleId ? (
              <p role="alert" className="mt-1.5 text-sm text-coral-300">
                {errors.principleId}
              </p>
            ) : null}
          </fieldset>
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
