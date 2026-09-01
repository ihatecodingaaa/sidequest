"use client";

import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/cn";
import { SIGNAL_MODES } from "@/data/signals";
import type { SignalMarker } from "@/features/streets/game/world-engine";
import {
  DISTRICT_01,
  LANDMARKS,
  MAP_H,
  MAP_W,
  type Npc,
} from "@/features/streets/streets-data";

/**
 * The district at a glance.
 *
 * It answers exactly one question: what is out there and where am I in it.
 * That was the specific thing missing from the first cut of Streets, where a
 * player could walk past somebody and have no idea the block continued in
 * three directions.
 *
 * It deliberately does not answer *what should I do*, which is the Quest
 * List's job and is carried in words. Every marker drawn here is also a row in
 * that list, so nothing is colour-only and nothing is map-only.
 *
 * The obvious failure mode for a minimap is the debug-panel look: a grey
 * rectangle with dots on it, dense and joyless. So this draws the real terrain
 * silhouette and gives each block its own shopfront colour, which is the same
 * colour it has in the world.
 */

/** Two device pixels per tile before DPR. Small, but the shapes still read. */
const SCALE = 2;

const MINI = {
  ground: "#3f7a46",
  path: "#c3b89f",
  road: "#4d525d",
  court: "#6f5fd0",
  block: "#e8e2d4",
  blockEdge: "#8d8471",
};

function surface(code: string): string | null {
  if (code === "r" || code === "z") return MINI.road;
  if (code === "c") return MINI.court;
  if (code === "." || code === "=") return MINI.path;
  if (code === "," || code === "T" || code === "b" || code === "~") return MINI.ground;
  return null;
}

export function Minimap({
  tile,
  npcs,
  signals,
  tracked,
  className,
}: {
  tile: { x: number; y: number };
  npcs: { npc: Npc; done: boolean }[];
  /** Live Signals, keyed by whoever raises them. Same source as the world. */
  signals: Record<string, SignalMarker>;
  /**
   * Somebody the player asked to be pointed at, from the Quest Journal.
   *
   * Drawn as a ring and a crosshair rather than a brighter dot, because a
   * colour difference on a four-pixel marker is not a difference. The name and
   * the place are also printed in real text above the map by the caller, so
   * nothing about tracking is map-only.
   */
  tracked?: Npc | null;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* Which block the player is standing nearest, for the label. */
  const nearest = useMemo(() => {
    let best = LANDMARKS[0];
    let bestDist = Infinity;
    for (const landmark of LANDMARKS) {
      const d = Math.hypot(landmark.x - tile.x, landmark.y - tile.y);
      if (d < bestDist) {
        bestDist = d;
        best = landmark;
      }
    }
    return best;
  }, [tile.x, tile.y]);

  const open = npcs.filter((entry) => !entry.done && signals[entry.npc.id]);
  const openCount = open.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = MAP_W * SCALE * dpr;
    canvas.height = MAP_H * SCALE * dpr;

    const g = canvas.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.imageSmoothingEnabled = false;

    // Ground first, then anything that is not ground painted over it.
    g.fillStyle = MINI.ground;
    g.fillRect(0, 0, MAP_W * SCALE, MAP_H * SCALE);

    for (let ty = 0; ty < MAP_H; ty += 1) {
      const row = DISTRICT_01[ty] ?? "";
      for (let tx = 0; tx < MAP_W; tx += 1) {
        const fill = surface(row[tx] ?? "#");
        if (!fill || fill === MINI.ground) continue;
        g.fillStyle = fill;
        g.fillRect(tx * SCALE, ty * SCALE, SCALE, SCALE);
      }
    }

    // Blocks, from their stated footprints rather than from wall tiles, so a
    // building is one solid shape instead of a scatter of squares.
    for (const landmark of LANDMARKS) {
      if (!landmark.building) continue;
      const { x, y, w, h } = landmark.building;
      g.fillStyle = MINI.block;
      g.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
      g.fillStyle = MINI.blockEdge;
      g.fillRect(x * SCALE, (y + h) * SCALE - 1, w * SCALE, 1);
      // The shopfront colour, in the same place as the sign in the world.
      g.fillStyle = landmark.sign ?? MINI.blockEdge;
      g.fillRect(x * SCALE, y * SCALE, w * SCALE, 1.5);
    }

    /*
     * Live Signals, in the mode colour they have in the world.
     *
     * A situation, never a person: this loop draws a dot for something that
     * needs doing, and the only reason it sits on somebody's tile is that the
     * situation is where they are. There is nothing to draw for an NPC who has
     * no live Signal, which is why a finished thread quietly empties the map.
     *
     * Colour alone would be an accessibility failure, so nothing here is
     * colour-only: every dot is also a row in the Quest List with its mode
     * spelled out, and the accessible name below counts them in words.
     */
    for (const entry of npcs) {
      const marker = signals[entry.npc.id];
      if (entry.done || !marker) continue;
      const spec = SIGNAL_MODES[marker.mode];
      g.fillStyle = "rgba(10,14,22,0.5)";
      g.beginPath();
      g.arc(entry.npc.x * SCALE + 1, entry.npc.y * SCALE + 1, 2.8, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = spec.colour;
      g.beginPath();
      g.arc(entry.npc.x * SCALE + 1, entry.npc.y * SCALE + 1, 2, 0, Math.PI * 2);
      g.fill();
    }

    /*
     * The tracked person, if the player asked for one.
     *
     * Their live tile, not their starting tile: residents walk routes and the
     * whole point of tracking is that it stays true while they move. The ring
     * is a shape rather than a colour so it survives being four pixels across
     * and reads for a player who cannot separate the accent from the signal
     * dots underneath it.
     */
    if (tracked) {
      const tx = tracked.x * SCALE + 1;
      const ty = tracked.y * SCALE + 1;
      g.strokeStyle = "rgba(10,14,22,0.85)";
      g.lineWidth = 3.4;
      g.beginPath();
      g.arc(tx, ty, 5.4, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = "#f7f9ff";
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(tx, ty, 5.4, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.moveTo(tx - 8, ty);
      g.lineTo(tx - 5.4, ty);
      g.moveTo(tx + 5.4, ty);
      g.lineTo(tx + 8, ty);
      g.moveTo(tx, ty - 8);
      g.lineTo(tx, ty - 5.4);
      g.moveTo(tx, ty + 5.4);
      g.lineTo(tx, ty + 8);
      g.stroke();
    }

    // The player last, so nothing can cover it.
    const px = tile.x * SCALE + 1;
    const py = tile.y * SCALE + 1;
    g.fillStyle = "rgba(10,14,22,0.85)";
    g.beginPath();
    g.arc(px, py, 3.2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.arc(px, py, 2, 0, Math.PI * 2);
    g.fill();
  }, [tile.x, tile.y, npcs, signals, tracked]);

  return (
    <div
      className={cn(
        "pointer-events-none overflow-hidden rounded-xl border border-white/15 bg-black/45 p-1 backdrop-blur",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Map of District 01. You are near ${nearest?.name ?? "the block"}. ${
          tracked ? `Following ${tracked.name}. ` : ""
        }${
          openCount === 0
            ? "Nothing open on the block right now."
            : `${openCount} ${openCount === 1 ? "situation" : "situations"} on the block. The quest list names each one.`
        }`}
        className="block h-auto w-full"
        style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
      />
    </div>
  );
}
