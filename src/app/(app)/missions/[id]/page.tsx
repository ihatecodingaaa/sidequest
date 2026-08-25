import { notFound } from "next/navigation";

import { MISSIONS, getMission } from "@/data/missions";
import { MissionDetail } from "@/features/missions/mission-detail";

export function generateStaticParams() {
  return MISSIONS.map((mission) => ({ id: mission.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMission(id);
  return {
    title: mission ? mission.title : "Mission",
    description: mission?.description,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMission(id);
  if (!mission) notFound();

  return <MissionDetail mission={mission} />;
}
