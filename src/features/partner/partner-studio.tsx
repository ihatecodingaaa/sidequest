"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Blocks,
  Building2,
  Check,
  Clock,
  Eye,
  HeartHandshake,
  Info,
  MapPin,
  ScanLine,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_TEXT, type Accent } from "@/lib/accent";
import { sanitiseText } from "@/lib/format";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Chip, ProvenanceTag } from "@/components/ui/primitives";
import type { MissionType } from "@/types/mission";

/**
 * Partner studio.
 *
 * A demonstration of how an organisation would author a SIDEQUEST mission,
 * built to answer the scalability question a judge will ask: does this only
 * work because the team wrote the content by hand?
 *
 * Deliberately not an admin backend. Nothing here is saved, submitted or
 * published, and the screen says so. The point is the shape of the workflow.
 */

interface Template {
  id: MissionType | "event";
  label: string;
  blurb: string;
  icon: LucideIcon;
  accent: Accent;
  /** What the organisation has to supply. */
  inputs: string[];
  /** What SIDEQUEST generates from that. */
  produces: string[];
  example: string;
}

const TEMPLATES: Template[] = [
  {
    id: "quick",
    label: "Decision Scenario",
    blurb: "A branching two minute situation with a debrief.",
    icon: ScanLine,
    accent: "quest",
    inputs: ["The situation", "Three to five realistic choices", "What each one leads to"],
    produces: ["A playable scenario", "XP and skill awards", "A link to your own resources"],
    example: "A bank writes the call its customers actually receive.",
  },
  {
    id: "build",
    label: "Norm Challenge",
    blurb: "Ask what people assume, then show what they said.",
    icon: Eye,
    accent: "volt",
    inputs: ["A behaviour to measure", "Your own survey result", "One line of interpretation"],
    produces: ["A predict-then-reveal mission", "Aggregate charts", "A provenance label on the data"],
    example: "A school runs the questions with its own cohort and shows the real gap.",
  },
  {
    id: "field",
    label: "Field Quest",
    blurb: "An activity at a real place, with a check-in.",
    icon: MapPin,
    accent: "pulse",
    inputs: ["Venue and area", "The tasks", "A check-in code or QR"],
    produces: ["A mission card in the area feed", "Check-in with a manual fallback", "Completion tracking"],
    example: "A roadshow gives visitors something to do rather than a flyer.",
  },
  {
    id: "boss",
    label: "Build Challenge",
    blurb: "A design brief that young people answer.",
    icon: Blocks,
    accent: "gold",
    inputs: ["The problem", "Hard constraints", "How entries get read"],
    produces: ["A brief page", "A submission form", "Entries in each participant's passport"],
    example: "A retailer asks how to reduce missed scans without profiling anyone.",
  },
  {
    id: "crew",
    label: "Crew Quest",
    blurb: "Something a group finishes together, asynchronously.",
    icon: Users,
    accent: "coral",
    inputs: ["The group goal", "What each member contributes", "A target"],
    produces: ["A shared crew objective", "Weekly progress", "Crew recognition"],
    example: "A CCA sets a challenge its members chip away at over a week.",
  },
  {
    id: "service",
    label: "Service Opportunity",
    blurb: "Real volunteering, run by your organisation.",
    icon: HeartHandshake,
    accent: "volt",
    inputs: ["What volunteers do", "Dates and location", "Your own signup link"],
    produces: ["A listing in Missions", "A handoff to your signup", "Community Action credit"],
    example: "An NGO lists sessions it is actually short of people for.",
  },
];

const AUDIENCES = ["13-15", "16-18", "19-25", "26+"] as const;

