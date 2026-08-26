import { ChevronRight, Phone, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { SAFE_PATHS, SAFE_READING, type SafePath } from "@/lib/official-links";
import { ExternalLink } from "@/components/ui/primitives";

/**
 * SAFE.
 *
 * The one screen whose users are, by definition, not calm. Everything here is
 * shaped by that:
 *
 * Four categorised paths rather than eight flat cards, because under acute
 * stress attention narrows and a person picks the first plausible option
 * instead of comparing. Categorising turns one wide decision into two narrow
 * ones.
 *
 * One fragment of text per path, not a sentence. Reading comprehension drops
 * exactly when this screen gets used.
 *
 * Exactly one red element. If everything is urgent, nothing is.
 *
 * A server component with no state, no profile, no campaign data and no
 * network dependency, so it renders instantly and cannot be broken by anything
 * happening elsewhere in the app.
 *
 * Tapping a path does nothing but reveal an official destination. SIDEQUEST
 * never dials, reports, shares location or notifies anyone on its own.
 */
export function SafeScreen() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-[2rem] leading-tight font-extrabold tracking-tight text-chalk lg:text-4xl">
          What do you need?
        </h1>
        <p className="mt-2 text-sm text-mist">
          These go straight to the people whose job it is.
        </p>
      </header>

      <ul className="space-y-3">
        {SAFE_PATHS.map((path) => (
          <li key={path.id}>
            <SafePathCard path={path} />
          </li>
        ))}
      </ul>

      {/* Reading, not help. Deliberately below the paths and visually quieter. */}
      <section className="mt-8">
        <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
          Read up
        </h2>
        <ul className="divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
          {SAFE_READING.map((resource) => (
            <li key={resource.id}>
              <ExternalLink
                href={resource.href}
                showIcon={false}
                className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-chalk">{resource.label}</span>
                  <span className="block truncate text-xs text-muted">
                    {resource.displayTarget}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0 text-faint" />
              </ExternalLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-white/8 p-4">
        <h2 className="text-sm font-bold text-chalk">SIDEQUEST does not take reports</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Everything here opens an official service. We store nothing about an incident, a place
          or a person, and we never ask you to photograph, follow or confront anybody.
        </p>
        <p className="mt-2.5 text-xs text-faint">
          Numbers and links checked against the official sites on 26 August 2026. If anything looks
          out of date, trust the agency&apos;s own site over this app.
        </p>
      </section>
    </div>
  );
}

/**
 * One path.
 *
 * Tone drives colour, and only the emergency path is red. The secondary option
 * sits inside the same card rather than becoming a fifth item in the list, so
 * the top-level decision stays at four.
 */
function SafePathCard({ path }: { path: SafePath }) {
  const emergency = path.tone === "emergency";
  const urgent = path.tone === "urgent";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border",
        emergency
          ? "border-coral-500/40 bg-coral-500/10"
          : urgent
            ? "border-gold-500/30 bg-gold-500/8"
            : "border-white/10 bg-white/4",
      )}
    >
      <ExternalLink
        href={path.primary.href}
        showIcon={false}
        className={cn(
          "flex items-center gap-4 p-5 transition-colors sq-pressable",
          emergency ? "hover:bg-coral-500/15" : urgent ? "hover:bg-gold-500/12" : "hover:bg-white/6",
        )}
      >
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl",
            emergency
              ? "bg-coral-500 text-ink-900"
              : urgent
                ? "bg-gold-500 text-ink-900"
                : "bg-white/8 text-mist",
          )}
        >
          {path.primary.action === "call" ? (
            <Phone aria-hidden className="size-5" />
          ) : (
            <ShieldCheck aria-hidden className="size-5" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-display text-xl leading-tight font-extrabold",
              emergency ? "text-coral-300" : urgent ? "text-gold-400" : "text-chalk",
            )}
          >
            {path.label}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-mist">{path.hint}</span>
        </span>

        <span
          className={cn(
            "shrink-0 font-display text-base font-bold tabular-nums",
            emergency ? "text-coral-300" : urgent ? "text-gold-400" : "text-mist",
          )}
        >
          {path.primary.action === "call" ? path.primary.displayTarget : null}
          {path.primary.action === "open" ? (
            <ChevronRight aria-hidden className="size-5" />
          ) : null}
        </span>
      </ExternalLink>

      {path.secondary ? (
        <ExternalLink
          href={path.secondary.href}
          showIcon={false}
          className="flex min-h-12 items-center gap-2 border-t border-white/8 px-5 py-3 text-sm font-semibold text-mist transition-colors hover:bg-white/4 hover:text-chalk"
        >
          <span className="flex-1">{path.secondary.label}</span>
          <span className="text-xs font-medium text-faint">{path.secondary.displayTarget}</span>
          <ChevronRight aria-hidden className="size-4 shrink-0 text-faint" />
        </ExternalLink>
      ) : null}
    </div>
  );
}

/** Kept for the Safe route's metadata description. */
export const SAFE_DESCRIPTION =
  "Emergency, scam help, reporting and Police services. SIDEQUEST connects you to official Singapore services and stays out of the way.";
