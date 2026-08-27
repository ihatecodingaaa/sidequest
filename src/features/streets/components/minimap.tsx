"use client";

import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/cn";
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
  className,
}: {
  tile: { x: number; y: number };
  npcs: { npc: Npc; done: boolean }[];
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

  const openCount = npcs.filter((entry) => !entry.done).length;

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
     * Anybody with something available. Gold, the same spark colour used above
     * their head in the world, never red and never an alert glyph: it means
     * there is something here, not that a person is a problem.
     */
    for (const entry of npcs) {
      if (entry.done) continue;
      g.fillStyle = "#f5b93f";
      g.beginPath();
      g.arc(entry.npc.x * SCALE + 1, entry.npc.y * SCALE + 1, 2, 0, Math.PI * 2);
      g.fill();
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
  }, [tile.x, tile.y, npcs]);

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
          openCount === 0 ? "Nothing left open." : `${openCount} people have something for you.`
        }`}
        className="block h-auto w-full"
        style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
      />
    </div>
  );
}
