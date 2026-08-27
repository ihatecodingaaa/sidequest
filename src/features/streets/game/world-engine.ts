import {
  DISTRICT_ID,
  MAPS,
  NPCS,
  SOLID,
  SPAWN,
  TERRAIN_CODES,
  TILE,
  type AvatarLook,
  type Door,
  type Npc,
  type TerrainCode,
  type WorldMap,
} from "@/features/streets/streets-data";
import type { EchoStyleId } from "@/data/echo-styles";

/**
 * The District 01 renderer.
 *
 * Written rather than taken from an engine, and the reasoning is measured in
 * `docs/STREETS_RESEARCH.md` section G: Phaser was installed, integrated and
 * proven working on this stack, and costs 1343 KB raw / 347 KB gzipped for a
 * feature set this district uses about a fifth of. The whole existing SIDEQUEST
 * app across every route is 1660 KB. On a product whose deployment story is a
 * roadshow on venue wifi, that trade did not hold.
 *
 * What this needs, and therefore all it does: draw a code-generated tile grid,
 * animate a four-direction sprite, test boxes against a static grid, follow and
 * clamp a camera, and report proximity. No physics engine, no tilemap loader,
 * no asset loader, no scene graph.
 *
 * Rendering is two-stage on purpose. Everything is drawn at world resolution
 * into a small buffer, then blitted up with smoothing disabled. That is what
 * produces a crisp low-resolution look from vector drawing commands, with no
 * sprite sheet to author, no image to download, and no licence to check. The
 * static terrain is painted once into its own canvas and thereafter copied,
 * so a frame costs one blit plus a handful of entities.
 */

/**
 * How much of the world is visible.
 *
 * Not a fixed rectangle, because the same rectangle cannot serve both
 * orientations. A portrait phone held one-handed and a landscape phone held in
 * two want opposite framings, and squeezing one into the other is how a game
 * ends up either letterboxed or stretched.
 *
 * The rule is: **pick a scale, then let the viewport decide how much world
 * fits.** The scale comes from the shorter side of the container, so a person
 * is the same physical size on screen whichever way the phone is held, and
 * turning it widens the view rather than resizing anybody.
 *
 * An earlier version held the visible *area* constant instead. That reads well
 * until the container gets very tall, at which point the height clamps, the
 * width collapses to compensate, and a portrait phone ends up looking through
 * a nine tile slot. Scale first is the version that survives both shapes.
 */

/** World units across the shorter side of the viewport. */
const UNITS_SHORT = 200;

/**
 * CSS pixels per world unit.
 *
 * The floor keeps a person readable on a small phone. The ceiling stops a
 * large desktop window from turning the district into six enormous tiles,
 * which is what a pure ratio does when the shorter side is 800 pixels.
 */
const SCALE_MIN = 1.3;
const SCALE_MAX = 2.8;

/** World units per second. Brisk enough to feel responsive, never twitchy. */
const SPEED = 74;

/**
 * How close the player must be to interact, in world units.
 *
 * Roughly two tiles, which is deliberately generous. Requiring precision to
 * start a conversation would make the interface a dexterity test, and standing
 * next to somebody and being told nobody is nearby is the exact frustration a
 * forgiving range exists to prevent.
 */
const INTERACT_RANGE = 30;

/**
 * How close the player must be to a doorway, in world units.
 *
 * Tighter than a conversation, because a door is a specific place and walking
 * past a shop should not keep offering to take you inside it.
 */
const DOOR_RANGE = 26;

/**
 * The district palette.
 *
 * Every surface has a base, a shade and a light so tiles can be given a bevel
 * rather than being flat fills. Flatness was the single biggest reason the
 * first cut read as a prototype: with no light direction, a path and a wall are
 * just two different greens and nothing looks built.
 *
 * Light comes from the top left throughout. That is the only lighting rule and
 * everything obeys it.
 */
const PALETTE = {
  /*
   * The checker is deliberately faint. A strong two-tone reads as a chessboard
   * rather than as ground, and the tuft scatter is what actually stops a park
   * from looking flat.
   */
  grass: "#4a8f52",
  grassAlt: "#4f9457",
  grassLight: "#62a869",
  grassShade: "#3c7845",

  path: "#d8cdb2",
  pathAlt: "#d0c4a7",
  pathLight: "#e6dcc4",
  pathShade: "#b3a68a",

  road: "#5f646f",
  roadLight: "#6d727d",
  stripe: "#e2e7ef",

  court: "#6f5fd0",
  courtLine: "#b9adff",
  courtShade: "#5b4cb4",

  wall: "#efe9db",
  wallShade: "#cfc6b2",
  wallDark: "#b3a894",
  roof: "#2f4a86",
  roofLight: "#3f5da3",

  /*
   * A covered walkway is in shade, so it is darker than the open path beside
   * it. The first cut made it lighter, and the main street read as one wide
   * beige band with a couple of hairlines through it.
   */
  walkway: "#c3b79b",
  walkwayShade: "#a2967a",
  post: "#8b91a0",

  /*
   * A canopy has to separate from the grass it stands on, and the grass is
   * already green. The dark ring does that work: it reads as an outline at
   * this size, which is what makes a tree look like a tree rather than a
   * slightly different green circle.
   */
  tree: "#357a44",
  treeLight: "#64ba6f",
  treeDark: "#1c4429",
  trunk: "#6b4a2c",

  bench: "#9a7448",
  benchLight: "#b48a58",
  planterRim: "#b4a184",

  shadow: "rgba(12,18,26,0.26)",
  outline: "rgba(18,26,20,0.35)",

  /* Indoors. Warmer and lower contrast, because a room is not a street. */
  floor: "#cfc3ad",
  floorAlt: "#c7bba4",
  grout: "#aea281",
  shelf: "#8a6a45",
  shelfLight: "#a88257",
  counter: "#e8dfcb",
  counterEdge: "#b9ac93",
  machine: "#aeb6c6",
  machineDark: "#7d8598",
  screen: "#2b3a5c",
  board: "#c9b98a",
  boardDark: "#9c8d66",
  mat: "#7d7260",
  indoorWall: "#3b3d49",
  indoorWallLight: "#4c4f5d",
} as const;

export interface NpcRuntime {
  npc: Npc;
  /** Done means the linked experience is finished. Changes lines and marker. */
  done: boolean;
}

