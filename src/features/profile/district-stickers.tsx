"use client";

import { useState } from "react";
import { Pin } from "lucide-react";

import { cn } from "@/lib/cn";
import { SectionHeader } from "@/components/ui/primitives";
import { StickerMark } from "@/components/district/sticker-mark";
import { useProfile } from "@/hooks/use-profile";
import { useAppStore } from "@/store/app-store";
import { DISTRICT_STICKERS, stickerStanding } from "@/data/district-stickers";

/**
 * Your district: eight stickers, and one of them can go on your corner.
 *
 * ---
 *
 * ## Why this is not a grid of mystery slots
 *
 * Every sticker is drawn, named and explained whether or not it is earned. A
 * locked one is dimmed and desaturated and says exactly what would earn it, in
 * a sentence, in the same place the earned version will appear.
 *
 * The alternative, silhouettes and question marks, is the single most common
 * pattern in this genre and it is a slot machine dressed as a collection: the
 * pull comes from not knowing, which means the product is trading on
 * uncertainty rather than on anything it actually did.
 *
 * ## Why there is no progress bar
 *
 * There is a quiet "3 so far" under a place sticker and nothing else. A bar
 * turns "I have been to the court a few times" into "I am 60 percent of the
 * way through the court", and the moment a place has a completion percentage
 * it stops being somewhere you have been.
 *
 * ## Why pinning exists
 *
 * Because otherwise the collection is a page you visit rather than something
 * you own. Pinning is the whole of the ownership: one sticker, next to your
 * name, changeable whenever, worth nothing. It is the cheapest possible
 * version of a locker and it is deliberately the only one, because the
 * alternative was a placement grid and a room to decorate, which is a
 * different product.
 */
export function DistrictStickers() {
  const { profile, ready } = useProfile();
  const pinSticker = useAppStore((state) => state.pinSticker);
  const [open, setOpen] = useState<string | null>(null);

  const earned = DISTRICT_STICKERS.filter((sticker) => ready && sticker.earned(profile));
  const pinned = ready ? profile.pinnedSticker : undefined;

  return (
    <section>
      <SectionHeader
        title="Your district"
        subtitle={
          earned.length === 0
            ? "Nothing yet. These come from being places, not from finishing things."
            : `${earned.length} of ${DISTRICT_STICKERS.length}. Tap one to see where it came from.`
        }
      />

      <ul className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
        {DISTRICT_STICKERS.map((sticker) => {
          const got = ready && sticker.earned(profile);
          const isOpen = open === sticker.id;
          return (
            <li key={sticker.id}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : sticker.id)}
                aria-expanded={isOpen}
                aria-label={
                  got
                    ? `${sticker.name}. Earned. ${sticker.memory}`
                    : `${sticker.name}. Not yet. ${sticker.requirement}`
                }
                className={cn(
                  "sq-pressable flex w-full flex-col items-center gap-1 rounded-2xl border p-2",
                  isOpen ? "border-volt-500/40 bg-volt-500/8" : "border-transparent",
                )}
              >
                <span className="relative">
                  <StickerMark art={sticker.art} earned={got} size={44} />
                  {pinned === sticker.id ? (
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-volt-500 text-ink-900"
                    >
                      <Pin className="size-2.5" strokeWidth={3} />
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "text-center text-[0.62rem] leading-tight font-bold",
                    got ? "text-chalk" : "text-faint",
                  )}
                >
                  {sticker.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/*
        One detail panel, below the grid rather than over it.

        A popover on a 390px screen covers the thing it describes, and this is
        a row of small drawings where the point is to look at them.
      */}
      {open ? (
        <StickerDetail
          id={open}
          earned={Boolean(ready && DISTRICT_STICKERS.find((s) => s.id === open)?.earned(profile))}
          pinned={pinned === open}
          standing={(() => {
            const sticker = DISTRICT_STICKERS.find((s) => s.id === open);
            return sticker && ready ? stickerStanding(profile, sticker) : null;
          })()}
          onPin={() => pinSticker(pinned === open ? null : open)}
        />
      ) : null}

      <p className="mt-3 text-xs leading-relaxed text-faint">
        Free, fixed and cosmetic. Nothing here can be bought, traded, lost or run out, none of it is
        worth XP, and there are no rare ones.
      </p>
    </section>
  );
}

function StickerDetail({
  id,
  earned,
  pinned,
  standing,
  onPin,
}: {
  id: string;
  earned: boolean;
  pinned: boolean;
  standing: string | null;
  onPin: () => void;
}) {
  const sticker = DISTRICT_STICKERS.find((entry) => entry.id === id);
  if (!sticker) return null;

  return (
    <div className="animate-rise mt-3 rounded-2xl border border-white/10 bg-white/4 p-4">
      <p className="text-sm font-bold text-chalk">{sticker.name}</p>
      <p className="mt-1 text-sm leading-relaxed text-mist">
        {earned ? sticker.memory : sticker.requirement}
      </p>

      {!earned && standing ? <p className="mt-1 text-xs text-faint">{standing}</p> : null}

      {earned ? (
        <button
          type="button"
          onClick={onPin}
          className={cn(
            "sq-pressable mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold",
            pinned
              ? "border-volt-500/40 bg-volt-500/12 text-volt-300"
              : "border-white/20 text-chalk",
          )}
        >
          <Pin aria-hidden className="size-3.5" />
          {pinned ? "On your corner" : "Put it on your corner"}
        </button>
      ) : null}
    </div>
  );
}
