import { notFound } from "next/navigation";

import { CAMPAIGNS, getCampaign } from "@/data/campaigns";
import { FinalePlayer } from "@/features/campaigns/finale-player";

export function generateStaticParams() {
  return CAMPAIGNS.map((campaign) => ({ slug: campaign.slug }));
}

export const metadata = { title: "Finale" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  return <FinalePlayer campaign={campaign} />;
}
