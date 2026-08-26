/*
 * Text volume audit.
 *
 * Finds the places where SIDEQUEST asks somebody to read a lot before they get
 * to do anything. It is a search tool, not a linter: character counts are a way
 * of locating candidates for a manual rewrite, never a target to optimise. A
 * long line that carries one clear idea is fine; four short lines dumped into
 * one block before a decision usually are not.
 *
 *   node scripts/text-audit.mjs
 *   node scripts/text-audit.mjs --json
 *
 * Roughly 42 characters fit on a line of body text at 390px, so the line
 * estimates below are chars/42.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const CHARS_PER_LINE = 42;

/** Blocks bigger than this get reported. Tuned to surface, not to police. */
const BLOCK_CHARS = 220;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full)) out.push(full);
  }
  return out;
}

/** Pulls `lines: [...]` arrays out of a fixture and measures each block. */
function findLineBlocks(text, file) {
  const found = [];
  const re = /(\blines|takeaways|points|context|discussionPrompts)\s*:\s*\[/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < text.length && depth > 0) {
      if (text[i] === "[") depth += 1;
      else if (text[i] === "]") depth -= 1;
      i += 1;
    }
    const body = text.slice(re.lastIndex, i - 1);
    const strings = [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
    if (strings.length === 0) continue;
    const chars = strings.reduce((sum, s) => sum + s.length, 0);
    found.push({
      file,
      field: match[1],
      count: strings.length,
      chars,
      estLines: Math.ceil(chars / CHARS_PER_LINE),
      line: text.slice(0, match.index).split("\n").length,
      preview: strings[0].slice(0, 70),
    });
  }
  return found;
}

/** Long single strings: body, summary, description, mechanism and friends. */
function findLongStrings(text, file) {
  const found = [];
  const re =
    /\b(body|summary|description|mechanism|detail|verdict|insight|action|shortDescription|brief|note|heldNote|shiftedNote|soloNote|lede|setup)\s*:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const value = match[2];
    if (value.length < BLOCK_CHARS) continue;
    found.push({
      file,
      field: match[1],
      count: 1,
      chars: value.length,
      estLines: Math.ceil(value.length / CHARS_PER_LINE),
      line: text.slice(0, match.index).split("\n").length,
      preview: value.slice(0, 70),
    });
  }
  return found;
}

const files = [...walk(join(ROOT, "src", "data")), ...walk(join(ROOT, "src", "features"))];

const blocks = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  blocks.push(...findLineBlocks(text, rel), ...findLongStrings(text, rel));
}

const heavy = blocks.filter((b) => b.chars >= BLOCK_CHARS).sort((a, b) => b.chars - a.chars);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(heavy, null, 2));
} else {
  const totalChars = blocks.reduce((sum, b) => sum + b.chars, 0);
  console.log(`Scanned ${files.length} files.`);
  console.log(`${blocks.length} text blocks, ${totalChars} characters total.`);
  console.log(`${heavy.length} blocks at or over ${BLOCK_CHARS} characters:\n`);
  for (const b of heavy.slice(0, 40)) {
    console.log(
      `${String(b.chars).padStart(5)}ch ~${String(b.estLines).padStart(2)}ln  ` +
        `${b.field.padEnd(17)} ${b.file}:${b.line}\n        "${b.preview}..."`,
    );
  }
}
