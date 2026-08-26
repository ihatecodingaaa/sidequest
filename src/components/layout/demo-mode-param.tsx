"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAppStore } from "@/store/app-store";
import { clearInstallDismissal } from "@/hooks/use-install";

/**
 * Demo shortcuts, driven by the URL so they can be bookmarked before judging.
 *
 *   /?demo=1     loads the deterministic demo progress
 *   /?demo=reset clears everything back to a first run
 *
 * The parameter is stripped afterwards so a refresh does not silently reapply
 * it halfway through a walkthrough.
 */
export function DemoModeParam() {
  const params = useSearchParams();
  const router = useRouter();
  const loadDemoProgress = useAppStore((state) => state.loadDemoProgress);
  const resetDemo = useAppStore((state) => state.resetDemo);
  const demo = params.get("demo");

  useEffect(() => {
    if (!demo) return;

    if (demo === "reset") {
      // Same reason as the Settings reset: the dismissal is device state and
      // has to go too, or the next judge sees a different app.
      clearInstallDismissal();
      resetDemo();
    } else {
      loadDemoProgress();
    }

    router.replace("/");
  }, [demo, loadDemoProgress, resetDemo, router]);

  return null;
}
