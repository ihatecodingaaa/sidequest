"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Brain, Check, Clock, MapPin, Users, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { formatDeadline, formatDuration } from "@/lib/format";
import { MISSION_TYPE_LABELS } from "@/data/missions";
import { getPulseItem } from "@/data/pulse";
import { getSkill } from "@/data/skills";
import { getCrew } from "@/data/crews";
import { ButtonLink } from "@/components/ui/button";
import { Chip, ProvenanceTag } from "@/components/ui/primitives";
import { MISSION_ART } from "@/components/mission/mission-art";
import { MissionWorld } from "@/components/mission/mission-world";
import { useProfile } from "@/hooks/use-profile";
import type { Mission } from "@/types/mission";

export function MissionDetail({ mission }: { mission: Mission }) {
  const { profile, ready } = useProfile();
  const complete = ready && profile.completedMissionIds.includes(mission.id);
  const crew = getCrew(profile.crewId);
  const playable = mission.status === "available" && mission.player !== "external";

  return (
    <article className="pb-4">
      <Link
        href="/missions"
        className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mist hover:text-chalk"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Missions
      </Link>

      {/*
        The detail page is the last surface before somebody commits minutes to
        a mission, and it was the one discovery surface with no picture of what
        they were committing to. The signature missions get their scene here at
        card height, above the chips, for the same reason the browser cards do:
        the shape of the experience should arrive before the metadata about it.

        Missions without a world fall through unchanged. Adding a generic
        illustration to the rest would be decoration, which is the thing this
        art direction exists to avoid.
      */}
      {MISSION_ART[mission.id] ? (
        <MissionWorld
          art={MISSION_ART[mission.id]}
          accent={mission.accent}
          scale="card"
          className="mb-5"
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <Chip accent={mission.accent}>{MISSION_TYPE_LABELS[mission.missionType]}</Chip>
        <ProvenanceTag provenance={mission.provenance} compact />
        {complete ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-volt-500/15 px-2 py-1 text-[0.7rem] font-semibold text-volt-300">
            <Check aria-hidden className="size-3" />
            Completed
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 text-balance-tight font-display text-[2rem] leading-[1.08] font-extrabold tracking-tight text-chalk lg:text-4xl">
        {mission.title}
      </h1>
      <p className="mt-1.5 text-sm font-semibold text-muted">{mission.subtitle}</p>
      <p className="mt-4 text-base leading-relaxed text-mist">{mission.description}</p>

      {/* Facts */}
      <ul className="mt-5 flex flex-wrap gap-2">
        {mission.durationMinutes > 0 ? (
          <Fact icon={<Clock aria-hidden className="size-3.5" />}>
            {formatDuration(mission.durationMinutes)}
          </Fact>
        ) : null}
        <Fact icon={<Zap aria-hidden className={cn("size-3.5", ACCENT_TEXT[mission.accent])} />}>
          {mission.xp} XP
        </Fact>
        <Fact className="capitalize">{mission.difficulty}</Fact>
        <Fact>Ages {mission.ageBands.join(", ")}</Fact>
        {mission.deadline ? <Fact>{formatDeadline(mission.deadline)}</Fact> : null}
      </ul>

      {/*
        The primary action sits above the fold rather than in a sticky bar.
        A sticky bar at the bottom of this route would sit underneath the fixed
        bottom navigation, and stacking one control on top of another is worse
        than simply putting the button where people look first.
      */}
      <div className="mt-6">
        {playable ? (
          <>
            <ButtonLink
              href={`/play/${mission.id}`}
              variant={complete ? "secondary" : "volt"}
              size="lg"
              full
              className="lg:w-auto lg:px-10"
            >
              {complete ? "Play again" : "Start mission"}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            {complete ? (
              <p className="mt-2 text-center text-xs text-faint lg:text-left">
                XP for this mission has already been counted.
              </p>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/4 p-4 text-center">
            <p className="text-sm font-semibold text-chalk">
              {mission.status === "coming-soon" ? "Coming soon" : "Runs outside the app"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {mission.status === "coming-soon"
                ? "This one lands with the next season."
                : "Signup happens with the organisation running it, not with SIDEQUEST."}
            </p>
          </div>
        )}
      </div>

      {/* Location */}
      {mission.location ? (
        <div className="sq-card mt-5 flex gap-3 p-4">
          <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-300" />
          <div>
            <p className="font-display text-base font-bold text-chalk">{mission.location.area}</p>
            <p className="mt-0.5 text-sm text-mist">{mission.location.venue}</p>
            {mission.location.note ? (
              <p className="mt-2 text-xs text-faint">{mission.location.note}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Partner honesty */}
      {mission.partner ? (
        <div className="mt-4 rounded-2xl border border-coral-500/25 bg-coral-500/8 p-4">
          <p className="text-sm font-semibold text-coral-300">{mission.partner.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            {mission.partner.isConfirmedPartner
              ? "This partnership is confirmed."
              : "No partnership is in place. This brief was written by the SIDEQUEST team to show how a partner challenge would work."}
          </p>
        </div>
      ) : null}

      {/* Crew context */}
      {mission.missionType === "crew" && crew ? (
        <div className="sq-card mt-4 flex gap-3 p-4">
          <Users aria-hidden className="mt-0.5 size-5 shrink-0 text-pulse-300" />
          <p className="text-sm leading-relaxed text-mist">
            Runs with <span className="font-semibold text-chalk">{crew.name}</span>. Everyone plays
            in their own time and the crew entries appear alongside yours. Crew entries in this
            prototype are seeded content.
          </p>
        </div>
      ) : null}

      {/* Behavioural mechanism, stated plainly */}
      <section className="sq-card mt-5 flex gap-3 p-4">
        <Brain aria-hidden className="mt-0.5 size-5 shrink-0 text-quest-300" />
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-faint">
            Why this works
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-mist">{mission.behaviouralHook}</p>
        </div>
      </section>

      {/* Skills */}
      <section className="mt-5">
        <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-faint">
          Builds
        </h2>
        <ul className="space-y-2">
          {mission.skillRewards.map((award) => {
            const skill = getSkill(award.skillId);
            if (!skill) return null;
            return (
              <li key={award.skillId} className="sq-card-flat flex items-start justify-between gap-3 p-3.5">
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-chalk">{skill.name}</span>
                  <span className="block text-xs text-muted">{skill.capability}</span>
                </span>
                <span className={cn("shrink-0 text-sm font-bold tabular-nums", ACCENT_TEXT[mission.accent])}>
                  +{award.points}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Related reading */}
      {mission.relatedPulseItemIds?.length ? (
        <section className="mt-5">
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-faint">
            Background
          </h2>
          <ul className="space-y-2">
            {mission.relatedPulseItemIds.map((id) => {
              const item = getPulseItem(id);
              if (!item) return null;
              return (
                <li key={id}>
                  <Link
                    href={`/pulse/${item.id}`}
                    className="sq-card sq-pressable flex items-center gap-3 p-3.5 hover:border-white/16"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-chalk">{item.title}</span>
                      <span className="block truncate text-xs text-muted">{item.source}</span>
                    </span>
                    <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {playable ? (
        <div className="mt-8 border-t border-white/8 pt-5">
          <ButtonLink
            href={`/play/${mission.id}`}
            variant="secondary"
            size="lg"
            full
            className="lg:w-auto lg:px-10"
          >
            {complete ? "Play again" : "Start mission"}
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
      ) : null}
    </article>
  );
}

function Fact({
  icon,
  children,
  className,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-semibold text-mist",
        className,
      )}
    >
      {icon}
      {children}
    </li>
  );
}
