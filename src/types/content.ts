import type { ContentCategory, DataProvenance } from "./core";

export interface PulseAction {
  label: string;
  detail: string;
}

export interface PulseItem {
  id: string;
  title: string;
  /** Original short summary written for SIDEQUEST. Never republished article text. */
  summary: string;
  /** A few paragraphs of original context shown on the detail page. */
  context: string[];
  /** The authority the guidance is drawn from, named plainly. */
  source: string;
  /** A real, working destination on that authority's own site. */
  sourceUrl: string;
  sourceLabel: string;
  category: ContentCategory;
  /**
   * Recency is stored as a plain offset rather than a date. Seeded content has
   * no real publication moment, and a fixed number keeps server and client
   * rendering identical and stops the feed drifting between demo days.
   */
  publishedOffsetHours: number;
  region: string;
  relatedMissionId?: string;
  /** Why this item is surfaced to the reader right now. */
  relevance: string;
  provenance: DataProvenance;
  featured?: boolean;
  /** Concrete protective steps. Kept short and actionable. */
  actions?: PulseAction[];
  /** Signals used by the related quest, shown as "what to look for". */
  signals?: string[];
}

export interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  language: string;
  description: string;
  /** Official listening destination. SIDEQUEST links out, never restreams. */
  officialUrl: string;
  platform: string;
  accent: "quest" | "pulse" | "volt" | "coral" | "gold";
  isPartnerConfirmed: boolean;
}

/** Outbound discovery tiles. No headline is ever invented for these. */
export interface DiscoveryLink {
  id: string;
  label: string;
  description: string;
  url: string;
  publisher: string;
  accent: "quest" | "pulse" | "volt" | "coral" | "gold";
}
