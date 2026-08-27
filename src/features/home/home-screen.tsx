"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Play, Radio, Users, Zap } from "lucide-react";

import { formatXp, greetingFor } from "@/lib/format";
import { getLevelProgress } from "@/lib/xp";
import { useMounted, useProfile } from "@/hooks/use-profile";
import { getFeaturedPulseItem } from "@/data/pulse";
import { getMission } from "@/data/missions";
import { getCrew } from "@/data/crews";
import { FEATURED_STATION_ID, getRadioStation } from "@/data/radio";
import { CAMPAIGNS } from "@/data/campaigns";
import { completedPhysicalCount, physicalChapters } from "@/lib/campaign";
import { Wordmark } from "@/components/layout/wordmark";
import { SignatureStrip } from "@/components/mission/signature-strip";
import { CharacterPortrait } from "@/components/story/character-portrait";
import { StreetsHero } from "@/features/streets/components/streets-hero";
import { EchoMascot } from "@/components/echo/echo-mascot";
import { resolveEchoStyle } from "@/data/echo-styles";
import { cn } from "@/lib/cn";
import { ExternalLink, ProvenanceTag } from "@/components/ui/primitives";
import type { CampaignProgress } from "@/types/campaign";

/**
 * Home.
 *
 * One hero, then a small number of clearly subordinate things.
 *
 * The previous version presented eleven cards of near-identical weight across
 * nine sections with six competing exits, which taught the user that nothing
 * in particular mattered. A home screen has to answer "what should I do now",
 * and it can only answer that if one thing outranks the rest.
 *
 * The hero is the Campaign. It is the product's most distinctive experience
 * and its most directly on-brief content: peer pressure, a shop-theft moment,
 * an account somebody lends to a friend, and a group decision, all across one
 * day. It shows progress when there is progress and an invitation when there
 * is not.
 *
 * Nothing was deleted from the product here. The field quest, the reward
 * teaser and the quick quest all still exist one tab away; they were
 * deprioritised, not removed.
 */
