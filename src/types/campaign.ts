import type { AgeBand, ContentCategory, DataProvenance, SkillAward } from "./core";
import type { StoryLineInput } from "./story";
import type { Accent } from "@/lib/accent";

/**
 * SIDEQUEST Campaigns.
 *
 * A Campaign turns a physical activation (a school hall, a roadshow, a partner
 * event) into one continuous story. Participants scan ordinary QR codes with
 * the phone camera, unlock a chapter, walk away from the station, play a short
 * behavioural mission, and later reach a finale. Follow-up chapters arrive
 * after the event, so the roadshow becomes episode one rather than the end.
 *
 * The model is deliberately data-first: a second Campaign should be authorable
 * as configuration, not as new React components.
 */

/** Which existing mission mechanic a chapter drives. */
export type ChapterMechanic =
  | "rewind"
  | "norm-mirror"
  | "breaksafe"
  | "crew-shift"
  | "story";

export type CampaignMode = "story" | "quick";

export type ChapterType = "station" | "finale" | "follow-up";

/**
 * Chapter content, tagged by mechanic so the player dispatcher stays typed and
 * a mis-authored chapter fails at compile time rather than at a roadshow.
 */
export type ChapterConfig =
  | { mechanic: "rewind"; scenarioId: string }
  | { mechanic: "norm-mirror"; questionSetId: string }
  | { mechanic: "breaksafe" }
  | { mechanic: "crew-shift"; roundId: string }
  | { mechanic: "story"; storyId: string };

/** A short narrative run shown before and after the mechanic in Story mode. */
export interface StorySegment {
  /** Scene label, e.g. "Thursday, 4:12pm". */
  slug?: string;
  /**
   * The scene, one idea per entry, revealed at the player's pace.
   *
   * A bare string is narration. Use `says()` where knowing who is talking is
   * part of understanding the scene, which in a four-character story is most
   * of the time.
   */
  lines: StoryLineInput[];
  /** Optional message-style exchange rendered as chat bubbles. */
  messages?: { from: string; text: string; isYou?: boolean }[];
}

export interface CampaignChapter {
  id: string;
  campaignId: string;
  slug: string;
  chapterNumber: number;
  chapterType: ChapterType;
  title: string;
  /** One line shown on the map and on the printed station sign. */
  shortDescription: string;
  config: ChapterConfig;
  accent: Accent;

  /** Shown before the mechanic in Story mode, skipped in Quick mode. */
  intro?: StorySegment;
  /** Shown after the mechanic in Story mode. */
  outro?: StorySegment;
  /** Always shown, in both modes. One sentence framing the task. */
  brief: string;

  behaviouralMechanism: string;
  behaviouralObjective: string;

  xp: number;
  skillRewards: SkillAward[];
  estimatedMinutes: number;

  /** Physical stations carry a printed QR and a spoken fallback code. */
  isPhysicalStation: boolean;
  stationCode?: string;
  /** Text for the printed sign at the station. */
  signText?: string;
}

export interface CampaignRoute {
  id: string;
  label: string;
  /** Chapter ids in the order this route recommends visiting them. */
  orderedChapterIds: string[];
}

export interface CampaignFollowUp {
  id: string;
  campaignId: string;
  slug: string;
  title: string;
  description: string;
  /** Hours after Campaign completion before this unlocks. */
  unlockAfterHours: number;
  config: ChapterConfig;
  intro?: StorySegment;
  brief: string;
  behaviouralMechanism: string;
  xp: number;
  skillRewards: SkillAward[];
  estimatedMinutes: number;
  accent: Accent;
}

export interface CampaignFinale {
  id: string;
  campaignId: string;
  title: string;
  intro: StorySegment;
  /** The single decision the finale turns on. */
  question: string;
  options: {
    id: string;
    label: string;
    /** Which chapter theme this answer leans on. */
    theme: "urgency" | "norms" | "design" | "peers";
  }[];
  /** Deterministic closing text, selected by the option's theme. */
  outcomes: Record<
    "urgency" | "norms" | "design" | "peers",
    { headline: string; body: string }
  >;
  /** Shown to everyone, after the themed outcome. */
  closing: { headline: string; body: string };
  /** Extra paragraph for participants who completed all four stations. */
  fullCompletionNote: string;
  xp: number;
  skillRewards: SkillAward[];
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** Why this exists, in one sentence, for the Campaign card. */
  premise: string;
  status: "available" | "coming-soon";
  ageBands: AgeBand[];
  categories: ContentCategory[];
  estimatedMinutes: number;
  accent: Accent;
  provenance: DataProvenance;
  locationType: "roadshow" | "school" | "community" | "anywhere";

  chapters: CampaignChapter[];
  routes: CampaignRoute[];
  finale: CampaignFinale;
  followUps: CampaignFollowUp[];

  /** Minimum physical chapters before the finale opens. Resilience, not rigour. */
  minimumChaptersForFinale: number;
  /** Bonus for clearing every physical station. */
  fullCompletionBonusXp: number;
  /** Prototype reward unlocked by finishing the Campaign and a follow-up. */
  completionRewardId?: string;
}

/* ------------------------------------------------------------- Progress */

/** Per-chapter outcome, tagged so the finale can read it without casts. */
export type ChapterResult =
  | { mechanic: "rewind"; firstChoiceId: string | null; secondChoiceId: string | null }
  | { mechanic: "norm-mirror"; overestimates: number; questionCount: number }
  | { mechanic: "breaksafe"; patchIds: string[]; avoidedProfiling: boolean }
  | {
      mechanic: "crew-shift";
      playerCount: number;
      shifted: boolean;
      finalOptionId: string;
      /** Seats that answered differently in the second round. Never which seats. */
      movedCount: number;
    }
  | { mechanic: "story" };

export interface CampaignProgress {
  campaignId: string;
  mode: CampaignMode;
  routeId: string;
  startedAt: string;
  unlockedChapterIds: string[];
  completedChapterIds: string[];
  chapterResults: Record<string, ChapterResult>;
  finaleCompleted: boolean;
  finaleOptionId: string | null;
  completedAt: string | null;
  completedFollowUpIds: string[];
  /**
   * Every XP grant already paid out, keyed by grant id. This is the single
   * idempotency ledger: re-scanning a QR, refreshing, or replaying a chapter
   * can never pay twice.
   */
  awardedKeys: string[];
  /**
   * Demo only. Shifts the clock backwards when computing follow-up unlocks so
   * the judging team can show a next-day chapter without waiting a day.
   */
  demoHoursOffset: number;
}
