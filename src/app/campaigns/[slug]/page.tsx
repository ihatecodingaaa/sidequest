import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { CAMPAIGNS, getCampaign } from "@/data/campaigns";
import { CampaignDetail } from "@/features/campaigns/campaign-detail";

export function generateStaticParams() {
  return CAMPAIGNS.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  return {
    title: campaign ? campaign.title : "Campaign",
    description: campaign?.description,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  return (
    <AppShell>
      <CampaignDetail campaign={campaign} />
    </AppShell>
  );
}
