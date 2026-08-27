"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * How much space Streets actually has, and therefore how to lay it out.
 *
 * ---
 *
 * ## Why this measures instead of asking
 *
 * The previous version was a media query:
 * `(orientation: landscape) and (max-height: 600px)`. It was wrong twice.
 *
 * It named a device class rather than a shape, so an iPad held sideways got
 * the one-handed portrait layout and gave three quarters of its screen to a
 * world it had room to fill.
 *
 * And a media query cannot see the browser. On iOS Safari `position: fixed;
 * inset: 0` sizes to the layout viewport, which is taller than the part a
 * person can see, so controls anchored to the bottom sit under the browser
 * chrome or the home indicator.
 *
 * Both problems go away by measuring: a `ResizeObserver` on the element that
 * actually holds the world, and `visualViewport` for the height the person
 * really has.
 *
 * ## The rule
 *
 * **Overlay when it is at least 1.25 times wider than it is tall.**
 *
 * One number, no device names, no height threshold. A landscape phone is about
 * 2.2, a portrait phone 0.46, a portrait tablet 0.7, a landscape tablet 1.4.
 */

/** Wider than this, and the controls belong at the edges rather than below. */
const OVERLAY_ASPECT = 1.25;

export interface StreetsLayout {
  /** Attach to the element that fills the screen. */
  ref: (node: HTMLElement | null) => void;
  /** True when the world should fill the screen and the chrome should float. */
  overlay: boolean;
  /**
   * Height to give the root, in CSS pixels, or null before it is known.
   *
   * From `visualViewport` where the browser has one, because that is the part
   * of the page a person can actually see. Callers fall back to `100dvh`.
   */
  height: number | null;
}

export function useStreetsLayout(): StreetsLayout {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [overlay, setOverlay] = useState(false);
  const [height, setHeight] = useState<number | null>(null);

  const ref = useCallback((next: HTMLElement | null) => setNode(next), []);

  /* The shape of the space, measured from the element that occupies it. */
  useEffect(() => {
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.height <= 0) return;
      setOverlay(rect.width / rect.height >= OVERLAY_ASPECT);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  /*
   * The height a person can actually see.
   *
   * Safari fires this during the rotation animation as well as after it, which
   * is why the value is only committed when it changes by more than a pixel:
   * a resize storm during a rotation would otherwise reframe the camera on
   * every intermediate size.
   */
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const read = () => {
      setHeight((current) => {
        const next = Math.round(viewport.height);
        return current !== null && Math.abs(current - next) < 2 ? current : next;
      });
    };
    read();
    viewport.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);
    return () => {
      viewport.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
    };
  }, []);

  return { ref, overlay, height };
}
