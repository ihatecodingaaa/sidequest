"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, KeyRound, PencilLine, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import { CREWS, findCrewByJoinCode, getCrew } from "@/data/crews";
import { CREW_CHALLENGES, type CrewChallenge } from "@/data/crew-challenges";
import { CrewBanner, type CrewEmblemId, type CrewPatternId } from "@/components/crew/crew-banner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/primitives";
import { CrewIdentityEditor } from "@/features/crews/crew-identity-editor";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";

/**
 * Crew.
 *
 * ---
 *
 * ## What this screen used to answer, and what it answers now
 *
 * It used to open with a weekly XP total, then rank the player's four friends
 * against them by XP, then show a challenge whose progress bar was a hardcoded
 * number in a data file, then rank their crew against two other crews.
 *
 * Four things were wrong with that, and only one of them was cosmetic.
 *
 * **It answered "how are we doing" when the question is "what are we doing".**
 * A crew of teenagers is not a team with a league position; it is four people
 * who might do a thing together this week.
 *
 * **The challenge progress was fabricated.** "3 of 5" moved for nobody. A
 * player could finish BREAKSAFE five times and watch it stay at three, which
 * teaches them nothing they do here counts, and it is an invented progress
 * claim in a product whose first rule is data honesty.
 *
 * **It ranked friends against each other by points.** In a product for young
 * people, about peer influence, whose whole argument is that a group sets the
 * norm rather than competing inside it.
 *
 * **The crew owned nothing.** No name they chose, no mark, nothing.
 *
 * ## The order now
 *
 * Who we are, what we are doing together, what we have made, and playing
 * together. Members are a list of people rather than a table of scores, and
 * they are below all of it.
 *
 * ## What is real and what is prototype
 *
 * Your own contribution to every challenge is derived from your profile and is
 * exactly as true as your XP. Everything about the other four members is
 * prototype content, and this screen says so next to each place it appears
 * rather than in a footnote at the bottom, because a caveat two hundred pixels
 * from its claim is not a caveat.
 */
