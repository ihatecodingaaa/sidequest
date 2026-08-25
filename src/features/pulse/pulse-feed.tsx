"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Radio, Sparkles } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { DISCOVERY_LINKS, PULSE_ITEMS } from "@/data/pulse";
import { getMission } from "@/data/missions";
import { PageHeader } from "@/components/layout/app-shell";
import { Chip, ExternalLink, ProvenanceTag } from "@/components/ui/primitives";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { offsetLabel } from "./offset-label";
import type { ContentCategory } from "@/types/core";

type Filter = "for-you" | "saved" | ContentCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "for-you", label: "For you" },
  { id: "singapore", label: "Singapore" },
  { id: "scams", label: "Scams" },
  { id: "youth", label: "Youth" },
  { id: "cyber", label: "Cyber" },
  { id: "community", label: "Community" },
  { id: "safety", label: "Safety" },
  { id: "saved", label: "Saved" },
];

export function PulseFeed() {
  const { profile, ready } = useProfile();
  const toggleSaved = useAppStore((state) => state.toggleSavedPulse);
  const [filter, setFilter] = useState<Filter>("for-you");

  const items = useMemo(() => {
    if (filter === "saved") {
      return PULSE_ITEMS.filter((item) => profile.savedPulseIds.includes(item.id));
    }
    if (filter === "for-you") {
      // Interests reorder the feed. Nothing is removed, so a judge always sees
      // the same catalogue whichever profile they arrive with.
      return [...PULSE_ITEMS].sort((a, b) => {
        const score = (category: ContentCategory) =>
          profile.interests.includes(category as never) ? 1 : 0;
        return score(b.category) - score(a.category) || a.publishedOffsetHours - b.publishedOffsetHours;
      });
    }
    if (filter === "singapore") return PULSE_ITEMS;
    return PULSE_ITEMS.filter((item) => item.category === filter);
  }, [filter, profile.interests, profile.savedPulseIds]);

  return (
    <div>
      <PageHeader
        eyebrow="Pillar one"
        title="Pulse"
        lede="What is actually happening, in plain language, with somewhere to go afterwards."
      />

      {/* Discovery */}
      <section className="mb-6">
        <div className="sq-scroll-x sq-edge-fade -mx-4 flex gap-2.5 px-4 pb-1 lg:mx-0 lg:px-0">
          {DISCOVERY_LINKS.map((link) => (
            <ExternalLink
              key={link.id}
              href={link.url}
              showIcon={false}
              className="sq-card sq-pressable w-44 shrink-0 p-3.5 hover:border-white/16"
            >
              <span className={cn("block text-[0.65rem] font-bold uppercase tracking-wide", ACCENT_TEXT[link.accent])}>
                {link.publisher}
              </span>
              <span className="mt-1 block text-sm font-bold text-chalk">{link.label}</span>
              <span className="mt-1 block text-xs leading-snug text-muted">{link.description}</span>
            </ExternalLink>
          ))}
          <Link
            href="/radio"
            className="sq-card sq-pressable flex w-44 shrink-0 flex-col justify-between p-3.5 hover:border-white/16"
          >
            <Radio aria-hidden className="size-4 text-coral-300" />
            <span>
              <span className="mt-2 block text-sm font-bold text-chalk">Radio</span>
              <span className="mt-1 block text-xs text-muted">Six stations on meLISTEN</span>
            </span>
          </Link>
        </div>
        <p className="mt-2 px-1 text-xs text-faint">
          These open the publisher&apos;s own site. SIDEQUEST does not republish their articles.
        </p>
      </section>

      {/* Filters */}
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
                ? "border-pulse-400 bg-pulse-500/15 text-pulse-300"
                : "border-white/10 bg-white/4 text-mist hover:bg-white/7",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="sq-card px-5 py-10 text-center text-sm text-muted">
          {filter === "saved"
            ? "Nothing saved yet. Tap the bookmark on any story."
            : "Nothing in this category yet."}
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {items.map((item) => {
            const mission = item.relatedMissionId ? getMission(item.relatedMissionId) : undefined;
            const saved = ready && profile.savedPulseIds.includes(item.id);

            return (
              <li key={item.id} className="sq-card group relative overflow-hidden">
                <Link href={`/pulse/${item.id}`} className="block p-4 pr-12">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Chip accent="pulse">{item.category}</Chip>
                    <ProvenanceTag provenance={item.provenance} compact />
                    <span className="text-[0.7rem] font-semibold text-faint">
                      {offsetLabel(item.publishedOffsetHours)}
                    </span>
                  </div>

                  <h2 className="mt-2.5 text-balance-tight font-display text-lg leading-tight font-bold text-chalk">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-muted">
                    {item.summary}
                  </p>
                  <p className="mt-2.5 text-xs text-faint">Based on {item.source}</p>
                </Link>

                <button
                  type="button"
                  onClick={() => toggleSaved(item.id)}
                  aria-pressed={saved}
                  aria-label={saved ? `Remove ${item.title} from saved` : `Save ${item.title}`}
                  className="absolute top-2.5 right-2.5 grid size-11 place-items-center rounded-full text-faint sq-pressable hover:bg-white/8 hover:text-chalk"
                >
                  {saved ? (
                    <BookmarkCheck aria-hidden className="size-5 text-pulse-300" />
                  ) : (
                    <Bookmark aria-hidden className="size-5" />
                  )}
                </button>

                {mission ? (
                  <Link
                    href={`/missions/${mission.id}`}
                    className="flex items-center gap-2 border-t border-white/8 px-4 py-3 text-sm font-semibold text-quest-300 sq-pressable hover:bg-white/4"
                  >
                    <Sparkles aria-hidden className="size-4" />
                    Try the related quest
                    <span className="ml-auto text-xs font-medium text-faint">{mission.xp} XP</span>
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-xs leading-relaxed text-faint">
        Pulse summaries are written by the SIDEQUEST team from public advisories and are marked as
        prototype content. Recency labels are illustrative. Every item links to the authority it is
        based on, which is where the primary source lives.
      </p>
    </div>
  );
}
