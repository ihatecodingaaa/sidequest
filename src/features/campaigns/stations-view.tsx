"use client";

import { useEffect, useState } from "react";
import { Printer, QrCode } from "lucide-react";

import { PageHeader } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { physicalChapters } from "@/lib/campaign";
import { useMounted } from "@/hooks/use-profile";
import type { Campaign, CampaignChapter } from "@/types/campaign";

/**
 * Organiser-facing station signs.
 *
 * Prints, or shows on a laptop next to each station. Deliberately not a CMS:
 * it is the one deployment utility a team actually needs on the morning of an
 * event, which is four pieces of paper with a QR and a code on them.
 *
 * The QR encodes an ordinary URL, so a participant scans it with the normal
 * phone camera. There is no in-app scanner to install and nothing to explain.
 * Codes are generated in the browser from the current origin, so the same page
 * produces correct signs on localhost and on the deployed domain without any
 * configuration.
 */
export function StationsView({ campaign }: { campaign: Campaign }) {
  const stations = physicalChapters(campaign);

  return (
    <div>
      <PageHeader
        eyebrow="Organiser"
        title="Station signs"
        lede="One per station. Print them, or open this page on a laptop beside each table."
      />

      <div className="sq-card mb-6 flex gap-3 p-4 print:hidden">
        <Printer aria-hidden className="mt-0.5 size-5 shrink-0 text-quest-300" />
        <div className="text-sm leading-relaxed text-mist">
          <p>
            Each code opens its chapter directly in a normal phone camera. Print duplicates of the
            busiest stations: the same QR can appear on as many signs as you like, and two copies of
            one station halves its queue.
          </p>
          <p className="mt-2 text-xs text-faint">
            Codes are generated from this page&apos;s address, so print them from the address a
            participant would actually visit.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stations.map((chapter) => (
          <StationCard key={chapter.id} campaign={campaign} chapter={chapter} />
        ))}
      </div>

      <div className="mt-8 print:hidden">
        <ButtonLink href={`/campaigns/${campaign.slug}`} variant="secondary">
          Back to the Campaign
        </ButtonLink>
      </div>
    </div>
  );
}

function StationCard({
  campaign,
  chapter,
}: {
  campaign: Campaign;
  chapter: CampaignChapter;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const mounted = useMounted();

  // The origin is only knowable in the browser, so it is derived rather than
  // stored. Printing from the address a participant will actually visit is
  // what keeps the generated codes correct on any domain.
  const target = mounted
    ? window.location.origin + "/campaigns/" + campaign.slug + "/chapter/" + chapter.slug
    : "";

  useEffect(() => {
    const url = window.location.origin + "/campaigns/" + campaign.slug + "/chapter/" + chapter.slug;
    let cancelled = false;
    // Loaded on demand so the QR encoder never reaches a participant's bundle.
    // Only an organiser ever opens this page.
    void import("qrcode").then(async (mod) => {
      const encoded = await mod.default.toDataURL(url, {
        margin: 1,
        width: 640,
        errorCorrectionLevel: "M",
        color: { dark: "#06070cff", light: "#ffffffff" },
      });
      if (!cancelled) setDataUrl(encoded);
    });

    return () => {
      cancelled = true;
    };
  }, [campaign.slug, chapter.slug]);

  return (
    <article className="sq-card-flat break-inside-avoid overflow-hidden p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
        {campaign.title}
      </p>
      <h2 className="mt-1.5 font-display text-2xl leading-tight font-extrabold text-chalk">
        Chapter {chapter.chapterNumber}
      </h2>
      <p className="mt-1 text-base font-semibold text-mist">{chapter.title}</p>

      <div className="mx-auto mt-5 grid aspect-square w-full max-w-56 place-items-center overflow-hidden rounded-2xl bg-white p-3">
        {dataUrl ? (
          // A data URL produced in this component from a known-safe string.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`QR code opening chapter ${chapter.chapterNumber}, ${chapter.title}`}
            className="size-full object-contain"
          />
        ) : (
          <QrCode aria-hidden className="size-10 text-ink-700" />
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-mist">{chapter.signText}</p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/4 p-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-faint">
          Cannot scan? Station code
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold tracking-[0.2em] text-volt-300">
          {chapter.stationCode}
        </p>
      </div>

      <p className="mt-3 break-all text-[0.6rem] text-faint">{target}</p>
    </article>
  );
}