export function CrewScreen() {
  const { profile, ready } = useProfile();
  const joinCrew = useAppStore((state) => state.joinCrew);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const crew = getCrew(profile.crewId);
  const banner = ready ? profile.crewBanner : undefined;
  const yours = ready ? CREW_CHALLENGES.filter((entry) => entry.done(profile)) : [];
  /* The lead is the first one still waiting on this player. */
  const lead = ready ? CREW_CHALLENGES.find((entry) => !entry.done(profile)) : undefined;
  const drafts = ready ? (profile.questDrafts ?? []) : [];

  const join = () => {
    const found = findCrewByJoinCode(code);
    if (!found) {
      setError("No crew with that code. The crews below can be joined by tapping.");
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
        lede="What you are doing together, in your own time. Nobody has to be online."
      />

      {ready && crew ? (
        <>
          {/* ------------------------------------------------- Who we are */}
          <section className="sq-card flex items-center gap-4 p-5">
            <CrewBanner
              emblem={(banner?.emblem as CrewEmblemId) ?? "arrow"}
              pattern={(banner?.pattern as CrewPatternId) ?? "plain"}
              accent={banner?.accent ?? "quest"}
              size={54}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-2xl font-extrabold text-chalk">
                {crew.name}
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {crew.tag}
                <span aria-hidden className="mx-1.5">
                  &middot;
                </span>
                {crew.members.length} people
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="sq-pressable mt-2.5 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-sm font-semibold text-chalk"
              >
                <PencilLine aria-hidden className="size-3.5" />
                Change the banner
              </button>
            </div>
          </section>

          {/* ------------------------------------ What we are doing together */}
          <section>
            <SectionHeader
              title="What we are doing together"
              subtitle="Four ways in. None of them needs everybody online at once except the last."
            />
            {/*
              One of them at full weight, the rest as rows.

              Four equal cards is four screens of scrolling in which nothing
              outranks anything, which is the same flat-catalogue problem Home
              and Missions were both fixed for. The lead is the first one this
              player has not done their part in, so the screen changes as they
              work through them and finishes by leading with what is left.
            */}
            {lead ? <ChallengeCard challenge={lead} done={false} /> : null}

            <ul
              className={cn(
                "divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8",
                lead && "mt-2.5",
              )}
            >
              {CREW_CHALLENGES.filter((challenge) => challenge.id !== lead?.id).map(
                (challenge) => (
                  <li key={challenge.id}>
                    <ChallengeRow challenge={challenge} done={challenge.done(profile)} />
                  </li>
                ),
              )}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-faint">
              Whether you have done your part is read from your own progress and is as true as your
              XP. What the other four have done is not knowable in this build: there is no account
              system and no server, so this screen does not show a crew total it would have to
              invent.
            </p>
          </section>

          {/* ------------------------------------------- What we have made */}
          <section>
            <SectionHeader
              title="Quests we made"
              subtitle={
                drafts.length === 0
                  ? "Nothing yet. A crew with its own quests has something no other crew has."
                  : `${drafts.length} written on this device.`
              }
            />
            {drafts.length === 0 ? (
              <Link
                href="/streets"
                className="sq-card sq-pressable flex min-h-16 items-center gap-3 px-4 py-3.5"
              >
                <span className="min-w-0 flex-1 text-sm text-mist">
                  Build one in the crew room, on the block.
                </span>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
              </Link>
            ) : (
              <ul className="divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
                {drafts.slice(0, 4).map((draft) => (
                  <li key={draft.id} className="px-4 py-3">
                    <p className="text-sm font-bold text-chalk">{draft.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                      {draft.hook}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-faint">
              Drafts are saved on this device only. Nothing is published from here and nothing is
              sent anywhere.
            </p>
          </section>

          {/* --------------------------------------------------- The people */}
          <section>
            <SectionHeader title="Who is in it" subtitle="Prototype members. Not real accounts." />
            <ul className="divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
              {crew.members.map((member) => (
                <li key={member.id} className="flex min-h-14 items-center gap-3 px-4 py-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full bg-ink-700 text-xs font-bold",
                      member.isYou ? "text-volt-300" : "text-mist",
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
                  </span>
                  {member.isYou ? (
                    <span className="shrink-0 rounded-full bg-quest-500/15 px-2 py-0.5 text-[0.6rem] font-bold tracking-wide text-quest-300 uppercase">
                      you
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            {/*
              No per-member points column, and no crew league table.

              Both were here and both are gone on purpose. This product's
              argument is that a group sets the norm rather than competing
              inside it, and a column that ranks four friends by XP argues the
              opposite on the screen where the argument matters most. Your own
              progress is on You, where you went to look at it.
            */}
          </section>

          {yours.length > 0 ? (
            <p className="text-sm text-muted">
              You have done your part in {yours.length} of {CREW_CHALLENGES.length}
              {yours.length === 1 ? " thing" : " things"}. That unlocked{" "}
              {yours.length === 1 ? "a banner pattern" : `${yours.length} banner patterns`} for your
              crew.
            </p>
          ) : null}
        </>
      ) : (
        <section className="sq-card px-5 py-8 text-center">
          <Users aria-hidden className="mx-auto size-7 text-faint" />
          <p className="mt-3 font-display text-lg font-bold text-chalk">You are not in a crew</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Join one below. Everything a crew does can be done in your own time.
          </p>
        </section>
      )}

      {/* ------------------------------------------------------------ Join */}
      <section>
        <SectionHeader title="Join another crew" subtitle="Codes are seeded for the prototype." />
        <div className="sq-card p-4">
          {/*
            Tap to join, first. The code field is the fallback for a code that
            is not on the list, not the primary path.
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

      {editing ? <CrewIdentityEditor onClose={() => setEditing(false)} /> : null}
    </div>
  );
}

/**
 * One thing the crew is doing, and whether you have done your bit.
 *
 * The state is a fact about the reader, phrased as a fact rather than as a
 * grade: "You have done this" and "Your part" carry no tick-versus-cross and
 * no colour-only signal. A row you have not done is not marked wrong, because
 * there is nothing to be wrong about.
 */
/**
 * One row, for a challenge that is not the lead.
 *
 * Title, your part, and whether you have done it. Everything a player needs to
 * decide whether to look, and nothing they would have to read twice.
 */
function ChallengeRow({ challenge, done }: { challenge: CrewChallenge; done: boolean }) {
  return (
    <Link
      href={challenge.href}
      className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4"
    >
      {done ? (
        <Check aria-hidden className="size-4 shrink-0 text-volt-400" strokeWidth={3} />
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[0.95rem] leading-snug font-bold text-chalk">
          {challenge.title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-faint">
          {done ? "You have done your part." : challenge.yourPart}
        </span>
      </span>
      <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
    </Link>
  );
}

/** The one still waiting on this player, at full weight. */
function ChallengeCard({ challenge, done }: { challenge: CrewChallenge; done: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        done ? "border-volt-500/25 bg-volt-500/6" : "border-white/10 bg-white/4",
      )}
    >
      <div className="flex items-start gap-2.5">
        {done ? (
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-volt-400" strokeWidth={3} />
        ) : null}
        <h3 className="min-w-0 flex-1 font-display text-lg leading-tight font-bold text-chalk">
          {challenge.title}
        </h3>
      </div>

      <p className="mt-1.5 text-sm leading-relaxed text-muted">{challenge.detail}</p>

      <p className="mt-2.5 text-sm font-semibold text-chalk">
        <span className="text-faint">Your part: </span>
        {challenge.yourPart}
      </p>

      {done ? (
        <p className="mt-2 text-xs font-semibold text-volt-300">
          Done. That unlocked a banner pattern.
        </p>
      ) : (
        <Link
          href={challenge.href}
          className="sq-pressable mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-chalk"
        >
          {challenge.cta}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}
