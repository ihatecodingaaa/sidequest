"use client";

import Link from "next/link";
import { Award, ChevronRight, Flame, Gift, Settings, Users, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { formatXp } from "@/lib/format";
import { getLevelProgress } from "@/lib/xp";
import { getMission } from "@/data/missions";
import { SAFETY_SKILLS, skillTier } from "@/data/skills";
import { getCrew } from "@/data/crews";
import { getReward } from "@/data/rewards";
import { getPrinciple } from "@/data/partner-challenges";
import { PageHeader } from "@/components/layout/app-shell";
import { ProgressBar, SectionHeader, StatTile } from "@/components/ui/primitives";
import { useProfile } from "@/hooks/use-profile";
import { LevelRing } from "./level-ring";
import { CampaignContributions } from "@/features/campaigns/campaign-contributions";
import { EchoCollection } from "@/features/profile/echo-collection";
import { DistrictMemories } from "@/features/profile/district-memories";
import { DistrictStickers } from "@/features/profile/district-stickers";
import { YourCorner } from "@/features/profile/your-corner";

export function ProfileScreen() {
  const { profile, ready } = useProfile();
  const level = getLevelProgress(profile.xp);
  const crew = getCrew(profile.crewId);

  const completed = ready
    ? profile.completedMissionIds
        .map(getMission)
        .filter((mission): mission is NonNullable<typeof mission> => Boolean(mission))
    : [];

  const skillRows = SAFETY_SKILLS.map((skill) => {
    const points = ready ? (profile.skillPoints[skill.id] ?? 0) : 0;
    return { skill, points, tier: skillTier(points) };
  });
  const startedSkills = skillRows.filter((entry) => entry.points > 0);
  const notStartedSkills = skillRows.filter((entry) => entry.points === 0);

  return (
    <div className="space-y-7">
      <PageHeader
        title="You"
        lede="Who you are on the block, and what has happened to you there."
        action={
          <Link
            href="/settings"
            aria-label="Settings and demo controls"
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 text-mist sq-pressable hover:text-chalk"
          >
            <Settings aria-hidden className="size-5" />
          </Link>
        }
      />

      {/*
        Who you are, before what you scored.

        This page used to open with a level ring, an XP total, a progress bar
        and three stat tiles, which is five numbers about the player before
        anything the player owns. The numbers are all still here, one screen
        down, where they read as a record rather than as a verdict.
      */}
      <YourCorner />

      {/*
        What has happened to you, by place.

        Above the passport for the same reason Echo is: this is the part of You
        that is about the world rather than about the player's record, and it
        is the surface somebody looks at when deciding whether to go back out.
      */}
      {/*
        The collection sits between who you are and what happened, because a
        sticker is the shorthand for a memory and the memories are the long
        form. Reading them the other way round means meeting the summary after
        the detail.
      */}
      <DistrictStickers />

      <DistrictMemories />

      {/*
        Echo sits above the passport, and the reason is measurement rather than
        taste. Below it, the collection heading landed 739px down an 1812px
        page: past the level ring, three stat tiles, seven capability rows and
        two disclaimers. Nobody scrolled that far to discover a feature they
        did not know existed, which is why the previous pass shipped a
        collection that users never found.

        The older ordering argued that what you can do outranks what your
        companion looks like. That is still true of importance, and the
        passport still carries more of the screen. It is not true of
        discovery: a capability record is something you go looking for once
        you have earned it, and a collection is the thing that has to be seen
        before you know there is anything to earn.
      */}
      <EchoCollection />

      {/* Level */}
      <section className="sq-card flex items-center gap-5 p-5">
        <LevelRing
          fraction={ready ? level.fraction : 0}
          level={ready ? level.level : 1}
          title={ready ? level.title : "Rookie"}
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-extrabold text-volt-300 tabular-nums">
            {ready ? formatXp(profile.xp) : 0}
            <span className="ml-1 text-sm font-bold text-faint">XP</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {ready && !level.isMaxLevel
              ? `${level.xpForNextLevel} XP to level ${level.level + 1}`
              : "Top level reached"}
          </p>
          <ProgressBar className="mt-3" value={ready ? level.fraction : 0} />
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          label="Played"
          value={String(completed.length)}
          hint={completed.length === 1 ? "mission" : "missions"}
          accent="quest"
        />
        <StatTile
          label="Streak"
          value={ready ? String(profile.streakDays) : "0"}
          hint="days"
          accent="coral"
        />
        <StatTile
          label="Building"
          value={String(startedSkills.length)}
          hint={startedSkills.length === 1 ? "capability" : "capabilities"}
          accent="volt"
        />
      </div>

      {/*
        Safety Passport.

        Capability, not assessment. The previous version rendered seven
        identical progress bars with a point count and a "next tier at N"
        readout, four of them empty, which is a school report card. It also
        showed a new user four empty bars before anything they had done.

        Now: what you are actually building, with the tier phrased as a
        capability, and the untouched areas collapsed into one quiet line
        rather than four rows of nothing.
      */}
      <section>
        <SectionHeader
          title="Safety Passport"
          subtitle="What you can do, not what you scored."
        />

        {startedSkills.length === 0 ? (
          <p className="rounded-2xl border border-white/8 px-5 py-8 text-center text-sm text-muted">
            Play anything and this fills in. Each mission builds a different
            thing.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {startedSkills.map(({ skill, points, tier }) => (
              <li key={skill.id} className="rounded-2xl border border-white/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold text-chalk">{skill.name}</p>
                    <p className="mt-0.5 text-sm leading-snug text-muted">{skill.capability}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide",
                      tier.index >= 3
                        ? "bg-volt-500/15 text-volt-300"
                        : "bg-quest-500/15 text-quest-300",
                    )}
                  >
                    {tier.label}
                  </span>
                </div>
                <ProgressBar
                  className="mt-3"
                  accent={tier.index >= 3 ? "volt" : "quest"}
                  value={tier.nextAt ? Math.min(1, points / tier.nextAt) : 1}
                  label={`${skill.name}: ${tier.label}`}
                />
              </li>
            ))}
          </ul>
        )}

        {notStartedSkills.length ? (
          <p className="mt-3 text-xs leading-relaxed text-faint">
            Not started yet: {notStartedSkills.map((entry) => entry.skill.name).join(", ")}.
          </p>
        ) : null}

        <p className="mt-2 text-xs leading-relaxed text-faint">
          A SIDEQUEST record, not a SkillsFuture credential. It carries no formal recognition.
        </p>
      </section>

      <CampaignContributions />

      {/* Contributions */}
      {ready && profile.submissions.length ? (
        <section>
          <SectionHeader title="Your contributions" subtitle="Build Quest entries you submitted." />
          <ul className="space-y-2.5">
            {profile.submissions.map((submission) => {
              const principle = getPrinciple(submission.principleId);
              return (
                <li key={submission.id} className="sq-card p-4">
                  <div className="flex items-start gap-3">
                    <Award aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-400" />
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-chalk">
                        {submission.title}
                      </p>
                      {principle ? (
                        <p className="mt-0.5 text-xs font-semibold text-gold-400">
                          {principle.label}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {submission.solution}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Completed */}
      <section>
        <SectionHeader title="Completed" action="All missions" href="/missions" />
        {completed.length === 0 ? (
          <p className="sq-card px-5 py-8 text-center text-sm text-muted">
            Nothing yet. A two minute Quick Quest is the easiest place to start.
          </p>
        ) : (
          <ul className="space-y-2">
            {completed.map((mission) => (
              <li key={mission.id}>
                <Link
                  href={`/missions/${mission.id}`}
                  className="sq-card sq-pressable flex items-center gap-3 p-3.5 hover:border-white/16"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-chalk">{mission.title}</span>
                    <span className="block text-xs text-muted">{mission.subtitle}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-volt-300">
                    <Zap aria-hidden className="size-3.5" />
                    {mission.xp}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Shortcuts */}
      <section className="space-y-2.5">
        <ShortcutRow
          href="/crew"
          icon={<Users aria-hidden className="size-5 text-pulse-300" />}
          label={crew ? crew.name : "Find a crew"}
          hint={crew ? `Rank ${crew.rank} this week` : "Play alongside other people"}
        />
        <ShortcutRow
          href="/rewards"
          icon={<Gift aria-hidden className="size-5 text-gold-400" />}
          label="Rewards"
          hint={
            ready && profile.rewardClaims.length
              ? `${profile.rewardClaims.length} claimed`
              : "Recognition, experiences and prototype concepts"
          }
        />
        <ShortcutRow
          href="/settings"
          icon={<Settings aria-hidden className="size-5 text-mist" />}
          label="Settings and demo"
          hint="Interests, area, and reset"
        />
      </section>

      {/* Claims */}
      {ready && profile.rewardClaims.length ? (
        <section>
          <SectionHeader title="Claimed" />
          <ul className="space-y-2">
            {profile.rewardClaims.map((claim) => {
              const reward = getReward(claim.rewardId);
              if (!reward) return null;
              return (
                <li key={claim.rewardId} className="sq-card p-3.5">
                  <p className="text-sm font-bold text-chalk">{reward.title}</p>
                  <p className="mt-0.5 text-xs text-faint">
                    Reference {claim.reference}. {reward.footnote}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {ready && profile.streakDays > 0 ? (
        <p className="flex items-center justify-center gap-1.5 text-xs text-faint">
          <Flame aria-hidden className="size-3.5 text-coral-400" />
          {profile.streakDays} day streak. Streaks reset if you skip a week, not a day.
        </p>
      ) : null}
    </div>
  );
}

function ShortcutRow({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="sq-card sq-pressable flex items-center gap-3.5 p-4 hover:border-white/16"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/6">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-chalk">{label}</span>
        <span className="block truncate text-xs text-muted">{hint}</span>
      </span>
      <ChevronRight aria-hidden className="size-4 shrink-0 text-faint" />
    </Link>
  );
}
