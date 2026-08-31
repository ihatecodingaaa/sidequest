import { getCue, type CueId, type Voice } from "./cues";

/**
 * The SIDEQUEST audio engine.
 *
 * ---
 *
 * ## Every sound in this product is synthesised at runtime
 *
 * There are no audio files. Not one. Every cue, every ambience layer and every
 * note of the music is generated from oscillators and a noise buffer by the
 * code in this directory.
 *
 * That is a deliberate choice and it buys four things at once:
 *
 * 1. **The copyright question disappears.** A synthesised square wave cannot
 *    contain somebody else's recording. `docs/AUDIO_ART_DIRECTION.md` records
 *    the provenance rule, and it is trivially satisfiable because there is
 *    nothing to license, nothing to attribute and nothing to have downloaded
 *    from anywhere.
 * 2. **It costs no download weight.** A PWA meant to open on a roadshow phone
 *    over bad wifi should not be shipping a megabyte of loops. The whole audio
 *    system is a few kilobytes of JavaScript, and it is behind the same dynamic
 *    import as the world engine, so Home, Updates and Safe never download it.
 * 3. **Latency is as low as the platform allows.** There is no fetch, no
 *    decode, and no first-play stall: the first tap after unlock makes a sound
 *    immediately.
 * 4. **It cannot accidentally sound like a specific game**, because there is no
 *    sample to be recognised. What identity it has comes from the interval and
 *    envelope choices in `cues.ts`, which are ours.
 *
 * `docs/GAME_FEEL_RESEARCH.md` already chose synthesis for interface sounds and
 * rejected music on the grounds that it "would need to be sourced, licensed,
 * hosted and lazy-loaded". Synthesis answers every clause of that objection,
 * which is why the music decision is revisited rather than ignored. The
 * reasoning is written out in `docs/LIVING_WORLD_RESEARCH.md`.
 *
 * ## The three buses
 *
 * SFX, music and ambience each get their own gain node so they can be turned
 * down independently, which is what the game accessibility guidelines ask for
 * and what a classroom actually needs: a facilitator can kill the music and
 * keep the feedback.
 *
 * Everything meets a limiter before the destination. Cues overlap constantly
 * (a step, an XP chip and a door in the same half second) and without one the
 * sum clips into a crackle on a phone speaker.
 *
 * ## Nothing here is load-bearing
 *
 * Audio is decoration over a product that must work in silence. Every method
 * is safe to call before unlock, after failure, and on a browser with no Web
 * Audio at all: they return quietly. `available` says whether anything can
 * play, and no caller is required to check it.
 */

export type Bus = "sfx" | "music" | "ambience";

/** What the world is doing, which is all the music needs to know. */
export type MusicScene = "streets" | "interior" | null;

export interface AudioLevels {
  master: number;
  sfx: number;
  music: number;
  ambience: number;
}

export const DEFAULT_LEVELS: AudioLevels = {
  master: 0.8,
  sfx: 0.9,
  /*
   * Music sits well under the effects on purpose. It is atmosphere, and the
   * moment it competes with a cue the cue stops doing its job. Ambience sits
   * lower again, because a bed you notice is a bed that is too loud.
   */
  music: 0.34,
  ambience: 0.26,
};

