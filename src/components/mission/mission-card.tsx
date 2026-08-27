"use client";

import Link from "next/link";
import { Check, Clock, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { PlayModeChip } from "@/components/mission/play-mode-chip";
import { ACCENT_BG_SOFT, ACCENT_BORDER, ACCENT_TEXT } from "@/lib/accent";
import { formatDuration } from "@/lib/format";
import { MISSION_TYPE_LABELS } from "@/data/missions";
import type { Mission } from "@/types/mission";
import { Chip } from "@/components/ui/primitives";

export function MissionCard({
  mission,
  complete,
  className,
  compact,
}: {
  mission: Mission;
  complete?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const locked = mission.status === "coming-soon";

  const shell = cn(
    "sq-card sq-pressable group relative block overflow-hidden p-4",
    !locked && "hover:border-white/16",
    locked && "opacity-60",
    className,
  );

  const body = (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-16 -right-10 size-40 rounded-full blur-3xl transition-opacity duration-500",
          ACCENT_BG_SOFT[mission.accent],
          "opacity-70 group-hover:opacity-100",
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip accent={mission.accent}>{MISSION_TYPE_LABELS[mission.missionType]}</Chip>
          {complete ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-volt-500/15 px-2 py-1 text-[0.7rem] font-semibold text-volt-300">
              <Check aria-hidden className="size-3" />
              Done
            </span>
          ) : null}
          {locked ? (
            <span className="rounded-full bg-white/6 px-2 py-1 text-[0.7rem] font-semibold text-faint">
              Coming soon
            </span>
          ) : null}
        </div>
      </div>

      <h3 className="relative mt-3 font-display text-lg leading-tight font-bold text-chalk">
        {mission.title}
      </h3>
      {!compact ? (
        <p className="relative mt-1.5 line-clamp-2 text-sm leading-snug text-muted">
          {mission.description}
        </p>
      ) : null}

      <div className="relative mt-3.5 flex items-center gap-3 text-xs font-semibold text-faint">
        {mission.durationMinutes > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="size-3.5" />
            {formatDuration(mission.durationMinutes)}
          </span>
        ) : null}
        <span className={cn("inline-flex items-center gap-1", ACCENT_TEXT[mission.accent])}>
          <Zap aria-hidden className="size-3.5" />
          {mission.xp} XP
        </span>
        {/* Whether this needs other people, before it is opened rather than after. */}
        <PlayModeChip mode={mission.playMode} crewSize={mission.crewSize} />
        {mission.location ? (
          <span className="truncate text-faint">{mission.location.area}</span>
        ) : null}
      </div>

      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
          ACCENT_BORDER[mission.accent],
          "border-b-2",
        )}
      />
    </>
  );

  if (locked) {
    return (
      <div className={shell} aria-disabled="true">
        {body}
      </div>
    );
  }

  return (
    <Link href={`/missions/${mission.id}`} className={shell}>
      {body}
    </Link>
  );
}
