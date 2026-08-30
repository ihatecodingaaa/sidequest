/**
 * Word budget and language check for content.json.
 *
 * Run before any layout exists. The point of budgeting copy first is that a
 * page which fits by construction never has to be rescued by shrinking type,
 * and the previous attempt shrank type.
 *
 * Counts every visible string on a page, including headings, labels, captions
 * and diagram text, because all of it occupies the page. Keys that are
 * metadata rather than copy are skipped by name.
 *
 * Usage:  node docs/submission/ycm-synopsis/wordcount.js
 */

const fs = require("node:fs");
const path = require("node:path");

const content = JSON.parse(
  fs.readFileSync(path.join(__dirname, "content.json"), "utf8"),
);

/** Keys that carry instructions to the build rather than words on the page. */
const NOT_COPY = new Set([
  "id",
  "n",
  "kind",
  "budget",
  "image",
  "images",
  "file",
  "imageCandidates",
  "imageAlternates",
  "imageCaptions",
  "verbatimSource",
  "colour",
  "colourLight",
  "shape",
  "columns",
]);

function words(value) {
  if (typeof value === "string") {
    return value.trim() ? value.trim().split(/\s+/).length : 0;
  }
  if (Array.isArray(value)) return value.reduce((sum, v) => sum + words(v), 0);
  if (value && typeof value === "object") {
    return Object.entries(value).reduce(
      (sum, [key, v]) => (NOT_COPY.has(key) ? sum : sum + words(v)),
      0,
    );
  }
  return 0;
}

/* ------------------------------------------------------------- Language */

const FORBIDDEN = [
  { name: "em dash U+2014", re: /\u2014/g },
  { name: "en dash U+2013", re: /\u2013/g },
  { name: "contraction n't", re: /\w n?'t\b|\w n't\b|\bcan't\b|\bdon't\b|\bwon't\b|n't\b/gi },
  { name: "contraction 're", re: /\w're\b/gi },
  { name: "contraction 've", re: /\w've\b/gi },
  { name: "contraction 'll", re: /\w'll\b/gi },
  { name: "contraction 'd", re: /\w'd\b/gi },
  { name: "contraction 'm", re: /\bI'm\b/gi },
  { name: "shorthand", re: /\b(shd|ppl|tgt|smth|rn|abt)\b/gi },
];

function everyString(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => everyString(v, out));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => everyString(v, out));
  }
  return out;
}

/* ------------------------------------------------------------------ Run */

let over = 0;
console.log("PAGE                          WORDS  BUDGET   HEADROOM");
console.log("".padEnd(56, "-"));

for (const page of content.pages) {
  const used = words(page);
  const headroom = page.budget - used;
  if (headroom < 0) over += 1;
  const flag = headroom < 0 ? "  OVER BUDGET" : "";
  console.log(
    `${String(page.n).padStart(2)}  ${page.id.padEnd(24)}${String(used).padStart(5)}${String(page.budget).padStart(8)}${String(headroom).padStart(11)}${flag}`,
  );
}

const total = content.pages.reduce((sum, p) => sum + words(p), 0);
console.log("".padEnd(56, "-"));
console.log(`    ${"total".padEnd(24)}${String(total).padStart(5)}`);

console.log("\nLANGUAGE");
const strings = everyString(content);
let hits = 0;
for (const rule of FORBIDDEN) {
  const found = strings.filter((s) => rule.re.test(s));
  rule.re.lastIndex = 0;
  if (found.length) {
    hits += found.length;
    console.log(`  FAIL ${rule.name}: ${found.length}`);
    found.slice(0, 3).forEach((s) => console.log(`       ${s.slice(0, 90)}`));
  }
}
if (!hits) console.log("  clean: no em dashes, no en dashes, no contractions, no shorthand");

console.log("");
if (over) {
  console.log(`${over} page(s) over budget. Cut words.`);
  process.exit(1);
}
console.log("Every page is inside its budget.");
