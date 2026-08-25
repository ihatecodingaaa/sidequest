"use client";

import { ScenarioPlayer } from "./scenario-player";
import { MissionShell } from "./mission-shell";
import { RewindPlayer } from "@/features/missions/rewind/rewind-player";
import { NormMirrorPlayer } from "@/features/missions/norm-mirror/norm-mirror-player";
import { BreaksafePlayer } from "@/features/missions/breaksafe/breaksafe-player";
import { FieldPlayer } from "@/features/missions/field/field-player";
import { BuildPlayer } from "@/features/missions/partner/build-player";
import { getScenario } from "@/data/scenarios";
import { ButtonLink } from "@/components/ui/button";
import type { Mission } from "@/types/mission";

/** Mounts the right experience for a mission's `player` field. */
export function MissionRouter({ mission }: { mission: Mission }) {
  switch (mission.player) {
    case "rewind": {
      const scenario = getScenario(mission.id);
      if (!scenario) return <MissingScenario mission={mission} />;
      return <RewindPlayer mission={mission} scenario={scenario} />;
    }

    case "norm-mirror":
      return <NormMirrorPlayer mission={mission} />;

    case "breaksafe":
      return <BreaksafePlayer mission={mission} />;

    case "field-checkin":
      return <FieldPlayer mission={mission} />;

    case "build-submission":
      return <BuildPlayer mission={mission} />;

    case "scenario": {
      const scenario = getScenario(mission.id);
      if (!scenario) return <MissingScenario mission={mission} />;
      return <ScenarioPlayer mission={mission} scenario={scenario} />;
    }

    default:
      return <MissingScenario mission={mission} />;
  }
}

function MissingScenario({ mission }: { mission: Mission }) {
  return (
    <MissionShell title={mission.title} exitHref={`/missions/${mission.id}`}>
      <div className="py-12 text-center">
        <p className="font-display text-lg font-bold text-chalk">
          This mission is not playable yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          It runs with a partner organisation rather than inside the app. The detail page has
          everything that is confirmed so far.
        </p>
        <ButtonLink href={`/missions/${mission.id}`} className="mt-6" variant="secondary">
          Back to the mission
        </ButtonLink>
      </div>
    </MissionShell>
  );
}
