"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import {
  HERO_MISSION_IDS,
  MISSIONS,
  MISSION_TYPE_BLURBS,
  MISSION_TYPE_LABELS,
} from "@/data/missions";
import { MissionCard } from "@/components/mission/mission-card";
import Link from "next/link";

import { SignatureStrip } from "@/components/mission/signature-strip";
import { CAMPAIGNS } from "@/data/campaigns";
import { SectionHeader } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/app-shell";
import { useProfile } from "@/hooks/use-profile";
import type { MissionType } from "@/types/mission";

type Filter = "all" | "for-you" | MissionType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "for-you", label: "For you" },
  { id: "all", label: "All" },
  { id: "quick", label: "Quick" },
  { id: "crew", label: "Crew" },
  { id: "field", label: "Field" },
  { id: "build", label: "Build" },
  { id: "service", label: "Service" },
  { id: "boss", label: "Boss" },
];

export function MissionsBrowser() {
  const { profile, ready } = useProfile();
  const [filter, setFilter] = useState<Filter>("for-you");

  const missions = useMemo(() => {
    // The signature three have their own section above, so the general list
    // skips them unless the reader is filtering by a specific mission type.
    const rest = MISSIONS.filter((mission) => !HERO_MISSION_IDS.includes(mission.id));

    if (filter === "all") return rest;

    if (filter === "for-you") {
      // Age band first, then anything matching a stated interest, then the rest.
      // Nothing is hidden: relevance changes the order, never the catalogue.
      const scored = rest.map((mission) => {
        let score = 0;
        if (mission.ageBands.includes(profile.ageBand)) score += 3;
        if (mission.categories.some((category) => profile.interests.includes(category as never)))
          score += 2;
        if (profile.completedMissionIds.includes(mission.id)) score -= 4;
        if (mission.status !== "available") score -= 2;
        return { mission, score };
      });
      return scored.sort((a, b) => b.score - a.score).map((entry) => entry.mission);
    }

    return MISSIONS.filter((mission) => mission.missionType === filter);
  }, [filter, profile.ageBand, profile.interests, profile.completedMissionIds]);

  const completedCount = ready
    ? MISSIONS.filter((mission) => profile.completedMissionIds.includes(mission.id)).length
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Pillar two"
        title="Missions"
        lede="Prevention you take part in. Two minute decisions, crew challenges, real places, and briefs where you design the fix."
      />

      <p className="mb-6 text-sm text-muted">
        {completedCount} of {MISSIONS.length} completed
      </p>

      <section className="mb-8">
        <SectionHeader
          title="Start here"
          subtitle="The three missions that carry the idea."
        />
        <SignatureStrip />
      </section>

      {CAMPAIGNS.length ? (
        <section className="mb-8">
          <SectionHeader
            title="Campaigns"
            subtitle="Longer, story-driven experiences built for real places."
          />
          <Link
            href={`/campaigns/${CAMPAIGNS[0].slug}`}
            className="sq-card sq-pressable block p-4 hover:border-white/16"
          >
            <p className="font-display text-lg font-bold text-chalk">{CAMPAIGNS[0].title}</p>
            <p className="mt-1 text-sm text-muted">{CAMPAIGNS[0].subtitle}</p>
            <p className="mt-2.5 text-xs font-semibold text-coral-300">
              {CAMPAIGNS[0].chapters.length} chapters
              <span aria-hidden className="mx-1.5 text-faint">
                &middot;
              </span>
              about {CAMPAIGNS[0].estimatedMinutes} min
            </p>
          </Link>
        </section>
      ) : null}

      <h2 className="mb-3 text-lg font-bold tracking-tight text-chalk">Everything else</h2>

      <div className="sq-scroll-x sq-edge-fade -mx-4 mb-5 flex gap-2 px-4 lg:mx-0 lg:px-0">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            aria-pressed={filter === option.id}
            className={cn(
              "sq-pressable min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap",
              filter === option.id
                ? "border-quest-400 bg-quest-500/15 text-quest-300"
                : "border-white/10 bg-white/4 text-mist hover:bg-white/7",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filter !== "all" && filter !== "for-you" ? (
        <p className="mb-4 text-sm text-muted">{MISSION_TYPE_BLURBS[filter]}</p>
      ) : null}

      {missions.length === 0 ? (
        <p className="sq-card px-5 py-8 text-center text-sm text-muted">
          Nothing here yet. Try another filter.
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {missions.map((mission) => (
            <li key={mission.id}>
              <MissionCard
                mission={mission}
                complete={ready && profile.completedMissionIds.includes(mission.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs leading-relaxed text-faint">
        Mission types: {Object.values(MISSION_TYPE_LABELS).join(", ")}. XP is granted once per
        mission. Replaying is encouraged and adds nothing to your total.
      </p>
    </div>
  );
}
