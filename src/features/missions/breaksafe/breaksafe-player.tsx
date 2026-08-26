"use client";

import { useState } from "react";
import { ArrowRight, Blocks, Check, ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { ShiftReveal } from "@/components/reveal/shift-reveal";
import {
  useMissionHost,
  type MissionHost,
} from "@/features/missions/engine/mission-host";
import { CheckoutMock } from "./checkout-mock";
import {
  BREAKSAFE_REVEAL,
  CHECKOUT_HOTSPOTS,
  MAX_PATCHES,
  PATCH_OPTIONS,
  REQUIRED_FINDINGS,
  SCORE_LABELS,
  type CheckoutHotspot,
  type PatchOption,
} from "@/data/breaksafe";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";

type Step = "intro" | "observe" | "patch" | "reveal" | "complete";

/**
 * BREAKSAFE.
 *
 * Three moves: find what makes the honest action hard, choose what to change,
 * then see the same terminal rebuilt. The facial recognition option is present
 * and selectable on purpose, because refusing it once you have read its scores
 * is a stronger lesson than never being offered it.
 */
export function BreaksafePlayer({
  mission,
  host: providedHost,
  onResult,
}: {
  mission: Mission;
  host?: MissionHost;
  onResult?: (result: { patchIds: string[]; avoidedProfiling: boolean }) => void;
}) {
  const host = useMissionHost(mission, providedHost);

  const [step, setStep] = useState<Step>("intro");
  const [found, setFound] = useState<string[]>([]);
  const [inspecting, setInspecting] = useState<CheckoutHotspot | null>(null);
  const [patches, setPatches] = useState<string[]>([]);
  const [result, setResult] = useState<AwardResult | null>(null);

  const exitHref = host.exitHref;

  // Only genuine design problems count towards the requirement. The two decoys
  // are tappable on purpose and explain why they are not the answer.
  const designIssuesFound = found.filter((id) =>
    CHECKOUT_HOTSPOTS.some((hotspot) => hotspot.id === id && hotspot.isDesignIssue),
  ).length;

  const inspect = (hotspot: CheckoutHotspot) => {
    setInspecting(hotspot);
    if (!found.includes(hotspot.id)) setFound((current) => [...current, hotspot.id]);
  };

  const togglePatch = (option: PatchOption) => {
    setPatches((current) => {
      if (current.includes(option.id)) return current.filter((id) => id !== option.id);
      if (current.length >= MAX_PATCHES) return current;
      return [...current, option.id];
    });
  };

  const finish = () => {
    onResult?.({ patchIds: patches, avoidedProfiling: chosePrivacyRespectingSet });
    setResult(host.complete());
    setStep("complete");
  };

  const chosePrivacyRespectingSet =
    patches.length > 0 && patches.every((id) => !PATCH_OPTIONS.find((o) => o.id === id)?.profilesPeople);
  const strongCount = patches.filter(
    (id) => PATCH_OPTIONS.find((option) => option.id === id)?.isStrong,
  ).length;

  /* ------------------------------------------------------------- Intro */

  if (step === "intro") {
    return (
      <MissionShell
        title="BREAKSAFE"
        accent="quest"
        progress={0}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setStep("observe")}>
            Open the terminal
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-6">
          <Chip accent="quest">Hero Mission</Chip>
          <h1 className="mt-4 text-balance-tight font-display text-[2.1rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
            Crime prevention as engineering
          </h1>
          <p className="mt-4 text-base leading-relaxed text-mist">
            This is a self-checkout that quietly pushes people towards the wrong outcome. Your job
            is not to catch anyone. It is to find what makes the safe decision unnecessarily hard,
            then rebuild it.
          </p>

          <div className="sq-card mt-8 flex gap-3 p-4">
            <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-400" />
            <p className="text-sm leading-relaxed text-mist">
              Nothing in this mission identifies, scores or watches a person. Every change you can
              make applies to everybody in the queue equally.
            </p>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Observe */

  if (step === "observe") {
    const enough = designIssuesFound >= REQUIRED_FINDINGS;

    return (
      <MissionShell
        title="BREAKSAFE"
        accent="quest"
        progress={0.3}
        exitHref={exitHref}
        footer={
          <Button
            variant={enough ? "volt" : "secondary"}
            size="lg"
            full
            disabled={!enough}
            onClick={() => setStep("patch")}
          >
            {enough
              ? "Now change something"
              : `Find ${REQUIRED_FINDINGS - designIssuesFound} more design problem${
                  REQUIRED_FINDINGS - designIssuesFound === 1 ? "" : "s"
                }`}
          </Button>
        }
      >
        <div className="animate-rise">
          <h1 className="font-display text-xl leading-tight font-extrabold text-chalk">
            Find what makes the safe decision difficult
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Tap anything that looks like it could push someone the wrong way.
          </p>

          <div className="mt-4">
            <CheckoutMock variant="before" onHotspot={inspect} foundIds={found} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            {Array.from({ length: REQUIRED_FINDINGS }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  index < designIssuesFound ? "bg-volt-500" : "bg-white/10",
                )}
              />
            ))}
            <span className="ml-1 text-xs font-semibold text-faint tabular-nums">
              {Math.min(designIssuesFound, REQUIRED_FINDINGS)}/{REQUIRED_FINDINGS}
            </span>
          </div>

          {inspecting ? (
            <div
              className={cn(
                "animate-rise mt-4 rounded-2xl border p-4",
                inspecting.isDesignIssue
                  ? "border-volt-500/30 bg-volt-500/8"
                  : "border-coral-500/30 bg-coral-500/8",
              )}
            >
              <div className="flex items-center gap-2">
                {inspecting.isDesignIssue ? (
                  <Check aria-hidden className="size-4 shrink-0 text-volt-300" strokeWidth={3} />
                ) : (
                  <X aria-hidden className="size-4 shrink-0 text-coral-300" strokeWidth={3} />
                )}
                <p
                  className={cn(
                    "font-display text-base leading-tight font-bold",
                    inspecting.isDesignIssue ? "text-volt-300" : "text-coral-300",
                  )}
                >
                  {inspecting.finding}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mist">{inspecting.explanation}</p>
            </div>
          ) : null}
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------- Patch */

  if (step === "patch") {
    return (
      <MissionShell
        title="BREAKSAFE"
        accent="quest"
        progress={0.65}
        exitHref={exitHref}
        footer={
          <Button
            variant={patches.length ? "volt" : "secondary"}
            size="lg"
            full
            disabled={patches.length === 0}
            onClick={() => setStep("reveal")}
          >
            {patches.length ? "Rebuild the terminal" : "Choose at least one change"}
          </Button>
        }
      >
        <div className="animate-rise">
          <h1 className="font-display text-xl leading-tight font-extrabold text-chalk">
            Pick up to {MAX_PATCHES} changes
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Every option is scored on more than prevention. Read the trade-off before you commit.
          </p>

          <div className="mt-4 space-y-3">
            {PATCH_OPTIONS.map((option) => {
              const selected = patches.includes(option.id);
              const full = patches.length >= MAX_PATCHES && !selected;

              return (
                <div
                  key={option.id}
                  className={cn(
                    "rounded-2xl border transition-colors duration-300",
                    selected
                      ? option.profilesPeople
                        ? "border-coral-500/50 bg-coral-500/8"
                        : "border-volt-500/40 bg-volt-500/8"
                      : "border-white/10 bg-white/4",
                    full && "opacity-45",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => togglePatch(option)}
                    disabled={full}
                    aria-pressed={selected}
                    className="sq-pressable flex w-full items-start gap-3 p-4 text-left"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border transition-colors",
                        selected
                          ? option.profilesPeople
                            ? "border-coral-400 bg-coral-500 text-ink-900"
                            : "border-volt-400 bg-volt-500 text-ink-900"
                          : "border-white/20",
                      )}
                    >
                      {selected ? <Check aria-hidden className="size-4" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base leading-tight font-bold text-chalk">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-sm leading-snug text-muted">
                        {option.description}
                      </span>
                    </span>
                  </button>

                  <div className="border-t border-white/8 px-4 py-3">
                    <ScoreRow option={option} />
                    {selected ? (
                      <p
                        className={cn(
                          "animate-rise mt-3 text-sm leading-relaxed",
                          option.profilesPeople ? "text-coral-300" : "text-mist",
                        )}
                      >
                        {option.verdict}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------ Reveal */

  if (step === "reveal") {
    return (
      <MissionShell
        title="BREAKSAFE"
        accent="quest"
        progress={0.92}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={finish}>
            Finish mission
          </Button>
        }
      >
        <div className="animate-rise">
          <ShiftReveal
            layout="side-by-side"
            accent="volt"
            beforeLabel="Before"
            afterLabel="After"
            before={<CheckoutMock variant="before" />}
            after={<CheckoutMock variant="after" patches={patches} />}
          />

          <div className="animate-pop mt-7 rounded-3xl border border-quest-500/30 bg-quest-500/8 p-5 text-center">
            <p className="font-display text-xl leading-[1.15] font-extrabold tracking-tight text-chalk">
              {BREAKSAFE_REVEAL.headline}
            </p>
            <p className="mt-3 font-display text-base font-bold text-volt-300">
              {BREAKSAFE_REVEAL.body}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-mist">{BREAKSAFE_REVEAL.detail}</p>
          </div>

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">
              What you changed
            </h2>
            <ul className="mt-3 space-y-2.5">
              {patches.map((id) => {
                const option = PATCH_OPTIONS.find((entry) => entry.id === id);
                if (!option) return null;
                return (
                  <li
                    key={id}
                    className={cn(
                      "rounded-2xl border p-3.5",
                      option.profilesPeople
                        ? "border-coral-500/30 bg-coral-500/8"
                        : "border-white/10 bg-white/4",
                    )}
                  >
                    <p className="text-sm font-bold text-chalk">{option.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{option.verdict}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          <div
            className={cn(
              "mt-5 flex gap-3 rounded-2xl border p-4",
              chosePrivacyRespectingSet
                ? "border-volt-500/25 bg-volt-500/8"
                : "border-coral-500/25 bg-coral-500/8",
            )}
          >
            <Blocks
              aria-hidden
              className={cn(
                "mt-0.5 size-5 shrink-0",
                chosePrivacyRespectingSet ? "text-volt-300" : "text-coral-300",
              )}
            />
            <p className="text-sm leading-relaxed text-mist">
              {chosePrivacyRespectingSet
                ? strongCount >= 2
                  ? "You fixed the environment without identifying a single person, and you picked the changes that address why the mistake happens rather than who makes it."
                  : "Nothing you selected profiles anybody. The strongest set also removes the ambiguity that causes the mistake in the first place."
                : "You included a change that works by identifying people. It scores badly on privacy and fairness for a reason: it treats every shopper as a suspect to solve a problem that is mostly caused by unclear feedback."}
            </p>
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ---------------------------------------------------------- Complete */

  if (step === "complete" && result) {
    return (
      <MissionShell title="BREAKSAFE" accent="quest" progress={1} exitHref={exitHref}>
        {host.renderComplete(
          result,
          "You diagnosed a system, then changed it without profiling anybody.",
        )}
      </MissionShell>
    );
  }

  return null;
}

function ScoreRow({ option }: { option: PatchOption }) {
  return (
    <ul className="grid grid-cols-5 gap-1.5">
      {SCORE_LABELS.map(({ key, label }) => {
        const score = option.scores[key];
        const poor = score <= 2;
        return (
          <li key={key} className="text-center">
            <span className="block text-[0.55rem] font-semibold uppercase tracking-wide text-faint">
              {label}
            </span>
            <span className="mt-1 flex justify-center gap-0.5" aria-label={`${label}: ${score} of 5`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  aria-hidden
                  className={cn(
                    "h-1 w-1 rounded-full",
                    index < score ? (poor ? "bg-coral-400" : "bg-volt-400") : "bg-white/15",
                  )}
                />
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
