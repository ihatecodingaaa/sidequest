"use client";

import Link from "next/link";
import { ArrowRight, Check, Crosshair, MapPin } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_GRADIENT, ACCENT_TEXT } from "@/lib/accent";
import { formatDuration } from "@/lib/format";
import { HERO_MISSION_IDS, getMissions } from "@/data/missions";
import { useProfile } from "@/hooks/use-profile";
import { MISSION_ART } from "@/components/mission/mission-art";
import { MissionWorld } from "@/components/mission/mission-world";
import { questGiver } from "@/features/missions/quest-journal";

/**
 * The three signature missions, given their own treatment.
 *
 * They carry the product's argument (rehearsal, norms, environment design) and
 * a flat list buries them among the quick quests. This is the shortest route to
 * the part of SIDEQUEST that is actually different.
 *
 * Each one also says who asks for it and where they stand, because these three
 * are exactly the missions somebody in the district opens, and until now the
 * catalogue and the neighbourhood described the same three experiences without
 * either one admitting it.
 */
export function SignatureStrip({ className }: { className?: string }) {
  const { profile, ready } = useProfile();
  const missions = getMissions(HERO_MISSION_IDS);

  return (
    <ul className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {missions.map((mission) => {
        const complete = ready && profile.completedMissionIds.includes(mission.id);

        return (
          <li key={mission.id} className="flex h-full flex-col">
            <Link
              href={`/missions/${mission.id}`}
              className="sq-card sq-pressable group relative flex h-full flex-col overflow-hidden p-4 hover:border-white/16"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                  ACCENT_GRADIENT[mission.accent],
                )}
              />

              {/*
                The mark became a scene.

                A mark answers "which mission is this" once you already know
                the set. It cannot answer "what kind of thing is this" for
                somebody who has never opened one, and that is the question a
                discovery card exists to answer. The scene is the widest
                element on the card so it is read first, and it carries the
                mechanic: two futures, a distorted mirror, an unchanged person
                in a changed room, a group turning together.

                The mark is not gone. It still runs the compact rows and the
                thumbnail sizes, where a scene would turn to mush.
              */}
              {MISSION_ART[mission.id] ? (
                <MissionWorld
                  art={MISSION_ART[mission.id]}
                  accent={mission.accent}
                  scale="card"
                  className="mb-3"
                />
              ) : null}

              <span className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "font-display text-[0.65rem] font-bold uppercase tracking-[0.14em]",
                    ACCENT_TEXT[mission.accent],
                  )}
                >
                  Signature
                </span>
                {complete ? (
                  <Check aria-hidden className="size-4 shrink-0 text-volt-400" strokeWidth={3} />
                ) : null}
              </span>

              <span className="mt-3 block font-display text-lg leading-tight font-extrabold text-chalk">
                {mission.title}
              </span>
              <span className="mt-1 block flex-1 text-sm leading-snug text-muted">
                {mission.subtitle}
              </span>

              <GiverLine missionId={mission.id} />

              <span className="mt-2 flex items-center gap-2 text-xs font-semibold text-faint">
                {formatDuration(mission.durationMinutes)}
                <span aria-hidden>&middot;</span>
                <span className={ACCENT_TEXT[mission.accent]}>{mission.xp} XP</span>
                <ArrowRight
                  aria-hidden
                  className="ml-auto size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
            </Link>

            {/*
              Beside the card, never inside it. The card is already one big
              link, and a link inside a link is invalid markup that browsers
              resolve by guessing.

              Only while there is something left to do: pointing somebody at a
              neighbour who has nothing more to say is a worse outcome than not
              offering it.
            */}
            {!complete ? <TrackLink missionId={mission.id} className="mt-2 self-start" /> : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Who asks, and where they stand.
 *
 * Two states. Before you have met them it is an introduction to a stranger in
 * a named place, which is an invitation to go and find them. After you have
 * met them it says you were asked, which turns a card in a catalogue into
 * somebody who is still waiting. Neither state gates anything: the mission
 * opens from here either way.
 */
function TrackLink({ missionId, className }: { missionId: string; className?: string }) {
  const { profile } = useProfile();
  const giver = questGiver(missionId, profile);
  if (!giver) return null;
  return (
    <Link
      href={`/streets?track=${giver.npcId}`}
      className={cn(
        "sq-pressable inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/16 px-3.5 text-xs font-bold text-mist hover:text-chalk",
        className,
      )}
    >
      <Crosshair aria-hidden className="size-3.5" />
      Show me where
    </Link>
  );
}

function GiverLine({ missionId }: { missionId: string }) {
  const { profile, ready } = useProfile();
  const giver = questGiver(missionId, profile);
  if (!giver) return null;

  return (
    <span className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-faint">
      <MapPin aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">
        {ready && giver.met
          ? `${giver.name} asked you, at the ${giver.place.toLowerCase()}`
          : `${giver.name} asks, at the ${giver.place.toLowerCase()}`}
      </span>
    </span>
  );
}
