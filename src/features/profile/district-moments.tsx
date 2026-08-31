"use client";

import { MapPin } from "lucide-react";

import { cn } from "@/lib/cn";
import { SectionHeader } from "@/components/ui/primitives";
import { useProfile } from "@/hooks/use-profile";
import { DISTRICT_MOMENTS } from "@/features/streets/streets-props";

/**
 * What the player has noticed about the block.
 *
 * ---
 *
 * ## Why this exists on You rather than in Streets
 *
 * The brief's diagnosis of the other screens is right: they had become places
 * that competed with the world instead of supporting it. This is the cheapest
 * honest fix for You. It is the one section that is *about* Streets without
 * duplicating it, it gives somebody a reason to open a screen that was
 * otherwise a report card, and it turns walking around into something that
 * accumulates.
 *
 * ## What it deliberately is not
 *
 * Not a currency, not scarce, not random, not tradeable, not tied to a
 * deadline, and worth no XP. There is a fixed list, everything on it is found
 * by walking up to a thing and looking at it, and nothing is ever removed or
 * expires. The unfound ones are shown as empty slots rather than hidden,
 * because a collection whose size is a secret is a collection that pressures
 * rather than invites, and because seeing what is left is the whole reason to
 * go back out.
 *
 * The labels are moments rather than objects on purpose: "The waiting spot",
 * not "Tree #3". What is being collected is having noticed something.
 */
export function DistrictMoments() {
  const { profile, ready } = useProfile();
  const found = ready ? (profile.districtMoments ?? []) : [];

  return (
    <section>
      <SectionHeader
        title="District moments"
        subtitle={`${found.length} of ${DISTRICT_MOMENTS.length} noticed. Found by looking, worth no XP.`}
      />

      <ul className="space-y-2">
        {DISTRICT_MOMENTS.map((moment) => {
          const has = found.includes(moment.id);
          return (
            <li
              key={moment.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3",
                has ? "border-volt-500/25 bg-volt-500/8" : "border-white/8 bg-white/2",
              )}
            >
              <MapPin
                aria-hidden
                className={cn("size-4 shrink-0", has ? "text-volt-300" : "text-faint")}
              />
              {/*
                An unfound moment shows its shape and not its content. Naming
                it would remove the reason to go and stand in front of it, and
                hiding the row entirely would hide how much block there is
                left.
              */}
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm",
                  has ? "font-semibold text-chalk" : "text-faint",
                )}
              >
                {has ? moment.label : "Not noticed yet"}
              </span>
              {has ? (
                <span className="shrink-0 text-[0.65rem] font-bold tracking-[0.08em] text-volt-300 uppercase">
                  Kept
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-faint">
        These are things in the district worth stopping at. Walk up to one and look. Nothing here
        can be bought, lost or run out.
      </p>
    </section>
  );
}
