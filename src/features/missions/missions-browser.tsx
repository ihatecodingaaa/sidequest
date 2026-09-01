"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Clock, MapPin, Users, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { formatDuration } from "@/lib/format";
import { HERO_MISSION_IDS, MISSIONS, MISSION_TYPE_LABELS } from "@/data/missions";
import { CAMPAIGNS } from "@/data/campaigns";
import { physicalChapters } from "@/lib/campaign";
import { MissionCard } from "@/components/mission/mission-card";
import { SignatureStrip } from "@/components/mission/signature-strip";
import { PageHeader } from "@/components/layout/app-shell";
import { useProfile } from "@/hooks/use-profile";
import { questGiver, splitByStatus } from "@/features/missions/quest-journal";
import type { UserProfile } from "@/types/profile";
import type { Mission, MissionType } from "@/types/mission";

type Filter = "all" | MissionType;

/**
 * Fewer filters than before. Seven chips overflowed the phone mid-word, and
 * splitting a small catalogue seven ways mostly produced lists of one.
 */
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "quick", label: "Short" },
  { id: "crew", label: "With friends" },
  { id: "field", label: "Out there" },
  { id: "build", label: "Design" },
];

/**
 * Missions.
 *
 * Two changes matter here beyond the visual pass.
 *
 * The completion denominator is gone. "3 of 11 completed" turns a catalogue
 * into a syllabus and implies an obligation to finish, which is the opposite
 * of the autonomy the product is trying to support. Progress lives on You,
 * where somebody went to look at it.
 *
 * Mission types are now structurally different rather than identically shaped
 * cards with differently coloured chips. A two minute scenario and a two hour
 * volunteering session are not the same kind of commitment, and a colour chip
 * is too weak a signal to carry that difference.
 *
 * The third change is that this list now knows about the district. Every row
 * that somebody in the world opens says who asks and where they stand, and
 * says it differently once you have met them, so the catalogue and the
 * neighbourhood are visibly the same eleven things rather than two products
 * sharing an app. See `quest-journal.ts` for why that is derived and not
 * stored.
 *
 * Finished missions drop to their own group at the bottom. They are still
 * here, still replayable and still free to replay; they have simply stopped
 * competing for attention with the ones somebody has not done.
 */
