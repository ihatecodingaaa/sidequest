"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { List, Volume2, VolumeX, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/use-profile";
import { useAudio } from "@/hooks/use-audio";
import { useAppStore } from "@/store/app-store";
import { useStreetsBridge } from "@/features/streets/game/quest-bridge";
import { useStreetsLayout } from "@/features/streets/game/use-orientation";
import { recallPlace, rememberPlace } from "@/features/streets/game/streets-return";
import { DialogueOverlay } from "@/features/streets/components/dialogue-overlay";
import { Minimap } from "@/features/streets/components/minimap";
import { CrewHub } from "@/features/streets/components/crew-hub";
import { RewardsCounter } from "@/features/streets/components/rewards-counter";
import { TouchPad } from "@/features/streets/components/touch-pad";
import { QuestList } from "@/features/streets/components/quest-list";
import { AvatarSetup } from "@/features/streets/components/avatar-setup";
import { SoundPrompt } from "@/features/streets/components/sound-prompt";
import { LookSheet } from "@/features/streets/components/look-sheet";
import { HistorySheet } from "@/features/streets/components/history-sheet";
import { StickerNotice } from "@/features/streets/components/sticker-notice";
import { indoorLandmark, memoryAt, nearLandmark } from "@/features/streets/district-memory";
import { earnedStickers, type DistrictSticker } from "@/data/district-stickers";
import { WorldSheet } from "@/features/streets/components/world-sheet";
import { AudioControls } from "@/components/ui/audio-controls";
import {
  DEFAULT_AVATAR,
  DISTRICT_ID,
  LANDMARKS,
  MAPS,
  NPCS,
  SPAWN,
  type AvatarLook,
  type Door,
  type Npc,
} from "@/features/streets/streets-data";
import type { WorldProp } from "@/features/streets/streets-props";
import { npcSpot } from "@/features/streets/game/world-engine";
import type {
  EngineOptions,
  NpcRuntime,
  WorldEngine,
} from "@/features/streets/game/world-engine";

/**
 * SIDEQUEST Streets.
 *
 * The canvas draws the district. Everything a person needs to read, choose or
 * operate is DOM on top of it. That split is not a stylistic preference: a
 * `<canvas>` exposes no semantics at all, so anything drawn inside it is
 * invisible to a screen reader, unreachable by keyboard focus and unaffected by
 * text sizing. The world can be a canvas. The product cannot be.
 *
 * Which is also why the Quest List is a peer of the map rather than a hidden
 * fallback: every experience reachable by walking is reachable without walking.
 * A prevention product must never gate its learning behind dexterity.
 */
/* A stable empty array, so an absent ledger does not re-render every frame. */
const EMPTY_MOMENTS: string[] = [];

/*
 * The track parameter, read without opting the route out of static rendering.
 *
 * `useSearchParams` would force this route dynamic or need a Suspense boundary
 * wrapped around an entire canvas world, for a value that is fixed at arrival.
 * Setting state from an effect is the other obvious option and the React
 * compiler correctly rejects it. `useSyncExternalStore` is the remaining
 * honest one: the server snapshot is null, the client snapshot is the URL, and
 * the subscription is a no-op because the value cannot change without a
 * navigation that remounts this anyway.
 */
const subscribeNothing = () => () => {};
const readNothing = () => null;
const readTrack = (): string | null => {
  const id = new URLSearchParams(window.location.search).get("track");
  return id && NPCS.some((npc) => npc.id === id) ? id : null;
};

