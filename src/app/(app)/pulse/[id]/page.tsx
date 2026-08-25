import { notFound } from "next/navigation";

import { PULSE_ITEMS, getPulseItem } from "@/data/pulse";
import { PulseDetail } from "@/features/pulse/pulse-detail";

export function generateStaticParams() {
  return PULSE_ITEMS.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getPulseItem(id);
  return { title: item ? item.title : "Pulse", description: item?.summary };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getPulseItem(id);
  if (!item) notFound();

  return <PulseDetail item={item} />;
}
