"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_GRADIENT, ACCENT_TEXT } from "@/lib/accent";
import { formatDuration } from "@/lib/format";
import { HERO_MISSION_IDS, getMissions } from "@/data/missions";
import { useProfile } from "@/hooks/use-profile";
import { MISSION_ART, MissionArt } from "@/components/mission/mission-art";

/**
 * The three signature missions, given their own treatment.
 *
 * They carry the product's argument (rehearsal, norms, environment design) and
 * a flat list buries them among the quick quests. This is the shortest route to
 * the part of SIDEQUEST that is actually different.
 */
export function SignatureStrip({ className }: { className?: string }) {
  const { profile, ready } = useProfile();
  const missions = getMissions(HERO_MISSION_IDS);

  return (
    <ul className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {missions.map((mission) => {
        const complete = ready && profile.completedMissionIds.includes(mission.id);

        return (
          <li key={mission.id}>
            <Link
              href={`/missions/${mission.id}`}
              className="sq-card sq-pressable group relative flex h-full flex-col overflow-hidden p-4 hover:border-white/16"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                  ACCENT_GRADIENT[mission.accent],
                )}
              />

              <span className="flex items-start justify-between gap-3">
                {/*
                  A mark rather than a word. "Signature" told a first-time
                  reader nothing about which mission this is, and three
                  identical text rows are what made this strip feel flat. The
                  mark's job is recognition, and it is the only image here.
                */}
                {MISSION_ART[mission.id] ? (
                  <MissionArt
                    art={MISSION_ART[mission.id]}
                    accent={mission.accent}
                    className="size-12 shrink-0"
                  />
                ) : (
                  <span
                    className={cn(
                      "font-display text-[0.65rem] font-bold uppercase tracking-[0.14em]",
                      ACCENT_TEXT[mission.accent],
                    )}
                  >
                    Signature
                  </span>
                )}
                {complete ? (
                  <Check aria-hidden className="size-4 shrink-0 text-volt-400" strokeWidth={3} />
                ) : null}
              </span>

              <span className="mt-3 block font-display text-lg leading-tight font-extrabold text-chalk">
                {mission.title}
              </span>
              <span className="mt-1 block flex-1 text-sm leading-snug text-muted">
                {mission.subtitle}
              </span>

              <span className="mt-3 flex items-center gap-2 text-xs font-semibold text-faint">
                {formatDuration(mission.durationMinutes)}
                <span aria-hidden>&middot;</span>
                <span className={ACCENT_TEXT[mission.accent]}>{mission.xp} XP</span>
                <ArrowRight
                  aria-hidden
                  className="ml-auto size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
