import type { Accent } from "@/lib/accent";

/**
 * Prevention Signals.
 *
 * A Signal marks a **situation**: something developing, somebody who needs
 * help, an opportunity to make a place safer. It is drawn near whoever raises
 * it because that is where the situation is, and for no other reason.
 *
 * ---
 *
 * ## The mode names the response, not the seriousness
 *
 * The obvious design is a severity scale: green for minor, red for serious.
 * That design answers "how bad is this", which is a question almost nobody is
 * stuck on, and it makes the worst thing on the map the most interesting thing
 * on the map.
 *
 * The bystander decision model (Latane and Darley) breaks helping into five
 * steps: notice, interpret, take responsibility, **know what form of help to
 * give**, act. Step four is where willing people freeze, because they do not
 * know what helping looks like in that specific moment. That is the step a
 * piece of software can actually answer.
 *
 * So each mode is a verb. Connect, Prevent, Redirect, Protect.
 *
 * ---
 *
 * ## The mode may never describe a person
 *
 * There is no risk field on an NPC anywhere in this codebase, and
 * `tests/unit/integrity.test.ts` fails the build if one appears. A product
 * that renders a colour over a human figure teaches, through thousands of
 * repetitions, that people carry a risk colour and that it is knowable by
 * looking. Dismantling that habit is most of what youth crime prevention is.
 *
 * ---
 *
 * ## Colour is one of four channels
 *
 * Around one in twelve men has a red-green colour vision deficiency, which is
 * precisely the discrimination a red-and-green system would depend on, and
 * WCAG 2.2 1.4.1 forbids colour as the only visual channel regardless. Every
 * Signal therefore carries **colour, an icon shape, a one word label and an
 * accessible name**, and the label travels with it into the Quest List.
 */

export type SignalMode = "connect" | "prevent" | "redirect" | "protect";

/** Which glyph the world and the DOM draw. Shape, so colour is never alone. */
export type SignalIcon = "connect" | "prevent" | "redirect" | "protect";

export interface SignalModeSpec {
  id: SignalMode;
  /** One word, uppercase, shown beside the marker and in the list. */
  label: string;
  /** What this situation needs, in one short line. Never what it is worth. */
  means: string;
  /** The action the player is being offered. Goes on the interact button. */
  cue: string;
  icon: SignalIcon;
  /** Canvas colour, world resolution. */
  colour: string;
  /** Lighter tone for the marker's lit edge. Same top-left light rule. */
  colourLight: string;
  /** DOM accent token. Literal strings only: Tailwind scans source text. */
  accent: Accent;
  /**
   * Read in place of the marker by a screen reader, and used as the accessible
   * name of the Quest List row. States the mode and what it needs, never who
   * is standing there.
   */
  accessibleName: string;
}

export const SIGNAL_MODES: Record<SignalMode, SignalModeSpec> = {
  connect: {
    id: "connect",
    label: "CONNECT",
    means: "Somebody needs information, a trusted adult, or an official source.",
    cue: "Talk",
    icon: "connect",
    colour: "#3d9be0",
    colourLight: "#7ec2f2",
    accent: "pulse",
    accessibleName: "Connect signal. Somebody here needs information or someone to ask.",
  },
  prevent: {
    id: "prevent",
    label: "PREVENT",
    means: "Nothing has gone wrong yet, and there is a way to make this safer.",
    cue: "Look",
    icon: "prevent",
    colour: "#6fbf4a",
    colourLight: "#a6e07f",
    accent: "volt",
    accessibleName: "Prevent signal. Nothing has gone wrong yet and there is a way to make this safer.",
  },
  redirect: {
    id: "redirect",
    label: "REDIRECT",
    means: "Pressure is building. It can still be interrupted.",
    cue: "Step in",
    icon: "redirect",
    colour: "#f5b93f",
    colourLight: "#ffd98a",
    accent: "gold",
    accessibleName: "Redirect signal. Pressure is building and it can still be interrupted.",
  },
  protect: {
    id: "protect",
    label: "PROTECT",
    means: "Someone may not be safe. Distance, support, and get help.",
    cue: "Help",
    icon: "protect",
    colour: "#e0574a",
    colourLight: "#f59288",
    accent: "coral",
    accessibleName: "Protect signal. Someone may not be safe. This one is about distance and getting help, never confrontation.",
  },
};

export const SIGNAL_MODE_IDS: readonly SignalMode[] = [
  "connect",
  "prevent",
  "redirect",
  "protect",
] as const;

export function signalMode(mode: SignalMode): SignalModeSpec {
  return SIGNAL_MODES[mode];
}

/**
 * A live marker in the world.
 *
 * Derived at runtime from threads and encounters rather than stored, so a
 * finished situation cannot leave a marker behind and a marker cannot exist
 * without a situation to belong to.
 *
 * Note what this interface does not have: no severity, no score, no owner. The
 * `npcId` is where to draw it, not whose it is.
 */
export interface WorldSignal {
  id: string;
  mode: SignalMode;
  /** One short line naming the situation. Describes a moment, never a person. */
  headline: string;
  mapId: string;
  x: number;
  y: number;
  /** Whoever raises it. Present so the marker knows where to sit. */
  npcId: string;
  /** The thread this belongs to, when it belongs to one. */
  threadId?: string;
}