export interface EngineOptions {
  look: AvatarLook;
  echo: EchoStyleId | null;
  npcs: NpcRuntime[];
  reducedMotion: boolean;
  /** Fires when the interact candidate changes, including to null. */
  onNear: (npc: Npc | null) => void;
  /**
   * Fires when a doorway comes into or goes out of range.
   *
   * Doors and people share one interact button, and whichever is closer wins.
   * Two buttons would mean a player standing between a shop door and a
   * neighbour has to work out which control they want before they can do
   * either, which is a puzzle nobody asked for.
   */
  onDoor?: (door: Door | null) => void;
  /** Fires when the player enters or leaves a building. */
  onMap?: (map: WorldMap) => void;
  /**
   * Fires when the player crosses into a new tile.
   *
   * Tile granularity rather than per frame, on purpose: the minimap and the
   * doorway prompt are the only things that need position, neither can show a
   * difference smaller than a tile, and re-rendering React sixty times a
   * second to move a two-pixel dot would be absurd.
   */
  onTile?: (tile: Vec) => void;
}

interface Vec {
  x: number;
  y: number;
}

type Facing = "up" | "down" | "left" | "right";

export class WorldEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly buffer: HTMLCanvasElement;
  private readonly bctx: CanvasRenderingContext2D;
  private terrain: HTMLCanvasElement | null = null;
  /** Painted terrain, kept per map so walking back out is instant. */
  private painted = new Map<string, HTMLCanvasElement>();

  /** Where the player currently is. Interiors are maps like any other. */
  private map: WorldMap = MAPS[DISTRICT_ID] as WorldMap;

  /** Recomputed on every resize from the container's aspect ratio. */
  private viewW = 320;
  private viewH = 232;

  private options: EngineOptions;
  private raf = 0;
  private last = 0;
  private running = false;

  private player: Vec = { x: SPAWN.x * TILE + TILE / 2, y: SPAWN.y * TILE + TILE / 2 };
  private facing: Facing = "down";
  private walkPhase = 0;
  private moving = false;
  private input: Vec = { x: 0, y: 0 };

  /** Echo trails the player through a short history of positions. */
  private trail: Vec[] = [];
  private near: Npc | null = null;
  private door: Door | null = null;
  private lastTile = "";

  constructor(canvas: HTMLCanvasElement, options: EngineOptions) {
    this.canvas = canvas;
    this.options = options;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;

    this.buffer = document.createElement("canvas");
    this.buffer.width = this.viewW;
    this.buffer.height = this.viewH;
    const bctx = this.buffer.getContext("2d");
    if (!bctx) throw new Error("2d buffer context unavailable");
    this.bctx = bctx;

    this.terrain = this.paintTerrain(this.map);
    this.resize();
  }

  /* ------------------------------------------------------------- Public */

  update(options: Partial<EngineOptions>) {
    this.options = { ...this.options, ...options };
  }

  setInput(x: number, y: number) {
    this.input.x = Math.max(-1, Math.min(1, x));
    this.input.y = Math.max(-1, Math.min(1, y));
  }

  /** The NPC currently in range, if any. */
  get target(): Npc | null {
    return this.near;
  }

  /** Player position in tiles. Used by tests and the pause panel. */
  get tile(): Vec {
    return { x: Math.floor(this.player.x / TILE), y: Math.floor(this.player.y / TILE) };
  }

  /** The doorway currently in range, if any. */
  get doorway(): Door | null {
    return this.door;
  }

  /** Which map the player is on. The HUD names it. */
  get place(): WorldMap {
    return this.map;
  }

  /**
   * Drops the player at a landmark, which is how the Quest List teleports.
   *
   * It always lands on the district, because every row in that list is a
   * street destination and arriving inside a shop the player never opened
   * would be disorienting.
   */
  moveTo(tileX: number, tileY: number) {
    if (this.map.id !== DISTRICT_ID) this.go(MAPS[DISTRICT_ID] as WorldMap);
    this.placeAt(tileX, tileY);
  }

  /**
   * Puts the player next to somebody, close enough to talk.
   *
   * The Quest List used to drop people two tiles below whoever they picked,
   * which is just outside conversation range, so arriving produced "Nobody
   * nearby". This tries the tiles around them and takes the first one that can
   * actually be stood on.
   */
  approach(npc: Npc) {
    const around = [
      [0, 1],
      [0, 2],
      [-1, 1],
      [1, 1],
      [-1, 0],
      [1, 0],
      [0, -1],
    ] as const;
    for (const [dx, dy] of around) {
      const tx = npc.x + dx;
      const ty = npc.y + dy;
      if (this.canStand(tx * TILE + TILE / 2, ty * TILE + TILE / 2)) {
        this.placeAt(tx, ty);
        return;
      }
    }
    this.placeAt(npc.x, npc.y + 1);
  }

  /** Drops the player somewhere on whichever map they are already on. */
  placeAt(tileX: number, tileY: number) {
    this.player.x = tileX * TILE + TILE / 2;
    this.player.y = tileY * TILE + TILE / 2;
    this.trail = [];
    this.lastTile = "";
    this.checkProximity();
  }

  /** Walks through a doorway. */
  enter(door: Door) {
    const next = MAPS[door.to];
    if (!next) return;
    this.go(next);
    this.facing = next.indoor ? "up" : "down";
    this.placeAt(door.at.x, door.at.y);
    this.checkDoor();
  }

  private go(next: WorldMap) {
    this.map = next;
    this.terrain = this.paintTerrain(next);
    // A room is framed closer than a street, so the camera reframes on entry.
    this.resize();
    this.options.onMap?.(next);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.step(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /**
   * Reframes the camera for the container's current shape.
   *
   * Called on resize and on orientation change. The world itself never
   * changes: the same district, the same scale of person, a different window
   * onto it.
   */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));

    const w = rect.width || 320;
    const h = rect.height || 232;
    const base = clamp(Math.min(w, h) / UNITS_SHORT, SCALE_MIN, SCALE_MAX);
    /*
     * Zoom in far enough that the map covers the screen, within reason.
     *
     * A room is much smaller than the district, and drawn at street scale it
     * left a third of a portrait phone as empty surround. Rooms are simply
     * seen closer, which is what a cut to an interior looks like anyway.
     *
     * The ceiling matters as much as the rule. Covering both axes exactly
     * would zoom a landscape phone until a person filled a fifth of the
     * screen, so the zoom stops at half again the street scale and whatever is
     * left over becomes an even dark frame. A frame reads as deliberate. Two
     * thirds of the screen as background does not.
     */
    const cover = Math.max(w / (this.map.w * TILE), h / (this.map.h * TILE));
    const scale = clamp(cover, base, base * 1.5);

    this.viewW = Math.min(Math.max(64, Math.round(w / scale)), this.map.w * TILE);
    this.viewH = Math.min(Math.max(64, Math.round(h / scale)), this.map.h * TILE);

    this.buffer.width = this.viewW;
    this.buffer.height = this.viewH;
    // Buffer canvases reset their context state when resized.
    this.bctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.draw();
  }

  /* ---------------------------------------------------------- Simulation */

  private step(dt: number) {
    const { x, y } = this.input;
    const len = Math.hypot(x, y) || 1;
    const dx = (x / len) * SPEED * dt;
    const dy = (y / len) * SPEED * dt;

    this.moving = x !== 0 || y !== 0;
    if (this.moving) {
      /*
       * Axes are resolved separately so that brushing a wall slides along it
       * instead of stopping dead. Getting stuck on a corner is the single most
       * common way a walking interface feels hostile, and this world is for
       * exploring, not for testing anybody's dexterity.
       */
      if (x !== 0) this.tryMove(dx, 0);
      if (y !== 0) this.tryMove(0, dy);

      if (Math.abs(x) > Math.abs(y)) this.facing = x > 0 ? "right" : "left";
      else this.facing = y > 0 ? "down" : "up";

      this.walkPhase += dt * 8;

      this.trail.push({ x: this.player.x, y: this.player.y });
      if (this.trail.length > 26) this.trail.shift();
    }

    this.checkProximity();
  }

  /** Player collision box, deliberately narrower than the sprite. */
  private canStand(px: number, py: number): boolean {
    const halfW = 4;
    const top = 2;
    const bottom = 7;
    const corners: Vec[] = [
      { x: px - halfW, y: py + top },
      { x: px + halfW, y: py + top },
      { x: px - halfW, y: py + bottom },
      { x: px + halfW, y: py + bottom },
    ];
    for (const c of corners) {
      const tx = Math.floor(c.x / TILE);
      const ty = Math.floor(c.y / TILE);
      if (tx < 0 || ty < 0 || tx >= this.map.w || ty >= this.map.h) return false;
      if (SOLID.has(this.at(tx, ty))) return false;
    }
    return true;
  }

  private tryMove(dx: number, dy: number) {
    const nx = this.player.x + dx;
    const ny = this.player.y + dy;
    if (this.canStand(nx, ny)) {
      this.player.x = nx;
      this.player.y = ny;
    }
  }

  private at(tx: number, ty: number): TerrainCode {
    const row = this.map.rows[ty];
    if (!row) return "#";
    const ch = row[tx];
    // Landmark door letters (M, V, F, S, B) sit inside walls and are solid.
    if (!ch || !TERRAIN_CODES.has(ch)) return "#";
    return ch as TerrainCode;
  }

  /** Everybody standing on the map the player is currently on. */
  private get here(): NpcRuntime[] {
    return this.options.npcs.filter(
      (entry) => (entry.npc.mapId ?? DISTRICT_ID) === this.map.id,
    );
  }

  private checkProximity() {
    let best: Npc | null = null;
    let bestDist = INTERACT_RANGE;
    for (const entry of this.here) {
      const nx = entry.npc.x * TILE + TILE / 2;
      const ny = entry.npc.y * TILE + TILE / 2;
      const d = Math.hypot(nx - this.player.x, ny - this.player.y);
      if (d < bestDist) {
        bestDist = d;
        best = entry.npc;
      }
    }
    /*
     * A doorway in range suppresses a person slightly further away, so
     * standing on a shop's doormat offers the shop. Standing next to somebody
     * offers the person. One button, and the nearer thing wins.
     */
    this.checkDoor();
    if (this.door && best) {
      const dx = this.door.x * TILE + TILE / 2 - this.player.x;
      const dy = this.door.y * TILE + TILE / 2 - this.player.y;
      if (Math.hypot(dx, dy) < bestDist) best = null;
    }
    if (best?.id !== this.near?.id) {
      this.near = best;
      this.options.onNear(best);
    }
  }

  private checkDoor() {
    let best: Door | null = null;
    let bestDist = DOOR_RANGE;
    for (const door of this.map.doors) {
      const dx = door.x * TILE + TILE / 2 - this.player.x;
      const dy = door.y * TILE + TILE / 2 - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        best = door;
      }
    }
    if (best?.id !== this.door?.id || best?.to !== this.door?.to) {
      this.door = best;
      this.options.onDoor?.(best);
    }
  }

  /* ------------------------------------------------------------ Terrain */

  /**
   * Paints one map into its own canvas, once.
   *
   * Kept per map so stepping out of a shop is instant rather than a repaint,
   * and so a frame costs one camera-cropped blit plus a handful of entities no
   * matter which map is showing.
   */
  private paintTerrain(map: WorldMap): HTMLCanvasElement {
    const cached = this.painted.get(map.id);
    if (cached) return cached;

    const c = document.createElement("canvas");
    c.width = map.w * TILE;
    c.height = map.h * TILE;
    const g = c.getContext("2d");
    if (!g) return c;

    /** Reads this map specifically, which is not always the one underfoot. */
    const at = (tx: number, ty: number): TerrainCode => {
      const row = map.rows[ty];
      if (!row) return "#";
      const ch = row[tx];
      if (!ch || !TERRAIN_CODES.has(ch)) return "#";
      return ch as TerrainCode;
    };


    /*
     * Terrain, with a light direction.
     *
     * Every surface gets a highlight where it meets something else on its top
     * or left edge and a shade on its bottom or right, so a path sits *in* the
     * grass instead of beside it. The first cut filled flat rectangles, which
     * is why the district read as a diagram: with no light there is no depth,
     * and with no depth nothing looks built.
     *
     * Light is from the top left everywhere. That is the whole lighting model.
     */
    /*
     * Bevels are drawn between *surfaces*, not between tile codes.
     *
     * A tree and a bench stand on grass, so they belong to the grass surface.
     * Comparing raw codes outlined every one of them with a light rectangle,
     * which made a park bench look like it was sitting in a box.
     */
    const bevel = (
      tx: number,
      ty: number,
      light: string,
      shade: string,
    ) => {
      const x = tx * TILE;
      const y = ty * TILE;
      const self = surface(at(tx, ty));
      if (surface(at(tx, ty - 1)) !== self) {
        g.fillStyle = light;
        g.fillRect(x, y, TILE, 2);
      }
      if (surface(at(tx - 1, ty)) !== self) {
        g.fillStyle = light;
        g.fillRect(x, y, 2, TILE);
      }
      if (surface(at(tx, ty + 1)) !== self) {
        g.fillStyle = shade;
        g.fillRect(x, y + TILE - 2, TILE, 2);
      }
      if (surface(at(tx + 1, ty)) !== self) {
        g.fillStyle = shade;
        g.fillRect(x + TILE - 2, y, 2, TILE);
      }
    };

    /** The room's own accent, which is the sign colour it has from outside. */
    const tint = map.tint ?? PALETTE.roofLight;

    for (let ty = 0; ty < map.h; ty += 1) {
      for (let tx = 0; tx < map.w; tx += 1) {
        const code = at(tx, ty);
        const x = tx * TILE;
        const y = ty * TILE;
        // A cheap deterministic checker keeps large areas from reading flat.
        const alt = (tx + ty) % 2 === 0;
        /*
         * One stable hash per tile drives every scatter below, so the district
         * looks identical on every load and never shimmers between renders.
         */
        const h = Math.abs((tx * 73856093) ^ (ty * 19349663));

        switch (code) {
          case ",": {
            g.fillStyle = alt ? PALETTE.grass : PALETTE.grassAlt;
            g.fillRect(x, y, TILE, TILE);
            bevel(tx, ty, PALETTE.grassLight, PALETTE.grassShade);
            if (h % 4 === 0) {
              // Tufts. Flat green over a whole park reads as unbuilt space.
              g.fillStyle = PALETTE.grassLight;
              g.fillRect(x + (h % 9) + 3, y + ((h >> 3) % 9) + 4, 2, 1);
              g.fillRect(x + (h % 9) + 4, y + ((h >> 3) % 9) + 3, 1, 2);
            }
            if (h % 37 === 0) {
              // The occasional flower. Rare, or it reads as litter rather than planting.
              g.fillStyle = (h >> 2) % 2 === 0 ? "#e6c667" : "#d891ac";
              g.fillRect(x + ((h >> 5) % 10) + 3, y + ((h >> 7) % 10) + 3, 2, 2);
            }
            break;
          }
          case ".":
            g.fillStyle = alt ? PALETTE.path : PALETTE.pathAlt;
            g.fillRect(x, y, TILE, TILE);
            bevel(tx, ty, PALETTE.pathLight, PALETTE.pathShade);
            if (h % 5 === 0) {
              // Aggregate speckle. Pavement without grain looks like paper.
              g.fillStyle = PALETTE.pathShade;
              g.fillRect(x + (h % 10) + 3, y + ((h >> 4) % 10) + 3, 2, 1);
            }
            break;
          case "=": {
            g.fillStyle = PALETTE.walkway;
            g.fillRect(x, y, TILE, TILE);
            // Paving joints, so a covered walkway reads as laid rather than poured.
            g.fillStyle = PALETTE.walkwayShade;
            g.fillRect(x, y + TILE - 1, TILE, 1);
            g.fillRect(x + TILE - 1, y, 1, TILE);
            /*
             * Posts on the sides and a beam only at the ends of a run. Drawing
             * a beam on every tile turned a covered walkway into a ladder.
             */
            const above = at(tx, ty - 1) === "=";
            const below = at(tx, ty + 1) === "=";
            const leftOpen = at(tx - 1, ty) !== "=";
            const rightOpen = at(tx + 1, ty) !== "=";
            g.fillStyle = PALETTE.post;
            if (leftOpen) g.fillRect(x, y, 2, TILE);
            if (rightOpen) g.fillRect(x + TILE - 2, y, 2, TILE);
            if (!above) g.fillRect(x, y, TILE, 3);
            if (!below) g.fillRect(x, y + TILE - 3, TILE, 3);
            // Columns every other tile, which is what gives the run a rhythm.
            if (ty % 3 === 0) {
              g.fillStyle = PALETTE.walkwayShade;
              if (leftOpen) g.fillRect(x, y + 4, 3, 8);
              if (rightOpen) g.fillRect(x + TILE - 3, y + 4, 3, 8);
            }
            break;
          }
          case "c":
            g.fillStyle = PALETTE.court;
            g.fillRect(x, y, TILE, TILE);
            bevel(tx, ty, PALETTE.courtLine, PALETTE.courtShade);
            g.strokeStyle = "rgba(185,173,255,0.4)";
            g.lineWidth = 1;
            g.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
            break;
          case "r":
            g.fillStyle = PALETTE.road;
            g.fillRect(x, y, TILE, TILE);
            // A kerb highlight only where the road meets something that is not road.
            if (at(tx, ty - 1) !== "r" && at(tx, ty - 1) !== "z") {
              g.fillStyle = PALETTE.roadLight;
              g.fillRect(x, y, TILE, 2);
            }
            if (at(tx, ty + 1) !== "r" && at(tx, ty + 1) !== "z") {
              g.fillStyle = PALETTE.roadLight;
              g.fillRect(x, y + TILE - 2, TILE, 2);
            }
            break;
          case "z":
            g.fillStyle = PALETTE.road;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.stripe;
            g.fillRect(x + 3, y, 4, TILE);
            g.fillRect(x + 10, y, 4, TILE);
            break;
          case "#":
            /*
             * Outdoors these are the parts of a block that no facade covers,
             * painted flat here with the building pass drawing over them.
             * Indoors they are the room's own walls.
             */
            if (map.indoor) {
              g.fillStyle = PALETTE.indoorWall;
              g.fillRect(x, y, TILE, TILE);
              /*
               * A skirting on every wall face that meets the floor, so the
               * room has a visible edge on all four sides rather than one
               * blue line along the back wall.
               */
              const lit = PALETTE.indoorWallLight;
              if (surface(at(tx, ty + 1)) === "floor") {
                g.fillStyle = lit;
                g.fillRect(x, y + TILE - 4, TILE, 4);
                g.fillStyle = tint;
                g.fillRect(x, y + TILE - 2, TILE, 2);
              }
              if (surface(at(tx, ty - 1)) === "floor") {
                g.fillStyle = lit;
                g.fillRect(x, y, TILE, 3);
              }
              if (surface(at(tx - 1, ty)) === "floor") {
                g.fillStyle = lit;
                g.fillRect(x, y, 3, TILE);
              }
              if (surface(at(tx + 1, ty)) === "floor") {
                g.fillStyle = lit;
                g.fillRect(x + TILE - 3, y, 3, TILE);
              }
              break;
            }
            g.fillStyle = PALETTE.wall;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.wallShade;
            g.fillRect(x, y + TILE - 3, TILE, 3);
            break;
          case "T":
            g.fillStyle = alt ? PALETTE.grass : PALETTE.grassAlt;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.shadow;
            g.beginPath();
            g.ellipse(x + 8, y + 13, 6, 2.4, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = PALETTE.trunk;
            g.fillRect(x + 6.6, y + 8, 3, 5.4);
            // Canopy in three tones. One flat circle reads as a green dot.
            g.fillStyle = PALETTE.treeDark;
            g.beginPath();
            g.arc(x + 8.6, y + 6.6, 6.8, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = PALETTE.tree;
            g.beginPath();
            g.arc(x + 8, y + 6, 6.2, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = PALETTE.treeLight;
            g.beginPath();
            g.arc(x + 6, y + 4.2, 3.2, 0, Math.PI * 2);
            g.fill();
            break;
          case "b":
            g.fillStyle = alt ? PALETTE.grass : PALETTE.grassAlt;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.shadow;
            g.fillRect(x + 1, y + 12, TILE - 2, 2);
            g.fillStyle = PALETTE.bench;
            g.fillRect(x + 1, y + 3, TILE - 2, 2.5);
            g.fillRect(x + 1, y + 7, TILE - 2, 3.5);
            g.fillStyle = PALETTE.benchLight;
            g.fillRect(x + 1, y + 3, TILE - 2, 1);
            g.fillRect(x + 1, y + 7, TILE - 2, 1);
            g.fillStyle = PALETTE.trunk;
            g.fillRect(x + 2, y + 10, 2, 2.5);
            g.fillRect(x + TILE - 4, y + 10, 2, 2.5);
            break;
          case "t":
            g.fillStyle = map.indoor ? PALETTE.floor : PALETTE.walkway;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = map.indoor ? PALETTE.grout : PALETTE.walkwayShade;
            g.fillRect(x, y + TILE - 1, TILE, 1);
            g.fillStyle = PALETTE.shadow;
            g.beginPath();
            g.ellipse(x + 8, y + 10, 5.6, 2.2, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = PALETTE.bench;
            g.beginPath();
            g.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = PALETTE.benchLight;
            g.beginPath();
            g.arc(x + 6.8, y + 6.8, 2.4, 0, Math.PI * 2);
            g.fill();
            break;
          case "~":
            if (map.indoor) {
              g.fillStyle = PALETTE.floor;
              g.fillRect(x, y, TILE, TILE);
            }
            g.fillStyle = PALETTE.planterRim;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = "rgba(255,255,255,0.28)";
            g.fillRect(x, y, TILE, 2);
            g.fillStyle = PALETTE.wallDark;
            g.fillRect(x, y + TILE - 2, TILE, 2);
            g.fillStyle = PALETTE.treeDark;
            g.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
            g.fillStyle = PALETTE.tree;
            g.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
            g.fillStyle = PALETTE.treeLight;
            g.fillRect(x + 4, y + 4, 3, 3);
            g.fillRect(x + 9, y + 8, 3, 3);
            break;
          /* ------------------------------------------------- Indoors */
          case "f": {
            g.fillStyle = alt ? PALETTE.floor : PALETTE.floorAlt;
            g.fillRect(x, y, TILE, TILE);
            // Grout on two sides only, which is what makes a floor read as tiles.
            g.fillStyle = PALETTE.grout;
            g.fillRect(x, y + TILE - 1, TILE, 1);
            g.fillRect(x + TILE - 1, y, 1, TILE);
            break;
          }
          case "s":
            // Shelving, seen from above and slightly in front.
            g.fillStyle = PALETTE.floor;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.shadow;
            g.fillRect(x + 1, y + TILE - 3, TILE - 2, 3);
            g.fillStyle = PALETTE.shelf;
            g.fillRect(x + 1, y + 1, TILE - 2, TILE - 3);
            g.fillStyle = PALETTE.shelfLight;
            g.fillRect(x + 1, y + 1, TILE - 2, 2);
            // Stock, in the room's own colour so each shop looks different.
            g.fillStyle = tint;
            for (let i = 0; i < 3; i += 1) {
              if ((h >> i) % 3 === 0) continue;
              g.fillRect(x + 2 + i * 4, y + 5, 3, 4);
            }
            break;
          case "k":
            g.fillStyle = PALETTE.floor;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.shadow;
            g.fillRect(x + 1, y + TILE - 3, TILE - 2, 3);
            g.fillStyle = PALETTE.counter;
            g.fillRect(x, y + 2, TILE, TILE - 5);
            g.fillStyle = "rgba(255,255,255,0.5)";
            g.fillRect(x, y + 2, TILE, 1.5);
            g.fillStyle = PALETTE.counterEdge;
            g.fillRect(x, y + TILE - 4, TILE, 1.5);
            g.fillStyle = tint;
            g.fillRect(x, y + TILE - 3, TILE, 1);
            break;
          case "m":
            g.fillStyle = PALETTE.floor;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.shadow;
            g.fillRect(x + 1, y + TILE - 3, TILE - 2, 3);
            g.fillStyle = PALETTE.machineDark;
            g.fillRect(x + 1, y + 1, TILE - 2, TILE - 3);
            g.fillStyle = PALETTE.machine;
            g.fillRect(x + 1, y + 1, TILE - 3, TILE - 4);
            g.fillStyle = PALETTE.screen;
            g.fillRect(x + 3, y + 3, TILE - 7, TILE - 9);
            g.fillStyle = "rgba(146,208,255,0.6)";
            g.fillRect(x + 3, y + 3, TILE - 7, 1.5);
            break;
          case "n":
            g.fillStyle = PALETTE.floor;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.boardDark;
            g.fillRect(x, y + 1, TILE, TILE - 3);
            g.fillStyle = PALETTE.board;
            g.fillRect(x + 1, y + 2, TILE - 2, TILE - 5);
            // Paper. Enough shapes to read as pinned notices, no fake text.
            g.fillStyle = "#f6f2e6";
            g.fillRect(x + 2, y + 3, 4, 5);
            g.fillRect(x + 8, y + 4, 5, 4);
            g.fillStyle = tint;
            g.fillRect(x + 2, y + 9, 6, 2);
            break;
          case "d":
            /*
             * The way out, drawn as a mat rather than labelled. A door you can
             * see from anywhere in a small room does not need a sign in it.
             */
            g.fillStyle = alt ? PALETTE.floor : PALETTE.floorAlt;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.mat;
            g.fillRect(x, y + 3, TILE, TILE - 5);
            g.fillStyle = "rgba(255,255,255,0.18)";
            g.fillRect(x, y + 3, TILE, 1.5);
            g.fillStyle = tint;
            g.fillRect(x, y + TILE - 3, TILE, 1.5);
            break;
          default:
            g.fillStyle = PALETTE.grass;
            g.fillRect(x, y, TILE, TILE);
        }
      }
    }

    /*
     * Buildings, drawn from their real wall footprint.
     *
     * The first version inferred the rect from the landmark's door position and
     * put a roof in the middle of the basketball court, which is what happens
     * when geometry is guessed instead of stated.
     *
     * A block is now a facade rather than a rectangle: roof, fascia, sign band,
     * window rows with a few lit units, an awning over the door, and a soft
     * ground shadow. The point is that a player can tell two blocks apart from
     * across the district without reading either sign.
     */
    for (const landmark of map.landmarks) {
      if (!landmark.building) continue;
      const { x: bx, y: by, w: bw, h: bh } = landmark.building;
      const x = bx * TILE;
      const y = by * TILE;
      const w = bw * TILE;
      const h = bh * TILE;
      const accent = landmark.sign ?? PALETTE.roofLight;

      // Facade, lit on the left and shaded on the right.
      g.fillStyle = PALETTE.wall;
      g.fillRect(x, y, w, h);
      g.fillStyle = "rgba(255,255,255,0.35)";
      g.fillRect(x, y, 2, h);
      g.fillStyle = PALETTE.wallShade;
      g.fillRect(x + w - 3, y, 3, h);
      g.fillStyle = PALETTE.wallDark;
      g.fillRect(x, y + h - 3, w, 3);

      // Roof, with its own lit top edge, then the accent fascia beneath it.
      g.fillStyle = PALETTE.roof;
      g.fillRect(x, y, w, TILE);
      g.fillStyle = PALETTE.roofLight;
      g.fillRect(x, y, w, 3);
      g.fillStyle = accent;
      g.fillRect(x, y + TILE - 4, w, 4);

      /*
       * Window rows. A handful are lit, chosen by a stable hash so the same
       * units are on every time: a block where every window is identical looks
       * empty, and a block where they flicker looks broken.
       */
      for (let row = 1; row < bh - 1; row += 1) {
        for (let col = 0; col < bw; col += 1) {
          const wx = x + col * TILE + 4;
          const wy = y + row * TILE + 5;
          const lit = Math.abs(((bx + col) * 92837111) ^ ((by + row) * 689287499)) % 7 === 0;
          g.fillStyle = lit ? "rgba(246,206,122,0.85)" : "rgba(52,72,120,0.75)";
          g.fillRect(wx, wy, TILE - 8, TILE - 9);
          // Glass catches the light at the top left, like everything else here.
          g.fillStyle = lit ? "rgba(255,240,200,0.55)" : "rgba(140,168,220,0.35)";
          g.fillRect(wx, wy, TILE - 8, 1.5);
        }
      }

      /*
       * Shopfront. The doorway is centred on the landmark's own door tile, with
       * an awning above it in the block's colour, which is what makes a door
       * findable from a distance without a label.
       */
      const doorX = landmark.x * TILE;
      const doorY = y + h - TILE;
      g.fillStyle = accent;
      g.fillRect(doorX - 6, doorY - 5, TILE + 12, 5);
      g.fillStyle = "rgba(0,0,0,0.18)";
      g.fillRect(doorX - 6, doorY - 1, TILE + 12, 1);
      g.fillStyle = "#2a2f3d";
      g.fillRect(doorX - 2, doorY, TILE + 4, TILE);
      g.fillStyle = "rgba(255,255,255,0.14)";
      g.fillRect(doorX - 2, doorY, TILE + 4, 2);
      g.fillStyle = accent;
      g.fillRect(doorX + 5, doorY + 7, 2, 2);

      // Ground shadow, so the block sits on the map rather than floating.
      g.fillStyle = "rgba(10,14,22,0.22)";
      g.fillRect(x, y + h, w, 3);
      g.fillStyle = "rgba(10,14,22,0.12)";
      g.fillRect(x, y + h + 3, w, 2);
    }

    this.painted.set(map.id, c);
    return c;
  }

  /* ------------------------------------------------------------ Drawing */

  private draw() {
    /*
     * The player's tile, published on the canvas element.
     *
     * A canvas has no semantics, so a test cannot ask it where anybody is. This
     * is the disciplined alternative to asserting pixels: one attribute, only
     * written when the value actually changes, and useful for debugging a world
     * that otherwise offers nothing to inspect.
     */
    const tile = `${Math.floor(this.player.x / TILE)},${Math.floor(this.player.y / TILE)}`;
    if (tile !== this.lastTile) {
      this.lastTile = tile;
      this.canvas.dataset.playerTile = tile;
      this.options.onTile?.(this.tile);
    }

    const g = this.bctx;
    g.imageSmoothingEnabled = false;
    /*
     * The surround. A small room is smaller than the viewport, so something has
     * to sit behind it: outdoors that is more ground, indoors it is a flat dark
     * colour, which makes the room read as lit and the outside as not.
     */
    g.fillStyle = this.map.surround;
    g.fillRect(0, 0, this.viewW, this.viewH);

    // Camera follows the player and clamps at the map edges.
    const worldW = this.map.w * TILE;
    const worldH = this.map.h * TILE;
    const camX = frame(this.player.x - this.viewW / 2, this.viewW, worldW);
    const camY = frame(this.player.y - this.viewH / 2, this.viewH, worldH);

    if (this.terrain) {
      g.drawImage(
        this.terrain,
        camX,
        camY,
        this.viewW,
        this.viewH,
        0,
        0,
        this.viewW,
        this.viewH,
      );
    }

    // Entities are drawn back to front so nearer things overlap further ones.
    const drawables = [
      ...this.here.map((entry) => ({
        y: entry.npc.y * TILE + TILE,
        paint: () => this.drawNpc(g, entry, camX, camY),
      })),
      { y: this.player.y, paint: () => this.drawEcho(g, camX, camY) },
      { y: this.player.y + 1, paint: () => this.drawPlayer(g, camX, camY) },
    ].sort((a, b) => a.y - b.y);

    for (const item of drawables) item.paint();

    // Blit up with smoothing off. This is what makes it read as pixel art.
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(
      this.buffer,
      0,
      0,
      this.viewW,
      this.viewH,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
  }

  private drawNpc(g: CanvasRenderingContext2D, entry: NpcRuntime, camX: number, camY: number) {
    const x = Math.round(entry.npc.x * TILE + TILE / 2 - camX);
    const y = Math.round(entry.npc.y * TILE + TILE / 2 - camY);
    if (x < -20 || y < -24 || x > this.viewW + 20 || y > this.viewH + 24) return;

    const figure = entry.npc.figure ?? "person";
    if (figure === "machine") this.drawMachine(g, x, y, entry.npc.tint);
    else if (figure === "board") this.drawBoard(g, x, y, entry.npc.tint);
    else {
      this.drawPerson(
        g,
        x,
        y,
        {
          skin: "#e7bd94",
          hair: "#241a12",
          hairStyle: "short",
          top: entry.npc.tint,
        },
        "down",
        0,
      );
    }

    /*
     * The quest marker. A SIDEQUEST spark, not an exclamation mark: it means
     * "there is something here", never "this person is suspicious". Nothing in
     * this district may encode appearance as risk.
     *
     * Only things that can be finished get one. Safe, the rewards counter and
     * the noticeboards have no done state, so a marker over them would never
     * go out, and a permanent alert is the definition of alarm fatigue.
     */
    if (!entry.done && MARKED.has(entry.npc.action.kind)) {
      const bob = this.options.reducedMotion ? 0 : Math.sin(this.walkPhase * 0.6) * 1.2;
      const my = y - 16 + bob;
      g.fillStyle = "#f5b93f";
      g.beginPath();
      g.moveTo(x, my - 4);
      g.lineTo(x + 2.6, my);
      g.lineTo(x, my + 4);
      g.lineTo(x - 2.6, my);
      g.closePath();
      g.fill();
    }
  }

  /**
   * A machine, drawn as a machine.
   *
   * Nothing in this world may imply that an object has intentions, so a self
   * checkout is a box with a screen. Giving it a face would be the shortest
   * possible route to teaching that appearance predicts behaviour, and the
   * whole district is built the other way round.
   */
  private drawMachine(g: CanvasRenderingContext2D, x: number, y: number, tint: string) {
    g.fillStyle = PALETTE.shadow;
    g.beginPath();
    g.ellipse(x, y + 8, 6, 2.4, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = PALETTE.machineDark;
    g.fillRect(x - 6, y - 10, 12, 18);
    g.fillStyle = PALETTE.machine;
    g.fillRect(x - 6, y - 10, 10, 17);
    g.fillStyle = PALETTE.screen;
    g.fillRect(x - 4, y - 8, 8, 7);
    g.fillStyle = tint;
    g.fillRect(x - 4, y - 8, 8, 1.5);
    g.fillStyle = "rgba(146,208,255,0.5)";
    g.fillRect(x - 3, y - 5, 5, 1);
    g.fillStyle = PALETTE.machineDark;
    g.fillRect(x - 5, y + 1, 10, 2);
  }

  /** A noticeboard on two legs. Paper shapes, never fake text. */
  private drawBoard(g: CanvasRenderingContext2D, x: number, y: number, tint: string) {
    g.fillStyle = PALETTE.shadow;
    g.beginPath();
    g.ellipse(x, y + 8, 6, 2.2, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = PALETTE.trunk;
    g.fillRect(x - 5, y + 1, 2, 7);
    g.fillRect(x + 3, y + 1, 2, 7);
    g.fillStyle = PALETTE.boardDark;
    g.fillRect(x - 8, y - 11, 16, 13);
    g.fillStyle = PALETTE.board;
    g.fillRect(x - 7, y - 10, 14, 11);
    g.fillStyle = "#f6f2e6";
    g.fillRect(x - 5.5, y - 8.5, 5, 6);
    g.fillRect(x + 1, y - 7.5, 5, 4);
    g.fillStyle = tint;
    g.fillRect(x + 1, y - 2.5, 5, 2);
  }

  private drawEcho(g: CanvasRenderingContext2D, camX: number, camY: number) {
    if (!this.options.echo) return;
    // Trails the player by a fixed history depth, so it never blocks the path.
    const spot = this.trail[0] ?? this.player;
    const x = Math.round(spot.x - camX - 9);
    const y = Math.round(spot.y - camY - 2);

    const tint = ECHO_TINT[this.options.echo];
    g.fillStyle = PALETTE.shadow;
    g.beginPath();
    g.ellipse(x, y + 7, 5, 2, 0, 0, Math.PI * 2);
    g.fill();

    const bob = this.options.reducedMotion ? 0 : Math.sin(this.walkPhase * 0.9) * 0.8;
    const by = y + bob;

    // Shield body, matching the mascot silhouette at this resolution.
    g.fillStyle = tint;
    g.beginPath();
    g.moveTo(x, by - 7);
    g.lineTo(x + 5, by - 4.6);
    g.lineTo(x + 5, by + 1);
    g.quadraticCurveTo(x + 5, by + 6, x, by + 7.5);
    g.quadraticCurveTo(x - 5, by + 6, x - 5, by + 1);
    g.lineTo(x - 5, by - 4.6);
    g.closePath();
    g.fill();

    // Visor and eyes.
    g.fillStyle = "#10131a";
    g.fillRect(x - 3.2, by - 2.4, 6.4, 5);
    g.fillStyle = "#f3f5fb";
    g.fillRect(x - 2, by - 1.2, 1.2, 2);
    g.fillRect(x + 0.8, by - 1.2, 1.2, 2);
  }

  private drawPlayer(g: CanvasRenderingContext2D, camX: number, camY: number) {
    const x = Math.round(this.player.x - camX);
    const y = Math.round(this.player.y - camY);
    const frame = this.moving ? Math.floor(this.walkPhase) % 4 : 0;
    this.drawPerson(g, x, y, this.options.look, this.facing, frame);
  }

  /**
   * One person, drawn from parts.
   *
   * Layered at draw time rather than pre-rendered, which is what keeps avatar
   * customisation from exploding into a sprite sheet per combination: four
   * directions times five skins times five hair colours times four styles times
   * six tops would be 2400 frames to author and ship.
   */
  private drawPerson(
    g: CanvasRenderingContext2D,
    x: number,
    y: number,
    look: AvatarLook,
    facing: Facing,
    frame: number,
  ) {
    const bob = frame === 1 ? -1 : frame === 3 ? 0 : 0;
    const legSwing = frame === 1 ? 1 : frame === 3 ? -1 : 0;

    g.fillStyle = PALETTE.shadow;
    g.beginPath();
    g.ellipse(x, y + 8, 5, 2, 0, 0, Math.PI * 2);
    g.fill();

    // Legs
    g.fillStyle = "#2b3550";
    g.fillRect(x - 3, y + 2 + bob, 2.4, 6 + legSwing);
    g.fillRect(x + 0.6, y + 2 + bob, 2.4, 6 - legSwing);

    // Torso
    g.fillStyle = look.top;
    g.fillRect(x - 4, y - 4 + bob, 8, 7);

    // Arms
    g.fillStyle = look.skin;
    g.fillRect(x - 5.4, y - 3 + bob, 1.6, 5);
    g.fillRect(x + 3.8, y - 3 + bob, 1.6, 5);

    // Head
    g.fillStyle = look.skin;
    g.fillRect(x - 3.6, y - 11 + bob, 7.2, 7.4);

    // Hair, by silhouette, and it changes with facing so turning reads.
    g.fillStyle = look.hair;
    switch (look.hairStyle) {
      case "swept":
        g.fillRect(x - 4, y - 12 + bob, 8, 3);
        if (facing !== "up") g.fillRect(x + 2.4, y - 11 + bob, 1.8, 4);
        break;
      case "tied":
        g.fillRect(x - 4, y - 12 + bob, 8, 3);
        g.fillRect(x - 5.4, y - 10 + bob, 1.6, 4);
        break;
      case "curls":
        g.fillRect(x - 4.4, y - 12.6 + bob, 8.8, 4);
        break;
      case "buzz":
        g.fillRect(x - 3.6, y - 11.6 + bob, 7.2, 2.2);
        break;
      case "long":
        g.fillRect(x - 4, y - 12 + bob, 8, 3);
        g.fillRect(x - 4.6, y - 11 + bob, 1.6, 8);
        g.fillRect(x + 3, y - 11 + bob, 1.6, 8);
        break;
      case "tudung":
        // A covered head, as one silhouette. No detail it cannot carry here.
        g.fillRect(x - 4.4, y - 12.4 + bob, 8.8, 5);
        g.fillRect(x - 4.4, y - 8 + bob, 1.6, 6);
        g.fillRect(x + 2.8, y - 8 + bob, 1.6, 6);
        g.fillRect(x - 3.4, y - 3 + bob, 6.8, 2.4);
        break;
      default:
        g.fillRect(x - 4, y - 12 + bob, 8, 3.4);
    }

    /*
     * The one extra. Drawn after the head so it sits on top, and drawn for
     * every direction so a player who picked it can still see it walking away.
     */
    switch (look.accessory) {
      case "glasses":
        if (facing === "down") {
          g.fillStyle = "rgba(24,28,40,0.85)";
          g.fillRect(x - 3, y - 8.6 + bob, 2.4, 2);
          g.fillRect(x + 0.6, y - 8.6 + bob, 2.4, 2);
          g.fillRect(x - 0.6, y - 8 + bob, 1.2, 0.8);
        }
        break;
      case "cap":
        g.fillStyle = "#22303f";
        g.fillRect(x - 4.2, y - 12.8 + bob, 8.4, 3);
        g.fillStyle = "#2f4258";
        if (facing !== "up") g.fillRect(x - 4.6, y - 10.2 + bob, 9.2, 1.6);
        break;
      case "headphones":
        g.fillStyle = "#1c2230";
        g.fillRect(x - 4.8, y - 13 + bob, 9.6, 1.6);
        g.fillRect(x - 5.4, y - 11.4 + bob, 1.8, 3.4);
        g.fillRect(x + 3.6, y - 11.4 + bob, 1.8, 3.4);
        break;
      case "bag":
        g.fillStyle = "#3a4560";
        if (facing === "up") g.fillRect(x - 3.4, y - 4 + bob, 6.8, 6.4);
        else if (facing === "left") g.fillRect(x + 1.6, y - 3.6 + bob, 2.8, 5.6);
        else if (facing === "right") g.fillRect(x - 4.4, y - 3.6 + bob, 2.8, 5.6);
        else {
          g.fillRect(x - 5, y - 3.4 + bob, 1.8, 5.2);
          g.fillRect(x + 3.2, y - 3.4 + bob, 1.8, 5.2);
        }
        break;
      default:
        break;
    }

    // Face, only when facing the camera. Two dots is enough at this size.
    if (facing === "down") {
      g.fillStyle = "#1a1208";
      g.fillRect(x - 2.2, y - 8 + bob, 1.2, 1.4);
      g.fillRect(x + 1, y - 8 + bob, 1.2, 1.4);
    } else if (facing === "left") {
      g.fillStyle = "#1a1208";
      g.fillRect(x - 2.6, y - 8 + bob, 1.2, 1.4);
    } else if (facing === "right") {
      g.fillStyle = "#1a1208";
      g.fillRect(x + 1.4, y - 8 + bob, 1.2, 1.4);
    }
  }
}

/** Actions that can actually be completed, and therefore can be marked. */
const MARKED = new Set(["mission", "campaign", "check"]);

const ECHO_TINT: Record<EchoStyleId, string> = {
  core: "#8b78ff",
  shift: "#22cde6",
  signal: "#b6f24a",
  scout: "#f5b93f",
  architect: "#ff6b6b",
};

/**
 * Which surface a tile belongs to.
 *
 * Grass, and everything that stands on grass, is one surface. So is paving and
 * everything on paving. This is what stops the bevel from drawing an outline
 * around every tree.
 */
function surface(code: TerrainCode): string {
  switch (code) {
    case ",":
    case "T":
    case "b":
      return "ground";
    case ".":
      return "paving";
    case "=":
      return "covered";
    case "c":
      return "court";
    case "r":
    case "z":
      return "road";
    case "f":
    case "d":
      return "floor";
    default:
      return code;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Where the camera sits on one axis.
 *
 * Normally it follows and clamps at the district edge. When the view is wider
 * than the district (a very wide landscape window) there is nothing to clamp
 * to, so the map is centred instead of being pinned to one side with a band of
 * empty ground next to it.
 */
function frame(want: number, view: number, world: number): number {
  if (view >= world) return (world - view) / 2;
  return clamp(want, 0, world - view);
}

export { NPCS };
