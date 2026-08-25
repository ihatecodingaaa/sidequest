import { notFound } from "next/navigation";

import { MISSIONS, getMission } from "@/data/missions";
import { MissionRouter } from "@/features/missions/engine/mission-router";

export function generateStaticParams() {
  return MISSIONS.map((mission) => ({ id: mission.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMission(id);
  return { title: mission ? mission.title : "Mission" };
}

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMission(id);
  if (!mission) notFound();

  return <MissionRouter mission={mission} />;
}
