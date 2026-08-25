"use client";

import type { ReactNode } from "react";

import { useProfile } from "@/hooks/use-profile";
import { Onboarding } from "@/features/onboarding/onboarding";
import { Mark } from "@/components/layout/wordmark";

/**
 * Decides between onboarding and the app.
 *
 * The persisted profile is only readable on the client, so there is a single
 * frame where we do not yet know which to show. The splash below fills it, and
 * it is the same on the server and the client, so nothing flashes or mismatches.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { ready, isOnboarded } = useProfile();

  if (!ready) {
    return (
      <div className="sq-app-bg grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3" role="status" aria-label="Loading">
          <Mark className="size-12 animate-pulse" />
          <span className="sr-only">Loading SIDEQUEST</span>
        </div>
      </div>
    );
  }

  if (!isOnboarded) return <Onboarding />;

  return <>{children}</>;
}
