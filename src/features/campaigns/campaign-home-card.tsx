"use client";

import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { Chip, ProgressBar, ProvenanceTag } from "@/components/ui/primitives";
import { CAMPAIGNS } from "@/data/campaigns";
import { campaignFraction, completedPhysicalCount, physicalChapters } from "@/lib/campaign";
import { useProfile } from "@/hooks/use-profile";

/**
 * The Campaign entry point on Home.
 *
 * Shows the flagship, and switches to a resume card once somebody has started
 * it, because the most common way back into a Campaign is a participant
 * reopening the app on the bus home.
 */
export function CampaignHomeCard() {
  const { profile, ready } = useProfile();
  const campaign = CAMPAIGNS[0];
  if (!campaign) return null;

  const progress = ready ? profile.campaigns?.[campaign.id] : undefined;
  const stations = physicalChapters(campaign);
  const done = progress ? completedPhysicalCount(campaign, progress) : 0;

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="sq-card sq-pressable group relative block overflow-hidden p-4 hover:border-white/16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-14 size-48 rounded-full bg-coral-500/12 blur-3xl"
      />

      <div className="relative flex flex-wrap items-center gap-1.5">
        <Chip accent={campaign.accent}>Campaign</Chip>
        <ProvenanceTag provenance={campaign.provenance} compact />
      </div>

      <h3 className="relative mt-3 font-display text-xl leading-tight font-extrabold text-chalk">
        {campaign.title}
      </h3>
      <p className="relative mt-1.5 text-sm leading-snug text-muted">
        {progress
          ? `${done} of ${stations.length} chapters done. Pick up where you left off.`
          : campaign.subtitle}
      </p>

      {progress ? (
        <div className="relative mt-3.5">
          <ProgressBar
            accent={campaign.accent}
            value={campaignFraction(campaign, progress)}
            label={`${campaign.title} progress`}
          />
        </div>
      ) : (
        <div className="relative mt-3.5 flex items-center gap-3 text-xs font-semibold text-faint">
          <span className="inline-flex items-center gap-1.5">
            <QrCode aria-hidden className="size-3.5" />
            {stations.length} stations
          </span>
          <span className={ACCENT_TEXT[campaign.accent]}>
            About {campaign.estimatedMinutes} min
          </span>
        </div>
      )}

      <p
        className={cn(
          "relative mt-3.5 inline-flex items-center gap-1.5 text-sm font-semibold",
          ACCENT_TEXT[campaign.accent],
        )}
      >
        {progress ? "Continue" : "Start the Campaign"}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </p>
    </Link>
  );
}
