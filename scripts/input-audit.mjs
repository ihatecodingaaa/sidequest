/*
 * Keyboard demand audit.
 *
 * Answers one question about the shipped source, with a number rather than an
 * impression: **how many times does normal gameplay require the keyboard?**
 *
 *   node scripts/input-audit.mjs
 *   node scripts/input-audit.mjs --json
 *   node scripts/input-audit.mjs --against <git-ref>     compare with a commit
 *
 * The interesting mode is the last one. Real testers said "there is too much
 * typing", so the useful artefact is not a count, it is a difference:
 *
 *   node scripts/input-audit.mjs --against 571ab1e
 *
 * ---
 *
 * ## What it counts, and what it refuses to count
 *
 * Every `<input>` and `<textarea>` in `src`, classified by the
 * `data-input-role` each one is required to declare. There is deliberately no
 * role meaning "the player must type this to continue", so a field that would
 * need one shows up here as UNDECLARED and fails `tests/unit/integrity.test.ts`
 * as well.
 *
 * Controls that open no keyboard (a range slider, a checkbox) are excluded,
 * because the subject is keyboards and not the DOM's naming of elements.
 *
 * This is a locator, not a target. Driving the number to zero by moving a
 * settings field somewhere else would be gaming it. The number worth watching
 * is the count of required gameplay fields, and that one is meant to stay at
 * zero forever.
 */

import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const againstIndex = args.indexOf("--against");
const against = againstIndex === -1 ? null : args[againstIndex + 1];

/** Roles a field may declare. Nothing here means "required to play". */
const ROLE_MEANING = {
  "optional-creator": "Optional. Behind a deliberate secondary control.",
  "code-entry": "A station, crew or mission code. A QR or tap path exists too.",
  settings: "Settings or onboarding. Skippable, and not gameplay.",
  "partner-tool": "The partner studio at /partner. Nothing in the app links to it.",
};

const NO_KEYBOARD = /type=\{?["']?(range|checkbox|radio|file|color)["']?\}?/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full)) out.push(full);
  }
  return out;
}

/**
 * Removes comments before scanning.
 *
 * Several components explain in a doc comment that they used to be a textarea
 * and no longer are. An audit that counts its own documentation reports the
 * opposite of the truth.
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_match, before) => before);
}

/** Every JSX opening tag of a name, with its own attribute text. */
function openingTags(text, tag) {
  const found = [];
  const marker = `<${tag}`;
  let from = 0;
  for (;;) {
    const start = text.indexOf(marker, from);
    if (start === -1) break;
    const after = text[start + marker.length];
    if (after && /[A-Za-z0-9_]/.test(after)) {
      from = start + marker.length;
      continue;
    }
    let depth = 0;
    let i = start + marker.length;
    while (i < text.length) {
      const char = text[i];
      if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
      else if (char === ">" && depth === 0) break;
      i += 1;
    }
    found.push({ attrs: text.slice(start, i), line: text.slice(0, start).split("\n").length });
    from = i + 1;
  }
  return found;
}

function scanText(path, raw) {
  const text = stripComments(raw);
  const fields = [];
  for (const tag of ["input", "textarea"]) {
    for (const { attrs, line } of openingTags(text, tag)) {
      if (tag === "input" && NO_KEYBOARD.test(attrs)) continue;
      const role = /data-input-role="([a-z-]+)"/.exec(attrs)?.[1] ?? "UNDECLARED";
      fields.push({ file: path, line, tag, role });
    }
  }
  return fields;
}

/** The working tree. */
function scanWorkingTree() {
  return walk(SRC).flatMap((full) =>
    scanText(relative(ROOT, full).replace(/\\/g, "/"), readFileSync(full, "utf8")),
  );
}

/** A git ref, without touching the working tree. */
function scanRef(ref) {
  const listing = execSync(`git ls-tree -r --name-only ${ref} -- src`, {
    encoding: "utf8",
    cwd: ROOT,
  });
  const files = listing.split("\n").filter((line) => /\.tsx?$/.test(line));
  return files.flatMap((path) => {
    const raw = execSync(`git show ${ref}:${path}`, {
      encoding: "utf8",
      cwd: ROOT,
      maxBuffer: 32 * 1024 * 1024,
    });
    return scanText(path, raw);
  });
}

function summarise(fields) {
  const byRole = {};
  for (const field of fields) byRole[field.role] = (byRole[field.role] ?? 0) + 1;
  return {
    total: fields.length,
    textareas: fields.filter((field) => field.tag === "textarea").length,
    requiredGameplay: fields.filter((field) => field.role === "UNDECLARED").length,
    byRole,
    fields,
  };
}

const now = summarise(scanWorkingTree());
const before = against ? summarise(scanRef(against)) : null;

if (asJson) {
  console.log(JSON.stringify({ now, before, against }, null, 2));
} else {
  const line = (label, value) => console.log(`  ${label.padEnd(38)} ${value}`);

  console.log("\nKEYBOARD DEMAND, working tree\n");
  line("Keyboard-opening fields in src", now.total);
  line("Textareas", now.textareas);
  line("Undeclared (required gameplay typing)", now.requiredGameplay);
  console.log("");
  for (const [role, count] of Object.entries(now.byRole).sort()) {
    line(`  ${role}`, `${count}  ${ROLE_MEANING[role] ?? "NOT A PERMITTED ROLE"}`);
  }

  console.log("\nEvery field, in source order\n");
  for (const field of now.fields) {
    console.log(`  ${field.role.padEnd(18)} <${field.tag}>  ${field.file}:${field.line}`);
  }

  if (before) {
    console.log(`\nAGAINST ${against}\n`);
    const delta = (label, a, b) => {
      const sign = b - a > 0 ? "+" : "";
      line(label, `${a}  ->  ${b}   (${sign}${b - a})`);
    };
    delta("Keyboard-opening fields", before.total, now.total);
    delta("Textareas", before.textareas, now.textareas);
    delta("Required gameplay typing", before.requiredGameplay, now.requiredGameplay);
    console.log(
      "\n  Note: at the compared ref no field declared a role, so every one of\n" +
        "  them counts as undeclared. Read the before column as 'fields that\n" +
        "  existed', and the after column as 'fields that still cannot be\n" +
        "  reached without a deliberate act'.",
    );
  }

  console.log("");
}

if (now.requiredGameplay > 0 && !asJson) {
  console.log(
    `  ${now.requiredGameplay} field(s) declare no role. tests/unit/integrity.test.ts fails on this.\n`,
  );
}
