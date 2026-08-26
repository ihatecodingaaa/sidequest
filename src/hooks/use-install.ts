"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { useMounted } from "@/hooks/use-profile";

/**
 * Install support, told honestly.
 *
 * Two facts drive everything here, both checked against MDN's browser-compat
 * data on 26 August 2026:
 *
 *   1. `beforeinstallprompt` is Chrome 44+, Edge, Opera and Samsung Internet
 *      5.0+. Firefox does not implement it. Safari does not implement it, and
 *      Safari on iOS mirrors Safari. MDN marks it experimental and explicitly
 *      not on a standards track.
 *   2. The `display-mode` media feature *is* supported everywhere that matters,
 *      including Safari 13 and Safari on iOS 12.2, so standalone detection
 *      needs no vendor shim.
 *
 * So: a real button where a real API exists, plain instructions where it does
 * not, and nothing at all once the app is already installed. There is no code
 * path here that renders something resembling a system dialog on a platform
 * that has no such dialog.
 */

const STANDALONE_QUERY = "(display-mode: standalone), (display-mode: minimal-ui), (display-mode: fullscreen)";

const DISMISS_KEY = "sidequest.install.v1";

/** Minimal shape of the non-standard event. Typed here rather than globally. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
}

function subscribeToDisplayMode(callback: () => void): () => void {
  const query = window.matchMedia(STANDALONE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

/*
 * The dismissal flag lives in localStorage, which the server cannot read, so it
 * is exposed through `useSyncExternalStore` rather than a setState-in-effect
 * flag: same reason as `useMounted`, and React 19 lints the effect version.
 * `dismissListeners` exists so that dismissing in one component updates every
 * other reader in the same document immediately.
 */
const dismissListeners = new Set<() => void>();

function subscribeToDismissal(callback: () => void): () => void {
  dismissListeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === DISMISS_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    dismissListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

/*
 * In-memory fallback for the case where storage throws, which is real: private
 * mode and browsers configured to block site data both do it. Without this,
 * tapping the dismiss button would write nothing, read back nothing, and leave
 * the invitation on screen. Dismissal then lasts the session rather than
 * forever, which is the most the browser will allow.
 */
let dismissedInMemory = false;

function readDismissed(): boolean {
  if (dismissedInMemory) return true;
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "dismissed";
  } catch {
    return false;
  }
}

/** True when the app is running from a Home Screen icon rather than a tab. */
export function useIsStandalone(): boolean {
  return useSyncExternalStore(
    subscribeToDisplayMode,
    () => window.matchMedia(STANDALONE_QUERY).matches,
    () => false,
  );
}

export type InstallMethod = "prompt" | "instructions";

export interface InstallState {
  /** False until React is running on the client, so the server render matches. */
  ready: boolean;
  /** Already installed, or previously dismissed. Either way, say nothing. */
  hidden: boolean;
  method: InstallMethod;
  /** Only present when `method` is "prompt". */
  install: (() => Promise<void>) | null;
  dismiss: () => void;
}

export function useInstall(): InstallState {
  const mounted = useMounted();
  const standalone = useIsStandalone();
  const dismissed = useSyncExternalStore(subscribeToDismissal, readDismissed, () => false);
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (raw: Event) => {
      // Suppress the browser's own mini-infobar so the invitation appears
      // where it has a reason to, rather than on whatever page happens to load.
      raw.preventDefault();
      setEvent(raw as InstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    dismissedInMemory = true;
    try {
      window.localStorage.setItem(DISMISS_KEY, "dismissed");
    } catch {
      // Storage is unavailable, so this dismissal lasts the session only.
    }
    for (const listener of dismissListeners) listener();
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    await event.prompt();
    // The event is single-use whatever the outcome. Accepted installs also
    // fire `appinstalled`, which clears it again.
    setEvent(null);
    dismiss();
  }, [event, dismiss]);

  return {
    // Nothing renders until the client is running, so the server markup and
    // the first client paint agree and hydration has nothing to reconcile.
    ready: mounted,
    hidden: standalone || dismissed,
    method: event ? "prompt" : "instructions",
    install: event ? install : null,
    dismiss,
  };
}

/** Clears the dismissal so a demo reset returns the device to a known state. */
export function clearInstallDismissal(): void {
  dismissedInMemory = false;
  try {
    window.localStorage.removeItem(DISMISS_KEY);
  } catch {
    // Ignored for the same reason as above.
  }
  for (const listener of dismissListeners) listener();
}
