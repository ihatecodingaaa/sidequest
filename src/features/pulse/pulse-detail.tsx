"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Eye, Sparkles } from "lucide-react";

import { practiceFor } from "@/data/practice-themes";
import { ButtonLink } from "@/components/ui/button";
import { Chip, ExternalLink, ProvenanceTag } from "@/components/ui/primitives";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { offsetLabel } from "./offset-label";
import type { PulseItem } from "@/types/content";

export function PulseDetail({ item }: { item: PulseItem }) {
  const { profile, ready } = useProfile();
  const toggleSaved = useAppStore((state) => state.toggleSavedPulse);
  const practice = practiceFor(item.id);
  const saved = ready && profile.savedPulseIds.includes(item.id);

  return (
    <article className="pb-4">
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/pulse"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mist hover:text-chalk"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Pulse
        </Link>
        <button
          type="button"
          onClick={() => toggleSaved(item.id)}
          aria-pressed={saved}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-mist sq-pressable hover:bg-white/8 hover:text-chalk"
        >
          {saved ? (
            <>
              <BookmarkCheck aria-hidden className="size-4 text-pulse-300" />
              Saved
            </>
          ) : (
            <>
              <Bookmark aria-hidden className="size-4" />
              Save
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Chip accent="pulse">{item.category}</Chip>
        <ProvenanceTag provenance={item.provenance} compact />
        <span className="text-[0.7rem] font-semibold text-faint">
          {offsetLabel(item.publishedOffsetHours)}
        </span>
      </div>

      <h1 className="mt-4 text-balance-tight font-display text-[1.9rem] leading-[1.1] font-extrabold tracking-tight text-chalk lg:text-4xl">
        {item.title}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-mist">{item.summary}</p>

      <div className="mt-5 space-y-3.5">
        {item.context.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-mist">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Signals */}
      {item.signals?.length ? (
        <section className="sq-card mt-6 p-4">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-faint">
            <Eye aria-hidden className="size-3.5" />
            What to look for
          </h2>
          <ul className="mt-3 space-y-2">
            {item.signals.map((signal) => (
              <li key={signal} className="flex gap-2.5 text-sm leading-relaxed text-chalk">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-pulse-400" />
                {signal}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Actions */}
      {item.actions?.length ? (
        <section className="mt-5">
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-faint">
            What actually helps
          </h2>
          <ul className="space-y-2">
            {item.actions.map((action) => (
              <li key={action.label} className="sq-card-flat p-3.5">
                <p className="text-sm font-bold text-chalk">{action.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{action.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Source */}
      <section className="mt-6">
        <ExternalLink
          href={item.sourceUrl}
          className="sq-card sq-pressable flex items-center gap-3 p-4 hover:border-white/16"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-faint">
              Primary source
            </span>
            <span className="mt-1 block text-sm font-bold text-chalk">{item.sourceLabel}</span>
            <span className="block text-xs text-muted">{item.source}</span>
          </span>
        </ExternalLink>
        <p className="mt-2 text-xs leading-relaxed text-faint">
          The summary above is original writing by the SIDEQUEST team, based on public advisories.
          We do not reproduce article text from any publisher.
        </p>
      </section>

      {/*
        Real information, then a fictional rehearsal of the same theme.

        The heading names the theme rather than the story, and the label on the
        control carries the word fictional, because a reader who taps without
        reading the paragraph must still not be able to believe they are about
        to replay the report they just read.
      */}
      {practice ? (
        <section className="mt-7">
          <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-quest-300 uppercase">
            Practise the theme
          </p>
          <div className="sq-card p-4">
            <p className="text-sm leading-relaxed text-mist">
              This is about <span className="font-semibold text-chalk">{practice.theme.name}</span>.
            </p>
            <h2 className="mt-2.5 font-display text-lg leading-tight font-bold text-chalk">
              {practice.mission.title}
            </h2>
            <p className="mt-1.5 text-sm text-muted">{practice.theme.fiction}</p>
            <ButtonLink href={`/missions/${practice.mission.id}`} full size="lg" className="mt-4">
              <Sparkles aria-hidden className="size-4" />
              Practise a fictional version
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <p className="mt-2.5 text-center text-xs text-faint">
              {practice.mission.durationMinutes} min &middot; {practice.mission.xp} XP
            </p>
            <p className="mt-3 text-xs leading-relaxed text-faint">
              Written by SIDEQUEST. Not a recreation of the report above, and not based on any real
              person or incident.
            </p>
          </div>
        </section>
      ) : null}
    </article>
  );
}
