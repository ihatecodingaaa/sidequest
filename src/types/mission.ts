import type { AgeBand, ContentCategory, DataProvenance, SkillAward } from "./core";

export type MissionType =
  | "quick"
  | "crew"
  | "field"
  | "build"
  | "service"
  | "boss";

export type Difficulty = "starter" | "core" | "advanced";

/**
 * Whether this needs other people.
 *
 * Declared on the content and shown **before** it opens. A young person who
 * starts something alone and discovers three tiles in that it needs three
 * friends has been wasted, and a judge who does it has been misled. Real user
 * testing produced exactly that feedback about Crew Shift, which is why this
 * exists rather than being inferred from `missionType`.
 */
export type PlayMode = "solo" | "crew" | "either";

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
  /** How many people this wants. Rendered on the card, never after entry. */
  playMode: PlayMode;
  /** Only for crew and either. Shown as written, for example "2-4". */
  crewSize?: string;
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
