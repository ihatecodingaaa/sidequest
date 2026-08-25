"use client";

import { useSyncExternalStore } from "react";

import { useAppStore } from "@/store/app-store";
import { getLevelProgress } from "@/lib/xp";

/** A subscription that never fires. Used for values that only change once. */
const neverChanges = () => () => {};

/**
 * True once React is running on the client.
 *
 * `useSyncExternalStore` gives the server snapshot and the client snapshot
 * separately, which is exactly this question, and it avoids the extra render
 * pass that a setState-in-effect flag would cause.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Mirrors the CSS media query so JS-driven motion can opt out too. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Persisted state lives in localStorage, which the server cannot see. Every
 * component that reads the profile must therefore render the same thing on the
 * server and on the first client paint, then swap in the real values.
 * `ready` is that switch.
 */
export function useProfile() {
  const profile = useAppStore((state) => state.profile);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const mounted = useMounted();

  const ready = mounted && hasHydrated;

  return {
    profile,
    ready,
    level: getLevelProgress(profile.xp),
    isOnboarded: Boolean(profile.onboardedAt),
  };
}
