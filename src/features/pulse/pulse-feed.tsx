"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, BookmarkCheck, ChevronRight, Play, Radio } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { DISCOVERY_LINKS, PULSE_ITEMS } from "@/data/pulse";
import type { DiscoveryLink } from "@/types/content";
import { PULSE_MOTIF, StoryMotif } from "@/components/story/story-motif";
import { getMission } from "@/data/missions";
import { PageHeader } from "@/components/layout/app-shell";
import { ExternalLink, ProvenanceTag } from "@/components/ui/primitives";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { offsetLabel } from "./offset-label";
import type { ContentCategory, Interest } from "@/types/core";

type Filter = "latest" | "saved" | ContentCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "youth", label: "Friends" },
  { id: "safety", label: "Everyday" },
  { id: "scams", label: "Scams" },
  { id: "community", label: "Community" },
  { id: "saved", label: "Saved" },
];

/**
 * Interests are a user vocabulary; categories are a content vocabulary. They
 * are not the same list and matching them by string coincidence was a bug:
 * "scams" matched, "youth" did not, so a profile with the default interests
 * quietly sorted every scam story above every peer-pressure story.
 */
const INTEREST_TO_CATEGORY: Partial<Record<Interest, ContentCategory[]>> = {
  scams: ["scams"],
  cyber: ["cyber"],
  "peer-pressure": ["youth"],
  design: ["safety"],
  volunteering: ["community"],
  events: ["community"],
  news: ["singapore", "safety"],
};

/**
 * Pulse.
 *
 * The previous version stacked eight identical cards, each led by a threat
 * category chip and each closed by the same call to action. Read as a column
 * that is a wall of SCAMS, SCAMS, SCAMS, CYBER, and SIDEQUEST is explicitly
 * not in the business of making Singapore feel unsafe.
 *
 * Now: one lead story with real weight, then a compact list. The
 * Pulse-to-Mission handoff, which is the product's signature interaction, is
 * prominent on the lead and quiet on the rest, so it reads as an invitation
 * rather than as a repeated footer.
 *
 * Provenance is declared once at the top of the feed and again at the bottom,
 * and appears in full on every detail page. It is not repeated on every card,
 * where at eight-per-screen it had stopped being information and become
 * texture.
 */