export function StreetsClient() {
  const reduced = usePrefersReducedMotion();
  const { ref: rootRef, metrics } = useStreetsLayout();
  const landscape = metrics.overlay;
  const compact = metrics.compact;
  const bridge = useStreetsBridge();
  const audio = useAudio();
  /*
   * Destructured because the effects below depend on these two specifically,
   * not on the bridge object, which is rebuilt every render. Listing `bridge`
   * would restart the engine on every keystroke.
   */
  const { ready: bridgeReady, equippedEcho, isNpcDone, signals } = bridge;
  const setStreetsAvatar = useAppStore((state) => state.setStreetsAvatar);
  const keepMoment = useAppStore((state) => state.keepMoment);
  const meetNpc = useAppStore((state) => state.meetNpc);
  const metNpcs = useAppStore((state) => state.profile.metNpcs) ?? EMPTY_MOMENTS;
  const profile = useAppStore((state) => state.profile);
  const moments = useAppStore((state) => state.profile.districtMoments) ?? EMPTY_MOMENTS;
  const storedLook = useAppStore((state) => state.profile.streetsAvatar);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /*
   * The live audio API, for callbacks the engine holds for its whole life.
   *
   * Written in an effect rather than during render. The engine is constructed
   * once and keeps its callbacks forever, while the audio API is rebuilt every
   * time a preference changes, so a captured value would freeze at whatever
   * was true on the first frame and a player who turned sound on afterwards
   * would get silence. See the note on `onStep`.
   */
  const audioRef = useRef(audio);
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);
  const engineRef = useRef<WorldEngine | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  /** Everything about the engine that changes without the engine changing. */
  const liveRef = useRef<
    Pick<EngineOptions, "look" | "echo" | "npcs" | "signals" | "reducedMotion">
  >({
    look: DEFAULT_AVATAR,
    echo: null,
    npcs: [],
    signals: {},
    reducedMotion: false,
  });

  const [engineReady, setEngineReady] = useState(false);
  const [near, setNear] = useState<Npc | null>(null);
  const [doorway, setDoorway] = useState<Door | null>(null);
  const [nearProp, setNearProp] = useState<WorldProp | null>(null);
  const [looking, setLooking] = useState<WorldProp | null>(null);
  const [placeId, setPlaceId] = useState<string>(DISTRICT_ID);
  const [tile, setTile] = useState(SPAWN);
  const [talkingTo, setTalkingTo] = useState<Npc | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [hint, setHint] = useState(true);
  const [soundOpen, setSoundOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const look: AvatarLook = storedLook ?? DEFAULT_AVATAR;
  const needsAvatar = bridgeReady && !storedLook;
  const place = MAPS[placeId] ?? MAPS[DISTRICT_ID];
  /*
   * Which landmark the player is standing in or at, and what happened there.
   *
   * Two ways of being somewhere, because the district has both kinds of place.
   * An interior maps to its landmark through the door the player came in by,
   * so memory made inside the shop belongs to the shop rather than to a room
   * id nobody has seen a name for. Outdoors it is proximity, because the court
   * and the bus stop have no interior at all and their history was reachable
   * from nowhere: two of six places could remember things the player could
   * never be shown.
   *
   * The radius is deliberately tight. Standing at the court means the court,
   * not the whole block, and a chip that followed the player everywhere would
   * be a history of everything, which is a dashboard.
   */
  const placeLandmarkId = placeId === DISTRICT_ID ? nearLandmark(tile) : indoorLandmark(placeId);
  const historyPlace = placeLandmarkId
    ? LANDMARKS.find((landmark) => landmark.id === placeLandmarkId)
    : undefined;
  const history = placeLandmarkId ? memoryAt(profile, placeLandmarkId) : [];
  const busy =
    Boolean(talkingTo) ||
    listOpen ||
    counterOpen ||
    hubOpen ||
    soundOpen ||
    historyOpen ||
    Boolean(looking);

  /* --------------------------------------------------------- Engine boot */

  /*
   * Everything the engine reads every frame is pushed in, never rebuilt around.
   *
   * This effect is declared first on purpose: effects run in order on mount, so
   * the ref is populated before the boot effect below constructs the engine.
   *
   * The reason it matters is a real bug this replaced. Finishing a Street Check
   * changes the profile, which changes `isNpcDone`, which used to be a
   * dependency of the boot effect. The engine was therefore torn down and
   * rebuilt at the spawn point at the exact moment somebody finished a
   * conversation, and once buildings opened that meant being thrown out onto
   * the street mid-sentence.
   */
  useEffect(() => {
    const live = {
      look,
      echo: equippedEcho,
      npcs: NPCS.map((npc) => ({ npc, done: isNpcDone(npc) })),
      signals,
      reducedMotion: reduced,
    };
    liveRef.current = live;
    engineRef.current?.update(live);
  }, [look, equippedEcho, isNpcDone, signals, reduced]);

  useEffect(() => {
    if (!bridgeReady || needsAvatar) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let engine: WorldEngine | null = null;

    void (async () => {
      // The renderer is loaded only when the world is actually entered, so
      // Home, Safe and Updates never pay for it.
      const { WorldEngine: Engine } = await import("@/features/streets/game/world-engine");
      if (disposed) return;

      engine = new Engine(canvas, {
        ...liveRef.current,
        onNear: setNear,
        onDoor: setDoorway,
        onProp: setNearProp,
        onTile: setTile,
        onMap: (map) => setPlaceId(map.id),
        /*
         * Audio is read through a ref rather than captured, because this
         * engine is constructed once and the audio API is rebuilt whenever a
         * preference changes. Capturing it here would freeze the first value
         * and a player who turned sound on afterwards would get silence.
         */
        onStep: (surface) => audioRef.current.play(`step-${surface}` as const),
      });

      /*
       * Come back to where you were, not to the spawn point.
       *
       * Somebody who walked up to a neighbour, played what that neighbour
       * offered and returned should be standing next to them watching the
       * world react. Restoring before `start()` means the first painted frame
       * is already in the right place, with no visible jump from spawn.
       */
      const here = recallPlace();
      if (here) {
        engine.restore(here.mapId, here.x, here.y, here.facing);
        setPlaceId(engine.place.id);
        setTile(engine.tile);
      }

      engineRef.current = engine;
      engine.start();
      setEngineReady(true);
    })();

    return () => {
      disposed = true;
      engine?.stop();
      engineRef.current = null;
    };
  }, [bridgeReady, needsAvatar]);

  /*
   * The camera reframes from the same measurement the layout uses.
   *
   * There used to be a second path here: window `resize` and
   * `orientationchange` listeners calling `engine.resize()`, which read the
   * canvas rect at whatever moment the event happened to fire. On iOS that can
   * be before the layout has settled, so the camera could be sized from a
   * viewport that no longer existed while the HUD was sized from another.
   *
   * Now there is one measurement. `metrics` changes only when the observed box
   * actually changes, which is after the browser has laid out, and every
   * consumer reads the same numbers.
   */
  useEffect(() => {
    if (!engineReady || metrics.width === 0) return;
    engineRef.current?.resize();
  }, [engineReady, metrics]);

  /* ------------------------------------------------------------- Input */

  /**
   * Bringing the sound back on a later visit.
   *
   * A player who already said yes should not be asked again, but a browser
   * still will not start a context outside a gesture. So the first movement,
   * tap or key press in the world is what resumes it: a real gesture, one the
   * player was making anyway, and it means the world is quiet for exactly as
   * long as nobody has touched it.
   *
   * Idempotent and cheap once the context exists.
   */
  const resumeAudio = useCallback(() => {
    if (audioRef.current.prefs.enabled !== true) return;
    if (audioRef.current.ready) return;
    void audioRef.current.enable();
  }, []);

  const applyKeys = useCallback(() => {
    resumeAudio();
    const keys = keysRef.current;
    const x = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
    const y = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);
    engineRef.current?.setInput(x, y);
    if (x !== 0 || y !== 0) setHint(false);
  }, [resumeAudio]);

  /**
   * Somebody coming into reach gets a quiet acknowledgement.
   *
   * Only on the transition into range, never on the way out, and never twice
   * for the same person. Walking back and forth past a neighbour should not
   * produce a stutter, and a sound on losing something is a sound that says
   * you did the wrong thing.
   */
  useEffect(() => {
    if (near) audio.play("npc-notice");
  }, [near, audio]);

  /*
   * Something worth stopping at coming into reach.
   *
   * Quieter than a person, and only on the way in. The world is full of these
   * and a cue on every one at conversation volume would be a rattle.
   */
  useEffect(() => {
    if (nearProp) audio.play("prop-near");
  }, [nearProp, audio]);

  const openNpc = useCallback(
    (npc: Npc) => {
      // The rewards counter is a screen of its own. Everybody else talks first.
      audioRef.current.play("npc-talk");
      /*
       * Meeting somebody happens when the conversation opens, not when it
       * finishes. A player who opens a sheet and taps "Not now" has still met
       * them, and the greeting next time should say so.
       *
       * Fixtures are excluded: a noticeboard is not somebody you have met, and
       * "Met Self checkout 2" is a joke the product did not intend to make.
       */
      if ((npc.figure ?? "person") === "person") {
        meetNpc(npc.id);
        /*
         * Echo notices a person, and only a person.
         *
         * The reaction is rate limited in the engine and carries nothing: the
         * conversation sheet that is about to open says everything. A
         * companion that reacted to doors and noticeboards too would be
         * reacting constantly, which is the same as not reacting.
         */
        engineRef.current?.reactEcho("curious");
      }
      setTalkingTo(npc);
      setHint(false);
    },
    [meetNpc],
  );

  /*
   * A sticker, announced where it was earned.
   *
   * Stickers derive, so there is no single write to hang an announcement on.
   * This watches the derived set instead and surfaces anything new while the
   * player is still standing in the place that earned it, which is the same
   * rule the Echo unlock and the district moment already follow: an unlock
   * discovered later on another screen is a database write, not a reward.
   *
   * The first render seeds the baseline rather than announcing eight stickers
   * to somebody who earned them last week.
   */
  /*
   * Somebody the Quest Journal asked us to point at.
   *
   * Read from the URL once, on mount, rather than through `useSearchParams`.
   * The hook would opt this route out of static rendering or need a Suspense
   * boundary around a whole canvas world, for a value that never changes after
   * arrival. Cleared by the player, never automatically, because a marker that
   * vanishes on its own is worse than one that stays.
   *
   * The position drawn is `npcSpot`, which is where the world says they are
   * standing right now, so tracking stays correct for the people who relocate
   * once their situation resolves.
   */
  const urlTrack = useSyncExternalStore(subscribeNothing, readTrack, readNothing);
  const [stopped, setStopped] = useState(false);
  const trackedId = stopped || !urlTrack ? null : urlTrack;

  const trackedNpc = trackedId ? (NPCS.find((npc) => npc.id === trackedId) ?? null) : null;
  const tracked = trackedNpc
    ? {
        ...trackedNpc,
        ...npcSpot({ npc: trackedNpc, done: isNpcDone(trackedNpc) } as NpcRuntime),
      }
    : null;
  const trackedPlace = trackedNpc
    ? LANDMARKS.find((landmark) => landmark.id === trackedNpc.landmarkId)
    : undefined;

  const [newSticker, setNewSticker] = useState<DistrictSticker | null>(null);
  const knownStickers = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!bridgeReady) return;
    const current = earnedStickers(profile);
    if (knownStickers.current === null) {
      knownStickers.current = new Set(current.map((sticker) => sticker.id));
      return;
    }
    const fresh = current.find((sticker) => !knownStickers.current!.has(sticker.id));
    knownStickers.current = new Set(current.map((sticker) => sticker.id));
    if (!fresh) return;
    setNewSticker(fresh);
    engineRef.current?.reactEcho("pleased");
    audioRef.current.play("discover");
  }, [profile, bridgeReady]);

  /**
   * One button, whichever is nearer.
   *
   * The engine suppresses a person who is further away than a doorway, so this
   * only has to prefer the person it was given.
   */
  const interact = useCallback(() => {
    resumeAudio();
    const engine = engineRef.current;
    if (!engine) return;
    engine.setInput(0, 0);
    keysRef.current.clear();

    const npc = engine.target;
    if (npc) {
      openNpc(npc);
      return;
    }
    const prop = engine.lookAt;
    if (prop) {
      audioRef.current.play("prop-look");
      /* Echo looks at what you look at, when there is something to keep. */
      if (prop.discovery) engine.reactEcho("pleased");
      setLooking(prop);
      setHint(false);
      return;
    }
    const door = engine.doorway;
    if (door) {
      /*
       * The latch fires before the map changes, so the sound belongs to the
       * gesture rather than arriving after the new room has drawn. Audio and
       * visual feedback for the same action have to land together or they
       * read as two events.
       */
      audioRef.current.play(door.to === DISTRICT_ID ? "door-close" : "door-open");
      engine.enter(door);
      setHint(false);
    }
  }, [openNpc, resumeAudio]);

  useEffect(() => {
    const map: Record<string, string> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
      W: "up",
      S: "down",
      A: "left",
      D: "right",
    };

    const onDown = (event: KeyboardEvent) => {
      // Never steal a key from a control somebody is actually using.
      const target = event.target as HTMLElement | null;
      if (target && /^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (busy) return;

      const dir = map[event.key];
      if (dir) {
        event.preventDefault();
        keysRef.current.add(dir);
        applyKeys();
        return;
      }
      if (event.key === "Enter" || event.key === " " || event.key === "e" || event.key === "E") {
        event.preventDefault();
        interact();
      }
    };

    const onUp = (event: KeyboardEvent) => {
      const dir = map[event.key];
      if (!dir) return;
      keysRef.current.delete(dir);
      applyKeys();
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [applyKeys, interact, busy]);

  /* --------------------------------------------------------------- Audio */

  /**
   * The music follows the room, and the ambience follows the outdoors.
   *
   * Both are keyed on the map rather than on a scene enum the client has to
   * maintain, so walking through a door is the only thing that has to happen
   * for the score to thin out and the birds to stop.
   */
  useEffect(() => {
    if (!engineReady || !audio.ready) return;
    const indoors = placeId !== DISTRICT_ID;
    audio.setScene(indoors ? "interior" : "streets");
    if (indoors) audio.stopAmbience();
    else audio.startAmbience();
  }, [engineReady, audio, placeId]);

  /** Everything stops when the world is left, whatever the exit was. */
  useEffect(() => {
    const api = audioRef.current;
    return () => {
      api.setScene(null);
      api.stopAmbience();
    };
  }, []);

  /**
   * The music steps back under a conversation.
   *
   * Ducked rather than stopped: the world should still be there behind the
   * sheet, so closing it returns the player to a place rather than to a
   * silence that then has to restart.
   */
  useEffect(() => {
    audio.duck(busy);
  }, [audio, busy]);

  /* Movement stops whenever something is on top of the world. */
  useEffect(() => {
    if (busy) {
      keysRef.current.clear();
      engineRef.current?.setInput(0, 0);
    }
  }, [busy]);

  /*
   * Remember where the player is, on every tile they cross.
   *
   * The tile callback already fires only when the tile actually changes, so
   * this is a handful of small session-storage writes per second of walking
   * and nothing at all while standing still. Doing it here rather than at the
   * moment of leaving means every exit is covered: a mission, a campaign,
   * Safe, the browser back button, or a refresh.
   */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engineReady || !engine) return;
    rememberPlace({ mapId: placeId, x: tile.x, y: tile.y, facing: engine.heading });
  }, [engineReady, placeId, tile]);

  /** The Quest List's shortcut. Interiors open their door on the way. */
  const walkTo = useCallback((npc: Npc) => {
    const engine = engineRef.current;
    if (!engine) return;
    const mapId = npc.mapId ?? DISTRICT_ID;
    if (mapId === DISTRICT_ID) {
      const spot = engine.spotFor(npc);
      engine.moveTo(spot.x, spot.y);
    } else {
      const door = MAPS[DISTRICT_ID]?.doors.find((entry) => entry.to === mapId);
      if (door) engine.enter(door);
    }
    // Close enough to talk. Arriving out of range and being told nobody is
    // nearby is the worst possible answer to "take me to this person".
    engine.approach(npc);
    setListOpen(false);
    setHint(false);
  }, []);

  /* ------------------------------------------------------------ Render */

  if (needsAvatar) {
    return (
      <AvatarSetup
        onDone={(chosen) => setStreetsAvatar(chosen)}
        onSkip={() => setStreetsAvatar(DEFAULT_AVATAR)}
      />
    );
  }

  /*
   * One tree, both orientations.
   *
   * The three children below are always the same three elements in the same
   * order, and only their classes change. That is not tidiness, it is the
   * whole fix: the previous version rendered a different JSX tree per
   * orientation, React reconciles children by position, and rotating the phone
   * therefore unmounted the canvas and mounted a fresh one. The engine kept
   * its reference to the old, detached node and went on drawing into nothing.
   *
   * A rotation is not a navigation event and must never cost the player their
   * position, the camera, or the frame.
   *
   * Stacking is stated explicitly rather than left to document order, because
   * in overlay mode the world comes after the top bar in the DOM.
   */
  const topBar = (
    <div
      className={cn(
        "z-20 flex items-center gap-2 px-3",
        landscape
          ? "pointer-events-none absolute inset-x-0 top-0 pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))]"
          : "relative pt-[max(0.6rem,env(safe-area-inset-top))] pb-2",
      )}
    >
      {/*
        On a short landscape screen the exit and the XP share one pill.

        The rule for compact is **remove duplicate chrome before shrinking the
        world**: two pills side by side spend two backgrounds, two blurs and
        two sets of padding to show two small things. One pill shows the same
        two things and gives the difference back to the district.
      */}
      <div
        className={cn(
          "flex items-center",
          compact
            ? "gap-1 rounded-full bg-black/45 pr-3 backdrop-blur"
            : "gap-2",
          landscape && "pointer-events-auto",
        )}
      >
        <Link
          href="/"
          aria-label="Leave Streets"
          className={cn(
            "sq-pressable grid size-11 place-items-center rounded-full text-chalk",
            compact ? "" : "bg-black/45 backdrop-blur",
          )}
        >
          <X aria-hidden className="size-5" />
        </Link>

        <p
          className={cn(
            "shrink-0 font-bold whitespace-nowrap text-volt-300 tabular-nums",
            compact
              ? "text-sm"
              : "rounded-full bg-black/45 px-3 py-1.5 text-sm backdrop-blur",
          )}
        >
          {bridge.xp} XP
        </p>
      </div>

      <div className="flex-1" />

      {/*
        Sound, reachable without leaving the world.

        An icon rather than a labelled control, and it is the one place in this
        bar where that is defensible: a speaker with a line through it is as
        unambiguous as any word, the accessible name carries the state for
        anybody who cannot see it, and the alternative is a third labelled pill
        on a 390px bar that already carries three things.
      */}
      <button
        type="button"
        onClick={() => setSoundOpen(true)}
        aria-label={
          audio.prefs.enabled === true ? "Sound settings. Sound is on." : "Sound settings. Sound is off."
        }
        className={cn(
          "sq-pressable grid size-11 shrink-0 place-items-center rounded-full text-chalk",
          compact ? "bg-black/45 backdrop-blur" : "bg-black/45 backdrop-blur",
          landscape && "pointer-events-auto",
        )}
      >
        {audio.prefs.enabled === true ? (
          <Volume2 aria-hidden className="size-5" />
        ) : (
          <VolumeX aria-hidden className="size-5 text-mist" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setListOpen(true)}
        /*
         * Compact hides the word but must not change what the button is
         * called. An aria-label overrides the text content entirely, so
         * spelling it differently here would silently rename the control for
         * screen readers and for every test that addresses it by name.
         */
        aria-label={compact ? "Quests" : undefined}
        className={cn(
          "sq-pressable flex min-h-11 items-center gap-2 rounded-full bg-black/45 text-sm font-bold text-chalk backdrop-blur",
          compact ? "w-11 justify-center px-0" : "px-3.5",
          landscape && "pointer-events-auto",
        )}
      >
        <List aria-hidden className="size-4" />
        {compact ? null : "Quests"}
      </button>
    </div>
  );

  return (
    <div
      ref={rootRef}
      /*
       * The height is CSS, not JavaScript.
       *
       * `fixed inset-0` alone sizes to the layout viewport, which on iOS is
       * taller than the visible area, so anything anchored to the bottom hides
       * under the browser chrome. `100dvh` is the dynamic viewport: it already
       * excludes that chrome, the browser keeps it correct, and unlike a value
       * read from an event it cannot be left stale by a rotation.
       */
      className={cn("fixed inset-0 h-[100dvh] flex flex-col bg-[#1a2a1e]", landscape && "block")}
      data-testid="streets-root"
      data-orientation={landscape ? "landscape" : "portrait"}
      data-compact={compact ? "true" : "false"}
    >
      {topBar}

      <div
        data-testid="streets-world"
        className={cn(landscape ? "absolute inset-0 z-0" : "relative z-0 min-h-0 flex-1")}
      >
        <canvas
          ref={canvasRef}
          data-testid="streets-canvas"
          aria-label="District 01. Use the quest list for a version without walking."
          role="img"
          className="absolute inset-0 size-full"
        />

        {!engineReady ? (
          <p className="absolute inset-0 grid place-items-center text-sm text-chalk/70">
            Loading the block...
          </p>
        ) : null}

        {/*
          Asked once, over the world rather than in front of it, and never
          again whichever way it is answered. See `SoundPrompt`.
        */}
        {engineReady ? <SoundPrompt /> : null}

        {/*
          Where you are, in words, opposite the minimap.
          It sits over the world rather than in the top bar because on a 390px
          phone the bar already carries three controls, and "Corner kopiti..."
          is not a place name.
        */}
        {/*
          Where you are.

          On a short landscape screen this drops to plain text with a shadow
          rather than a pill. It is the lowest value persistent chrome on the
          screen: useful the moment you walk into a shop, and mostly furniture
          after that. Losing the pill keeps the information and returns the
          background.
        */}
        {engineReady && history.length === 0 ? (
          <p
            className={cn(
              "pointer-events-none absolute left-3 max-w-[52%] truncate font-semibold text-chalk",
              compact
                ? "top-12 text-xs [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]"
                : "rounded-full bg-black/45 px-3 py-1.5 text-sm backdrop-blur",
              landscape && !compact ? "top-14" : compact ? "" : "top-2",
            )}
          >
            {place?.name ?? "District 01"}
          </p>
        ) : null}

        {/*
          Where you are, and what has happened to you here.

          The place name becomes a control only once there is something behind
          it. Before that it stays the plain label it was, because a button
          that opens an empty panel teaches a player that the button is not
          worth pressing, and they are right.

          The count is the whole invitation. It is a number of things that
          happened, not a score and not a fraction of a total: there is no
          denominator here on purpose.
        */}
        {engineReady && history.length > 0 ? (
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label={`${historyPlace?.name ?? place?.name}. ${history.length} ${
              history.length === 1 ? "thing has" : "things have"
            } happened here. Open.`}
            className={cn(
              "sq-pressable absolute left-3 flex max-w-[52%] items-center gap-1.5 font-semibold text-chalk",
              compact
                ? "top-11 min-h-9 text-xs [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]"
                : "min-h-9 rounded-full bg-black/45 px-3 text-sm backdrop-blur",
              landscape && !compact ? "top-14" : compact ? "" : "top-2",
            )}
          >
            <span className="truncate">
              {historyPlace?.name ?? place?.name ?? "District 01"}
            </span>
            <span
              aria-hidden
              className="shrink-0 rounded-full bg-volt-500/20 px-1.5 text-[0.65rem] font-bold text-volt-300 tabular-nums"
            >
              {history.length}
            </span>
          </button>
        ) : null}

        {/*
          The minimap is for the district. An eighteen by fourteen room does
          not need one, and drawing it anyway would be the debug-panel look
          this deliberately avoids.
        */}
        {engineReady && placeId === DISTRICT_ID ? (
          <Minimap
            tile={tile}
            npcs={NPCS.filter((npc) => !npc.mapId).map((npc) => ({ npc, done: isNpcDone(npc) }))}
            signals={signals}
            tracked={tracked}
            className={cn(
              "absolute right-2",
              compact ? "top-12 w-20 p-0.5" : landscape ? "top-14 w-24" : "top-2 w-28",
            )}
          />
        ) : null}

        {hint && engineReady ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-chalk backdrop-blur">
            Move with the pad. Doors open.
          </p>
        ) : null}
      </div>

      <div className={cn("z-20", landscape ? "absolute inset-x-0 bottom-0" : "relative")}>
        {!busy ? (
          <TouchPad
            near={near}
            door={doorway}
            layout={landscape ? "edges" : "stacked"}
            compact={compact}
            onMove={(x, y) => {
              engineRef.current?.setInput(x, y);
              if (x !== 0 || y !== 0) setHint(false);
            }}
            prop={nearProp}
            onInteract={interact}
          />
        ) : null}
      </div>

      {talkingTo ? (
        <DialogueOverlay
          npc={talkingTo}
          done={bridge.isNpcDone(talkingTo)}
          met={metNpcs.includes(talkingTo.id)}
          bridge={bridge}
          onClose={() => setTalkingTo(null)}
          onOpenRewards={() => {
            setTalkingTo(null);
            setCounterOpen(true);
          }}
          onOpenHub={() => {
            setTalkingTo(null);
            setHubOpen(true);
          }}
          landscape={landscape}
        />
      ) : null}

      {counterOpen ? (
        <RewardsCounter onClose={() => setCounterOpen(false)} landscape={landscape} />
      ) : null}

      {/*
        Who you asked to be pointed at, in words.

        The ring on the minimap is four pixels across, so it cannot be the only
        carrier: this names the person and the place in real text, and carries
        the control that stops following them. Tracking never expires on its
        own, because a marker that disappears while somebody is walking towards
        it is worse than no marker.
      */}
      {trackedNpc && engineReady ? (
        <div
          className={cn(
            "absolute left-3 z-20 flex max-w-[62%] items-center gap-2 rounded-full border border-white/20 bg-black/60 py-1 pr-1 pl-3 backdrop-blur",
            compact ? "top-[4.5rem]" : landscape ? "top-24" : "top-12",
          )}
        >
          <span className="min-w-0 truncate text-xs font-semibold text-chalk">
            Following {trackedNpc.name}
            {trackedPlace ? `, at the ${trackedPlace.name.toLowerCase()}` : ""}
          </span>
          <button
            type="button"
            onClick={() => setStopped(true)}
            aria-label={`Stop following ${trackedNpc.name}`}
            className="sq-pressable grid size-8 shrink-0 place-items-center rounded-full text-faint hover:text-chalk"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        </div>
      ) : null}

      {/*
        A sticker, said quietly, where it happened.

        A strip rather than a sheet, because this must not interrupt: the
        player earned it by doing something else, and stopping the world to
        announce a cosmetic would make a free thing feel like a toll. It is a
        live region so it is announced without stealing focus, it dismisses
        itself, and tapping it goes to the collection.
      */}
      {newSticker ? (
        <StickerNotice sticker={newSticker} onDismiss={() => setNewSticker(null)} />
      ) : null}

      {looking ? (
        <LookSheet
          prop={looking}
          found={moments.includes(looking.discovery?.id ?? "")}
          onKeep={keepMoment}
          onClose={() => setLooking(null)}
          landscape={landscape}
        />
      ) : null}

      {historyOpen && placeLandmarkId ? (
        <HistorySheet
          placeName={historyPlace?.name ?? place?.name ?? "District 01"}
          entries={history}
          landscape={landscape}
          onClose={() => setHistoryOpen(false)}
        />
      ) : null}

      {soundOpen ? (
        <WorldSheet
          label="Sound"
          landscape={landscape}
          onClose={() => setSoundOpen(false)}
          closeLabel="Close sound settings"
        >
          <h2 className="font-display text-xl font-extrabold tracking-tight text-chalk">Sound</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Off until you ask for it, and it never carries anything the screen does not.
          </p>
          <AudioControls className="mt-4" />
          <button
            type="button"
            onClick={() => setSoundOpen(false)}
            className="sq-pressable mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
          >
            Back to the block
          </button>
        </WorldSheet>
      ) : null}

      {hubOpen ? (
        <CrewHub bridge={bridge} onClose={() => setHubOpen(false)} landscape={landscape} />
      ) : null}

      {listOpen ? (
        <QuestList
          bridge={bridge}
          landscape={landscape}
          onClose={() => setListOpen(false)}
          onWalkTo={walkTo}
          onTalkTo={(npc) => {
            setListOpen(false);
            if (npc.action.kind === "rewards") setCounterOpen(true);
            else if (npc.action.kind === "hub") setHubOpen(true);
            else openNpc(npc);
          }}
        />
      ) : null}
    </div>
  );
}

export { cn };
