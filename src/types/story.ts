/**
 * Story content, as beats rather than blocks.
 *
 * A `StoryLine` is one idea. Two short sentences that form a single thought
 * belong in one line; two separate thoughts do not, even if both are short.
 * The unit is deliberately the idea and not the sentence, because splitting a
 * thought across two taps reintroduces the split attention that segmenting
 * exists to remove.
 */

export type CharacterId = "ken" | "ilyas" | "rina" | "you" | "narrator";

/**
 * A small closed set of expressions.
 *
 * These are narrative states, not physiognomy. Nothing in SIDEQUEST implies
 * that a face reveals whether somebody will offend, and expression is never
 * the only carrier of an idea: the words always say it too.
 */
export type Expression =
  | "neutral"
  | "uncertain"
  | "amused"
  | "pressured"
  | "concerned"
  | "relieved";

export type StoryLine =
  /** Plain narration. No speaker. */
  | { kind: "narration"; text: string }
  /** Somebody says something out loud. */
  | {
      kind: "speech";
      characterId: CharacterId;
      speaker: string;
      text: string;
      expression?: Expression;
    }
  /**
   * A short back-and-forth revealed as one unit.
   *
   * Two people trading one line each is a single idea: the dare lands and the
   * denial arrives. Splitting that across two taps is exactly the overcorrection
   * the segmenting research warns about, because the second half only means
   * anything while the first is still in mind.
   */
  | {
      kind: "exchange";
      turns: { characterId: CharacterId; speaker: string; text: string; expression?: Expression }[];
    }
  /** A chat message, rendered as a bubble. */
  | { kind: "message"; from: string; text: string; isYou?: boolean }
  /**
   * A whole chat exchange, revealed as one unit.
   *
   * A thread is a single artefact: somebody hands you their phone and you read
   * the screen. Drip-feeding it a bubble at a time reads as affectation rather
   * than pacing, and it was costing three taps in Crew Shift for no gain.
   */
  | { kind: "thread"; messages: { from: string; text: string; isYou?: boolean }[] };

/** Convenience for fixture authors: narration from a bare string. */
export function narrate(text: string): StoryLine {
  return { kind: "narration", text };
}

/** Convenience for fixture authors: a line of speech. */
export function says(
  characterId: CharacterId,
  speaker: string,
  text: string,
  expression?: Expression,
): StoryLine {
  return { kind: "speech", characterId, speaker, text, expression };
}

/**
 * What a fixture may write.
 *
 * A bare string is narration. Allowing it is deliberate: every existing scene
 * keeps working and immediately gets player-paced reveal, while the scenes
 * where knowing the speaker actually matters get upgraded to `speech` by hand.
 * A migration that required rewriting every quick quest before anything
 * improved would have been the wrong trade.
 */
export type StoryLineInput = string | StoryLine;

/** Normalises fixture input into the shape the renderer expects. */
export function toStoryLines(input: readonly StoryLineInput[]): StoryLine[] {
  return input.map((line) => (typeof line === "string" ? narrate(line) : line));
}
