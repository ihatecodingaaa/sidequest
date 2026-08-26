import { AppShell } from "@/components/layout/app-shell";
import { CampaignList } from "@/features/campaigns/campaign-list";

export const metadata = {
  title: "Campaigns",
  description: "Story-driven crime prevention experiences built for real places.",
};

export default function Page() {
  return (
    <AppShell>
      <CampaignList />
    </AppShell>
  );
}
