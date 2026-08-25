import { Radio } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_TEXT } from "@/lib/accent";
import { RADIO_STATIONS } from "@/data/radio";
import { PageHeader } from "@/components/layout/app-shell";
import { ExternalLink } from "@/components/ui/primitives";

/**
 * Radio discovery. A server component: nothing here needs client state, and
 * there is deliberately no player, because SIDEQUEST has no right to stream.
 */
export function RadioScreen() {
  return (
    <div>
      <PageHeader
        eyebrow="Pulse"
        title="Radio"
        lede="Singapore stations, opened in the official player. SIDEQUEST does not stream or rehost any audio."
      />

      <ul className="grid gap-3 lg:grid-cols-2">
        {RADIO_STATIONS.map((station) => (
          <li key={station.id} className="sq-card flex items-center gap-3.5 p-4">
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-2xl",
                ACCENT_BG_SOFT[station.accent],
              )}
            >
              <Radio aria-hidden className={cn("size-5", ACCENT_TEXT[station.accent])} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold text-chalk">
                {station.name}
                <span className="ml-2 text-xs font-semibold text-faint">{station.frequency}</span>
              </p>
              <p className="text-xs font-semibold text-muted">{station.language}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">{station.description}</p>
            </div>

            <ExternalLink
              href={station.officialUrl}
              showIcon={false}
              aria-label={`Listen to ${station.name} on ${station.platform}`}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-white/6 px-4 text-sm font-semibold text-chalk sq-pressable hover:bg-white/10"
            >
              Listen
            </ExternalLink>
          </li>
        ))}
      </ul>

      <div className="sq-card mt-6 p-4">
        <h2 className="font-display text-base font-bold text-chalk">How this works</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Every station opens meLISTEN, Mediacorp&apos;s official listening service, which handles
          playback and rights. SIDEQUEST is not a Mediacorp partner and does not claim to be. If a
          partnership were ever agreed, the same screen could carry programme information and tie
          radio segments to relevant missions.
        </p>
      </div>
    </div>
  );
}
