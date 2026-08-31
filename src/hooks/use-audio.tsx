"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import type { AudioEngine, AudioLevels, Bus, MusicScene } from "@/lib/audio/engine";
import type { CueId } from "@/lib/audio/cues";

/**
 * The one way anything in SIDEQUEST makes a sound.
 *
 * ---
 *
 * ## Why a provider rather than a module singleton
 *
 * Preferences have to be readable by a settings screen and writable from two
 * places, the engine has to be torn down when the tab hides, and the whole
 * thing has to stay out of the initial bundle. A context does all three, and it
 * means no component ever constructs an `AudioContext` of its own. There is
 * deliberately no `new Audio(...)` anywhere in this codebase and a unit test
 * fails the build if one appears.
 *
 * ## The engine is imported dynamically
 *
 * `AudioEngine` is only fetched on the first genuine unlock. Home, Updates and
 * Safe therefore never download a byte of it, which is the point of a PWA that
 * has to open on a roadshow phone. The provider itself is a few hundred bytes
 * and safe to mount everywhere.
 *
 * ## Preferences are device state, not profile state
 *
 * They live under their own `localStorage` key rather than on the persisted
 * profile, because whether sound should play is a fact about the room somebody
 * is in, not about who they are. The same young person wants it on with
 * earphones and off in a classroom, and the profile is the wrong place to
 * record that. It also means the settings are readable before the profile has
 * hydrated, which matters because the first thing Streets does is ask.
 */

const STORAGE_KEY = "sidequest.audio.v1";

export interface AudioPrefs {
  /**
   * Whether the player has been asked yet.
   *
   * Three states, not two. `null` means unasked, which is what makes the first
   * Streets entry able to offer the choice once and then never again.
   */
  enabled: boolean | null;
  music: boolean;
  ambience: boolean;
  sfx: boolean;
  levels: AudioLevels;
}

const DEFAULTS: AudioPrefs = {
  enabled: null,
  music: true,
  ambience: true,
  sfx: true,
  levels: { master: 0.8, sfx: 0.9, music: 0.34, ambience: 0.26 },
};

function load(): AudioPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>;
    return {
      ...DEFAULTS,
      ...parsed,
      levels: { ...DEFAULTS.levels, ...(parsed.levels ?? {}) },
    };
  } catch {
    /* A corrupt or blocked store is not a reason to break the world. */
    return DEFAULTS;
  }
}

/**
 * Preferences as a tiny external store.
 *
 * React reads this through `useSyncExternalStore` rather than through state
 * seeded in an effect. That is not ceremony: `localStorage` does not exist
 * during server rendering, so reading it during render is a hydration
 * mismatch, and reading it in an effect and calling `setState` is a cascading
 * render the compiler rejects. An external store is the primitive built for
 * exactly this shape, and it gives the server snapshot its own explicit
 * answer.
 *
 * The snapshot is cached so the reference is stable between reads. Returning a
 * fresh object each time would re-render forever.
 */
let snapshot: AudioPrefs | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): AudioPrefs {
  if (!snapshot) snapshot = load();
  return snapshot;
}

/** The server has no storage, so it gets the defaults and nothing else. */
function getServerSnapshot(): AudioPrefs {
  return DEFAULTS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writePrefs(next: AudioPrefs) {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Private mode. The preference just will not survive the session. */
  }
  for (const listener of listeners) listener();
}

interface AudioApi {
  /** Whether the player has answered the sound question. */
  prefs: AudioPrefs;
  /** True once a context is actually running. */
  ready: boolean;
  /** Plays a cue. Safe to call always: silent when off, locked or muted. */
  play: (id: CueId) => void;
  /** Sets the music scene. Null stops it. */
  setScene: (scene: MusicScene) => void;
  /** Ducks music under dialogue. */
  duck: (on: boolean) => void;
  startAmbience: () => void;
  stopAmbience: () => void;
  /** Turns sound on from a genuine user gesture. Returns whether it worked. */
  enable: () => Promise<boolean>;
  /** Records that the player does not want sound. Never asks again. */
  decline: () => void;
  setBus: (bus: Bus, on: boolean) => void;
  setLevel: (bus: Bus | "master", value: number) => void;
  /** Master mute, independent of the per-bus switches. */
  setMuted: (muted: boolean) => void;
  muted: boolean;
}

