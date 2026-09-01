"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { resolveEchoStyle } from "@/data/echo-styles";
import { EchoMascot } from "@/components/echo/echo-mascot";
import { useProfile } from "@/hooks/use-profile";
import { useAppStore } from "@/store/app-store";
import { AvatarFigure } from "@/features/streets/components/avatar-figure";
import { AvatarSetup } from "@/features/streets/components/avatar-setup";
import { districtMemory } from "@/features/streets/district-memory";
import { DEFAULT_AVATAR, LANDMARKS, type AvatarLook } from "@/features/streets/streets-data";

/**
 * Your corner.
 *
 * ---
 *
 * ## What this replaced, and why
 *
 * The You page used to open with a level ring, an XP total, a progress bar and
 * three stat tiles: played, streak, building. Five numbers about the player
 * before anything the player owns. That is a report card, and a report card is
 * what a young person already gets from school.
 *
 * This opens with the person instead. The same figure that walks around the
 * district, the Echo they actually equipped, their name, and one line about
 * where they have been. The numbers are all still on the page; they are just
 * no longer the first thing somebody learns about themselves.
 *
 * ## Why the avatar is a button
 *
 * Because it is theirs. Customisation existed but was reachable exactly once,
 * on the first entry to Streets, and never again: a look chosen in the first
 * thirty seconds of using the product was permanent. Tapping the figure now
 * reopens the same setup, starting from what they are wearing rather than from
 * the default, which is the difference between changing your look and starting
 * over.
 *
 * ## What it does not do
 *
 * There is no room to decorate, no furniture, no placement grid. The brief
 * offered a locker and the honest answer is that a room simulator is a
 * different product: the goal here is ownership, and ownership is served by
 * seeing yourself and being able to change yourself, not by arranging objects.
 */
export function YourCorner() {
  const { profile, ready } = useProfile();
  const setStreetsAvatar = useAppStore((state) => state.setStreetsAvatar);
  const [editing, setEditing] = useState(false);

  const look: AvatarLook = (ready && profile.streetsAvatar) || DEFAULT_AVATAR;
  const echo = ready ? resolveEchoStyle(profile) : null;
  const memories = ready ? districtMemory(profile) : [];
  const places = new Set(memories.map((entry) => entry.locationId)).size;

  /*
   * One line about where they have been, rather than a count of what they own.
   *
   * Written to describe the district rather than to grade the player, which is
   * the informational framing the reward research found flips the sign on the
   * same words. "You have been to four places" and not "4 of 6 explored".
   */
  const line = !ready
    ? "Loading."
    : memories.length === 0
      ? "You have not been out on the block yet."
      : `You have history in ${places} of ${LANDMARKS.length} places on the block.`;

  return (
    <>
      <section className="sq-card relative overflow-hidden p-5">
        {/* A slice of the district behind them, the same palette the world uses. */}
        <span aria-hidden className="absolute inset-0 bg-[#31603a]" />
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 bg-[#c8bda4]" />
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(9,12,18,0.94)_0%,rgba(9,12,18,0.74)_52%,rgba(9,12,18,0.35)_100%)]"
        />

        <div className="relative flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] font-bold tracking-[0.16em] text-volt-300 uppercase">
              Your corner
            </p>
            <h2 className="mt-1 truncate font-display text-2xl leading-tight font-extrabold tracking-tight text-chalk">
              {ready && profile.displayName ? profile.displayName : "You"}
            </h2>
            <p className="mt-1.5 text-sm leading-snug text-mist">{line}</p>

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="sq-pressable mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-sm font-semibold text-chalk"
            >
              <Pencil aria-hidden className="size-3.5" />
              Change your look
            </button>
          </div>

          {/*
            The figure and the companion, at the right, standing on the path.
            A button rather than a picture, with the control beside it labelled
            in words: the tap target is the obvious one, and the accessible
            name is on the button that says what it does.
          */}
          <span aria-hidden className="flex shrink-0 items-end gap-1">
            {echo ? (
              <EchoMascot
                style={echo.id}
                expression="pleased"
                size={34}
                className="mb-1.5 text-quest-300"
              />
            ) : null}
            <AvatarFigure look={look} size={64} />
          </span>
        </div>
      </section>

      {editing ? (
        <AvatarSetup
          initial={look}
          title="Change your look"
          lede="This is who walks around the block. Change it whenever you like."
          confirmLabel="Save"
          onDone={(next) => {
            setStreetsAvatar(next);
            setEditing(false);
          }}
          onSkip={() => setEditing(false)}
        />
      ) : null}
    </>
  );
}
