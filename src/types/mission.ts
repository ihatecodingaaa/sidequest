import type { AgeBand, ContentCategory, DataProvenance, SkillAward } from "./core";

export type MissionType =
  | "quick"
  | "crew"
  | "field"
  | "build"
  | "service"
  | "boss";

export type Difficulty = "starter" | "core" | "advanced";

export type MissionStatus = "available" | "locked" | "coming-soon";

/**
 * `player` tells the router which experience to mount.
 * Hero missions get bespoke players; everything else runs on the shared
 * data-driven scenario engine.
 */
export type MissionPlayer =
  | "scenario"
  | "rewind"
  | "norm-mirror"
  | "breaksafe"
  | "field-checkin"
  | "build-submission"
  | "external";

export interface MissionLocation {
  /** Neighbourhood label only. SIDEQUEST never stores precise coordinates. */
  area: string;
  venue: string;
  note?: string;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  missionType: MissionType;
  player: MissionPlayer;
  durationMinutes: number;
  xp: number;
  difficulty: Difficulty;
  ageBands: AgeBand[];
  categories: ContentCategory[];
  skillRewards: SkillAward[];
  /** Short line naming the behavioural mechanism the mission rehearses. */
  behaviouralHook: string;
  accent: "quest" | "pulse" | "volt" | "coral" | "gold";
  status: MissionStatus;
  provenance: DataProvenance;
  location?: MissionLocation;
  partner?: {
    name: string;
    /** Never true unless a real agreement exists. */
    isConfirmedPartner: boolean;
  };
  relatedPulseItemIds?: string[];
  /** Used by the field-checkin player. Case-insensitive. */
  checkInCode?: string;
  deadline?: string;
}
