"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useProfile } from "@/hooks/use-profile";
import { resolveEchoStyle } from "@/data/echo-styles";
import { EchoMascot } from "@/components/echo/echo-mascot";
import { DEFAULT_AVATAR, NPCS, type AvatarLook } from "@/features/streets/streets-data";

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

  const waiting = ready
    ? NPCS.filter(
        (npc) => npc.action.kind === "mission" && !profile.completedMissionIds.includes(npc.action.missionId),
      ).length
    : 0;

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
        <WalkingAvatar look={look} />
      </span>

      <div className="relative p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-volt-300">New</p>
        <h2 className="mt-1.5 font-display text-[1.75rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
          SIDEQUEST Streets
        </h2>
        <p className="mt-1.5 max-w-[15rem] text-sm leading-snug text-mist">
          {waiting > 0
            ? `Walk around the block. ${waiting} ${waiting === 1 ? "person" : "people"} want a word.`
            : "Walk around the block and see who is out."}
        </p>

        <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-volt-500 px-5 text-sm font-bold text-ink-900 transition-transform duration-200 group-active:scale-[0.98]">
          Explore
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </Link>
  );
}

/** The world sprite's part layout, at portrait scale. */
function WalkingAvatar({ look }: { look: AvatarLook }) {
  return (
    <svg viewBox="0 0 24 28" width={58} height={68} aria-hidden>
      <ellipse cx="12" cy="25.5" rx="6" ry="1.8" fill="rgba(10,14,22,0.3)" />
      <rect x="9" y="18" width="2.6" height="7" fill="#2b3550" />
      <rect x="12.4" y="18" width="2.6" height="6" fill="#2b3550" />
      <rect x="8" y="11" width="8" height="7.4" fill={look.top} />
      <rect x="6.6" y="12" width="1.7" height="5" fill={look.skin} />
      <rect x="15.7" y="12" width="1.7" height="5" fill={look.skin} />
      <rect x="8.4" y="4" width="7.2" height="7.4" fill={look.skin} />
      {look.hairStyle === "swept" ? (
        <>
          <rect x="8" y="2.8" width="8" height="3" fill={look.hair} />
          <rect x="14.4" y="3.8" width="1.8" height="4" fill={look.hair} />
        </>
      ) : look.hairStyle === "tied" ? (
        <>
          <rect x="8" y="2.8" width="8" height="3" fill={look.hair} />
          <rect x="6.6" y="4.8" width="1.6" height="4" fill={look.hair} />
        </>
      ) : look.hairStyle === "curls" ? (
        <rect x="7.6" y="2.2" width="8.8" height="4" fill={look.hair} />
      ) : (
        <rect x="8" y="2.8" width="8" height="3.4" fill={look.hair} />
      )}
      <rect x="9.8" y="7.4" width="1.2" height="1.4" fill="#1a1208" />
      <rect x="13" y="7.4" width="1.2" height="1.4" fill="#1a1208" />
    </svg>
  );
}
