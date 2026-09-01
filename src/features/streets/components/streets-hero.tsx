"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useProfile } from "@/hooks/use-profile";
import { resolveEchoStyle } from "@/data/echo-styles";
import { EchoMascot } from "@/components/echo/echo-mascot";
import { AvatarFigure } from "@/features/streets/components/avatar-figure";
import { DEFAULT_AVATAR, LANDMARKS, type AvatarLook } from "@/features/streets/streets-data";
import { waitingCount, whoIsWaiting } from "@/features/streets/game/quest-bridge";
import { DISTRICT_MOMENTS } from "@/features/streets/streets-props";

/**
 * The way into SIDEQUEST Streets, from Home.
 *
 * The most interesting thing in the product should not be three taps deep, so
 * this is the first thing under the greeting. It shows the two things that make
 * the world worth entering rather than describing them: **your character**, in
 * the clothes you actually chose, and **your Echo**, in the variant you
 * actually equipped. A card that said "explore a neighbourhood" would be a
 * claim. This is the thing itself, small.
 *
 * The artwork is the same part layout the world sprite uses, so what somebody
 * sees here is exactly who walks around down there.
 */
export function StreetsHero() {
  const { profile, ready } = useProfile();
  const look: AvatarLook = (ready && profile.streetsAvatar) || DEFAULT_AVATAR;
  const echo = ready ? resolveEchoStyle(profile) : null;

  /*
   * What is actually waiting down there.
   *
   * This used to count hero missions only, so somebody with five live thread
   * steps and three unplayed checks was told nobody wanted a word. It now uses
   * the same rule the world does, which is the point of the rule being shared.
   */
  const waiting = ready ? waitingCount(profile) : 0;
  const moments = ready ? (profile.districtMoments ?? []).length : 0;
  const left = DISTRICT_MOMENTS.length - moments;

  /*
   * Somebody, rather than a number.
   *
   * A name and a place is a reason to open the world; a backlog size is a
   * reason to feel behind. The count still runs the plural fallback for a
   * player who has met nobody, because naming a stranger on a cold install is
   * a name that means nothing.
   */
  const person = ready ? whoIsWaiting(profile) : null;
  const met = ready && person ? (profile.metNpcs ?? []).includes(person.id) : false;
  const place = person
    ? LANDMARKS.find((landmark) => landmark.id === person.landmarkId)?.name
    : undefined;

  return (
    <Link
      href="/streets"
      className="sq-pressable group relative block overflow-hidden rounded-[1.75rem] border border-volt-500/25"
    >
      {/* A slice of the district: grass, path, and the covered walkway. */}
      <span aria-hidden className="absolute inset-0 bg-[#3f7a46]" />
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 bg-[#c8bda4]" />
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-[1.55rem] bg-[#9aa0ac]" />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(9,12,18,0.92)_0%,rgba(9,12,18,0.7)_46%,transparent_78%)]"
      />

      {/* Player and companion, at the right, walking the path. */}
      <span aria-hidden className="absolute top-1/2 right-5 flex -translate-y-1/2 items-end gap-1">
        {echo ? <EchoMascot style={echo.id} expression="pleased" size={34} className="mb-1.5 text-quest-300" /> : null}
        <AvatarFigure look={look} size={58} />
      </span>

      <div className="relative p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-volt-300">New</p>
        <h2 className="mt-1.5 font-display text-[1.75rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
          SIDEQUEST Streets
        </h2>
        <p className="mt-1.5 max-w-[15rem] text-sm leading-snug text-mist">
          {met && person && place
            ? `${person.name} is still at the ${place.toLowerCase()}.`
            : waiting > 0
              ? `Walk around the block. ${waiting} ${waiting === 1 ? "person" : "people"} want a word.`
              : "Walk around the block and see who is out."}
        </p>

        {/*
          A second reason to go, for somebody who has already seen everybody.
          Exploring has to be worth something once the objectives run out, or
          the world is a menu with a walk attached.
        */}
        {moments > 0 && left > 0 ? (
          <p className="mt-1 max-w-[15rem] text-xs leading-snug text-volt-300/90">
            {left} more thing{left === 1 ? "" : "s"} on the block worth a look.
          </p>
        ) : null}

        <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-volt-500 px-5 text-sm font-bold text-ink-900 transition-transform duration-200 group-active:scale-[0.98]">
          Explore
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </Link>
  );
}
