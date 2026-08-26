import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { CAMPAIGNS, getCampaign } from "@/data/campaigns";
import { ImpactView } from "@/features/campaigns/impact-view";

export function generateStaticParams() {
  return CAMPAIGNS.map((campaign) => ({ slug: campaign.slug }));
}

export const metadata = { title: "What a pilot could measure" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  return (
    <AppShell>
      <ImpactView campaign={campaign} />
    </AppShell>
  );
}
