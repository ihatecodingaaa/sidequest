import { notFound } from "next/navigation";

import { CAMPAIGNS, getCampaign, getFollowUp } from "@/data/campaigns";
import { FollowUpPlayer } from "@/features/campaigns/follow-up-player";

export function generateStaticParams() {
  return CAMPAIGNS.flatMap((campaign) =>
    campaign.followUps.map((followUp) => ({
      slug: campaign.slug,
      followUpSlug: followUp.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; followUpSlug: string }>;
}) {
  const { slug, followUpSlug } = await params;
  const campaign = getCampaign(slug);
  const followUp = campaign ? getFollowUp(campaign, followUpSlug) : undefined;
  return { title: followUp ? followUp.title : "Follow-up" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; followUpSlug: string }>;
}) {
  const { slug, followUpSlug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  const followUp = getFollowUp(campaign, followUpSlug);
  if (!followUp) notFound();

  return <FollowUpPlayer campaign={campaign} followUp={followUp} />;
}
