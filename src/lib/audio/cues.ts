/**
 * The SIDEQUEST sound vocabulary.
 *
 * ---
 *
 * ## Every cue is a number, not a recording
 *
 * A cue is a list of voices, and a voice is a waveform, a frequency, an
 * envelope and a duration. Nothing is sampled and nothing is downloaded, so
 * nothing here can contain anybody else's audio. See `engine.ts` for why the
 * whole system is built this way.
 *
 * ## How these were designed
 *
 * The rules are in `docs/AUDIO_ART_DIRECTION.md`. The short version:
 *
 * **Short.** Almost everything is under 200ms. A UI sound that outlasts the
 * gesture that caused it stops feeling like a response and starts feeling like
 * an announcement.
 *
 * **Triangle by default.** Square waves read as harsher and more retro; the
 * triangle is rounder and sits better under speech and under a phone speaker's
 * midrange honk. Square is used sparingly, for the two or three moments that
 * should feel like a machine rather than a place.
 *
 * **Rising for progress, falling for closing, flat for acknowledgement.**
 * Consistency matters more than cleverness: once a player has heard three
 * rising cues on things going forward, a rising cue means forward.
 *
 * **Small intervals.** Mostly a fourth or a fifth, occasionally an octave. The
 * wide, leaping, brass-bright fanfare is the single most recognisable thing
 * about the handheld adventure games this product admires, and it is exactly
 * what must not be reproduced. Ours are quieter and closer together on purpose.
 *
 * **Never the only channel.** Every cue in this file accompanies something
 * already visible. Nothing is announced by sound alone, which is both a WCAG
 * requirement and the reason the product is fully playable muted.
 *
 * ## The originality test
 *
 * From the brief, and it is the binding one: if a knowledgeable player could
 * reasonably say "that is basically the Pokemon sound", it is wrong and it gets
 * rewritten. No cue here reproduces a healing jingle, a level-up melody, an
 * encounter sting or a menu blip from any existing game, and none was written
 * by transcribing one.
 */

export type Wave = OscillatorType | "noise";

export interface Voice {
  wave: Wave;
  /** Hertz. For noise, the centre frequency of the filter. */
  freq: number;
  /** Sweep target. Oscillators only. */
  toFreq?: number;
  /** Seconds. */
  duration: number;
  /** 0 to 1, before bus and master gain. */
  gain: number;
  /** Seconds. Never zero: an instant gain jump is an audible click. */
  attack?: number;
  /** Seconds to wait before this voice starts, for two-note cues. */
  delay?: number;
  /** Noise only. */
  filter?: BiquadFilterType;
  q?: number;
}

export interface CueSpec {
  voices: Voice[];
  /** Overall trim, so a busy cue can be pulled down without editing voices. */
  gain?: number;
}

/* Note frequencies used below, named so the tables read as music. */
const E4 = 329.63;
const G4 = 392;
const A4 = 440;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const G5 = 784;
const A5 = 880;
const C6 = 1046.5;

