"use client";

import Link from "next/link";
import { ArrowRight, MapPin, QrCode, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_TEXT } from "@/lib/accent";
import { PageHeader } from "@/components/layout/app-shell";
import { Chip, ProgressBar, ProvenanceTag } from "@/components/ui/primitives";
import { CAMPAIGNS } from "@/data/campaigns";
import { campaignFraction, completedPhysicalCount, physicalChapters } from "@/lib/campaign";
import { useProfile } from "@/hooks/use-profile";

export function CampaignList() {
  const { profile, ready } = useProfile();

  return (
    <div>
      <PageHeader
        eyebrow="Campaigns"
        title="Campaigns"
        lede="Story-driven experiences built for real places. Scan a code at a school or a roadshow, play on your phone, and the story keeps going after you leave."
      />

      <ul className="grid gap-3 lg:grid-cols-2">
        {CAMPAIGNS.map((campaign) => {
          const progress = ready ? profile.campaigns?.[campaign.id] : undefined;
          const stations = physicalChapters(campaign);
          const done = progress ? completedPhysicalCount(campaign, progress) : 0;

          return (
            <li key={campaign.id}>
              <Link
                href={`/campaigns/${campaign.slug}`}
                className="sq-card sq-pressable group relative block overflow-hidden p-5 hover:border-white/16"
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-20 -right-16 size-52 rounded-full blur-3xl transition-opacity duration-500",
                    ACCENT_BG_SOFT[campaign.accent],
                  )}
                />

                <div className="relative flex flex-wrap items-center gap-1.5">
                  <Chip accent={campaign.accent}>{campaign.locationType}</Chip>
                  <ProvenanceTag provenance={campaign.provenance} compact />
                </div>

                <h2 className="relative mt-3.5 font-display text-2xl leading-tight font-extrabold tracking-tight text-chalk">
                  {campaign.title}
                </h2>
                <p className="relative mt-1 text-sm font-semibold text-muted">
                  {campaign.subtitle}
                </p>
                <p className="relative mt-3 text-sm leading-relaxed text-mist">
                  {campaign.description}
                </p>

                <div className="relative mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-faint">
                  <span className="inline-flex items-center gap-1.5">
                    <QrCode aria-hidden className="size-3.5" />
                    {stations.length} stations
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users aria-hidden className="size-3.5" />
                    Solo or with friends
                  </span>
                  <span className={ACCENT_TEXT[campaign.accent]}>
                    About {campaign.estimatedMinutes} min
                  </span>
                </div>

                {progress ? (
                  <div className="relative mt-4">
                    <ProgressBar
                      accent={campaign.accent}
                      value={campaignFraction(campaign, progress)}
                      label={`${campaign.title} progress`}
                    />
                    <p className="mt-2 text-xs text-faint">
                      {progress.finaleCompleted
                        ? "Completed"
                        : `${done} of ${stations.length} chapters`}
                    </p>
                  </div>
                ) : (
                  <p className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-quest-300">
                    Start the Campaign
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="sq-card mt-7 flex gap-3 p-5">
        <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-300" />
        <div>
          <h2 className="font-display text-base font-bold text-chalk">
            Built for physical events
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            A Campaign runs across stations in a real space. You scan an ordinary QR code with your
            normal camera, the chapter saves to your phone, and you walk away to play it. Different
            people are sent to different starting stations, so nobody queues in one place, and any
            three of four chapters is enough to finish.
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-mist">
            You can also play the whole thing from here without being at an event.
          </p>
        </div>
      </section>
    </div>
  );
}