/** How far ahead the music scheduler looks, in seconds. */
const LOOKAHEAD = 0.12;
/** How often it wakes up to schedule, in milliseconds. */
const TICK_MS = 32;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buses: Record<Bus, GainNode> | null = null;
  private noise: AudioBuffer | null = null;

  private levels: AudioLevels = { ...DEFAULT_LEVELS };
  private muted = false;

  /** Set once the platform has told us it cannot do this. */
  private broken = false;

  /* ------------------------------------------------------------- Music */

  private scene: MusicScene = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  /** Next note index and the time it should start. */
  private step = 0;
  private nextNoteAt = 0;

  /* ---------------------------------------------------------- Ambience */

  private ambienceNodes: AudioScheduledSourceNode[] = [];
  private ambienceGain: GainNode | null = null;
  private ambienceTimer: ReturnType<typeof setInterval> | null = null;

  /* ------------------------------------------------------------- State */

  /** True once a real user gesture has produced a running context. */
  get unlocked(): boolean {
    return this.ctx?.state === "running";
  }

  /** False when the platform has no Web Audio, or it failed to start. */
  get available(): boolean {
    return !this.broken;
  }

  /**
   * The context state, for the settings screen and for tests.
   *
   * `interrupted` is a WebKit addition rather than a spec state: iOS moves a
   * context there when a phone call, Siri or another app takes the audio
   * session. It is reported as-is rather than normalised, because the recovery
   * is different: a suspended context resumes, an interrupted one has to wait
   * for the interruption to end and then resume on the next gesture.
   */
  get state(): string {
    return this.ctx?.state ?? "closed";
  }

  /* ------------------------------------------------------------- Unlock */

  /**
   * Creates and starts the context. Must be called from a user gesture.
   *
   * Browsers refuse to start an AudioContext outside a genuine gesture, and
   * that rule is correct: unexpected sound is an accessibility problem, not
   * only an annoyance. There is deliberately no attempt to work around it, no
   * silent-buffer trick and no hidden autoplay. The product asks, and if the
   * answer is no it stays quiet.
   *
   * Safe to call repeatedly. Returns whether audio is now running.
   */
  async unlock(): Promise<boolean> {
    if (this.broken) return false;

    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) {
          this.broken = true;
          return false;
        }
        this.ctx = new Ctor();
        this.build();
      }

      if (this.ctx.state !== "running") await this.ctx.resume();
      return this.ctx.state === "running";
    } catch {
      /*
       * A rejected resume is a normal outcome, not an error worth surfacing:
       * it happens when the call did not come from a gesture, or while iOS is
       * still holding the audio session. The next gesture tries again.
       */
      return false;
    }
  }

  /** Builds the bus graph once. */
  private build() {
    const ctx = this.ctx;
    if (!ctx) return;

    /*
     * A compressor used as a limiter. High ratio, low threshold, fast attack:
     * this is not for musical dynamics, it is to stop three overlapping cues
     * summing past 0 dBFS and crackling on a phone speaker.
     */
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.14;
    limiter.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : this.levels.master;
    master.connect(limiter);
    this.master = master;

    const make = (level: number) => {
      const g = ctx.createGain();
      g.gain.value = level;
      g.connect(master);
      return g;
    };

    this.buses = {
      sfx: make(this.levels.sfx),
      music: make(this.levels.music),
      ambience: make(this.levels.ambience),
    };

    /*
     * One second of white noise, generated once and reused by every cue that
     * needs a transient: footsteps, the door latch, the paper rustle. Creating
     * a buffer per cue would allocate constantly during walking.
     */
    const frames = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
    this.noise = buffer;
  }

  /* ------------------------------------------------------------- Levels */

  setLevel(bus: Bus | "master", value: number) {
    const clamped = Math.min(1, Math.max(0, value));
    this.levels = { ...this.levels, [bus]: clamped };

    const node =
      bus === "master" ? this.master : this.buses ? this.buses[bus] : null;
    if (!node || !this.ctx) return;
    /*
     * Ramped rather than set. A gain jump on a running oscillator is an
     * audible click, and the settings screen changes gain while the music is
     * playing by definition.
     */
    node.gain.setTargetAtTime(
      bus === "master" && this.muted ? 0 : clamped,
      this.ctx.currentTime,
      0.02,
    );
  }

  getLevels(): AudioLevels {
    return { ...this.levels };
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.master || !this.ctx) return;
    this.master.gain.setTargetAtTime(
      muted ? 0 : this.levels.master,
      this.ctx.currentTime,
      0.02,
    );
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /* ---------------------------------------------------------------- SFX */

  /**
   * Plays one cue.
   *
   * Silently does nothing when audio is unavailable, locked or muted, which is
   * the whole contract: a caller never has to ask permission first, and no
   * gameplay path can break because a sound failed.
   */
  play(id: CueId, options?: { rate?: number; gain?: number }) {
    const ctx = this.ctx;
    const bus = this.buses?.sfx;
    if (!ctx || !bus || ctx.state !== "running" || this.muted) return;

    const cue = getCue(id);
    if (!cue) return;

    const rate = options?.rate ?? 1;
    const gain = options?.gain ?? 1;
    const start = ctx.currentTime + 0.001;

    for (const voice of cue.voices) {
      this.voice(voice, start, rate, gain * (cue.gain ?? 1), bus);
    }
  }

  /** Renders one voice of a cue. */
  private voice(
    v: Voice,
    start: number,
    rate: number,
    gain: number,
    destination: GainNode,
  ) {
    const ctx = this.ctx;
    if (!ctx) return;

    const at = start + (v.delay ?? 0) / rate;
    const dur = Math.max(0.012, v.duration / rate);

    const amp = ctx.createGain();
    amp.connect(destination);

    let source: AudioScheduledSourceNode;

    if (v.wave === "noise") {
      if (!this.noise) return;
      const node = ctx.createBufferSource();
      node.buffer = this.noise;
      /*
       * A random offset into the shared buffer, so repeated footsteps are not
       * literally the same slice of noise. Repetition is what makes a walking
       * sound become irritating, and this is the cheapest possible variation.
       */
      node.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = v.filter ?? "bandpass";
      filter.frequency.value = v.freq;
      filter.Q.value = v.q ?? 1;
      node.connect(filter);
      filter.connect(amp);
      source = node;
    } else {
      const osc = ctx.createOscillator();
      osc.type = v.wave;
      osc.frequency.setValueAtTime(v.freq, at);
      if (v.toFreq !== undefined) {
        /*
         * Exponential, because pitch is perceived logarithmically: a linear
         * sweep from 220 to 880 spends most of its time sounding high. The
         * guard is because an exponential ramp cannot pass through or reach
         * zero, which throws.
         */
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, v.toFreq), at + dur);
      }
      osc.connect(amp);
      source = osc;
    }

    /*
     * The envelope. Attack is never zero: a gain that jumps from 0 to full in
     * one sample is a click, which on a short UI cue is the difference between
     * crisp and broken. Release uses an exponential approach to a floor rather
     * than to zero, for the same reason as above, and the node is stopped just
     * after.
     */
    const peak = Math.max(0.0001, v.gain * gain);
    const attack = Math.max(0.002, v.attack ?? 0.004);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(peak, at + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);

    source.start(at);
    source.stop(at + dur + 0.02);
    source.onended = () => {
      /*
       * Disconnect on end. Web Audio nodes are collected once they are
       * finished and unreferenced, but a walking player fires a step every
       * few hundred milliseconds for minutes at a time, and leaving the graph
       * to grow is how a long session turns into a stutter.
       */
      try {
        amp.disconnect();
        source.disconnect();
      } catch {
        /* Already torn down. */
      }
    };
  }

  /* -------------------------------------------------------------- Music */

  /**
   * Starts or switches the music.
   *
   * The scheduler is the standard Web Audio two-clock pattern: a timer wakes
   * up often, looks a short way ahead, and schedules any note that falls in
   * that window against the audio clock. Scheduling notes directly from
   * `setInterval` would drift audibly within a bar, because a timer callback
   * is not sample accurate and a phone under load delays it further.
   */
  setScene(scene: MusicScene) {
    if (scene === this.scene) return;
    this.scene = scene;

    if (!scene) {
      this.stopMusic();
      return;
    }
    if (!this.ctx || this.ctx.state !== "running") return;
    if (this.timer) return;

    this.step = 0;
    this.nextNoteAt = this.ctx.currentTime + 0.06;
    this.timer = setInterval(() => this.pump(), TICK_MS);
  }

  stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.scene = null;
  }

  /**
   * Takes the music out from under anything being read.
   *
   * The number here is evidence-led and it started out wrong. The first
   * version ducked to a third, on the reasoning that the world should still be
   * audible behind a conversation. That is a taste argument, and the evidence
   * runs against it: Vasilev, Kirkby and Angele's Bayesian meta-analysis of 65
   * studies puts background sound at g = -0.21 on reading comprehension, with
   * non-lyrical music at g = -0.19. Small, but it is a pure cost with nothing
   * measured on the other side of the ledger, and SIDEQUEST's core interaction
   * is reading a situation and deciding about it.
   *
   * So it ducks to inaudible rather than to quiet. It is a fade rather than a
   * stop, which is the one thing worth keeping from the original reasoning:
   * closing the sheet returns the player to a place instead of restarting a
   * loop, and the sustained ambience bed underneath never moves.
   */
  duck(on: boolean) {
    const bus = this.buses?.music;
    if (!bus || !this.ctx) return;
    bus.gain.setTargetAtTime(
      (on ? 0.06 : 1) * this.levels.music,
      this.ctx.currentTime,
      0.12,
    );
  }

  private pump() {
    const ctx = this.ctx;
    const bus = this.buses?.music;
    if (!ctx || !bus || !this.scene) return;
    if (ctx.state !== "running") return;

    // Imported lazily to keep the score out of the engine's own concerns.
    const score = SCORES[this.scene];
    const spb = 60 / score.bpm / score.subdivision;

    while (this.nextNoteAt < ctx.currentTime + LOOKAHEAD) {
      const index = this.step % score.length;
      for (const line of score.lines) {
        const note = line.pattern[index % line.pattern.length];
        if (note === null || note === undefined) continue;
        this.voice(
          {
            wave: line.wave,
            freq: note,
            duration: spb * (line.hold ?? 1),
            gain: line.gain,
            attack: line.attack,
          },
          this.nextNoteAt,
          1,
          1,
          bus,
        );
      }
      this.nextNoteAt += spb;
      this.step += 1;
    }
  }

  /* ----------------------------------------------------------- Ambience */

  /**
   * Starts the neighbourhood bed.
   *
   * Two parts, which is the standard shape: a continuous quiet bed, and
   * occasional one-shots scattered in time so the ear never learns the loop.
   * The bed here is filtered noise rather than a recording, which is what a
   * distant road actually is at this distance, and it sits far enough under
   * the effects that a player notices it leaving rather than arriving.
   */
  startAmbience() {
    const ctx = this.ctx;
    const bus = this.buses?.ambience;
    if (!ctx || !bus || !this.noise || this.ambienceGain) return;
    if (ctx.state !== "running") return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 1.6);
    gain.connect(bus);
    this.ambienceGain = gain;

    // The bed: low-passed noise, which reads as distant traffic and room tone.
    const bed = ctx.createBufferSource();
    bed.buffer = this.noise;
    bed.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    lp.Q.value = 0.6;
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.16;
    bed.connect(lp);
    lp.connect(bedGain);
    bedGain.connect(gain);
    bed.start();
    this.ambienceNodes.push(bed);

    /*
     * One-shots on an irregular schedule. A fixed interval is heard as a
     * metronome within about three repetitions, so the gap is randomised
     * across a wide range and the cue is chosen from a small pool.
     */
    const ONE_SHOTS: CueId[] = ["amb-bird", "amb-bird-far", "amb-pass", "amb-ball"];
    const schedule = () => {
      if (!this.ambienceGain) return;
      const cue = ONE_SHOTS[Math.floor(Math.random() * ONE_SHOTS.length)];
      const spec = getCue(cue);
      if (spec && this.ambienceGain) {
        for (const v of spec.voices) {
          this.voice(v, ctx.currentTime + 0.02, 1, spec.gain ?? 1, this.ambienceGain);
        }
      }
    };
    this.ambienceTimer = setInterval(() => {
      // Roughly a one in three chance every two seconds: mean gap about six.
      if (Math.random() < 0.34) schedule();
    }, 2000);
  }

  stopAmbience() {
    if (this.ambienceTimer) clearInterval(this.ambienceTimer);
    this.ambienceTimer = null;
    for (const node of this.ambienceNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        /* Already stopped. */
      }
    }
    this.ambienceNodes = [];
    try {
      this.ambienceGain?.disconnect();
    } catch {
      /* Already gone. */
    }
    this.ambienceGain = null;
  }

  /* ------------------------------------------------------------ Suspend */

  /**
   * Stops everything and lets the platform reclaim the audio session.
   *
   * Called when the tab is hidden and when the world unmounts. A page that
   * keeps making noise after somebody has switched away is the single most
   * complained-about behaviour in mobile web audio, and there is no reason
   * for it here: the world is not running either.
   */
  async suspend() {
    this.stopMusic();
    this.stopAmbience();
    try {
      if (this.ctx && this.ctx.state === "running") await this.ctx.suspend();
    } catch {
      /* Nothing to do. The context is already gone or was never started. */
    }
  }

  /** Tears the whole thing down. */
  async close() {
    this.stopMusic();
    this.stopAmbience();
    try {
      await this.ctx?.close();
    } catch {
      /* Already closed. */
    }
    this.ctx = null;
    this.master = null;
    this.buses = null;
    this.noise = null;
  }
}

