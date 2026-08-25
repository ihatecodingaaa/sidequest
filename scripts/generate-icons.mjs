/**
 * Generates the PWA icon set as real PNG files.
 *
 * Written by hand rather than pulled from an image library: the icons are a
 * gradient plus one glyph, and a build-time native dependency is a worse
 * trade than eighty lines of deterministic maths. Run with `npm run icons`.
 */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "..", "public", "icons");

/* ------------------------------------------------------------ PNG writer */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* --------------------------------------------------------------- Drawing */

const INK = [6, 7, 12];
const VIOLET = [139, 120, 255];
const QUEST = [110, 86, 248];
const CYAN = [34, 205, 230];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixRgb(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** Gradient sampled along the main diagonal, violet through quest into cyan. */
function background(u, v) {
  const t = Math.min(1, Math.max(0, (u + v) / 2));
  return t < 0.55 ? mixRgb(VIOLET, QUEST, t / 0.55) : mixRgb(QUEST, CYAN, (t - 0.55) / 0.45);
}

/** Distance from point to a thick capsule between two points. */
function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0 ? 0 : Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function roundedRectDistance(px, py, halfW, halfH, radius) {
  const qx = Math.abs(px) - (halfW - radius);
  const qy = Math.abs(py) - (halfH - radius);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - radius;
}

/**
 * The glyph: an arrow leaving towards the top right, matching the cutout in
 * the in-app mark. Drawn as three capsules so it stays crisp at 32px.
 * Coordinates are in a -1 to 1 space.
 */
function glyphDistance(x, y, thickness) {
  const shaft = segmentDistance(x, y, -0.46, 0.46, 0.4, -0.4);
  const headA = segmentDistance(x, y, 0.4, -0.4, -0.1, -0.4);
  const headB = segmentDistance(x, y, 0.4, -0.4, 0.4, 0.1);
  return Math.min(shaft, headA, headB) - thickness;
}

function renderIcon(size, { padding, rounded }) {
  const SS = 3; // supersample factor, enough to kill visible stair-stepping
  const rgba = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const px = (x + (sx + 0.5) / SS) / size;
          const py = (y + (sy + 0.5) / SS) / size;
          // Normalised to -1..1 with the requested padding applied.
          const nx = (px * 2 - 1) / (1 - padding);
          const ny = (py * 2 - 1) / (1 - padding);

          let inside = 1;
          if (rounded) {
            const d = roundedRectDistance(nx, ny, 1, 1, 0.32);
            inside = d <= 0 ? 1 : 0;
          }

          if (!inside) continue;

          const base = background(px, py);
          const gd = glyphDistance(nx, ny, 0.155);
          // Soft edge roughly one supersampled pixel wide.
          const glyph = gd < 0 ? 1 : 0;
          const colour = glyph ? INK : base;

          r += colour[0];
          g += colour[1];
          b += colour[2];
          a += 255;
        }
      }

      const samples = SS * SS;
      const idx = (y * size + x) * 4;
      const alpha = a / samples;
      // Un-premultiply so partially covered edge pixels keep their colour.
      const coverage = alpha === 0 ? 1 : a / 255;
      rgba[idx] = Math.round(r / coverage);
      rgba[idx + 1] = Math.round(g / coverage);
      rgba[idx + 2] = Math.round(b / coverage);
      rgba[idx + 3] = Math.round(alpha);
    }
  }

  return encodePng(size, size, rgba);
}

/* ------------------------------------------------------------------ Main */

mkdirSync(OUT_DIR, { recursive: true });

const TARGETS = [
  { file: "icon-192.png", size: 192, padding: 0, rounded: false },
  { file: "icon-512.png", size: 512, padding: 0, rounded: false },
  // Maskable icons get cropped to a circle on some launchers, so the glyph is
  // kept well inside the 80% safe zone.
  { file: "icon-maskable-192.png", size: 192, padding: 0.42, rounded: false },
  { file: "icon-maskable-512.png", size: 512, padding: 0.42, rounded: false },
  { file: "apple-touch-icon.png", size: 180, padding: 0.14, rounded: false },
  { file: "favicon-32.png", size: 32, padding: 0.08, rounded: true },
];

for (const target of TARGETS) {
  const png = renderIcon(target.size, { padding: target.padding, rounded: target.rounded });
  writeFileSync(resolve(OUT_DIR, target.file), png);
  console.log(`wrote icons/${target.file} (${png.length} bytes)`);
}
