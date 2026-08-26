import { notFound } from "next/navigation";

import { CAMPAIGNS, getCampaign, getChapter } from "@/data/campaigns";
import { ChapterRunner } from "@/features/campaigns/chapter-runner";

/**
 * The QR landing route. Every station code resolves here, so it is prerendered
 * for every chapter of every campaign and a scan never waits on a server.
 */
export function generateStaticParams() {
  return CAMPAIGNS.flatMap((campaign) =>
    campaign.chapters.map((chapter) => ({
      slug: campaign.slug,
      chapterSlug: chapter.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}) {
  const { slug, chapterSlug } = await params;
  const campaign = getCampaign(slug);
  const chapter = campaign ? getChapter(campaign, chapterSlug) : undefined;
  return {
    title: chapter ? `${chapter.title}` : "Chapter",
    description: chapter?.shortDescription,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}) {
  const { slug, chapterSlug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  const chapter = getChapter(campaign, chapterSlug);
  if (!chapter) notFound();

  return <ChapterRunner campaign={campaign} chapter={chapter} />;
}
