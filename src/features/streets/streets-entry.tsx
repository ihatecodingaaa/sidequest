"use client";

import dynamic from "next/dynamic";

/**
 * The route boundary for SIDEQUEST Streets.
 *
 * `ssr: false` and a dynamic import together are what keep the renderer, the
 * district data and every world component out of Home, Safe and Updates. The
 * world is the only route that pays for the world, which matters because this
 * product is deployed at roadshows on venue wifi.
 */
const StreetsClient = dynamic(
  () => import("@/features/streets/streets-client").then((m) => m.StreetsClient),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 grid place-items-center bg-[#1a2a1e]">
        <p className="text-sm text-chalk/70">Loading the block...</p>
      </div>
    ),
  },
);

export function StreetsEntry() {
  return <StreetsClient />;
}
