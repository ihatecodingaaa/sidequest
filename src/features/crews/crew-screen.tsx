"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Crown, KeyRound, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { formatXp } from "@/lib/format";
import { CREWS, LEADERBOARD, findCrewByJoinCode, getCrew } from "@/data/crews";
import { getMission } from "@/data/missions";
import { PageHeader } from "@/components/layout/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar, SectionHeader } from "@/components/ui/primitives";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";

export function CrewScreen() {
  const { profile, ready } = useProfile();
  const joinCrew = useAppStore((state) => state.joinCrew);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const crew = getCrew(profile.crewId);

  const join = () => {
    const found = findCrewByJoinCode(code);
    if (!found) {
      setError("No crew with that code. The crews above can be joined by tapping.");
      return;
    }
    joinCrew(found.id);
    setCode("");
    setError(null);
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="You"
        title="Crew"
        lede="Crews run asynchronously. Everyone plays in their own time and the week adds up."
      />

      {ready && crew ? (
        <>
          <section className="sq-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-extrabold text-chalk">{crew.name}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {crew.tag} &middot; {crew.members.length} members
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-2xl font-extrabold text-volt-300 tabular-nums">
                  {formatXp(crew.weeklyXp)}
                </p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-faint">
                  this week
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {crew.members.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full bg-ink-700 text-xs font-bold",
                      ACCENT_TEXT[member.accent],
                    )}
                  >
                    {member.initials}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm font-semibold",
                      member.isYou ? "text-chalk" : "text-mist",
                    )}
                  >
                    {member.name}
                    {member.isYou ? (
                      <span className="ml-2 rounded-full bg-quest-500/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-quest-300">
                        you
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-faint tabular-nums">
                    {member.weeklyXp}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs text-faint">
              Crew members and their weekly totals are prototype content. There is no realtime layer
              and no account system in this build.
            </p>
          </section>

          {/* Current challenge */}
          <section>
            <SectionHeader title="This week's crew challenge" />
            <div className="sq-card p-4">
              <h3 className="font-display text-lg font-bold text-chalk">
                {crew.currentChallenge.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{crew.currentChallenge.detail}</p>
              <ProgressBar
                className="mt-3.5"
                accent="quest"
                value={crew.currentChallenge.progress / crew.currentChallenge.target}
                label="Crew challenge progress"
              />
              <p className="mt-1.5 text-xs text-faint tabular-nums">
                {crew.currentChallenge.progress} of {crew.currentChallenge.target}
              </p>

              {crew.currentChallenge.missionId ? (
                <ButtonLink
                  href={`/missions/${crew.currentChallenge.missionId}`}
                  className="mt-4"
                  full
                  variant="secondary"
                >
                  {getMission(crew.currentChallenge.missionId)?.title ?? "Open mission"}
                  <ArrowRight aria-hidden className="size-4" />
                </ButtonLink>
              ) : null}
            </div>
          </section>

          {/* Achievements */}
          <section>
            <SectionHeader title="Recently" />
            <ul className="space-y-2">
              {crew.recentAchievements.map((achievement) => (
                <li key={achievement.label} className="sq-card-flat flex items-center gap-3 p-3.5">
                  <Check aria-hidden className="size-4 shrink-0 text-volt-400" />
                  <span className="min-w-0 flex-1 text-sm text-mist">{achievement.label}</span>
                  <span className="shrink-0 text-xs text-faint">{achievement.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <section className="sq-card px-5 py-8 text-center">
          <Users aria-hidden className="mx-auto size-7 text-faint" />
          <p className="mt-3 font-display text-lg font-bold text-chalk">You are not in a crew</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Join one with a code below. Crews make the weekly challenges worth finishing.
          </p>
        </section>
      )}

      {/* Leaderboard */}
      <section>
        <SectionHeader title="This week" subtitle="Prototype leaderboard." />
        <ul className="space-y-2">
          {LEADERBOARD.map((entry) => {
            const isMine = entry.crewId === profile.crewId;
            return (
              <li
                key={entry.crewId}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3.5",
                  isMine ? "border-quest-500/40 bg-quest-500/8" : "border-white/10 bg-white/4",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-xl font-display text-sm font-bold",
                    entry.rank === 1 ? "bg-gold-500/15 text-gold-400" : "bg-white/6 text-faint",
                  )}
                >
                  {entry.rank === 1 ? <Crown aria-hidden className="size-4" /> : entry.rank}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-chalk">
                  {entry.name}
                </span>
                <span className="shrink-0 text-sm font-bold text-volt-300 tabular-nums">
                  {formatXp(entry.weeklyXp)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Join */}
      <section>
        <SectionHeader title="Join another crew" subtitle="Codes are seeded for the prototype." />
        <div className="sq-card p-4">
          {/*
            Tap to join, first.

            The crews and their codes were already listed on this screen, as
            text, next to a box you had to type the code into. That is a
            keyboard requirement with the answer printed underneath it, which
            is the clearest possible example of the friction testers were
            describing. The list is now the primary path and the code field is
            the fallback for a code that is not on it.
          */}
          <ul className="space-y-2">
            {CREWS.map((entry) => {
              const current = entry.id === profile.crewId;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    disabled={current}
                    onClick={() => {
                      joinCrew(entry.id);
                      setError(null);
                    }}
                    className={cn(
                      "sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left",
                      current
                        ? "cursor-not-allowed border-white/8 bg-white/2"
                        : "border-white/10 bg-white/4 hover:bg-white/7",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-chalk">{entry.name}</span>
                      <span className="block font-mono text-xs text-faint">{entry.joinCode}</span>
                    </span>
                    {current ? (
                      <span className="shrink-0 text-xs font-semibold text-faint">You are here</span>
                    ) : (
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <label className="mt-4 block">
            <span className="flex items-center gap-2 text-sm font-semibold text-chalk">
              <KeyRound aria-hidden className="size-4 text-faint" />
              Or type a code
            </span>
            <input
              data-input-role="code-entry"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="CLUB-482"
              autoComplete="off"
              spellCheck={false}
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 font-mono text-base tracking-wider text-chalk uppercase placeholder:text-faint focus:border-quest-400 focus:outline-none"
            />
          </label>

          {error ? (
            <p role="alert" className="mt-2 text-sm text-coral-300">
              {error}
            </p>
          ) : null}

          <Button className="mt-3" full disabled={code.trim().length === 0} onClick={join}>
            Join crew
          </Button>
        </div>
      </section>

      <p className="text-xs leading-relaxed text-faint">
        A production version would handle invites, verification and moderation properly. This build
        deliberately stops short of that so the prevention experiences got the time instead. See{" "}
        <Link href="/settings" className="text-quest-300 underline underline-offset-2">
          Settings
        </Link>{" "}
        to reset the demo.
      </p>
    </div>
  );
}
