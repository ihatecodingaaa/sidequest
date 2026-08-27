"use client";

import { useSyncExternalStore } from "react";

/**
 * Where an experience was opened from, and therefore where finishing goes.
 *
 * ---
 *
 * ## The bug this exists for
 *
 * Streets sent the player into REWIND, they finished it, and the app dropped
 * them on the generic missions directory. The world loop is supposed to be
 * explore, meet somebody, play, return **to the same world**, and see it react.
 * Landing in a directory breaks it at the last step.
 *
 * The obvious fix, sending every completion to `/streets`, would fix the world
 * and break the two surfaces that were already correct.
 *
 * ## One mechanism, not fifteen conditionals
 *
 * The origin travels in the URL as a **key**, never as a path:
 *
 *     /play/mission-rewind?from=streets
 *
 * The key is looked up in the table below and the destination is resolved in
 * code. Nothing from the query string is ever navigated to, so there is no
 * open redirect here and cannot be one: an unknown key falls back to the
 * default exactly as a missing key does.
 *
 * The **default is the old behaviour**, which is what keeps the missions and
 * direct-link paths working without a single call site changing.
 *
 * Campaigns do not use this. They already pass their own `MissionHost` with
 * its own exit and completion screen, which is the same idea one layer up.
 */

/** Surfaces that can send somebody into a mission. */
export type OriginKey = "streets" | "missions" | "crew";

export interface ExperienceOrigin {
  key: OriginKey | "direct";
  /**
   * Where leaving without finishing goes.
   *
   * Deliberately separate from `finishTo`. Abandoning halfway and completing
   * are different acts and, for a direct visit, they have always had different
   * destinations: closing goes back to the mission's own page, finishing goes
   * on to the next one. Collapsing them into a single field quietly changed
   * that, and a test caught it.
   */
  closeTo: string;
  /** Where the finish control goes. */
  finishTo: string;
  /** The primary control at the end of the experience. */
  finishLabel: string;
}

const TABLE: Record<OriginKey, Omit<ExperienceOrigin, "key">> = {
  streets: {
    closeTo: "/streets",
    finishTo: "/streets",
    finishLabel: "Back to the block",
  },
  missions: {
    closeTo: "/missions",
    finishTo: "/missions",
    finishLabel: "Next mission",
  },
  crew: {
    closeTo: "/crew",
    finishTo: "/crew",
    finishLabel: "Back to your crew",
  },
};

function isOriginKey(value: string | null): value is OriginKey {
  return value !== null && Object.prototype.hasOwnProperty.call(TABLE, value);
}

/**
 * Resolves an origin.
 *
 * `fallbackCloseTo` is where closing a direct visit should go, which for a
 * mission is its own detail page. That was the behaviour before this existed
 * and it stays the behaviour when nothing says otherwise.
 */
export function resolveOrigin(key: string | null, fallbackCloseTo: string): ExperienceOrigin {
  if (isOriginKey(key)) return { key, ...TABLE[key] };
  return {
    key: "direct",
    closeTo: fallbackCloseTo,
    finishTo: "/missions",
    finishLabel: "Next mission",
  };
}

/** Adds the origin to an internal href. Only ever a key, never a path. */
export function withOrigin(href: string, key: OriginKey): string {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}from=${key}`;
}

function subscribe(callback: () => void) {
  // Back and forward change the query without remounting the route.
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

/**
 * The origin key currently in the URL.
 *
 * Read from `window.location` rather than through `useSearchParams`, on
 * purpose. `/play/[id]` is statically generated, and `useSearchParams` there
 * would either need a Suspense boundary wrapping the whole player, which
 * blanks it on first paint, or a server-side `searchParams` prop, which drops
 * the route out of static generation. This product is demonstrated on venue
 * wifi and the static output is worth keeping.
 *
 * The value only matters after hydration: it decides where a link goes when it
 * is clicked and what the completion screen says, and neither happens during
 * the server snapshot.
 */
export function useOriginKey(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get("from"),
    () => null,
  );
}

/** The resolved origin for an experience whose direct destination is known. */
export function useExperienceOrigin(fallbackCloseTo: string): ExperienceOrigin {
  return resolveOrigin(useOriginKey(), fallbackCloseTo);
}
