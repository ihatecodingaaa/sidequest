"use client";

import { useSyncExternalStore } from "react";

/**
 * Is this a phone held sideways?
 *
 * An aspect test rather than a width test, on purpose. A landscape phone and a
 * portrait tablet are similar widths and want opposite layouts: one has both
 * thumbs at the outer edges and a dead zone in the middle, the other has one
 * thumb at the bottom and needs the whole screen above it. Width alone cannot
 * tell those apart.
 *
 * The height bound keeps a desktop window out of it. A 1440 by 900 browser is
 * landscape and has no thumbs on it at all.
 */
const COMPACT_LANDSCAPE = "(orientation: landscape) and (max-height: 600px)";

function subscribe(callback: () => void) {
  const query = window.matchMedia(COMPACT_LANDSCAPE);
  query.addEventListener("change", callback);
  // Rotating a phone changes the match, and some browsers fire only this.
  window.addEventListener("resize", callback);
  return () => {
    query.removeEventListener("change", callback);
    window.removeEventListener("resize", callback);
  };
}

export function useCompactLandscape(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(COMPACT_LANDSCAPE).matches,
    // The server cannot know, and portrait is the design target, so start there.
    () => false,
  );
}