const AudioCtx = createContext<AudioApi | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);

  /**
   * The audio state, published on the document element.
   *
   * An AudioContext is not inspectable from a test, so "Safe is silent" would
   * otherwise be an unfalsifiable claim about a class nobody can reach. This
   * is the same disciplined alternative the world engine already uses for the
   * player's tile: one attribute, written only when the value changes, and
   * useful for debugging something that is otherwise invisible.
   */
  const publish = useCallback((scene: MusicScene) => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.audioScene = scene ?? "none";
  }, []);
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [ready, setReady] = useState(false);
  const [muted, setMutedState] = useState(false);
  const pathname = usePathname();

  /** Applies the per-bus on/off switches to the engine's gain nodes. */
  const applyBuses = useCallback((engine: AudioEngine, p: AudioPrefs) => {
    engine.setLevel("master", p.levels.master);
    engine.setLevel("sfx", p.sfx ? p.levels.sfx : 0);
    engine.setLevel("music", p.music ? p.levels.music : 0);
    engine.setLevel("ambience", p.ambience ? p.levels.ambience : 0);
  }, []);

  const enable = useCallback(async () => {
    const current = getSnapshot();
    if (!engineRef.current) {
      /*
       * The dynamic import is the whole reason the rest of the app pays
       * nothing for this. It resolves in a few milliseconds from cache on
       * every visit after the first.
       */
      const { AudioEngine: Ctor } = await import("@/lib/audio/engine");
      engineRef.current = new Ctor();
    }
    const engine = engineRef.current;
    const ok = await engine.unlock();
    if (ok) applyBuses(engine, current);
    setReady(ok);
    writePrefs({ ...current, enabled: ok });
    return ok;
  }, [applyBuses]);

  const decline = useCallback(() => {
    writePrefs({ ...getSnapshot(), enabled: false });
  }, []);

  /* ------------------------------------------------------------- Safe */

  /**
   * Safe is silent, and it is silent by an explicit rule rather than by luck.
   *
   * Leaving Streets already unmounts the world, which stops the music, so in
   * practice arriving at Safe from anywhere is quiet. That is an emergent
   * property and emergent properties rot. This watches the route and forces it,
   * so a future screen that starts music somewhere else cannot leak into the
   * one screen in the product that must never be playful. An e2e test pins it.
   */
  useEffect(() => {
    if (!pathname?.startsWith("/safe")) return;
    publish(null);
    const engine = engineRef.current;
    if (!engine) return;
    engine.setScene(null);
    engine.stopAmbience();
    publish(null);
  }, [pathname, publish]);

  /* -------------------------------------------------------- Visibility */

  /**
   * Nothing plays into a tab nobody is looking at.
   *
   * A page that keeps making noise after somebody has switched apps is the
   * most complained-about behaviour in mobile web audio, and there is no case
   * for it here: the world has stopped rendering too. Coming back does not
   * auto-resume, because a resume outside a gesture is exactly what browsers
   * refuse; the next tap brings it back.
   */
  useEffect(() => {
    const onVisibility = () => {
      const engine = engineRef.current;
      if (!engine) return;
      if (document.visibilityState === "hidden") void engine.suspend();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    return () => {
      void engineRef.current?.close();
      engineRef.current = null;
    };
  }, []);

  const api = useMemo<AudioApi>(
    () => ({
      prefs,
      ready,
      muted,
      play: (id) => {
        if (!prefs.sfx) return;
        engineRef.current?.play(id);
      },
      setScene: (scene) => {
        if (!prefs.music) {
          engineRef.current?.setScene(null);
          publish(null);
          return;
        }
        engineRef.current?.setScene(scene);
        publish(scene);
      },
      duck: (on) => engineRef.current?.duck(on),
      startAmbience: () => {
        if (!prefs.ambience) return;
        engineRef.current?.startAmbience();
      },
      stopAmbience: () => engineRef.current?.stopAmbience(),
      enable,
      decline,
      setBus: (bus, on) => {
        const next = { ...getSnapshot(), [bus]: on };
        writePrefs(next);
        const engine = engineRef.current;
        if (!engine) return;
        applyBuses(engine, next);
        if (bus === "music" && !on) engine.setScene(null);
        if (bus === "ambience" && !on) engine.stopAmbience();
      },
      setLevel: (bus, value) => {
        const current = getSnapshot();
        const next = { ...current, levels: { ...current.levels, [bus]: value } };
        writePrefs(next);
        const engine = engineRef.current;
        if (engine) applyBuses(engine, next);
      },
      setMuted: (value) => {
        setMutedState(value);
        engineRef.current?.setMuted(value);
      },
    }),
    [prefs, ready, muted, enable, decline, applyBuses, publish],
  );

  return <AudioCtx.Provider value={api}>{children}</AudioCtx.Provider>;
}

/**
 * The hook every caller uses.
 *
 * Returns a no-op API rather than throwing when there is no provider, because
 * audio is decoration: a component rendered in a test or in isolation should
 * behave normally and stay quiet, not crash.
 */
export function useAudio(): AudioApi {
  const ctx = useContext(AudioCtx);
  return ctx ?? SILENT;
}

const SILENT: AudioApi = {
  prefs: DEFAULTS,
  ready: false,
  muted: false,
  play: () => {},
  setScene: () => {},
  duck: () => {},
  startAmbience: () => {},
  stopAmbience: () => {},
  enable: async () => false,
  decline: () => {},
  setBus: () => {},
  setLevel: () => {},
  setMuted: () => {},
};
