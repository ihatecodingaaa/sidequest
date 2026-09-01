"use client";

import { useEffect } from "react";
import Link from "next/link";

import { StickerMark } from "@/components/district/sticker-mark";
import type { DistrictSticker } from "@/data/district-stickers";

/**
 * A sticker, announced in the world that produced it.
 *
 * ---
 *
 * The rule this obeys is the one the Echo unlock and the district moment
 * already obey: an unlock discovered later on another screen is a database
 * write, not a reward. So it appears here, over the world, at the moment the
 * derived set grows.
 *
 * ## Why it does not stop the world
 *
 * Because the player was doing something else. They earned this by walking
 * into a fourth thing at the minimart, or by having been everywhere, and a
 * modal congratulating them would turn a free cosmetic into a toll on the
 * activity that produced it. It is a strip at the top, it leaves on its own,
 * and nothing waits for it.
 *
 * ## Accessibility
 *
 * A polite live region, so it is announced without stealing focus from the
 * world or from whatever sheet is open. The link inside is a real link with a
 * real name, so somebody who wants to go and look at it can, and somebody who
 * does not loses nothing: the sticker is already theirs and will still be on
 * You in an hour.
 */
export function StickerNotice({
  sticker,
  onDismiss,
}: {
  sticker: DistrictSticker;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(timer);
  }, [sticker, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-rise pointer-events-none absolute inset-x-3 top-3 z-30 flex justify-center"
    >
      <Link
        href="/you"
        onClick={onDismiss}
        className="sq-pressable pointer-events-auto flex max-w-full items-center gap-3 rounded-2xl border border-volt-500/30 bg-ink-900/92 px-3.5 py-2.5 backdrop-blur"
      >
        <StickerMark art={sticker.art} size={34} className="shrink-0" />
        <span className="min-w-0">
          <span className="block text-[0.62rem] font-bold tracking-[0.14em] text-volt-300 uppercase">
            New sticker
          </span>
          <span className="block truncate text-sm font-bold text-chalk">{sticker.name}</span>
        </span>
      </Link>
    </div>
  );
}
