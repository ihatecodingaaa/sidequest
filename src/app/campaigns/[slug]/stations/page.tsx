import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { CAMPAIGNS, getCampaign } from "@/data/campaigns";
import { StationsView } from "@/features/campaigns/stations-view";

export function generateStaticParams() {
  return CAMPAIGNS.map((campaign) => ({ slug: campaign.slug }));
}

export const metadata = { title: "Station signs" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  return (
    <AppShell>
      <StationsView campaign={campaign} />
    </AppShell>
  );
}
