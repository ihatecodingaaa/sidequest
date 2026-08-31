import type { LucideIcon } from "lucide-react";

/**
 * The interaction vocabulary.
 *
 * ---
 *
 * ## Why this file exists
 *
 * Real user feedback on the prototype was blunt: "there is too much typing",
 * "make the tasks MCQ based instead", "typing answers feels tedious". The
 * first two sentences pull in opposite directions, and taking the second one
 * literally would be the wrong change. A product whose every activity is four
 * lettered options is a quiz, and a quiz about crime prevention is precisely
 * the thing the product thesis refuses to build.
 *
 * So the rule adopted is the first half of the feedback, not the second:
 *
 * > **Choice first. Action first. Keyboard last.**
 *
 * A tap is the unit of input. Which *kind* of tap is chosen by the narrative,
 * never by a rota. `docs/INTERACTION_FIRST_RESEARCH.md` records what the
 * evidence does and does not support here, including the finding that matters
 * most: Adesope, Trevisan and Sundararajan's (2017) meta-analysis found
 * multiple-choice retrieval practice performing at least as well as
 * short-answer, so removing required typing is not a learning concession. What
 * it is not licence for is making every interaction the same shape.
 *
 * ## What is deliberately absent
 *
 * There is no `correct` field anywhere in this file. None of these mechanics
 * has a right answer, every option gets an honest consequence, and no option
 * costs anything. `isSafest` exists on the *content* types so a debrief can
 * name what worked; it is not a score and it never renders as one.
 */

/**
 * One tappable option.
 *
 * Presentational only, so the seven existing option shapes in the codebase
 * (thread choices, street check options, scenario choices, crew shift rounds,
 * finale options, follow-up options, BREAKSAFE patches) can all render through
 * one component without any of them changing their data type.
 */
export interface ChoiceOption {
  id: string;
  /** What the player does, phrased as an action. Two to ten words. */
  label: string;
  /**
   * One short line under the label.
   *
   * Use for a genuine clarification, never for a hint at which option is
   * approved. If the hint would tell somebody what to pick, it is the wrong
   * hint.
   */
  hint?: string;
  /**
   * A glyph, so an option reads as an action rather than as answer C.
   *
   * Never the only channel: the label always says the thing. An icon that
   * carries meaning the words do not is information a screen reader loses.
   */
  icon?: LucideIcon;
  disabled?: boolean;
}

/**
 * What a hotspot scene is asking for.
 *
 * `observe` is "something here makes the easy choice harder", where tapping
 * reveals what the spot is doing. `change` is the situational prevention move:
 * tapping picks the thing to alter, and the scene shows the alteration.
 */
export type HotspotIntent = "observe" | "change";

export interface HotspotSpot {
  id: string;
  /** The accessible name of the spot. Names the object, never a person. */
  label: string;
  /** Percentage position inside the scene box. */
  x: number;
  y: number;
  /**
   * Whether this spot is one of the ones the step is counting.
   *
   * A decoy is tappable on purpose and explains why it is not the answer,
   * which is a stronger lesson than not offering it. BREAKSAFE established
   * this: the facial recognition option is selectable, and refusing it after
   * reading its trade-offs teaches more than never seeing it.
   */
  counts: boolean;
  /** The headline shown once tapped. One short line. */
  finding: string;
  /** One or two sentences of detail. */
  explanation: string;
}

/** An ordering step. Two to four cards, tapped into sequence. */
export interface OrderCard {
  id: string;
  label: string;
  /** Shown in the debrief beside the card, once the order is locked in. */
  note?: string;
}
