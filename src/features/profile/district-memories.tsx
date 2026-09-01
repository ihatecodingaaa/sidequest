"use client";

import { MapPin } from "lucide-react";

import { cn } from "@/lib/cn";
import { SectionHeader } from "@/components/ui/primitives";
import { useProfile } from "@/hooks/use-profile";
import { memoryByPlace, type MemoryType } from "@/features/streets/district-memory";

/**
 * What the player has done, by place.
 *
 * ---
 *
 * ## Why this replaced the moments list
 *
 * The previous version of this section listed six district moments as found or
 * not found. That was a collection, and a collection of six is a checklist:
 * the unfound rows said "Not noticed yet" and turned exploring into clearing a
 * list, which is the exact shape the props were written to avoid.
 *
 * Discoveries are still here. They are now one kind of thing that happened in
 * a place, next to who you met there and what you changed, which is where they
 * belong. The list stopped being a set to complete and became a record of
 * having been somewhere.
 *
 * ## Why it groups by place and not by type
 *
 * Because the memory is about the district. "The minimart: met Wei, met Bea,
 * scanned the last two, showed Lek what was making it easy" is a relationship
 * with a shop. The same four entries sorted into met, helped and changed is an
 * audit of a player.
 *
 * ## Why places you have never been still appear
 *
 * Quietly, with a count of nothing. A place that is hidden until you visit it
 * cannot invite you, and the whole reason this is on You rather than only in
 * the world is that it is the surface somebody looks at when deciding whether
 * to go back out.
 */

const VERB: Record<MemoryType, string> = {
  met: "Met",
  helped: "Helped",
  discovered: "Noticed",
  changed: "Changed",
  created: "Made",
  visited: "Been",
};

const TINT: Record<MemoryType, string> = {
  met: "text-quest-300",
  helped: "text-volt-300",
  discovered: "text-pulse-300",
  changed: "text-gold-400",
  created: "text-quest-300",
  visited: "text-mist",
};

export function DistrictMemories() {
  const { profile, ready } = useProfile();
  const places = memoryByPlace(profile);
  const total = ready ? places.reduce((sum, place) => sum + place.entries.length, 0) : 0;
  const visited = places.filter((place) => place.entries.length > 0);

  return (
    <section>
      <SectionHeader
        title="District memories"
        subtitle={
          total === 0
            ? "Nothing yet. The block remembers what you do in it."
            : `${total} ${total === 1 ? "thing has" : "things have"} happened, across ${
                visited.length
              } ${visited.length === 1 ? "place" : "places"}.`
        }
      />

      <ul className="space-y-2.5">
        {places.map(({ landmark, entries }) => {
          const has = ready && entries.length > 0;
          return (
            <li
              key={landmark.id}
              className={cn(
                "rounded-2xl border px-4 py-3",
                has ? "border-white/12 bg-white/4" : "border-white/8 bg-white/2",
              )}
            >
              <p className="flex items-center gap-2">
                <MapPin
                  aria-hidden
                  className={cn("size-3.5 shrink-0", has ? "text-volt-300" : "text-faint")}
                />
                <span
                  className={cn(
                    "text-sm font-bold",
                    has ? "text-chalk" : "text-faint",
                  )}
                >
                  {landmark.name}
                </span>
              </p>

              {has ? (
                <ul className="mt-2 space-y-1.5">
                  {entries.map((entry) => (
                    <li key={entry.id} className="flex gap-2.5">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-1.5 h-px w-3 shrink-0 bg-current opacity-50",
                          TINT[entry.type],
                        )}
                      />
                      <span className="min-w-0 flex-1 text-xs leading-relaxed text-mist">
                        <span className={cn("font-bold", TINT[entry.type])}>
                          {VERB[entry.type]}.
                        </span>{" "}
                        {entry.title}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-faint">Not been yet.</p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-faint">
        This is a record of what happened, not a list to finish. Nothing here can be bought, lost or
        run out, and none of it is worth XP.
      </p>
    </section>
  );
}
