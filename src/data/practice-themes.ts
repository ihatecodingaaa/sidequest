import { getMission } from "@/data/missions";
import { PULSE_ITEMS } from "@/data/pulse";
import type { Mission } from "@/types/mission";

/**
 * Practice themes: the honest join between real information and fictional play.
 *
 * ---
 *
 * ## The problem this fixes
 *
 * Updates already knew which mission related to which story, and rendered it
 * as a button reading **"Play REWIND"** directly beneath a summary of real
 * Singapore Police Force guidance. Read that as a fifteen year old scrolling
 * quickly and the offer is "play this news story".
 *
 * Nobody intended that. It happened because the link was made between an
 * *item* and a *mission*, and an item is a specific piece of reporting.
 *
 * ## What a theme is, and why the mapping belongs to it
 *
 * A theme is the underlying situation both things are about: somebody being
 * recruited to move money, a shop floor that makes the wrong thing easy, a
 * request for a code. The real story is evidence that the theme exists. The
 * mission is a made-up situation in the same shape.
 *
 * Attaching the mapping to the theme rather than to the item is the whole
 * safeguard. It becomes structurally impossible to offer somebody a replay of
 * a particular reported incident, because no code path anywhere connects one
 * report to one scenario. A story only ever says "this is about X, and there
 * is a made-up X you can walk through".
 *
 * ## The rules
 *
 * **Everything on the fictional side is labelled fictional, in the control
 * itself**, not in a footnote. The link text carries the word.
 *
 * **No theme is ever about a victim.** Themes name situations and systems:
 * the recruitment approach, the machine, the group. None of them names a
 * person, a place where something really happened, or an outcome somebody
 * really suffered.
 *
 * **Provenance is untouched.** A real report does not become official because
 * it links to a mission, and a mission does not become reported because a real
 * story points at it. The two vocabularies stay where they were.
 *
 * **A theme with no scenario simply has no practice link.** There is no
 * placeholder and no coming-soon.
 */

export interface PracticeTheme {
  id: string;
  /** The situation, named plainly. Never a person and never an incident. */
  name: string;
  /**
   * What the fictional scenario puts the player in, in one sentence.
   *
   * Written to describe the made-up situation rather than the real one, so the
   * sentence itself does the separating work even if somebody reads only it.
   */
  fiction: string;
  /** The existing mission that rehearses it. Never a new experience. */
  missionId: string;
}

export const PRACTICE_THEMES: PracticeTheme[] = [
  {
    id: "theme-recruitment",
    name: "being recruited to move money",
    fiction: "A made-up group chat, a made-up offer, and a decision you can take twice.",
    missionId: "mission-job-scam",
  },
  {
    id: "theme-codes",
    name: "somebody asking for a code",
    fiction: "An invented message asking for six digits, and what happens either way.",
    missionId: "mission-otp",
  },
  {
    id: "theme-off-platform",
    name: "a deal that has to leave the app",
    fiction: "A fictional listing, a fictional seller, and the moment the chat moves.",
    missionId: "mission-marketplace",
  },
  {
    id: "theme-going-along",
    name: "going along with the group",
    fiction: "An invented evening with invented friends, replayed from the moment it turned.",
    missionId: "mission-rewind",
  },
  {
    id: "theme-easy-wrong",
    name: "a place that makes the wrong thing easy",
    fiction: "A made-up shop floor you get to redesign, and what each change costs.",
    missionId: "mission-breaksafe",
  },
  {
    id: "theme-what-everyone-does",
    name: "what you think everybody else does",
    fiction: "You guess first, then see what a made-up group actually answered.",
    missionId: "mission-norm-mirror",
  },
  {
    id: "theme-turning-up",
    name: "prevention that is just turning up",
    fiction: "A fictional Saturday, and what a few hours of it is actually worth.",
    missionId: "mission-service",
  },
];

export function getPracticeTheme(id: string | null | undefined): PracticeTheme | undefined {
  if (!id) return undefined;
  return PRACTICE_THEMES.find((theme) => theme.id === id);
}

/**
 * The theme a story is about, resolved through the mission it already named.
 *
 * Derived rather than added as a second field on every Pulse item, so the two
 * cannot disagree: an item points at a mission, a theme points at a mission,
 * and the theme is whichever one matches. If a mission ever loses its theme
 * the story simply stops offering practice, which is the safe direction to
 * fail in.
 */
export function themeForPulse(pulseId: string): PracticeTheme | undefined {
  const item = PULSE_ITEMS.find((entry) => entry.id === pulseId);
  if (!item?.relatedMissionId) return undefined;
  return PRACTICE_THEMES.find((theme) => theme.missionId === item.relatedMissionId);
}

/** The theme and its mission together, when both resolve. Used by the UI. */
export function practiceFor(
  pulseId: string,
): { theme: PracticeTheme; mission: Mission } | undefined {
  const theme = themeForPulse(pulseId);
  if (!theme) return undefined;
  const mission = getMission(theme.missionId);
  if (!mission) return undefined;
  return { theme, mission };
}
