"use client";

import Link from "next/link";
import { Award, ChevronRight, Flame, Gift, Settings, Users, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { formatXp } from "@/lib/format";
import { getLevelProgress } from "@/lib/xp";
import { MISSIONS, getMission } from "@/data/missions";
import { SAFETY_SKILLS, skillTier } from "@/data/skills";
import { getCrew } from "@/data/crews";
import { getReward } from "@/data/rewards";
import { getPrinciple } from "@/data/partner-challenges";
import { PageHeader } from "@/components/layout/app-shell";
import { ProgressBar, SectionHeader, StatTile } from "@/components/ui/primitives";
import { useProfile } from "@/hooks/use-profile";
import { LevelRing } from "./level-ring";
import { CampaignContributions } from "@/features/campaigns/campaign-contributions";

export function ProfileScreen() {
  const { profile, ready } = useProfile();
  const level = getLevelProgress(profile.xp);
  const crew = getCrew(profile.crewId);

  const completed = ready
    ? profile.completedMissionIds
        .map(getMission)
        .filter((mission): mission is NonNullable<typeof mission> => Boolean(mission))
    : [];

  const totalSkillPoints = Object.values(profile.skillPoints).reduce<number>(
    (sum, value) => sum + (value ?? 0),
    0,
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="You"
        title={ready && profile.displayName ? profile.displayName : "Your progress"}
        lede="Your Safety Passport records what you can do, not how much you have read."
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
          label="Missions"
          value={String(completed.length)}
          hint={`of ${MISSIONS.length}`}
          accent="quest"
        />
        <StatTile
          label="Streak"
          value={ready ? String(profile.streakDays) : "0"}
          hint="days"
          accent="coral"
        />
        <StatTile
          label="Skill pts"
          value={ready ? formatXp(totalSkillPoints) : "0"}
          hint="across 7 areas"
          accent="volt"
        />
      </div>

      {/* Safety Passport */}
      <section>
        <SectionHeader
          title="Safety Passport"
          subtitle="What you can do, and how far along you are."
        />

        <ul className="space-y-2.5">
          {SAFETY_SKILLS.map((skill) => {
            const points = ready ? (profile.skillPoints[skill.id] ?? 0) : 0;
            const tier = skillTier(points);
            const ceiling = tier.nextAt ?? Math.max(points, 130);
            const floorForTier = points === 0 ? 0 : points;

            return (
              <li key={skill.id} className="sq-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold text-chalk">{skill.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted">{skill.capability}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide",
                      tier.index === 0
                        ? "bg-white/6 text-faint"
                        : tier.index >= 3
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
                  value={tier.nextAt ? Math.min(1, floorForTier / ceiling) : 1}
                  label={`${skill.name} progress`}
                />
                <p className="mt-1.5 text-xs text-faint">
                  {points === 0 ? (
                    "No missions have built this yet"
                  ) : (
                    <span className="tabular-nums">
                      {points} points
                      {tier.nextAt ? <> &middot; next tier at {tier.nextAt}</> : null}
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-3 text-xs leading-relaxed text-faint">
          The Safety Passport is a SIDEQUEST record. It is not a SkillsFuture credential and carries
          no formal recognition. The structure is designed so a recognised credential could be
          issued by an appropriate body in future.
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
