import { Phone, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_BORDER, ACCENT_TEXT } from "@/lib/accent";
import { OFFICIAL_RESOURCES } from "@/lib/official-links";
import { PageHeader } from "@/components/layout/app-shell";
import { ExternalLink } from "@/components/ui/primitives";

/**
 * SAFE.
 *
 * Deliberately the plainest screen in the app: large targets, no decoration
 * competing for attention, and nothing between the user and the agency that
 * owns the job. SIDEQUEST takes no reports and stores nothing from here.
 */
export function SafeScreen() {
  const emergency = OFFICIAL_RESOURCES.filter((item) => item.priority !== "standard");
  const standard = OFFICIAL_RESOURCES.filter((item) => item.priority === "standard");

  return (
    <div>
      <PageHeader
        eyebrow="Pillar three"
        title="Safe"
        lede="Official Singapore services, one tap away. SIDEQUEST connects you to them and stays out of the way."
      />

      <section aria-label="Urgent help" className="space-y-3">
        {emergency.map((resource) => (
          <ExternalLink
            key={resource.id}
            href={resource.href}
            showIcon={false}
            className={cn(
              "flex items-center gap-4 rounded-3xl border p-5 sq-pressable",
              ACCENT_BG_SOFT[resource.accent],
              ACCENT_BORDER[resource.accent],
            )}
          >
            <span
              className={cn(
                "grid size-14 shrink-0 place-items-center rounded-2xl bg-ink-900/50",
                ACCENT_TEXT[resource.accent],
              )}
            >
              <Phone aria-hidden className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("block font-display text-xl font-extrabold", ACCENT_TEXT[resource.accent])}>
                {resource.label}
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-mist">
                {resource.description}
              </span>
              <span className="mt-1.5 block font-display text-lg font-bold text-chalk tabular-nums">
                {resource.displayTarget}
              </span>
            </span>
          </ExternalLink>
        ))}
      </section>

      <h2 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
        Official services
      </h2>

      <ul className="grid gap-2.5 lg:grid-cols-2">
        {standard.map((resource) => (
          <li key={resource.id}>
            <ExternalLink
              href={resource.href}
              showIcon={false}
              className="sq-card sq-pressable flex min-h-20 items-center gap-3.5 p-4 hover:border-white/16"
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-2xl",
                  ACCENT_BG_SOFT[resource.accent],
                  ACCENT_TEXT[resource.accent],
                )}
              >
                <ShieldCheck aria-hidden className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold text-chalk">
                  {resource.label}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">
                  {resource.description}
                </span>
                <span className="mt-1 block text-xs text-faint">{resource.handoff}</span>
              </span>
            </ExternalLink>
          </li>
        ))}
      </ul>

      <section className="sq-card mt-8 p-5">
        <h2 className="font-display text-base font-bold text-chalk">
          What SIDEQUEST deliberately does not do
        </h2>
        <ul className="mt-3 space-y-2.5">
          {[
            "Receive crime reports. Reports go to the Police, through the Police.",
            "Store anything about an incident, a location or a person.",
            "Ask you to photograph, follow, record or confront anybody.",
            "Rank people, places or neighbourhoods by risk.",
          ].map((line) => (
            <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-mist">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-coral-400" />
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Numbers and links on this screen were checked against the official sites on 25 August
          2026. If anything here looks out of date, trust the agency&apos;s own site over this app.
        </p>
      </section>
    </div>
  );
}
