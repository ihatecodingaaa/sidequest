"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { Campaign } from "@/types/campaign";

/**
 * Warms the rest of a Campaign once a participant has opened it.
 *
 * The roadshow problem is that a phone scans a QR at a station, gets the first
 * chapter, then walks somewhere with worse signal and taps the next one. Next.js
 * already prefetches `<Link>`s that reach the viewport, and with the default
 * `prefetch` behaviour a static route is prefetched in full including its data,
 * but only in production and only once the link has actually been scrolled to.
 * The finale is worse off again: it is not linked at all until it unlocks.
 *
 * So this asks for the whole Campaign up front. Every route involved is
 * prerendered, so the request is for static output that the service worker then
 * keeps, and no route here is one the participant was not going to open anyway.
 *
 * Two restraints. It runs once per mount and never in a loop, and it is skipped
 * entirely when the device asks for reduced data, because a prefetch is a
 * convenience and Data Saver is a request not to spend someone's money on
 * conveniences.
 */
export function useCampaignWarmup(campaign: Campaign): void {
  const router = useRouter();

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;

    const routes = [
      ...campaign.chapters.map((chapter) => `/campaigns/${campaign.slug}/chapter/${chapter.slug}`),
      `/campaigns/${campaign.slug}/finale`,
    ];

    for (const route of routes) router.prefetch(route);
  }, [campaign, router]);
}
