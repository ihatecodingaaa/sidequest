/**
 * Campaign impact, demonstration only.
 *
 * READ THIS BEFORE CHANGING ANYTHING HERE.
 *
 * Every number below is invented. Nobody has run this Campaign, no
 * participants exist, and none of these figures describe anything that has
 * happened. They exist to show a judge what a pilot would be able to measure,
 * which is a different and much more useful claim than showing attendance.
 *
 * The UI labels every single figure as demo data, and the page says so twice.
 * If a real pilot ever runs, these get replaced by results with a sample size
 * and a date, and the labels change with them.
 */

export interface FunnelStep {
  id: string;
  label: string;
  /** Share of participants, 0 to 100. */
  value: number;
  note: string;
}

export interface BehaviouralMeasure {
  id: string;
  chapter: string;
  headline: string;
  /** Two figures worth comparing, not a single vanity number. */
  comparison: { label: string; value: number }[];
  interpretation: string;
  /** What would have to be true for this to mean anything. */
  caveat: string;
}

export const DEMO_FUNNEL: FunnelStep[] = [
  {
    id: "started",
    label: "Started the Campaign",
    value: 100,
    note: "Scanned any station QR.",
  },
  {
    id: "two-chapters",
    label: "Completed 2 or more chapters",
    value: 78,
    note: "Walked to a second station.",
  },
  {
    id: "three-chapters",
    label: "Completed 3 or more chapters",
    value: 61,
    note: "Reached the finale threshold.",
  },
  {
    id: "finale",
    label: "Reached the finale",
    value: 54,
    note: "Finished the story on the day.",
  },
  {
    id: "all-four",
    label: "Completed all 4 chapters",
    value: 33,
    note: "The 3 of 4 rule means this is a choice, not a requirement.",
  },
  {
    id: "follow-up",
    label: "Returned for a follow-up",
    value: 29,
    note: "The measure that separates this from attendance.",
  },
];

export const DEMO_MEASURES: BehaviouralMeasure[] = [
  {
    id: "norm-gap",
    chapter: "Chapter 2, Everyone would do it",
    headline: "The gap between what people expect and what they report",
    comparison: [
      { label: "Average predicted peer rate", value: 42 },
      { label: "Reported rate", value: 17 },
    ],
    interpretation:
      "Participants expected roughly two and a half times as many of their peers to take the offer as actually said they would. That gap is the thing the chapter exists to surface, and it is directly measurable.",
    caveat:
      "Both figures here are invented. In a pilot the reported rate would come from the cohort itself, which is what makes the comparison credible to the people in the room.",
  },
  {
    id: "crew-shift",
    chapter: "Chapter 4, Crew Shift",
    headline: "How often a group decided differently from its members",
    comparison: [
      { label: "Group changed its decision after discussion", value: 31 },
      { label: "Group held its initial majority", value: 69 },
    ],
    interpretation:
      "Peer influence is normally invisible. Because everyone commits privately before anyone speaks, this mechanic produces a clean before and after on the same group within about ninety seconds.",
    caveat:
      "This measures movement, not improvement. A group shifting is not automatically a good outcome, and the product deliberately does not score it as one.",
  },
  {
    id: "retention",
    chapter: "Follow-ups",
    headline: "Whether the experience survived the walk home",
    comparison: [
      { label: "Opened the next-day follow-up", value: 29 },
      { label: "Opened the one-week follow-up", value: 18 },
    ],
    interpretation:
      "Most roadshows cannot answer this question at all, because there is nothing to come back to. A follow-up completion rate is the closest available proxy for whether anything stuck.",
    caveat:
      "Opening a follow-up is engagement, not behaviour change. It is a necessary condition for retention, not evidence of it.",
  },
];

export const IMPACT_DISCLAIMER =
  "Every figure on this page is invented. No participant data exists, this Campaign has not been run, and nothing here describes a real cohort. It shows what a pilot would be instrumented to measure.";

/** What a real deployment would record, and what it deliberately would not. */
export const MEASUREMENT_SCHEMA: { field: string; why: string }[] = [
  { field: "Campaign started, with the selected mode", why: "Tells you whether Story or Quick mode changes completion." },
  { field: "Chapter completed, with chapter id", why: "Shows which stations congest and which get skipped." },
  { field: "Route assigned", why: "Confirms the distribution actually spread people out." },
  { field: "Norm prediction and personal answer", why: "The perceived versus reported gap, per cohort." },
  { field: "Crew Shift private answers and final group answer", why: "Whether discussion moved the group, and in which direction." },
  { field: "Finale decision category", why: "Which of the four themes participants reach for under pressure." },
  { field: "Follow-up opened and completed", why: "Retention past the event." },
];

export const MEASUREMENT_EXCLUSIONS: string[] = [
  "No names, contact details or accounts.",
  "No precise location, and no location history.",
  "No information about any suspected person or alleged offence.",
  "No free-text confessions, and no reporting channel of any kind.",
  "Nothing that could identify an individual participant from their answers.",
];
