"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Mark } from "@/components/layout/wordmark";
import { cn } from "@/lib/cn";
import { AGE_BANDS, type AgeBand, type Interest } from "@/types/core";
import { INTEREST_OPTIONS, NEIGHBOURHOOD_NAMES } from "@/data/neighbourhoods";
import { useAppStore } from "@/store/app-store";

const AGE_COPY: Record<AgeBand, string> = {
  "13-15": "Lower secondary",
  "16-18": "Upper secondary and JC",
  "19-25": "Poly, ITE, uni and first jobs",
  "26+": "Everyone else",
};

const STEPS = ["Welcome", "About you", "Interests", "Area"] as const;

export function Onboarding() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("16-18");
  const [interests, setInterests] = useState<Interest[]>(["scams", "peer-pressure"]);
  const [neighbourhood, setNeighbourhood] = useState<string | null>(null);

  const toggleInterest = (id: Interest) =>
    setInterests((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const finish = () => completeOnboarding({ displayName, ageBand, interests, neighbourhood });

  return (
    <div className="sq-app-bg flex min-h-dvh flex-col">
      <div
        className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-8"
        style={{ paddingTop: "calc(1.5rem + var(--safe-top))" }}
      >
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex flex-1 flex-col gap-1.5">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors duration-500",
                  index <= step ? "bg-quest-500" : "bg-white/10",
                )}
              />
              <span
                className={cn(
                  "text-[0.65rem] font-semibold tracking-wide transition-colors",
                  index === step ? "text-quest-300" : "text-faint",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {step === 0 ? <WelcomeStep /> : null}

        {step === 1 ? (
          <section className="animate-rise flex-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-chalk">
              A bit about you
            </h1>
            <p className="mt-2 text-sm text-mist">
              This changes which missions and stories you see first. Nothing here leaves your phone.
            </p>

            <label className="mt-7 block">
              <span className="text-sm font-semibold text-chalk">What should we call you?</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Optional"
                maxLength={24}
                autoComplete="off"
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-chalk placeholder:text-faint focus:border-quest-400 focus:outline-none"
              />
            </label>

            <fieldset className="mt-7">
              <legend className="text-sm font-semibold text-chalk">How old are you?</legend>
              <div className="mt-3 grid gap-2">
                {AGE_BANDS.map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => setAgeBand(band)}
                    aria-pressed={ageBand === band}
                    className={cn(
                      "sq-pressable flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left",
                      ageBand === band
                        ? "border-quest-400 bg-quest-500/15"
                        : "border-white/10 bg-white/4 hover:bg-white/7",
                    )}
                  >
                    <span>
                      <span className="block font-display text-base font-bold text-chalk">{band}</span>
                      <span className="block text-xs text-muted">{AGE_COPY[band]}</span>
                    </span>
                    {ageBand === band ? (
                      <Check aria-hidden className="size-5 text-quest-300" />
                    ) : null}
                  </button>
                ))}
              </div>
            </fieldset>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="animate-rise flex-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-chalk">
              What are you into?
            </h1>
            <p className="mt-2 text-sm text-mist">
              Pick anything that sounds relevant. You can change this later.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {INTEREST_OPTIONS.map((option) => {
                const selected = interests.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleInterest(option.id)}
                    aria-pressed={selected}
                    className={cn(
                      "sq-pressable min-h-[4.5rem] rounded-2xl border p-3 text-left",
                      selected
                        ? "border-volt-500/50 bg-volt-500/12"
                        : "border-white/10 bg-white/4 hover:bg-white/7",
                    )}
                  >
                    <span
                      className={cn(
                        "block text-sm font-bold",
                        selected ? "text-volt-300" : "text-chalk",
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">
                      {option.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="animate-rise flex-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-chalk">
              Where do you spend time?
            </h1>
            <p className="mt-2 text-sm text-mist">
              Used to surface activities near you. Optional, and you can skip it.
            </p>

            <div className="sq-card mt-5 flex gap-3 p-3.5">
              <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-400" />
              <p className="text-xs leading-relaxed text-mist">
                SIDEQUEST does not ask for your GPS location and never stores coordinates. A
                neighbourhood name is the most specific thing we keep, and it stays on your device.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NEIGHBOURHOOD_NAMES.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setNeighbourhood(neighbourhood === area ? null : area)}
                  aria-pressed={neighbourhood === area}
                  className={cn(
                    "sq-pressable min-h-11 rounded-xl border px-3 text-sm font-medium",
                    neighbourhood === area
                      ? "border-pulse-500/50 bg-pulse-500/12 text-pulse-300"
                      : "border-white/10 bg-white/4 text-mist hover:bg-white/7",
                  )}
                >
                  {area}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Footer controls */}
        <div className="mt-8 flex items-center gap-3">
          {step > 0 ? (
            <Button variant="ghost" size="lg" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft aria-hidden className="size-4" />
              Back
            </Button>
          ) : null}

          {step < STEPS.length - 1 ? (
            <Button size="lg" full className="flex-1" onClick={() => setStep((s) => s + 1)}>
              {step === 0 ? "Get started" : "Continue"}
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          ) : (
            <Button variant="volt" size="lg" full className="flex-1" onClick={finish}>
              <Sparkles aria-hidden className="size-4" />
              Enter SIDEQUEST
            </Button>
          )}
        </div>

        {step === 3 ? (
          <button
            type="button"
            onClick={() => {
              setNeighbourhood(null);
              finish();
            }}
            className="mx-auto mt-3 flex min-h-11 items-center gap-1.5 px-3 text-sm font-medium text-muted hover:text-chalk"
          >
            <MapPin aria-hidden className="size-4" />
            Skip, I will pick later
          </button>
        ) : null}
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <section className="animate-rise flex flex-1 flex-col justify-center py-6">
      <Mark className="size-14" />
      <h1 className="mt-6 font-display text-[2.5rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
        SIDE<span className="text-quest-300">QUEST</span>
      </h1>
      <p className="mt-4 text-balance-tight text-lg leading-snug text-mist">
        Most crime prevention stops at telling you something. This is the part where you get to do
        something about it.
      </p>

      <ul className="mt-8 space-y-3.5">
        {[
          { label: "See", detail: "What is actually happening in Singapore right now." },
          { label: "Play", detail: "Two minute decisions, before they happen for real." },
          { label: "Build", detail: "Redesign the systems that make safe choices hard." },
        ].map((row, index) => (
          <li key={row.label} className="flex gap-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-quest-500/15 font-display text-sm font-bold text-quest-300">
              {index + 1}
            </span>
            <span>
              <span className="block font-display text-base font-bold text-chalk">{row.label}</span>
              <span className="block text-sm text-muted">{row.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