export const CUES = {
  /* ----------------------------------------------------------- Interface */

  /** Moving between options. The quietest thing in the product. */
  "ui-nav": {
    voices: [{ wave: "triangle", freq: A5, duration: 0.035, gain: 0.1, attack: 0.003 }],
  },

  /** Committing to something. A fourth up, which reads as forward. */
  "ui-select": {
    voices: [
      { wave: "triangle", freq: A4, duration: 0.05, gain: 0.16, attack: 0.003 },
      { wave: "triangle", freq: D5, duration: 0.07, gain: 0.13, attack: 0.003, delay: 0.035 },
    ],
  },

  /** Going back. The same shape inverted, so it is legible without thought. */
  "ui-back": {
    voices: [
      { wave: "triangle", freq: D5, duration: 0.05, gain: 0.13, attack: 0.003 },
      { wave: "triangle", freq: A4, duration: 0.07, gain: 0.11, attack: 0.003, delay: 0.035 },
    ],
  },

  /** A sheet or panel arriving. Soft, wide, no pitch content to speak of. */
  "ui-open": {
    voices: [
      { wave: "noise", freq: 900, duration: 0.1, gain: 0.05, attack: 0.012, filter: "bandpass", q: 0.8 },
      { wave: "triangle", freq: E4, toFreq: A4, duration: 0.11, gain: 0.09, attack: 0.008 },
    ],
  },

  /** A sheet leaving. */
  "ui-close": {
    voices: [
      { wave: "triangle", freq: A4, toFreq: E4, duration: 0.1, gain: 0.08, attack: 0.006 },
    ],
  },

  /* ------------------------------------------------------------ Movement */

  /*
   * Footsteps.
   *
   * Filtered noise, very quiet, and pitched differently per surface so the
   * ground is legible with the eyes on the far side of the screen. These fire
   * a few times a second while walking, so they are the one cue where getting
   * the level wrong ruins everything: they sit right at the edge of audible.
   */
  "step-path": {
    voices: [{ wave: "noise", freq: 1500, duration: 0.045, gain: 0.05, attack: 0.002, filter: "bandpass", q: 1.4 }],
  },
  "step-grass": {
    voices: [{ wave: "noise", freq: 2600, duration: 0.05, gain: 0.04, attack: 0.003, filter: "highpass", q: 0.7 }],
  },
  "step-interior": {
    voices: [{ wave: "noise", freq: 700, duration: 0.04, gain: 0.05, attack: 0.002, filter: "bandpass", q: 2.2 }],
  },

  /* --------------------------------------------------------------- World */

  /** A door opening. A latch, then two notes that say "inside". */
  "door-open": {
    voices: [
      { wave: "noise", freq: 1800, duration: 0.05, gain: 0.09, attack: 0.002, filter: "bandpass", q: 2 },
      { wave: "triangle", freq: G4, duration: 0.09, gain: 0.11, attack: 0.005, delay: 0.05 },
      { wave: "triangle", freq: C5, duration: 0.13, gain: 0.09, attack: 0.005, delay: 0.11 },
    ],
  },

  /** Stepping back out. The same two notes, the other way round. */
  "door-close": {
    voices: [
      { wave: "triangle", freq: C5, duration: 0.08, gain: 0.09, attack: 0.005 },
      { wave: "triangle", freq: G4, duration: 0.12, gain: 0.08, attack: 0.005, delay: 0.06 },
      { wave: "noise", freq: 1400, duration: 0.05, gain: 0.07, attack: 0.002, filter: "bandpass", q: 2, delay: 0.02 },
    ],
  },

  /** Somebody noticing you. One soft note, not a cartoon exclamation. */
  "npc-notice": {
    voices: [{ wave: "triangle", freq: C5, duration: 0.08, gain: 0.08, attack: 0.008 }],
  },

  /** A conversation starting. */
  "npc-talk": {
    voices: [
      { wave: "triangle", freq: G4, duration: 0.06, gain: 0.1, attack: 0.005 },
      { wave: "triangle", freq: B4, duration: 0.09, gain: 0.08, attack: 0.005, delay: 0.045 },
    ],
  },

  /** Something worth stopping at comes into reach. */
  "prop-near": {
    voices: [{ wave: "triangle", freq: E5, duration: 0.05, gain: 0.06, attack: 0.006 }],
  },

  /** Looking at a thing in the world. */
  "prop-look": {
    voices: [
      { wave: "noise", freq: 2200, duration: 0.06, gain: 0.05, attack: 0.004, filter: "bandpass", q: 1.1 },
      { wave: "triangle", freq: A4, duration: 0.1, gain: 0.09, attack: 0.006, delay: 0.03 },
    ],
  },

  /* ------------------------------------------------------------ Progress */

  /** A choice taken. Deliberately neutral: no option is scored. */
  "choice-select": {
    voices: [
      { wave: "triangle", freq: A4, duration: 0.06, gain: 0.14, attack: 0.004 },
      { wave: "triangle", freq: E5, duration: 0.1, gain: 0.1, attack: 0.004, delay: 0.045 },
    ],
  },

  /**
   * A consequence arriving.
   *
   * One note, flat, and the same one whatever was chosen. The product does not
   * score a choice, so the sound must not either: a brighter cue for the safer
   * option would tell the player they had been graded, which is precisely the
   * thing every other part of this codebase refuses to do.
   */
  "consequence": {
    voices: [
      { wave: "triangle", freq: D5, duration: 0.14, gain: 0.1, attack: 0.012 },
      { wave: "triangle", freq: A4, duration: 0.18, gain: 0.07, attack: 0.012, delay: 0.02 },
    ],
  },

  /** A small amount of XP. */
  "xp-small": {
    voices: [
      { wave: "triangle", freq: A5, duration: 0.05, gain: 0.1, attack: 0.003 },
      { wave: "triangle", freq: C6, duration: 0.08, gain: 0.08, attack: 0.003, delay: 0.04 },
    ],
  },

  /** A mission's worth. Three notes, still small. */
  "xp-large": {
    voices: [
      { wave: "triangle", freq: G5, duration: 0.06, gain: 0.12, attack: 0.003 },
      { wave: "triangle", freq: A5, duration: 0.06, gain: 0.11, attack: 0.003, delay: 0.05 },
      { wave: "triangle", freq: C6, duration: 0.13, gain: 0.1, attack: 0.003, delay: 0.1 },
    ],
  },

  /**
   * Levelling up.
   *
   * The largest cue in the product, and it is four notes and under half a
   * second. The temptation here is a fanfare, and a fanfare is exactly the
   * thing that would make this sound like somebody else's game.
   */
  "level-up": {
    voices: [
      { wave: "triangle", freq: A4, duration: 0.07, gain: 0.13, attack: 0.004 },
      { wave: "triangle", freq: D5, duration: 0.07, gain: 0.13, attack: 0.004, delay: 0.06 },
      { wave: "triangle", freq: E5, duration: 0.07, gain: 0.12, attack: 0.004, delay: 0.12 },
      { wave: "triangle", freq: A5, duration: 0.2, gain: 0.13, attack: 0.004, delay: 0.18 },
      { wave: "square", freq: A5, duration: 0.2, gain: 0.03, attack: 0.01, delay: 0.18 },
    ],
  },

  /** A thread step banked. */
  "quest-progress": {
    voices: [
      { wave: "triangle", freq: E5, duration: 0.06, gain: 0.11, attack: 0.004 },
      { wave: "triangle", freq: A5, duration: 0.11, gain: 0.09, attack: 0.004, delay: 0.05 },
    ],
  },

  /** A whole thread finished. Resolves downward onto the tonic: closure. */
  "quest-resolve": {
    voices: [
      { wave: "triangle", freq: E5, duration: 0.08, gain: 0.12, attack: 0.005 },
      { wave: "triangle", freq: D5, duration: 0.08, gain: 0.12, attack: 0.005, delay: 0.07 },
      { wave: "triangle", freq: A4, duration: 0.26, gain: 0.13, attack: 0.006, delay: 0.14 },
      { wave: "triangle", freq: E4, duration: 0.3, gain: 0.07, attack: 0.008, delay: 0.14 },
    ],
  },

  /** A new situation appearing on the map. */
  "quest-appear": {
    voices: [
      { wave: "triangle", freq: D5, duration: 0.07, gain: 0.09, attack: 0.008 },
      { wave: "triangle", freq: G5, duration: 0.12, gain: 0.07, attack: 0.008, delay: 0.06 },
    ],
  },

  /** The world visibly changing because of something the player did. */
  "world-change": {
    voices: [
      { wave: "triangle", freq: A4, duration: 0.1, gain: 0.1, attack: 0.01 },
      { wave: "triangle", freq: E5, duration: 0.14, gain: 0.09, attack: 0.01, delay: 0.07 },
      { wave: "triangle", freq: A5, duration: 0.24, gain: 0.07, attack: 0.012, delay: 0.15 },
    ],
  },

  /* ----------------------------------------------------------- Discovery */

  /** Finding something. Bright, brief, and never worth XP. */
  "discover": {
    voices: [
      { wave: "triangle", freq: C5, duration: 0.05, gain: 0.11, attack: 0.003 },
      { wave: "triangle", freq: E5, duration: 0.05, gain: 0.1, attack: 0.003, delay: 0.045 },
      { wave: "triangle", freq: A5, duration: 0.16, gain: 0.1, attack: 0.003, delay: 0.09 },
    ],
  },

  /* ---------------------------------------------------------------- Echo */

  /** Echo reacting. Softer and rounder than anything else, so it reads as it. */
  "echo-react": {
    voices: [
      { wave: "sine", freq: G5, duration: 0.07, gain: 0.08, attack: 0.008 },
      { wave: "sine", freq: C6, duration: 0.11, gain: 0.06, attack: 0.008, delay: 0.05 },
    ],
  },

  "echo-unlock": {
    voices: [
      { wave: "sine", freq: E5, duration: 0.08, gain: 0.1, attack: 0.008 },
      { wave: "sine", freq: A5, duration: 0.08, gain: 0.09, attack: 0.008, delay: 0.07 },
      { wave: "sine", freq: C6, duration: 0.22, gain: 0.09, attack: 0.008, delay: 0.14 },
    ],
  },

  "echo-equip": {
    voices: [
      { wave: "sine", freq: A5, duration: 0.06, gain: 0.09, attack: 0.006 },
      { wave: "sine", freq: E5, duration: 0.12, gain: 0.07, attack: 0.006, delay: 0.05 },
    ],
  },

  /* -------------------------------------------------------- Ambience pool */

  /*
   * One-shots for the neighbourhood bed. Scattered irregularly by the engine
   * so the ear never learns the pattern, and quiet enough that they read as
   * something happening somewhere else rather than as an event.
   */
  "amb-bird": {
    voices: [
      { wave: "sine", freq: 2400, toFreq: 3100, duration: 0.06, gain: 0.04, attack: 0.008 },
      { wave: "sine", freq: 2900, toFreq: 2500, duration: 0.05, gain: 0.03, attack: 0.006, delay: 0.09 },
    ],
  },
  "amb-bird-far": {
    voices: [
      { wave: "sine", freq: 3200, toFreq: 2700, duration: 0.05, gain: 0.02, attack: 0.01 },
    ],
  },
  /** A vehicle somewhere off the block. Noise swelling and fading. */
  "amb-pass": {
    voices: [
      { wave: "noise", freq: 240, duration: 1.5, gain: 0.05, attack: 0.5, filter: "lowpass", q: 0.6 },
    ],
  },
  /** A ball on the court. */
  "amb-ball": {
    voices: [
      { wave: "noise", freq: 480, duration: 0.07, gain: 0.045, attack: 0.002, filter: "bandpass", q: 3 },
      { wave: "noise", freq: 460, duration: 0.06, gain: 0.03, attack: 0.002, filter: "bandpass", q: 3, delay: 0.34 },
      { wave: "noise", freq: 450, duration: 0.05, gain: 0.02, attack: 0.002, filter: "bandpass", q: 3, delay: 0.58 },
    ],
  },
} satisfies Record<string, CueSpec>;

export type CueId = keyof typeof CUES;

/**
 * Widens one cue to the shared shape.
 *
 * `satisfies` is used above so `CueId` stays the exact set of keys rather than
 * `string`, which is what makes a typo in a `play()` call a compile error. The
 * cost is that indexing gives back the literal union, on which an optional
 * field that only some members declare is not visible. This is the one place
 * that widening happens, so callers see a plain `CueSpec`.
 */
export function getCue(id: CueId): CueSpec {
  return CUES[id];
}
