import { Suspense, type ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { OnboardingGate } from "@/components/layout/onboarding-gate";
import { DemoModeParam } from "@/components/layout/demo-mode-param";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingGate>
      <Suspense fallback={null}>
        <DemoModeParam />
      </Suspense>
      <AppShell>{children}</AppShell>
    </OnboardingGate>
  );
}
