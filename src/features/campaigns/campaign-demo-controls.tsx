"use client";

import { useState } from "react";
import { ChevronDown, FastForward, RefreshCw, Shuffle, Sparkles, Unlock } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { useCampaign } from "./use-campaign";
import type { Campaign } from "@/types/campaign";

/**
 * Campaign demo controls.
 *
 * Collapsed by default and clearly labelled, because these are not product
 * features. Judging happens more than once and a physical Campaign has state
 * that would otherwise take fifteen minutes of walking to rebuild, so the team
 * needs to jump to any point in the experience in a couple of taps.
 */
export function CampaignDemoControls({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false);
  const { progress } = useCampaign(campaign);

  const resetCampaign = useAppStore((state) => state.resetCampaign);
  const reassignRoute = useAppStore((state) => state.reassignCampaignRoute);
  const unlockAll = useAppStore((state) => state.unlockAllChapters);
  const advanceClock = useAppStore((state) => state.advanceCampaignClock);

  return (
    <section className="rounded-3xl border border-white/8 bg-white/3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 w-full items-center gap-2.5 px-4 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">
          Demo controls
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "ml-auto size-4 text-faint transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-2.5 border-t border-white/8 p-4">
          <p className="text-xs leading-relaxed text-faint">
            For running this in front of someone. Not part of the product, and not something a
            participant would ever see.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => unlockAll(campaign)} disabled={!progress}>
              <Unlock aria-hidden className="size-4" />
              Unlock all stations
            </Button>

            <Button variant="secondary" onClick={() => reassignRoute(campaign)} disabled={!progress}>
              <Shuffle aria-hidden className="size-4" />
              Assign a new route
            </Button>

            <Button
              variant="secondary"
              onClick={() => advanceClock(campaign.id, 24)}
              disabled={!progress?.completedAt}
            >
              <FastForward aria-hidden className="size-4" />
              Skip forward a day
            </Button>

            <Button
              variant="secondary"
              onClick={() => advanceClock(campaign.id, 24 * 7)}
              disabled={!progress?.completedAt}
            >
              <FastForward aria-hidden className="size-4" />
              Skip forward a week
            </Button>
          </div>

          {progress?.completedAt ? (
            <p className="text-xs text-faint">
              Clock shifted by {Math.round(progress.demoHoursOffset)}h. Follow-ups unlock against
              this offset only in the demo.
            </p>
          ) : (
            <p className="text-xs text-faint">
              Time skips need a completed Campaign, because follow-ups are timed from the finale.
            </p>
          )}

          <Button variant="danger" full onClick={() => resetCampaign(campaign.id)}>
            <RefreshCw aria-hidden className="size-4" />
            Reset this Campaign
          </Button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-faint">
            <Sparkles aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            Resetting clears chapters, the finale, follow-ups and the assigned route. It does not
            touch the XP already added to your profile, which is what a real participant would keep.
          </p>
        </div>
      ) : null}
    </section>
  );
}
