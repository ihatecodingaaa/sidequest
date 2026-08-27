"use client";

import type { Facing } from "@/features/streets/game/world-engine";

/**
 * Where the player was standing when they left the world.
 *
 * Returning to `/streets` is not enough on its own. Somebody who walks up to a
 * neighbour, plays the mission that neighbour opened and comes back should be
 * standing next to that neighbour, seeing the world react. Being teleported to
 * the spawn point instead is a smaller version of the same bug as landing in a
 * directory: the trip erased the place.
 *
 * ---
 *
 * ## Why session storage rather than the profile
 *
 * This is not progress and it must never look like progress. XP, missions,
 * threads, Echo and the passport are canonical, persisted, and belong to the
 * person. Where somebody happened to be standing is **transient**, belongs to
 * this browsing session, and would be actively wrong to restore on a device
 * somebody picked up a week later.
 *
 * `sessionStorage` says exactly that: it survives a navigation and a refresh,
 * and it is gone when the tab is. It is also outside the persisted store, so
 * it can never collide with the profile schema or need a migration.
 *
 * Nothing here is read by the rest of the product, and Streets works normally
 * if it is empty, unavailable, or corrupt.
 */

const KEY = "sidequest.streets.here";

export interface StreetsPlace {
  mapId: string;
  x: number;
  y: number;
  facing: Facing;
}

function isPlace(value: unknown): value is StreetsPlace {
  if (!value || typeof value !== "object") return false;
  const place = value as Partial<StreetsPlace>;
  return (
    typeof place.mapId === "string" &&
    typeof place.x === "number" &&
    typeof place.y === "number" &&
    Number.isFinite(place.x) &&
    Number.isFinite(place.y) &&
    typeof place.facing === "string"
  );
}

/** Records where the player is. Cheap, and silently gives up if it cannot. */
export function rememberPlace(place: StreetsPlace): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(place));
  } catch {
    // Private mode, a full quota, or storage disabled. None of it is fatal:
    // the world simply starts at the spawn point, which is where it started
    // before any of this existed.
  }
}

/** Where to put the player back, or null to use the spawn point. */
export function recallPlace(): StreetsPlace | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPlace(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Used by the demo reset, so a judge always starts from the same corner. */
export function forgetPlace(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do, and nothing depends on it.
  }
}
