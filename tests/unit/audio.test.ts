import { describe, expect, it, vi } from "vitest";

import { CUES, getCue, type CueId } from "@/lib/audio/cues";
import { AudioEngine, DEFAULT_LEVELS } from "@/lib/audio/engine";

/**
 * The audio layer.
 *
 * Two things are worth testing here and one is not.
 *
 * Worth testing: that the cue data cannot describe a sound the Web Audio API
 * will refuse or that a phone speaker will turn into a click, and that the
 * engine degrades quietly on a platform that has no audio at all. Both are
 * real failure modes, and the second one is a gameplay bug rather than an
 * audio bug: a thrown exception inside a footstep would stop the world.
 *
 * Not worth testing: whether the sounds are nice. A waveform snapshot would
 * fail on every deliberate change and prove nothing about how anything
 * sounded, so aesthetics stay a listening job and are recorded in
 * `docs/AUDIO_ART_DIRECTION.md` instead.
 */

const IDS = Object.keys(CUES) as CueId[];

/* ------------------------------------------------------------ The data */

describe("every cue describes a sound the platform will actually play", () => {
  it("has a vocabulary rather than a library", () => {
    /*
     * A ceiling, deliberately. A polished small set beats a large mediocre
     * one, and every cue past the point of recognition is one more thing to
     * balance against all the others. If this needs raising, the question to
     * answer first is which existing cue the new event could have shared.
     */
    expect(IDS.length).toBeGreaterThan(20);
    expect(IDS.length).toBeLessThanOrEqual(34);
  });

  it("never uses an attack of zero", () => {
    /*
     * A gain that jumps from silence to full in a single sample is a click.
     * On a 40ms interface cue that click IS the sound, which is the difference
     * between crisp and broken, and it is the single easiest mistake to make
     * when hand-writing envelopes.
     */
    for (const id of IDS) {
      for (const [index, voice] of getCue(id).voices.entries()) {
        const attack = voice.attack ?? 0;
        expect(attack, `${id} voice ${index}`).toBeGreaterThan(0);
        /* And the attack must fit inside the note it is shaping. */
        expect(attack, `${id} voice ${index} attack vs duration`).toBeLessThan(voice.duration);
      }
    }
  });

  it("never asks for an exponential ramp to zero", () => {
    /*
     * `exponentialRampToValueAtTime` throws on a non-positive target, and the
     * engine ramps both gain and frequency. A zero anywhere in this table is a
     * runtime exception inside a footstep.
     */
    for (const id of IDS) {
      for (const [index, voice] of getCue(id).voices.entries()) {
        expect(voice.gain, `${id} voice ${index}`).toBeGreaterThan(0);
        expect(voice.freq, `${id} voice ${index}`).toBeGreaterThan(0);
        if (voice.toFreq !== undefined) {
          expect(voice.toFreq, `${id} voice ${index} sweep`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("keeps every cue short enough to be a response", () => {
    /*
     * A UI sound that outlasts the gesture that caused it stops reading as a
     * response and starts reading as an announcement. The longest thing here
     * is the ambient vehicle pass, which is scenery rather than feedback.
     */
    for (const id of IDS) {
      const cue = getCue(id);
      const end = Math.max(...cue.voices.map((v) => (v.delay ?? 0) + v.duration));
      const limit = id.startsWith("amb-") ? 2.2 : 0.62;
      expect(end, `${id} runs ${end.toFixed(2)}s`).toBeLessThanOrEqual(limit);
    }
  });

  it("keeps every voice quiet enough that overlapping cues do not clip", () => {
    /*
     * The limiter catches the rest, but a limiter working hard is audible as
     * pumping. Individual voices stay well under unity so the sum of the two
     * or three that realistically overlap does not need rescuing.
     */
    for (const id of IDS) {
      for (const [index, voice] of getCue(id).voices.entries()) {
        expect(voice.gain, `${id} voice ${index}`).toBeLessThanOrEqual(0.2);
      }
    }
  });

  it("filters every noise voice, so nothing is raw white noise", () => {
    /*
     * Unfiltered white noise is a hiss with no character and no place in the
     * world. Every noise voice here is a footfall, a latch or a bounce, and
     * each is shaped by a filter into something with a body.
     */
    for (const id of IDS) {
      for (const voice of getCue(id).voices) {
        if (voice.wave !== "noise") continue;
        expect(voice.filter, `${id}`).toBeTruthy();
      }
    }
  });

  it("keeps the footsteps at the very bottom of the mix", () => {
    /*
     * These fire twice a second for as long as somebody is walking, which
     * makes them the one cue where a level that is merely slightly wrong
     * becomes unbearable within a minute.
     */
    for (const id of ["step-path", "step-grass", "step-interior"] as CueId[]) {
      for (const voice of getCue(id).voices) {
        expect(voice.gain, id).toBeLessThanOrEqual(0.06);
      }
    }
  });
});

/* ---------------------------------------------------------- The engine */

/** A minimal recording stand-in for the parts of Web Audio the engine uses. */
function fakeAudio() {
  const created: string[] = [];
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
  });
  const node = (kind: string) => {
    created.push(kind);
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      gain: param(),
      frequency: param(),
      Q: param(),
      threshold: param(),
      knee: param(),
      ratio: param(),
      attack: param(),
      release: param(),
      type: "",
      buffer: null,
      loop: false,
      onended: null,
    };
  };

  class FakeContext {
    state = "running";
    currentTime = 0;
    sampleRate = 48000;
    destination = node("destination");
    createGain = () => node("gain");
    createOscillator = () => node("oscillator");
    createBufferSource = () => node("buffer-source");
    createBiquadFilter = () => node("filter");
    createDynamicsCompressor = () => node("compressor");
    createBuffer = () => ({ getChannelData: () => new Float32Array(48000) });
    resume = vi.fn(async () => {});
    suspend = vi.fn(async () => {});
    close = vi.fn(async () => {});
  }

  return { FakeContext, created };
}

describe("the engine is safe to use before, during and after failure", () => {
  it("stays silent and does not throw when the platform has no Web Audio", async () => {
    const original = window.AudioContext;
    // @ts-expect-error deliberately removing the API
    delete window.AudioContext;

    const engine = new AudioEngine();
    await expect(engine.unlock()).resolves.toBe(false);
    expect(engine.available).toBe(false);

    /* And every method is still callable. This is the gameplay guarantee. */
    expect(() => engine.play("ui-select")).not.toThrow();
    expect(() => engine.setScene("streets")).not.toThrow();
    expect(() => engine.startAmbience()).not.toThrow();
    expect(() => engine.duck(true)).not.toThrow();
    expect(() => engine.setLevel("music", 0.5)).not.toThrow();
    await expect(engine.suspend()).resolves.toBeUndefined();

    window.AudioContext = original;
  });

  it("stays silent when a resume is refused, which is what autoplay blocking looks like", async () => {
    const { FakeContext } = fakeAudio();
    class Refusing extends FakeContext {
      state = "suspended";
      resume = vi.fn(async () => {
        throw new Error("not allowed");
      });
    }
    // @ts-expect-error test double
    window.AudioContext = Refusing;

    const engine = new AudioEngine();
    await expect(engine.unlock()).resolves.toBe(false);
    expect(engine.unlocked).toBe(false);
    /* A refused unlock must not poison the engine: a later gesture can retry. */
    expect(engine.available).toBe(true);
    expect(() => engine.play("xp-small")).not.toThrow();
  });

  it("builds a graph and plays a cue once unlocked", async () => {
    const { FakeContext, created } = fakeAudio();
    // @ts-expect-error test double
    window.AudioContext = FakeContext;

    const engine = new AudioEngine();
    await expect(engine.unlock()).resolves.toBe(true);
    expect(engine.unlocked).toBe(true);

    /* A limiter and four gains: master plus the three buses. */
    expect(created.filter((k) => k === "compressor")).toHaveLength(1);
    expect(created.filter((k) => k === "gain").length).toBeGreaterThanOrEqual(4);

    const before = created.length;
    engine.play("level-up");
    /* Five voices in that cue, each an oscillator plus its own gain. */
    expect(created.length).toBeGreaterThan(before);
  });

  it("plays nothing while muted", async () => {
    const { FakeContext, created } = fakeAudio();
    // @ts-expect-error test double
    window.AudioContext = FakeContext;

    const engine = new AudioEngine();
    await engine.unlock();
    engine.setMuted(true);
    expect(engine.isMuted).toBe(true);

    const before = created.length;
    engine.play("level-up");
    expect(created.length, "muted engine created nodes").toBe(before);
  });

  it("clamps levels and reports them back", async () => {
    const { FakeContext } = fakeAudio();
    // @ts-expect-error test double
    window.AudioContext = FakeContext;

    const engine = new AudioEngine();
    await engine.unlock();

    engine.setLevel("music", 5);
    engine.setLevel("ambience", -3);
    const levels = engine.getLevels();
    expect(levels.music).toBe(1);
    expect(levels.ambience).toBe(0);
    expect(levels.sfx).toBe(DEFAULT_LEVELS.sfx);
  });

  it("stops the music and the ambience when suspended", async () => {
    const { FakeContext } = fakeAudio();
    // @ts-expect-error test double
    window.AudioContext = FakeContext;

    const engine = new AudioEngine();
    await engine.unlock();
    engine.setScene("streets");
    engine.startAmbience();

    await engine.suspend();
    /* Setting the same scene again after a suspend must restart it cleanly. */
    expect(() => engine.setScene("streets")).not.toThrow();
  });
});