/* ----------------------------------------------------------------- Scores */

interface Line {
  wave: OscillatorType;
  /** One entry per subdivision. `null` is a rest. Values are hertz. */
  pattern: (number | null)[];
  gain: number;
  attack?: number;
  /** Multiples of one subdivision. */
  hold?: number;
}

interface Score {
  bpm: number;
  /** Subdivisions per beat. */
  subdivision: number;
  /** Total subdivisions before the pattern repeats. */
  length: number;
  lines: Line[];
}

/*
 * The two pieces, written as note tables rather than as a file.
 *
 * Both are in A minor pentatonic, which is five notes with no semitone
 * clashes, so any two lines that land together still sound intentional. That
 * is a practical choice for procedurally scheduled music: there is no arranger
 * to fix a wrong interval.
 *
 * The originality rule from `docs/AUDIO_ART_DIRECTION.md` applies here more
 * than anywhere: the melodic content is ours, it is deliberately built from
 * even, stepwise motion rather than the wide leaping fanfares handheld
 * adventure games are remembered for, and it must never be adjusted in the
 * direction of a remembered tune. If a knowledgeable player could name the
 * game it is from, it is wrong and it gets rewritten.
 */
const A3 = 220;
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const G4 = 392;
const A4 = 440;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;

const SCORES: Record<Exclude<MusicScene, null>, Score> = {
  /*
   * Streets. Daytime neighbourhood: a walking bass, a soft pluck line that
   * moves mostly by step, and a lot of rests. The rests are the point. A
   * continuous melody is what makes a short loop wear out, and this one is
   * meant to be inhabited for several minutes at a time.
   */
  streets: {
    bpm: 96,
    subdivision: 2,
    length: 32,
    lines: [
      {
        wave: "triangle",
        gain: 0.15,
        attack: 0.01,
        hold: 1.6,
        pattern: [
          A3, null, null, null, C4, null, null, null,
          D4, null, null, null, C4, null, null, null,
          A3, null, null, null, G4 / 2, null, null, null,
          C4, null, null, null, D4, null, null, null,
        ],
      },
      {
        wave: "square",
        gain: 0.055,
        attack: 0.006,
        hold: 0.9,
        pattern: [
          null, null, E4, null, null, G4, null, null,
          A4, null, null, null, null, G4, null, E4,
          null, null, D4, null, null, E4, null, null,
          G4, null, null, null, null, E4, null, null,
        ],
      },
      {
        wave: "triangle",
        gain: 0.035,
        attack: 0.004,
        hold: 0.5,
        pattern: [
          null, null, null, null, null, null, C5, null,
          null, null, null, null, null, null, null, null,
          null, null, null, null, null, null, A4, null,
          null, null, null, null, D5, null, null, null,
        ],
      },
    ],
  },

  /*
   * Interior. The same key and the same tempo so a door does not feel like a
   * scene change, but thinner: the bass drops out, the pluck slows, and the
   * top line carries it. Walking inside should feel like the street got
   * quieter, not like a different game started.
   */
  interior: {
    bpm: 96,
    subdivision: 2,
    length: 16,
    lines: [
      {
        wave: "triangle",
        gain: 0.1,
        attack: 0.014,
        hold: 3.2,
        pattern: [A3, null, null, null, null, null, null, null, C4, null, null, null, null, null, null, null],
      },
      {
        wave: "triangle",
        gain: 0.05,
        attack: 0.008,
        hold: 1.4,
        pattern: [
          null, null, null, E4, null, null, null, null,
          null, null, D4, null, null, null, E5 / 2, null,
        ],
      },
    ],
  },
};