export function PulseFeed() {
  const { profile, ready } = useProfile();
  const toggleSaved = useAppStore((state) => state.toggleSavedPulse);
  const [filter, setFilter] = useState<Filter>("latest");

  const items = useMemo(() => {
    if (filter === "saved") {
      return PULSE_ITEMS.filter((item) => profile.savedPulseIds.includes(item.id));
    }
    if (filter === "latest") {
      const boosted = new Set(
        profile.interests.flatMap((interest) => INTEREST_TO_CATEGORY[interest] ?? []),
      );
      // Recency leads. An interest match is worth a six hour head start, which
      // personalises the order without letting it override what is new.
      return [...PULSE_ITEMS].sort(
        (a, b) =>
          a.publishedOffsetHours -
          (boosted.has(a.category) ? 6 : 0) -
          (b.publishedOffsetHours - (boosted.has(b.category) ? 6 : 0)),
      );
    }
    return PULSE_ITEMS.filter((item) => item.category === filter);
  }, [filter, profile.interests, profile.savedPulseIds]);

  const [lead, ...rest] = items;

  const officialLinks = DISCOVERY_LINKS.filter((link) => link.provenance === "official-source");
  const reportedLinks = DISCOVERY_LINKS.filter((link) => link.provenance === "reported");

  return (
    <div>
      <PageHeader title="Updates" lede="What is worth knowing, and what you can do about it." />

      <p className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-faint">
        <ProvenanceTag provenance="seeded" compact />
        <span>Written by the SIDEQUEST team from public advisories.</span>
      </p>

      <div className="sq-scroll-x sq-edge-fade -mx-4 mb-6 flex gap-2 px-4 lg:mx-0 lg:px-0">
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
        <p className="rounded-2xl border border-white/8 px-5 py-10 text-center text-sm text-muted">
          {filter === "saved"
            ? "Nothing saved yet. Tap the bookmark on any story."
            : "Nothing in this category yet."}
        </p>
      ) : (
        <>
          {lead ? (
            <LeadStory
              item={lead}
              saved={ready && profile.savedPulseIds.includes(lead.id)}
              onToggleSave={() => toggleSaved(lead.id)}
            />
          ) : null}

          {rest.length ? (
            <ul className="mt-7 divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
              {rest.map((item) => {
                const mission = item.relatedMissionId ? getMission(item.relatedMissionId) : undefined;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/pulse/${item.id}`}
                      className="flex min-h-20 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/4"
                    >
                      {PULSE_MOTIF[item.id] ? (
                        <StoryMotif
                          motif={PULSE_MOTIF[item.id]}
                          accent="pulse"
                          className="size-12 shrink-0"
                        />
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.95rem] leading-snug font-bold text-chalk">
                          {item.title}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-faint">
                          <span>{offsetLabel(item.publishedOffsetHours)}</span>
                          {mission ? (
                            <span className="font-semibold text-quest-300">Has a quest</span>
                          ) : null}
                        </span>
                      </span>
                      <ChevronRight aria-hidden className="size-4 shrink-0 text-faint" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </>
      )}

      {/*
        Discovery, below the product's own content rather than above it.

        Split by who publishes it. A government advisory and a newsroom are not
        the same kind of source, and one subheading each labels every row in the
        group without hanging a chip on all six. Exhaustive, not loud.
      */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-faint">Elsewhere</h2>

        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-faint">
          Official services
        </p>
        <ul className="divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
          {officialLinks.map((link) => (
            <li key={link.id}>
              <DiscoveryRow link={link} />
            </li>
          ))}
        </ul>

        <p className="mt-5 mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-faint">
          News reporting, written by the publisher
        </p>
        <ul className="divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
          {reportedLinks.map((link) => (
            <li key={link.id}>
              <DiscoveryRow link={link} />
            </li>
          ))}
          <li>
            <Link
              href="/radio"
              className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-chalk">Radio</span>
                <span className="block text-xs text-muted">Six stations on meLISTEN</span>
              </span>
              <Radio aria-hidden className="size-4 shrink-0 text-coral-300" />
            </Link>
          </li>
        </ul>
        <p className="mt-2 text-xs text-faint">
          These open the publisher&apos;s own site. SIDEQUEST does not republish their articles.
        </p>
      </section>
    </div>
  );
}

/**
 * The lead story.
 *
 * Not a card. Larger type, no enclosing border, and the mission handoff as a
 * real button rather than a repeated link, so one story clearly outranks the
 * others instead of eight competing on equal terms.
 */
function LeadStory({
  item,
  saved,
  onToggleSave,
}: {
  item: (typeof PULSE_ITEMS)[number];
  saved: boolean;
  onToggleSave: () => void;
}) {
  const mission = item.relatedMissionId ? getMission(item.relatedMissionId) : undefined;

  return (
    <article>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pulse-300">
          {offsetLabel(item.publishedOffsetHours)}
        </p>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${item.title} from saved` : `Save ${item.title}`}
          className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-faint sq-pressable hover:bg-white/8 hover:text-chalk"
        >
          {saved ? (
            <BookmarkCheck aria-hidden className="size-5 text-pulse-300" />
          ) : (
            <Bookmark aria-hidden className="size-5" />
          )}
        </button>
      </div>

      <Link href={`/pulse/${item.id}`} className="block">
        {/*
          The lead story gets artwork about *its own subject*: the object or
          system the story is about, never a scene and never a stock mood shot.
          A story with no motif gets nothing, which is the correct outcome of
          "no visual without a job" rather than a gap to fill.
        */}
        {PULSE_MOTIF[item.id] ? (
          <StoryMotif
            motif={PULSE_MOTIF[item.id]}
            accent="pulse"
            className="mt-2 mb-4 h-28 w-full"
          />
        ) : null}

        <h2 className="mt-1 text-balance-tight font-display text-[1.6rem] leading-[1.12] font-extrabold tracking-tight text-chalk lg:text-3xl">
          {item.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-mist">{item.summary}</p>
        <p className="mt-3 text-xs text-faint">Based on {item.source}</p>
      </Link>

      {mission ? (
        <Link
          href={`/missions/${mission.id}`}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-quest-500 px-5 text-sm font-bold text-white sq-pressable hover:bg-quest-400"
        >
          <Play aria-hidden className="size-4" />
          Play {mission.title}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </article>
  );
}

/** One outbound row. Its provenance comes from the group it is rendered in. */
function DiscoveryRow({ link }: { link: DiscoveryLink }) {
  return (
    <ExternalLink
      href={link.url}
      showIcon={false}
      className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-chalk">{link.label}</span>
        <span className="block truncate text-xs text-muted">{link.description}</span>
      </span>
      <span className={cn("shrink-0 text-xs font-bold", ACCENT_TEXT[link.accent])}>
        {link.publisher}
      </span>
    </ExternalLink>
  );
}
