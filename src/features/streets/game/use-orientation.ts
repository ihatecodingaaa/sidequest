"use client";

import { useCallback, useState } from "react";

/**
 * How much space Streets actually has, measured once, for everybody.
 *
 * ---
 *
 * ## One measurement, three consumers
 *
 * The world container, the camera and the HUD all need to know the same thing,
 * and every time they worked it out separately they eventually disagreed. This
 * hook is the single source: it observes the element that holds the world and
 * reports its real box. The layout mode, the compact tier, and the engine's
 * own resize all hang off this one object.
 *
 * ## Why the height is CSS and not JavaScript
 *
 * An earlier version set the root's height from `visualViewport.height` in
 * JavaScript. On a real iPhone, rotating to landscape and back left portrait
 * visually compressed, and only a refresh recovered it.
 *
 * The reason is that a value read from an event can be stale, and this one
 * was: `orientationchange` fires on iOS **before** the viewport settles, so
 * reading synchronously inside it captures the pre-rotation height and commits
 * it. If no later corrective event arrives, the root keeps the landscape
 * height in portrait, and every geometry downstream is squeezed with it.
 * Refreshing worked because the first read on load is always correct.
 *
 * So the height is now `100dvh` in CSS. The browser owns it, it cannot be
 * stale, it already excludes browser chrome, and it needs no listeners. What
 * JavaScript does is **observe the result**, which is the direction that
 * cannot drift.
 *
 * ## Settling
 *
 * A `ResizeObserver` is self-correcting: an intermediate size during a
 * rotation is followed by the settled one, because both are box changes. That
 * is the property an event listener does not have, and it is why no timer
 * appears anywhere in this file.
 *
 * `visualViewport` is still subscribed to, but only as an **extra trigger to
 * re-measure the element**, never as a second source of truth. Safari can
 * settle its toolbar after the last box change, and this catches that without
 * introducing a value that can disagree with the box.
 */

/** Wider than this, and the controls belong at the edges rather than below. */
const OVERLAY_ASPECT = 1.25;

/**
 * Below this many CSS pixels of height, a landscape screen has no room to
 * spend on chrome.
 *
 * Chosen from real device sizes rather than from taste. Every iPhone in
 * landscape is at most 430 tall before browser chrome is subtracted, and the
 * smallest tablet in landscape is 744. Anything between those two separates
 * them, and 480 sits clear of both.
 */
const COMPACT_HEIGHT = 480;

export interface ViewportMetrics {
  width: number;
  height: number;
  aspect: number;
  /** Whether the world fills the screen and the chrome floats over it. */
  overlay: boolean;
  /** Landscape on a screen with very little height. Chrome gets out of the way. */
  compact: boolean;
}

const START: ViewportMetrics = {
  width: 0,
  height: 0,
  aspect: 0,
  overlay: false,
  compact: false,
};

function measure(node: HTMLElement): ViewportMetrics | null {
  const rect = node.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const aspect = rect.width / rect.height;
  const overlay = aspect >= OVERLAY_ASPECT;
  return {
    width: rect.width,
    height: rect.height,
    aspect,
    overlay,
    compact: overlay && rect.height <= COMPACT_HEIGHT,
  };
}

function same(a: ViewportMetrics, b: ViewportMetrics): boolean {
  return (
    Math.abs(a.width - b.width) < 1 &&
    Math.abs(a.height - b.height) < 1 &&
    a.overlay === b.overlay &&
    a.compact === b.compact
  );
}

export function useStreetsLayout(): {
  ref: (node: HTMLElement | null) => void;
  metrics: ViewportMetrics;
} {
  const [metrics, setMetrics] = useState<ViewportMetrics>(START);

  /*
   * A callback ref rather than an effect, so the observer is attached the
   * moment the node exists and detached the moment it does not. There is no
   * window in which the element is mounted and unobserved.
   */
  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    const commit = () => {
      const next = measure(node);
      if (!next) return;
      setMetrics((current) => (same(current, next) ? current : next));
    };

    commit();

    const observer = new ResizeObserver(commit);
    observer.observe(node);

    /*
     * An extra nudge, not an extra source. Safari can finish settling its
     * toolbar after the last box change, and this re-measures the element
     * rather than trusting the event's own numbers.
     */
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", commit);
    window.addEventListener("orientationchange", commit);

    return () => {
      observer.disconnect();
      viewport?.removeEventListener("resize", commit);
      window.removeEventListener("orientationchange", commit);
    };
  }, []);

  return { ref, metrics };
}