export function HomeScreen() {
  const { profile, ready } = useProfile();
  const mounted = useMounted();
  const level = getLevelProgress(profile.xp);

  const campaign = CAMPAIGNS[0];
  const progress = ready && campaign ? profile.campaigns?.[campaign.id] : undefined;
  const featured = getFeaturedPulseItem();
  const relatedMission = featured.relatedMissionId
    ? getMission(featured.relatedMissionId)
    : undefined;
  const crew = getCrew(profile.crewId);
  const station = getRadioStation(FEATURED_STATION_ID);

  // The greeting reads the visitor's clock, which the server does not have.
  const greeting = mounted ? greetingFor() : "Welcome";
  const name = ready && profile.displayName ? `, ${profile.displayName}` : "";
  const echoStyle = resolveEchoStyle(profile);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-3">
        <Wordmark className="lg:hidden" />
        <Link
          href="/you"
          aria-label={`Level ${ready ? level.level : 1}, ${ready ? profile.xp : 0} XP. Open your profile.`}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 pr-3.5 pl-3 text-sm font-semibold sq-pressable"
        >
          <Zap aria-hidden className="size-4 text-volt-300" />
          <span className="tabular-nums text-volt-300">{ready ? formatXp(profile.xp) : "0"}</span>
          <span className="text-faint">Lv {ready ? level.level : 1}</span>
        </Link>
      </header>

      {/*
        Echo greets you, at a size where it is a character rather than a bullet.

        Home carried no mascot at all before this, which meant the first screen
        of the product gave a new user no evidence that a companion or a
        collection existed. Everything Echo did happened after you had already
        committed to a mission. A mascot that only appears once you are deep in
        a flow cannot do the job a mascot is for.

        It links to You because tapping your companion to see your companions
        is the affordance people already expect, and it gives the collection a
        route in from the busiest screen instead of relying on the tab bar.
      */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-[1.75rem] leading-tight font-extrabold tracking-tight text-chalk lg:text-4xl">
          {greeting}
          {name}
        </h1>
        <Link
          href="/you"
          aria-label={`Your Echo: ${echoStyle.name}. Open your collection.`}
          className="sq-pressable -m-2 shrink-0 rounded-full p-2"
        >
          <EchoMascot
            style={echoStyle.id}
            expression="pleased"
            size={64}
            className={echoStyle.ring}
          />
        </Link>
      </div>

      {/*
        SIDEQUEST Streets sits above the Campaign hero, because a world is the
        thing somebody has not seen before and the reason to open the app at
        all. The Campaign keeps a full hero directly beneath it: Streets is a
        way in, not a replacement, and ONE BAD MINUTE is still the flagship.
      */}
      <StreetsHero />

      {campaign ? <CampaignHero progress={progress} /> : null}

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section aria-labelledby="play-now">
          <SectionTitle id="play-now" title="Play now" href="/missions" action="All missions" />
          <SignatureStrip className="sm:grid-cols-1" />
        </section>

        <div className="space-y-8">
          {crew ? (
            <section aria-labelledby="crew">
              <SectionTitle id="crew" title="Your crew" href="/crew" action="Open" />
              <Link
                href="/crew"
                className="flex min-h-16 items-center gap-3.5 rounded-2xl border border-white/8 p-3.5 transition-colors hover:bg-white/4"
              >
                <span className="flex -space-x-2">
                  {crew.members.slice(0, 4).map((member) => (
                    <span
                      key={member.id}
                      className="grid size-8 place-items-center rounded-full border-2 border-ink-900 bg-ink-700 text-[0.65rem] font-bold text-mist"
                    >
                      {member.initials}
                    </span>
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-chalk">{crew.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {crew.currentChallenge.title}
                  </span>
                </span>
                <Users aria-hidden className="size-4 shrink-0 text-faint" />
              </Link>
            </section>
          ) : null}

          <section aria-labelledby="knowing">
            <SectionTitle id="knowing" title="Worth knowing" href="/pulse" action="More" />
            <article className="rounded-2xl border border-white/8 p-4">
              <h3 className="text-balance-tight font-display text-lg leading-tight font-bold text-chalk">
                {featured.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{featured.summary}</p>

              {/*
                The signature interaction, and the reason this section is not
                just a news card: a story does not end when you close it, it
                becomes the decision.
              */}
              {relatedMission ? (
                <Link
                  href={`/missions/${relatedMission.id}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-quest-300 hover:text-quest-400"
                >
                  <Play aria-hidden className="size-4" />
                  Play {relatedMission.title}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              ) : (
                <Link
                  href={`/pulse/${featured.id}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-quest-300"
                >
                  Read more
                </Link>
              )}

              <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-faint">
                <ProvenanceTag provenance={featured.provenance} compact />
                {featured.source}
              </p>
            </article>
          </section>

          {station ? (
            <section aria-labelledby="radio">
              <SectionTitle id="radio" title="Listening" href="/radio" action="Stations" />
              <ExternalLink
                href={station.officialUrl}
                showIcon={false}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/8 px-3.5 py-3 transition-colors hover:bg-white/4"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-coral-500/12">
                  <Radio aria-hidden className="size-4 text-coral-300" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-chalk">
                    {station.name}
                    <span className="ml-1.5 text-xs font-medium text-faint">
                      {station.frequency}
                    </span>
                  </span>
                  <span className="block truncate text-xs text-muted">
                    Opens {station.platform}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0 text-faint" />
              </ExternalLink>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */

/**
 * The one element on the screen with real weight.
 *
 * Deliberately not a card from the same family as everything else: larger
 * radius, its own colour field, a solid light button. If it looked like the
 * other surfaces it would not be a hero, it would be the first of several.
 *
 * The colour field is CSS gradients rather than artwork: no image weight, no
 * licensing question, and nothing to load on a roadshow connection.
 */
function CampaignHero({ progress }: { progress: CampaignProgress | undefined }) {
  const campaign = CAMPAIGNS[0];
  const stations = physicalChapters(campaign);
  const done = progress ? completedPhysicalCount(campaign, progress) : 0;
  const started = Boolean(progress);

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group relative block overflow-hidden rounded-[1.75rem] border border-coral-500/25 sq-pressable"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_0%,rgba(255,95,95,0.3)_0%,transparent_58%),radial-gradient(100%_90%_at_100%_100%,rgba(110,86,248,0.34)_0%,transparent_62%)]"
      />
      <div aria-hidden className="sq-grid-lines absolute inset-0 opacity-30" />

      {/*
        The cast, faint, behind the type.
        
        The hero was a colour field and a headline, which is atmosphere without
        a subject. ONE BAD MINUTE is about four friends, so the four of them are
        what the artwork should be. They sit at low opacity behind the copy, so
        they set a scene without competing with the words or the control.
      */}
      {/*
        The cluster is masked away on its left edge. Without it the Start pill
        landed directly across the first two faces, which reads as a layout
        accident rather than a composition: a control sitting on someone's
        head. Fading the far side out means the pill always has plain colour
        under it however long the label gets, and the eye is pushed toward Ken
        on the right, who is the one the chapter is actually about.
      */}
      <div
        aria-hidden
        className="absolute -right-1 bottom-0 flex items-end opacity-[0.42]"
        style={{
          maskImage: "linear-gradient(to right, transparent 4%, #000 46%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 4%, #000 46%)",
        }}
      >
        {(["you", "rina", "ilyas", "ken"] as const).map((id, index) => (
          <CharacterPortrait
            key={id}
            characterId={id}
            expression={index === 3 ? "amused" : "uncertain"}
            className={cn("size-20 -ml-5", index === 3 && "size-24")}
          />
        ))}
      </div>

      <div className="relative p-5 pt-6">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-coral-300">
          {started ? "Continue" : "Story campaign"}
        </p>

        <h2 className="mt-2 font-display text-[2rem] leading-[1.02] font-extrabold tracking-tight text-chalk">
          {campaign.title}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-mist">
          {started
            ? "Four friends, one ordinary day. Pick up where you left off."
            : "One friend makes a bad call. Nobody plans anything. Four small decisions decide how it ends."}
        </p>

        {started ? (
          <div className="mt-4 max-w-xs">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-white/12"
              role="progressbar"
              aria-valuenow={done}
              aria-valuemin={0}
              aria-valuemax={stations.length}
              aria-label="Campaign progress"
            >
              <div
                className="h-full rounded-full bg-coral-400 transition-[width] duration-700"
                style={{ width: `${(done / stations.length) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-mist tabular-nums">
              {done} of {stations.length} chapters
            </p>
          </div>
        ) : null}

        <span className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-chalk px-5 text-sm font-bold text-ink-900 transition-transform duration-200 group-active:scale-[0.98]">
          {started ? "Continue" : "Start"}
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </Link>
  );
}

/* --------------------------------------------------------------- Section */

/** A quiet section label with at most one secondary exit. */
function SectionTitle({
  id,
  title,
  href,
  action,
}: {
  id: string;
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-sm font-bold uppercase tracking-[0.1em] text-faint">
        {title}
      </h2>
      {href && action ? (
        <Link
          href={href}
          className="-mr-2 inline-flex min-h-11 items-center px-2 text-xs font-semibold text-quest-300 hover:text-quest-400"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}