export function MissionsBrowser() {
  const { profile, ready } = useProfile();
  const [filter, setFilter] = useState<Filter>("all");

  const campaign = CAMPAIGNS[0];

  const missions = useMemo(() => {
    // The signature three have their own section above.
    const rest = MISSIONS.filter((mission) => !HERO_MISSION_IDS.includes(mission.id));
    if (filter === "all") return rest;
    return rest.filter((mission) => mission.missionType === filter);
  }, [filter]);

  const isDone = (mission: Mission) =>
    ready && profile.completedMissionIds.includes(mission.id);

  const { open, done } = splitByStatus(missions, profile, ready);

  return (
    <div>
      <PageHeader
        title="Missions"
        lede="Short decisions, stories with your crew, and real places to go."
      />

      {/* The flagship gets the weight it deserves on the screen that sells it. */}
      {campaign ? (
        <Link
          href={`/campaigns/${campaign.slug}`}
          className="group relative mb-8 block overflow-hidden rounded-[1.5rem] border border-coral-500/25 sq-pressable"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(110%_100%_at_0%_0%,rgba(255,95,95,0.28)_0%,transparent_60%),radial-gradient(90%_90%_at_100%_100%,rgba(110,86,248,0.3)_0%,transparent_65%)]"
          />
          <div className="relative flex items-center gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-coral-300">
                Story campaign
              </p>
              <h2 className="mt-1.5 font-display text-2xl leading-tight font-extrabold text-chalk">
                {campaign.title}
              </h2>
              <p className="mt-1.5 text-sm text-mist">{campaign.subtitle}</p>
              <p className="mt-2.5 text-xs font-semibold text-faint">
                {physicalChapters(campaign).length} chapters
                <span aria-hidden className="mx-1.5">
                  &middot;
                </span>
                about {campaign.estimatedMinutes} min
              </p>
            </div>
            <ArrowRight
              aria-hidden
              className="size-5 shrink-0 text-coral-300 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </div>
        </Link>
      ) : null}

      <section className="mb-8">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-[0.1em] text-faint">Start here</h2>
        <p className="mb-3 text-sm text-muted">The three that carry the idea.</p>
        <SignatureStrip />
      </section>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-faint">
        More to play
      </h2>

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

      {missions.length === 0 ? (
        <p className="rounded-2xl border border-white/8 px-5 py-8 text-center text-sm text-muted">
          Nothing here yet. Try another filter.
        </p>
      ) : (
        <MissionList missions={open} isDone={isDone} profile={profile} ready={ready} />
      )}

      {done.length ? (
        <section className="mt-8">
          <h3 className="mb-1 text-xs font-semibold tracking-[0.1em] text-faint uppercase">
            Already played
          </h3>
          <p className="mb-2.5 text-sm text-muted">
            Replay any of these. They cost nothing and pay nothing the second time.
          </p>
          <ul className="divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
            {done.map((mission) => (
              <li key={mission.id}>
                <QuickRow mission={mission} done profile={profile} ready={ready} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/**
 * Short scenarios become compact rows; anything involving a real place, a real
 * submission or a season gets a full card. The structure carries the
 * difference in commitment so the reader does not have to decode a chip.
 */
function MissionList({
  missions,
  isDone,
  profile,
  ready,
}: {
  missions: Mission[];
  isDone: (mission: Mission) => boolean;
  profile: UserProfile;
  ready: boolean;
}) {
  const quick = missions.filter(
    (mission) => mission.missionType === "quick" || mission.missionType === "crew",
  );
  const bigger = missions.filter(
    (mission) => mission.missionType !== "quick" && mission.missionType !== "crew",
  );

  return (
    <div className="space-y-8">
      {quick.length ? (
        <section>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-faint">
            A few minutes
          </h3>
          <ul className="divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
            {quick.map((mission) => (
              <li key={mission.id}>
                <QuickRow
                  mission={mission}
                  done={isDone(mission)}
                  profile={profile}
                  ready={ready}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {bigger.length ? (
        <section>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-faint">
            Bigger things
          </h3>
          <ul className="grid gap-3 lg:grid-cols-2">
            {bigger.map((mission) => (
              <li key={mission.id}>
                <MissionCard mission={mission} complete={isDone(mission)} />
                <GiverLine mission={mission} profile={profile} ready={ready} className="mt-1.5 px-1" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/**
 * Who asks for this, and where.
 *
 * Two states, and the difference between them is the whole reason it is here.
 * Before you have met somebody it names a stranger and a place, which is an
 * invitation. After you have met them it says so, which turns a catalogue row
 * into a person you owe an answer to. Neither state is a score and neither is
 * a lock: everything is openable from here regardless.
 */
function GiverLine({
  mission,
  profile,
  ready,
  className,
}: {
  mission: Mission;
  profile: UserProfile;
  ready: boolean;
  className?: string;
}) {
  const giver = questGiver(mission.id, profile);
  if (!giver) return null;
  return (
    <span className={cn("flex items-center gap-1 text-xs font-semibold text-faint", className)}>
      <MapPin aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">
        {ready && giver.met
          ? `${giver.name} asked you, at the ${giver.place.toLowerCase()}`
          : `${giver.name} asks, at the ${giver.place.toLowerCase()}`}
      </span>
    </span>
  );
}

function QuickRow({
  mission,
  done,
  profile,
  ready,
}: {
  mission: Mission;
  done: boolean;
  profile: UserProfile;
  ready: boolean;
}) {
  const locked = mission.status === "coming-soon";
  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[0.95rem] font-bold text-chalk">{mission.title}</span>
          {done ? (
            <Check aria-hidden className="size-3.5 shrink-0 text-volt-400" strokeWidth={3} />
          ) : null}
        </span>
        <span className="mt-0.5 flex items-center gap-2.5 text-xs font-semibold text-faint">
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="size-3.5" />
            {formatDuration(mission.durationMinutes)}
          </span>
          <span className={ACCENT_TEXT[mission.accent]}>{mission.xp} XP</span>
          {mission.missionType === "crew" ? (
            <span className="inline-flex items-center gap-1">
              <Users aria-hidden className="size-3.5" />
              crew
            </span>
          ) : null}
        </span>
        <GiverLine mission={mission} profile={profile} ready={ready} className="mt-1" />
      </span>
      <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
    </>
  );

  if (locked) {
    return (
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 opacity-50">{content}</div>
    );
  }

  return (
    <Link
      href={`/missions/${mission.id}`}
      className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4"
    >
      {content}
    </Link>
  );
}

/** Exported so the mission detail page can name a type without a glossary. */
export { MISSION_TYPE_LABELS };

/** Kept so field missions can show where they happen without a legend. */
export function MissionPlace({ area }: { area: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-faint">
      <MapPin aria-hidden className="size-3.5" />
      {area}
    </span>
  );
}

/** Small XP marker reused by compact rows. */
export function XpMark({ xp }: { xp: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-volt-300">
      <Zap aria-hidden className="size-3.5" />
      {xp}
    </span>
  );
}
