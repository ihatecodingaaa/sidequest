import {
  DISTRICT_01,
  LANDMARKS,
  MAP_H,
  MAP_W,
  NPCS,
  SOLID,
  SPAWN,
  TILE,
  type AvatarLook,
  type Npc,
  type TerrainCode,
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

/** How much of the world is visible, in world units. About 4:3. */
/*
 * Wide enough that a block is visible from the middle of the corridor. Framed
 * tighter at first and the district read as a field: you could see grass and
 * one neighbour, but never a place you might walk to.
 */
const VIEW_W = 320;
const VIEW_H = 232;

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

const PALETTE = {
  grass: "#3f7a46",
  grassAlt: "#478a4e",
  path: "#c8bda4",
  pathAlt: "#bfb298",
  road: "#5a5f6b",
  stripe: "#d9dee6",
  court: "#7a6bd6",
  courtLine: "#a99bf0",
  wall: "#e8e2d4",
  wallShade: "#c9c1af",
  roof: "#2f4a86",
  roofAlt: "#3d5da0",
  walkway: "#d6cdb8",
  walkwayPost: "#9aa0ac",
  tree: "#2c5f36",
  treeTop: "#3f8248",
  bench: "#8a6a44",
  planter: "#57804f",
  shadow: "rgba(10,14,22,0.28)",
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
  private lastTile = "";

  constructor(canvas: HTMLCanvasElement, options: EngineOptions) {
    this.canvas = canvas;
    this.options = options;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;

    this.buffer = document.createElement("canvas");
    this.buffer.width = VIEW_W;
    this.buffer.height = VIEW_H;
    const bctx = this.buffer.getContext("2d");
    if (!bctx) throw new Error("2d buffer context unavailable");
    this.bctx = bctx;

    this.paintTerrain();
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

  /** Drops the player at a landmark, which is how the Quest List teleports. */
  moveTo(tileX: number, tileY: number) {
    this.player.x = tileX * TILE + TILE / 2;
    this.player.y = tileY * TILE + TILE / 2;
    this.trail = [];
    this.checkProximity();
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

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
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
      if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
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
    const row = DISTRICT_01[ty];
    if (!row) return "#";
    const ch = row[tx];
    // Landmark door letters (M, V, F, S, B) sit inside walls and are solid.
    if (!ch || /[A-Z]/.test(ch)) return "#";
    return ch as TerrainCode;
  }

  private checkProximity() {
    let best: Npc | null = null;
    let bestDist = INTERACT_RANGE;
    for (const entry of this.options.npcs) {
      const nx = entry.npc.x * TILE + TILE / 2;
      const ny = entry.npc.y * TILE + TILE / 2;
      const d = Math.hypot(nx - this.player.x, ny - this.player.y);
      if (d < bestDist) {
        bestDist = d;
        best = entry.npc;
      }
    }
    if (best?.id !== this.near?.id) {
      this.near = best;
      this.options.onNear(best);
    }
  }

  /* ------------------------------------------------------------ Terrain */

  private paintTerrain() {
    const c = document.createElement("canvas");
    c.width = MAP_W * TILE;
    c.height = MAP_H * TILE;
    const g = c.getContext("2d");
    if (!g) return;

    for (let ty = 0; ty < MAP_H; ty += 1) {
      for (let tx = 0; tx < MAP_W; tx += 1) {
        const code = this.at(tx, ty);
        const x = tx * TILE;
        const y = ty * TILE;
        // A cheap deterministic checker keeps large areas from reading flat.
        const alt = (tx + ty) % 2 === 0;

        switch (code) {
          case ",": {
            g.fillStyle = alt ? PALETTE.grass : PALETTE.grassAlt;
            g.fillRect(x, y, TILE, TILE);
            /*
             * A deterministic scatter of tufts. Large flat areas read as unbuilt
             * space rather than as a neighbourhood, and a hash keeps it stable
             * across reloads so the district always looks the same.
             */
            const h = (tx * 73856093) ^ (ty * 19349663);
            if ((h & 7) === 0) {
              g.fillStyle = PALETTE.treeTop;
              g.fillRect(x + (h % 9) + 2, y + ((h >> 3) % 9) + 3, 2, 2);
            }
            break;
          }
          case ".":
            g.fillStyle = alt ? PALETTE.path : PALETTE.pathAlt;
            g.fillRect(x, y, TILE, TILE);
            break;
          case "=": {
            g.fillStyle = PALETTE.walkway;
            g.fillRect(x, y, TILE, TILE);
            /*
             * Posts on the sides and a beam only at the ends of a run. Drawing
             * a beam on every tile turned a covered walkway into a ladder.
             */
            const above = this.at(tx, ty - 1) === "=";
            const below = this.at(tx, ty + 1) === "=";
            const leftOpen = this.at(tx - 1, ty) !== "=";
            const rightOpen = this.at(tx + 1, ty) !== "=";
            g.fillStyle = PALETTE.walkwayPost;
            if (leftOpen) g.fillRect(x, y, 2, TILE);
            if (rightOpen) g.fillRect(x + TILE - 2, y, 2, TILE);
            if (!above) g.fillRect(x, y, TILE, 2);
            if (!below) g.fillRect(x, y + TILE - 2, TILE, 2);
            break;
          }
          case "c":
            g.fillStyle = PALETTE.court;
            g.fillRect(x, y, TILE, TILE);
            g.strokeStyle = PALETTE.courtLine;
            g.lineWidth = 1;
            g.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
            break;
          case "r":
            g.fillStyle = PALETTE.road;
            g.fillRect(x, y, TILE, TILE);
            break;
          case "z":
            g.fillStyle = PALETTE.road;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.stripe;
            g.fillRect(x + 3, y, 4, TILE);
            g.fillRect(x + 10, y, 4, TILE);
            break;
          case "#":
            g.fillStyle = PALETTE.wall;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.wallShade;
            g.fillRect(x, y + TILE - 3, TILE, 3);
            break;
          case "T":
            g.fillStyle = alt ? PALETTE.grass : PALETTE.grassAlt;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = "rgba(10,14,22,0.2)";
            g.beginPath();
            g.ellipse(x + 8, y + 13, 5.5, 2, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "#6b4a2c";
            g.fillRect(x + 7, y + 8, 2.4, 5);
            g.fillStyle = PALETTE.tree;
            g.beginPath();
            g.arc(x + 8, y + 6, 6.6, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "#5aa862";
            g.beginPath();
            g.arc(x + 6, y + 4.4, 3.4, 0, Math.PI * 2);
            g.fill();
            break;
          case "b":
            g.fillStyle = alt ? PALETTE.grass : PALETTE.grassAlt;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = "rgba(10,14,22,0.18)";
            g.fillRect(x + 1, y + 12, TILE - 2, 2);
            g.fillStyle = "#7d5c3a";
            g.fillRect(x + 1, y + 3, TILE - 2, 2.5);
            g.fillStyle = PALETTE.bench;
            g.fillRect(x + 1, y + 7, TILE - 2, 3.5);
            g.fillRect(x + 2, y + 10, 2, 2.5);
            g.fillRect(x + TILE - 4, y + 10, 2, 2.5);
            break;
          case "t":
            g.fillStyle = PALETTE.walkway;
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.bench;
            g.beginPath();
            g.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
            g.fill();
            break;
          case "~":
            g.fillStyle = "#a89578";
            g.fillRect(x, y, TILE, TILE);
            g.fillStyle = PALETTE.planter;
            g.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
            g.fillStyle = "#5aa862";
            g.fillRect(x + 4, y + 4, 3, 3);
            g.fillRect(x + 9, y + 8, 3, 3);
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
     */
    for (const landmark of LANDMARKS) {
      if (!landmark.building) continue;
      const { x: bx, y: by, w: bw, h: bh } = landmark.building;
      const x = bx * TILE;
      const y = by * TILE;
      const w = bw * TILE;
      const h = bh * TILE;

      // Facade
      g.fillStyle = PALETTE.wall;
      g.fillRect(x, y, w, h);

      // Roof band across the top, in the block's own colour.
      g.fillStyle = PALETTE.roof;
      g.fillRect(x, y, w, TILE);
      g.fillStyle = landmark.sign ?? PALETTE.roofAlt;
      g.fillRect(x, y + TILE - 4, w, 4);

      // Window rows, so a block reads as somewhere people live or shop.
      g.fillStyle = "rgba(52,72,120,0.75)";
      for (let row = 1; row < bh - 1; row += 1) {
        for (let col = 0; col < bw; col += 1) {
          g.fillRect(x + col * TILE + 4, y + row * TILE + 5, TILE - 8, TILE - 9);
        }
      }

      // Doorway under the sign, centred on the landmark's door tile.
      const doorX = landmark.x * TILE;
      const doorY = y + h - TILE;
      g.fillStyle = "#2a2f3d";
      g.fillRect(doorX - 2, doorY, TILE + 4, TILE);
      g.fillStyle = landmark.sign ?? PALETTE.roofAlt;
      g.fillRect(doorX - 2, doorY, TILE + 4, 3);

      // Ground shadow, so the block sits on the map rather than floating.
      g.fillStyle = "rgba(10,14,22,0.22)";
      g.fillRect(x, y + h, w, 3);
    }

    this.terrain = c;
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
    }

    const g = this.bctx;
    g.imageSmoothingEnabled = false;
    g.fillStyle = PALETTE.grass;
    g.fillRect(0, 0, VIEW_W, VIEW_H);

    // Camera follows the player and clamps at the district edges.
    const camX = clamp(this.player.x - VIEW_W / 2, 0, MAP_W * TILE - VIEW_W);
    const camY = clamp(this.player.y - VIEW_H / 2, 0, MAP_H * TILE - VIEW_H);

    if (this.terrain) {
      g.drawImage(this.terrain, camX, camY, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
    }

    // Entities are drawn back to front so nearer things overlap further ones.
    const drawables = [
      ...this.options.npcs.map((entry) => ({
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
    ctx.drawImage(this.buffer, 0, 0, VIEW_W, VIEW_H, 0, 0, this.canvas.width, this.canvas.height);
  }

  private drawNpc(g: CanvasRenderingContext2D, entry: NpcRuntime, camX: number, camY: number) {
    const x = Math.round(entry.npc.x * TILE + TILE / 2 - camX);
    const y = Math.round(entry.npc.y * TILE + TILE / 2 - camY);
    if (x < -20 || y < -24 || x > VIEW_W + 20 || y > VIEW_H + 24) return;

    this.drawPerson(g, x, y, {
      skin: "#e7bd94",
      hair: "#241a12",
      hairStyle: "short",
      top: entry.npc.tint,
    }, "down", 0);

    /*
     * The quest marker. A SIDEQUEST spark, not an exclamation mark: it means
     * "there is something here", never "this person is suspicious". Nothing in
     * this district may encode appearance as risk.
     */
    if (!entry.done) {
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
      default:
        g.fillRect(x - 4, y - 12 + bob, 8, 3.4);
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

const ECHO_TINT: Record<EchoStyleId, string> = {
  core: "#8b78ff",
  shift: "#22cde6",
  signal: "#b6f24a",
  scout: "#f5b93f",
  architect: "#ff6b6b",
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Exported for the Quest List, so it can walk the player to a landmark. */
export { VIEW_W, VIEW_H };
export { NPCS };
