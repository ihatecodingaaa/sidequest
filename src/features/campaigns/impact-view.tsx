import { Info, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { ProvenanceTag } from "@/components/ui/primitives";
import {
  DEMO_FUNNEL,
  DEMO_MEASURES,
  IMPACT_DISCLAIMER,
  MEASUREMENT_EXCLUSIONS,
  MEASUREMENT_SCHEMA,
} from "@/data/campaigns/impact";
import type { Campaign } from "@/types/campaign";

/**
 * What a pilot could measure.
 *
 * Not a dashboard and not surveillance. The argument this page makes is that a
 * Campaign can answer questions a roadshow head-count cannot, and every figure
 * carries a demo label so nobody can mistake the demonstration for evidence.
 */
export function ImpactView({ campaign }: { campaign: Campaign }) {
  return (
    <div>
      <PageHeader
        eyebrow="Campaign"
        title="What a pilot could measure"
        lede="Most activations can report how many people showed up. A Campaign can report what changed."
      />

      <div className="mb-7 flex gap-3 rounded-3xl border border-gold-500/30 bg-gold-500/8 p-4">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-400" />
        <div>
          <h2 className="font-display text-base font-bold text-gold-400">Demo data</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-mist">{IMPACT_DISCLAIMER}</p>
        </div>
      </div>

      {/* Funnel */}
      <section aria-labelledby="funnel" className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 id="funnel" className="text-lg font-bold tracking-tight text-chalk">
            Participation
          </h2>
          <ProvenanceTag provenance="demo-aggregate" compact />
        </div>

        <ul className="space-y-2.5">
          {DEMO_FUNNEL.map((step, index) => (
            <li key={step.id} className="sq-card p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-chalk">{step.label}</p>
                <p
                  className={cn(
                    "shrink-0 font-display text-xl font-extrabold tabular-nums",
                    index === DEMO_FUNNEL.length - 1 ? "text-volt-300" : "text-quest-300",
                  )}
                >
                  {step.value}%
                </p>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className={cn(
                    "h-full rounded-full",
                    index === DEMO_FUNNEL.length - 1 ? "bg-volt-500" : "bg-quest-500",
                  )}
                  style={{ width: `${step.value}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">{step.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Behavioural measures */}
      <section aria-labelledby="measures" className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 id="measures" className="text-lg font-bold tracking-tight text-chalk">
            Beyond attendance
          </h2>
          <ProvenanceTag provenance="demo-aggregate" compact />
        </div>

        <ul className="space-y-3">
          {DEMO_MEASURES.map((measure) => (
            <li key={measure.id} className="sq-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-faint">
                {measure.chapter}
              </p>
              <h3 className="mt-1.5 font-display text-base leading-tight font-bold text-chalk">
                {measure.headline}
              </h3>

              <ul className="mt-4 space-y-3">
                {measure.comparison.map((entry, index) => (
                  <li key={entry.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-mist">{entry.label}</span>
                      <span
                        className={cn(
                          "font-display text-lg font-extrabold tabular-nums",
                          index === 0 ? "text-quest-300" : "text-volt-300",
                        )}
                      >
                        {entry.value}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/8">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          index === 0 ? "bg-quest-500" : "bg-volt-500",
                        )}
                        style={{ width: `${entry.value}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm leading-relaxed text-mist">{measure.interpretation}</p>
              <p className="mt-2.5 text-xs leading-relaxed text-faint">{measure.caveat}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Schema */}
      <section aria-labelledby="schema" className="mb-8">
        <h2 id="schema" className="mb-3 text-lg font-bold tracking-tight text-chalk">
          What a real deployment would record
        </h2>
        <ul className="space-y-2">
          {MEASUREMENT_SCHEMA.map((entry) => (
            <li key={entry.field} className="sq-card-flat p-3.5">
              <p className="text-sm font-semibold text-chalk">{entry.field}</p>
              <p className="mt-0.5 text-xs text-muted">{entry.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sq-card p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-400" />
          <div>
            <h2 className="font-display text-base font-bold text-chalk">
              And what it would never record
            </h2>
            <ul className="mt-3 space-y-2">
              {MEASUREMENT_EXCLUSIONS.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-mist">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-coral-400" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ButtonLink href={`/campaigns/${campaign.slug}`} variant="secondary">
          Back to the Campaign
        </ButtonLink>
      </div>
    </div>
  );
}