export function PartnerStudio() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [audience, setAudience] = useState<string[]>(["16-18"]);
  const [previewed, setPreviewed] = useState(false);

  const toggleAudience = (band: string) =>
    setAudience((current) =>
      current.includes(band) ? current.filter((value) => value !== band) : [...current, band],
    );

  return (
    <div>
      <PageHeader
        eyebrow="Partner studio"
        title="Author a mission"
        lede="How an organisation would put its own prevention work into SIDEQUEST, without the team writing it for them."
      />

      <div className="sq-card mb-6 flex gap-3 p-4">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-400" />
        <p className="text-sm leading-relaxed text-mist">
          This is a walkthrough, not a live console. Nothing here is saved, submitted or published,
          and no organisation has an account. It exists to show that the mission formats are
          templates rather than one-off content.
        </p>
      </div>

      {/* Step 1: template */}
      <section className="mb-8">
        <StepHeading index={1} title="Pick a format" />
        <ul className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((option) => {
            const selected = template?.id === option.id;
            const Icon = option.icon;

            return (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setTemplate(selected ? null : option);
                    setPreviewed(false);
                  }}
                  className={cn(
                    "sq-pressable flex h-full w-full items-start gap-3 rounded-2xl border p-4 text-left",
                    selected
                      ? "border-quest-400 bg-quest-500/10"
                      : "border-white/10 bg-white/4 hover:bg-white/7",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl",
                      ACCENT_BG_SOFT[option.accent],
                    )}
                  >
                    <Icon aria-hidden className={cn("size-5", ACCENT_TEXT[option.accent])} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-bold text-chalk">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-muted">
                      {option.blurb}
                    </span>
                  </span>
                  {selected ? (
                    <Check aria-hidden className="size-5 shrink-0 text-quest-300" strokeWidth={3} />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {template ? (
        <>
          {/* What the template asks for */}
          <section className="mb-8">
            <StepHeading index={2} title="What you supply, what SIDEQUEST builds" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sq-card p-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-faint">
                  <Building2 aria-hidden className="size-3.5" />
                  You supply
                </h3>
                <ul className="mt-3 space-y-2">
                  {template.inputs.map((input) => (
                    <li key={input} className="flex gap-2.5 text-sm leading-relaxed text-mist">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-white/25" />
                      {input}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sq-card p-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-faint">
                  <Sparkles aria-hidden className="size-3.5" />
                  SIDEQUEST builds
                </h3>
                <ul className="mt-3 space-y-2">
                  {template.produces.map((output) => (
                    <li key={output} className="flex gap-2.5 text-sm leading-relaxed text-mist">
                      <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-volt-400" />
                      {output}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{template.example}</p>
          </section>

          {/* Step 3: draft */}
          <section className="mb-8">
            <StepHeading index={3} title="Draft it" />

            <label className="block">
              <span className="text-sm font-semibold text-chalk">Mission title</span>
              <input
                value={title}
                onChange={(event) => setTitle(sanitiseText(event.target.value, 70))}
                placeholder="Make self-checkout safer"
                maxLength={70}
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-chalk placeholder:text-faint focus:border-quest-400 focus:outline-none"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-chalk">
                The question or situation
              </span>
              <textarea
                value={question}
                onChange={(event) => setQuestion(sanitiseText(event.target.value, 280))}
                rows={3}
                maxLength={280}
                placeholder="How could we reduce missed scans while preserving customer privacy?"
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-base leading-relaxed text-chalk placeholder:text-faint focus:border-quest-400 focus:outline-none"
              />
            </label>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-chalk">Audience</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {AUDIENCES.map((band) => (
                  <button
                    key={band}
                    type="button"
                    aria-pressed={audience.includes(band)}
                    onClick={() => toggleAudience(band)}
                    className={cn(
                      "sq-pressable min-h-11 rounded-full border px-4 text-sm font-semibold",
                      audience.includes(band)
                        ? "border-volt-500/50 bg-volt-500/12 text-volt-300"
                        : "border-white/10 bg-white/4 text-mist hover:bg-white/7",
                    )}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </fieldset>

            <Button
              variant="volt"
              size="lg"
              full
              className="mt-5 lg:w-auto lg:px-10"
              onClick={() => setPreviewed(true)}
            >
              Preview the mission card
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </section>

          {/* Step 4: preview */}
          {previewed ? (
            <section className="animate-rise mb-8">
              <StepHeading index={4} title="What a young person would see" />

              <div className="sq-card max-w-md p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip accent={template.accent}>{template.label}</Chip>
                  <ProvenanceTag provenance="partner-concept" compact />
                </div>
                <h3 className="mt-3 font-display text-lg leading-tight font-bold text-chalk">
                  {title || "Untitled mission"}
                </h3>
                <p className="mt-1.5 text-sm leading-snug text-muted">
                  {question || "No question written yet."}
                </p>
                <div className="mt-3.5 flex items-center gap-3 text-xs font-semibold text-faint">
                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden className="size-3.5" />
                    Set by duration
                  </span>
                  <span className={ACCENT_TEXT[template.accent]}>XP set by difficulty</span>
                  <span>Ages {audience.length ? audience.join(", ") : "not set"}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-coral-500/25 bg-coral-500/8 p-4">
                <p className="text-sm leading-relaxed text-mist">
                  Before anything like this went live, a real deployment would need review by the
                  organisation and by SIDEQUEST: content accuracy, age suitability, no profiling of
                  people, and no activity that puts a young person in a risky situation. That review
                  step is part of the model, not an afterthought.
                </p>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <p className="sq-card px-5 py-10 text-center text-sm text-muted">
          Pick a format above to see what authoring one looks like.
        </p>
      )}

      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mist hover:text-chalk"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to the app
      </Link>
    </div>
  );
}

function StepHeading({ index, title }: { index: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-quest-500/15 font-display text-sm font-bold text-quest-300">
        {index}
      </span>
      <h2 className="text-lg font-bold tracking-tight text-chalk">{title}</h2>
    </div>
  );
}
