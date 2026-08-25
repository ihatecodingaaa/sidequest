"use client";

import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Gift,
  MapPin,
  Radio,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { formatDuration, formatXp, greetingFor } from "@/lib/format";
import { getLevelProgress } from "@/lib/xp";
import { useMounted, useProfile } from "@/hooks/use-profile";
import { getFeaturedPulseItem } from "@/data/pulse";
import { getMission } from "@/data/missions";
import { getCrew } from "@/data/crews";
import { FEATURED_STATION_ID, getRadioStation } from "@/data/radio";
import { REWARDS } from "@/data/rewards";
import { ButtonLink } from "@/components/ui/button";
import {
  Chip,
  ExternalLink,
  ProgressBar,
  ProvenanceTag,
  SectionHeader,
} from "@/components/ui/primitives";
import { Wordmark } from "@/components/layout/wordmark";
import { MissionCard } from "@/components/mission/mission-card";
import { SignatureStrip } from "@/components/mission/signature-strip";
import { offsetLabel } from "@/features/pulse/offset-label";

const QUICK_QUEST_ID = "mission-otp";
const FIELD_QUEST_ID = "mission-field-design-hunt";

export function HomeScreen() {
  const { profile, ready } = useProfile();
  const mounted = useMounted();
  const level = getLevelProgress(profile.xp);

  const featured = getFeaturedPulseItem();
  const relatedMission = featured.relatedMissionId ? getMission(featured.relatedMissionId) : undefined;
  const quickQuest = getMission(QUICK_QUEST_ID);
  const fieldQuest = getMission(FIELD_QUEST_ID);
  const crew = getCrew(profile.crewId);
  const station = getRadioStation(FEATURED_STATION_ID);
  const teaser = REWARDS[0];

  // Rendered only after mount: the greeting depends on the visitor's clock,
  // which the server does not have.
  const greeting = mounted ? greetingFor() : "Welcome";
  const name = ready && profile.displayName ? `, ${profile.displayName}` : "";

  return (
    <div className="space-y-7">
      {/* ------------------------------------------------ Header and XP */}
      <header>
        <div className="flex items-center justify-between">
          <Wordmark className="lg:hidden" />
          <Link
            href="/you"
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-sm font-semibold text-volt-300 sq-pressable"
          >
            <Zap aria-hidden className="size-4" />
            <span className="tabular-nums">{ready ? formatXp(profile.xp) : "0"}</span>
            <span className="text-faint">XP</span>
          </Link>
        </div>

        <h1 className="mt-5 font-display text-[1.7rem] leading-tight font-extrabold tracking-tight text-chalk lg:text-4xl">
          {greeting}
          {name}
        </h1>

        <div className="sq-card mt-4 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-faint">
                Level {ready ? level.level : 1}
              </p>
              <p className="mt-0.5 font-display text-xl font-extrabold text-chalk">
                {ready ? level.title : "Rookie"}
              </p>
            </div>
            {ready && profile.streakDays > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-500/12 px-2.5 py-1 text-sm font-bold text-coral-300">
                <Flame aria-hidden className="size-4" />
                {profile.streakDays} day{profile.streakDays === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>

          <ProgressBar
            className="mt-3.5"
            value={ready ? level.fraction : 0}
            label="Progress to the next level"
          />
          <p className="mt-2 text-xs text-muted">
            {ready && !level.isMaxLevel
              ? `${level.xpForNextLevel} XP to level ${level.level + 1}. Progress tracks what you can do, not how much you have read.`
              : "Top level. Progress tracks what you can do, not how much you have read."}
          </p>
        </div>
      </header>

      {/* ------------------------------------------------- Safety Pulse */}
      <section aria-labelledby="pulse-hero">
        <SectionHeader title="Safety Pulse" action="See all" href="/pulse" />

        <article className="sq-card relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-pulse-500/12 blur-3xl"
          />

          <div className="relative p-4 pb-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip accent="pulse">{featured.category}</Chip>
              <ProvenanceTag provenance={featured.provenance} compact />
              <span className="text-[0.7rem] font-semibold text-faint">
                {offsetLabel(featured.publishedOffsetHours)}
              </span>
            </div>

            <h3
              id="pulse-hero"
              className="mt-3 text-balance-tight font-display text-xl leading-tight font-extrabold text-chalk lg:text-2xl"
            >
              {featured.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mist">{featured.summary}</p>

            <p className="mt-3 text-xs text-faint">
              Based on {featured.source}
            </p>
          </div>

          <div className="relative mt-4 border-t border-white/8 p-4">
            {relatedMission ? (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-quest-300">
                  Information to action
                </p>
                <ButtonLink
                  href={`/missions/${relatedMission.id}`}
                  full
                  size="lg"
                  className="lg:mx-auto lg:w-auto lg:px-12"
                >
                  <Sparkles aria-hidden className="size-4" />
                  Try the related quest
                </ButtonLink>
                <p className="mt-2.5 text-center text-xs text-faint">
                  {relatedMission.title} &middot; {formatDuration(relatedMission.durationMinutes)}{" "}
                  &middot; {relatedMission.xp} XP
                </p>
              </>
            ) : (
              <ButtonLink href={`/pulse/${featured.id}`} full size="lg" variant="secondary">
                Read more
              </ButtonLink>
            )}
          </div>
        </article>
      </section>

      {/* --------------------------------------------- Signature missions */}
      <section aria-labelledby="signature">
        <SectionHeader
          id="signature"
          title="The three that matter"
          subtitle="Rehearse a decision, check a norm, redesign a system."
          action="All missions"
          href="/missions"
        />
        <SignatureStrip />
      </section>

      {/* -------------------------------------------------- Quick Quest */}
      {quickQuest ? (
        <section aria-labelledby="quick-quest">
          <SectionHeader
            title="Two minutes"
            subtitle="Short enough to finish before your stop."
            action="All missions"
            href="/missions"
          />
          <div id="quick-quest">
            <MissionCard
              mission={quickQuest}
              complete={ready && profile.completedMissionIds.includes(quickQuest.id)}
            />
          </div>
        </section>
      ) : null}

      <div className="grid gap-7 lg:grid-cols-2">
      {/* ------------------------------------------------------ Nearby */}
      {fieldQuest ? (
        <section aria-labelledby="nearby">
          <SectionHeader
            title="Near you"
            subtitle={
              ready && profile.neighbourhood
                ? `Showing activity around ${profile.neighbourhood}`
                : "Pick an area to see what is on"
            }
          />
          <article id="nearby" className="sq-card overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-volt-500/12">
                <MapPin aria-hidden className="size-5 text-volt-300" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip accent="volt">Field Quest</Chip>
                  <ProvenanceTag provenance={fieldQuest.provenance} compact />
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-chalk">
                  {fieldQuest.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{fieldQuest.location?.venue}</p>
                <p className="mt-2 text-xs text-faint">
                  {formatDuration(fieldQuest.durationMinutes)} &middot; {fieldQuest.xp} XP &middot;
                  check in on site or with a code
                </p>
              </div>
            </div>
            <div className="border-t border-white/8 p-3">
              <ButtonLink href={`/missions/${fieldQuest.id}`} variant="secondary" full>
                Open Field Quest
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
          </article>
        </section>
      ) : null}

      {/* -------------------------------------------------------- Crew */}
      {crew ? (
        <section aria-labelledby="crew">
          <SectionHeader title="Your crew" action="Open" href="/crew" />
          <Link
            id="crew"
            href="/crew"
            className="sq-card sq-pressable block p-4 hover:border-white/16"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-chalk">{crew.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {crew.members.length} members &middot; rank {crew.rank} this week
                </p>
              </div>
              <span className="shrink-0 text-right">
                <span className="block font-display text-xl font-extrabold text-volt-300 tabular-nums">
                  {formatXp(crew.weeklyXp)}
                </span>
                <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-faint">
                  crew XP
                </span>
              </span>
            </div>

            <div className="mt-3.5 flex items-center gap-3">
              <div className="flex -space-x-2">
                {crew.members.slice(0, 5).map((member) => (
                  <span
                    key={member.id}
                    className={cn(
                      "grid size-8 place-items-center rounded-full border-2 border-ink-900 bg-ink-700 text-[0.65rem] font-bold",
                      ACCENT_TEXT[member.accent],
                    )}
                  >
                    {member.initials}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist">
                <Users aria-hidden className="size-3.5 text-faint" />
                {crew.currentChallenge.title}
              </span>
            </div>

            <ProgressBar
              className="mt-3"
              accent="quest"
              value={crew.currentChallenge.progress / crew.currentChallenge.target}
              label="Crew challenge progress"
            />
            <p className="mt-1.5 text-xs text-faint">
              {crew.currentChallenge.progress} of {crew.currentChallenge.target} done
            </p>
          </Link>
        </section>
      ) : null}

      {/* ------------------------------------------------------- Radio */}
      {station ? (
        <section aria-labelledby="radio">
          <SectionHeader title="Radio" action="All stations" href="/radio" />
          <article id="radio" className="sq-card flex items-center gap-3.5 p-4">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-coral-500/12">
              <span
                aria-hidden
                className="animate-pulse-ring absolute inset-0 rounded-2xl border border-coral-500/40"
              />
              <Radio aria-hidden className="size-5 text-coral-300" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold text-chalk">
                {station.name}
                <span className="ml-2 text-xs font-semibold text-faint">{station.frequency}</span>
              </p>
              <p className="line-clamp-2 text-xs leading-snug text-muted">{station.description}</p>
            </div>
            <ExternalLink
              href={station.officialUrl}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-white/6 px-3.5 text-sm font-semibold text-chalk sq-pressable hover:bg-white/10"
            >
              Listen
            </ExternalLink>
          </article>
          <p className="mt-2 px-1 text-xs text-faint">
            Opens {station.platform}, the official listening service. SIDEQUEST does not stream
            audio.
          </p>
        </section>
      ) : null}

      {/* ------------------------------------------------------ Reward */}
      <section aria-labelledby="reward">
        <SectionHeader title="Worth working towards" action="Rewards" href="/rewards" />
        <article id="reward" className="sq-card p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-500/12">
              <Gift aria-hidden className="size-5 text-gold-400" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <ProvenanceTag provenance={teaser.provenance} compact />
              </div>
              <h3 className="mt-2 font-display text-base font-bold text-chalk">{teaser.title}</h3>
              <p className="mt-1 text-sm text-muted">{teaser.description}</p>
            </div>
          </div>

          <div className="mt-3.5">
            <ProgressBar
              accent="gold"
              value={ready ? Math.min(1, profile.xp / teaser.xpCost) : 0}
              label={`Progress towards ${teaser.title}`}
            />
            <p className="mt-2 text-xs text-faint">
              {ready
                ? profile.xp >= teaser.xpCost
                  ? "Unlocked. Open Rewards to claim it."
                  : `${teaser.xpCost - profile.xp} XP to go`
                : `${teaser.xpCost} XP`}
            </p>
          </div>
        </article>
      </section>

      </div>

      {/* ------------------------------------------------------ Thesis */}
      <section className="sq-card sq-grid-lines overflow-hidden p-5">
        <p className="text-balance-tight font-display text-lg leading-snug font-bold text-chalk">
          We are not building another place to learn about crime prevention. We are building a
          reason to take part in it.
        </p>
        <p className="mt-2.5 text-sm text-muted">
          See it, play it, act on it, then design what comes next.
        </p>
      </section>
    </div>
  );
}
