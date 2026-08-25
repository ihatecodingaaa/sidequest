"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production only. In development it would
 * shadow the dev server's own assets and produce confusing stale reloads,
 * which is exactly the kind of surprise a demo cannot afford.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support is a bonus. Failing to register must never surface
        // to the user or break the page.
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
