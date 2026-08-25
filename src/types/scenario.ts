import type { SkillAward } from "./core";

/** Data-driven branching engine shared by quick quests and REWIND. */

export interface ScenarioChoice {
  id: string;
  label: string;
  /** Short reaction shown immediately after choosing. */
  reaction?: string;
  next: string;
  /** Marks the option that best supports a safe outcome. */
  isPreferred?: boolean;
  tone?: "safe" | "risky" | "neutral";
}

export interface ScenarioBeat {
  id: string;
  /** Optional scene-setting label, e.g. "6:41pm, bus stop". */
  slug?: string;
  speaker?: string;
  lines: string[];
  choices?: ScenarioChoice[];
  /** Terminal beats carry an outcome instead of choices. */
  outcome?: ScenarioOutcome;
  /** Marks the beat the REWIND player returns to. */
  isPivot?: boolean;
}

export interface ScenarioOutcome {
  kind: "good" | "mixed" | "poor";
  headline: string;
  body: string;
  /** What actually made the difference. Behavioural, not moralising. */
  takeaways: string[];
}

export interface Scenario {
  id: string;
  intro: {
    kicker: string;
    title: string;
    setup: string;
  };
  startBeatId: string;
  beats: ScenarioBeat[];
  debrief: {
    title: string;
    mechanism: string;
    points: string[];
  };
  skillAwards: SkillAward[];
}
