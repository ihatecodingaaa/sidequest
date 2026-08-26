"use client";

import Link from "next/link";
import { Check, Flag, MapPin } from "lucide-react";

import { cn } from "@/lib/cn";
import { SectionHeader } from "@/components/ui/primitives";
import { CAMPAIGNS } from "@/data/campaigns";
import {
  completedPhysicalCount,
  isFullyCompleted,
  physicalChapters,
} from "@/lib/campaign";
import { useProfile } from "@/hooks/use-profile";

/**
 * Campaign participation on the Safety Passport.
 *
 * A Campaign is the closest thing SIDEQUEST has to a real-world contribution:
 * somebody physically went somewhere and worked through it, often with other
 * people. It belongs on the passport next to Build Quest submissions, not
 * buried as a pile of XP.
 */
export function CampaignContributions() {
  const { profile, ready } = useProfile();
  if (!ready) return null;

  const entries = CAMPAIGNS.map((campaign) => ({
    campaign,
    progress: profile.campaigns?.[campaign.id],
  })).filter((entry) => Boolean(entry.progress));

  if (entries.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title="Campaigns"
        subtitle="Story experiences you took part in."
      />

      <ul className="space-y-2.5">
        {entries.map(({ campaign, progress }) => {
          if (!progress) return null;
          const stations = physicalChapters(campaign);
          const done = completedPhysicalCount(campaign, progress);
          const complete = progress.finaleCompleted;
          const allDone = isFullyCompleted(campaign, progress);

          return (
            <li key={campaign.id}>
              <Link
                href={`/campaigns/${campaign.slug}`}
                className="sq-card sq-pressable block p-4 hover:border-white/16"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-2xl",
                      complete ? "bg-volt-500/15 text-volt-300" : "bg-coral-500/12 text-coral-300",
                    )}
                  >
                    {complete ? (
                      <Check aria-hidden className="size-5" strokeWidth={3} />
                    ) : (
                      <Flag aria-hidden className="size-5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-bold text-chalk">
                      {campaign.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {complete
                        ? allDone
                          ? `Completed, all ${stations.length} chapters`
                          : `Completed, ${done} of ${stations.length} chapters`
                        : `${done} of ${stations.length} chapters`}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-faint">
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden className="size-3.5" />
                        {campaign.locationType}
                      </span>
                      <span>{progress.mode === "story" ? "Story mode" : "Quick mode"}</span>
                      {progress.completedFollowUpIds.length ? (
                        <span className="text-volt-300">
                          {progress.completedFollowUpIds.length} follow-up
                          {progress.completedFollowUpIds.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
