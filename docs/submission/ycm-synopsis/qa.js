/**
 * QA for the synopsis. A failure blocks the build.
 *
 * Four checks, each one aimed at a defect that actually shipped in a previous
 * attempt rather than at a defect that is merely conceivable.
 *
 *   1. Page geometry, read from the finished PDF's /MediaBox with pdf-lib.
 *      Every page must be 841.89 by 595.28 points, which is A4 landscape. The
 *      previous attempt produced portrait while believing it had asked for
 *      landscape, so this reads the artefact rather than the intent.
 *
 *   2. Overflow, per element, inside the rendered layout. Any element whose
 *      scrollHeight exceeds its clientHeight is clipping its own content. This
 *      is deliberately per element and not per document: the dominant defect
 *      last time was card bodies cut off mid sentence, and a document level
 *      test cannot see those at all.
 *
 *   3. Overlap, between every pair of [data-block] boxes on the same page.
 *      Any intersection greater than zero fails. This is what catches a
 *      callout dropped on top of live text.
 *
 *   4. Language, over the text extracted from the PDF with pdftotext, plus the
 *      HTML and CSS source. No U+2014, no U+2013, no contractions.
 *
 * Page count and file size are reported alongside, since both are free once
 * the PDF is open.
 *
 * Usage:  node docs/submission/ycm-synopsis/qa.js
 */

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { PDFDocument } = require("pdf-lib");

const HERE = __dirname;
const HTML = path.join(HERE, "index.html");
const PDF = path.join(HERE, "..", "SIDEQUEST_Content_and_Experience_Synopsis.pdf");

/** A4 landscape in PostScript points, to two decimals. */
const EXPECT_W = 841.89;
const EXPECT_H = 595.28;
const TOLERANCE_PT = 0.5;
const EXPECT_PAGES = 11;

const failures = [];
const notes = [];

function fail(check, message) {
  failures.push(`${check}: ${message}`);
}

/* ------------------------------------------- 1. Geometry, from the PDF */

async function checkGeometry() {
  const bytes = fs.readFileSync(PDF);
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();

  console.log("\n[1] PAGE GEOMETRY, read from /MediaBox");
  console.log(`    expecting ${EXPECT_W} x ${EXPECT_H} pt on every page`);

  let bad = 0;
  const seen = new Set();
  pages.forEach((p, i) => {
    const { width, height } = p.getSize();
    seen.add(`${width.toFixed(2)} x ${height.toFixed(2)}`);
    const ok =
      Math.abs(width - EXPECT_W) <= TOLERANCE_PT &&
      Math.abs(height - EXPECT_H) <= TOLERANCE_PT;
    if (!ok) {
      bad += 1;
      fail("geometry", `page ${i + 1} is ${width.toFixed(2)} x ${height.toFixed(2)} pt`);
    }
  });

  console.log(`    sizes found: ${[...seen].join(", ")}`);
  console.log(`    ${bad ? `FAIL, ${bad} page(s) wrong` : `PASS, all ${pages.length} pages landscape`}`);

  console.log(`\n    page count: ${pages.length}`);
  if (pages.length !== EXPECT_PAGES) {
    fail("pages", `expected ${EXPECT_PAGES} pages, found ${pages.length}`);
  } else {
    console.log(`    PASS, ${EXPECT_PAGES} pages`);
  }

  const mb = fs.statSync(PDF).size / 1048576;
  console.log(`    file size: ${mb.toFixed(2)} MB`);
  notes.push(`file size ${mb.toFixed(2)} MB`);
}

/* ------------------------- 2 and 3. Overflow and overlap, in the browser */

async function checkLayout() {
  const browser = await chromium.launch({ args: ["--hide-scrollbars"] });
  const context = await browser.newContext();
  const tab = await context.newPage();
  await tab.goto(`file://${HTML.replace(/\\/g, "/")}`, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.waitForTimeout(400);

  const result = await tab.evaluate(() => {
    const pages = Array.from(document.querySelectorAll(".page"));

    /* --- Overflow, per element --------------------------------------- */
    const overflow = [];
    pages.forEach((pageEl, pageIndex) => {
      const all = [pageEl, ...pageEl.querySelectorAll("*")];
      all.forEach((el) => {
        if (el.tagName === "IMG" || el.tagName === "SVG") return;
        const overY = el.scrollHeight - el.clientHeight;
        const overX = el.scrollWidth - el.clientWidth;
        if (overY > 1 || overX > 1) {
          overflow.push({
            page: pageIndex + 1,
            selector: `${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).trim().split(/\s+/).join(".")}` : ""}`,
            overY,
            overX,
            text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
          });
        }
      });
    });

    /* --- Overlap, between [data-block] pairs -------------------------- */
    const overlap = [];
    pages.forEach((pageEl, pageIndex) => {
      const blocks = Array.from(pageEl.querySelectorAll("[data-block]"));
      // Only compare blocks that are not nested inside one another: a child
      // inside its parent is containment, not a collision.
      for (let i = 0; i < blocks.length; i += 1) {
        for (let j = i + 1; j < blocks.length; j += 1) {
          const a = blocks[i];
          const b = blocks[j];
          if (a.contains(b) || b.contains(a)) continue;
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (w > 0.5 && h > 0.5) {
            overlap.push({
              page: pageIndex + 1,
              a: a.getAttribute("data-block"),
              b: b.getAttribute("data-block"),
              area: Math.round(w * h),
              aText: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
              bText: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
            });
          }
        }
      }
    });

    const blockCount = document.querySelectorAll("[data-block]").length;
    return { overflow, overlap, pages: pages.length, blockCount };
  });

  await browser.close();

  console.log("\n[2] OVERFLOW, per element, scrollHeight > clientHeight");
  console.log(`    ${result.pages} pages inspected`);
  if (result.overflow.length) {
    result.overflow.slice(0, 14).forEach((o) => {
      console.log(
        `    FAIL p${o.page} ${o.selector}  overY=${o.overY} overX=${o.overX}\n         "${o.text}"`,
      );
    });
    if (result.overflow.length > 14) {
      console.log(`    ... and ${result.overflow.length - 14} more`);
    }
    fail("overflow", `${result.overflow.length} element(s) clipping their content`);
  } else {
    console.log("    PASS, nothing is clipped");
  }

  console.log("\n[3] OVERLAP, between [data-block] pairs");
  console.log(`    ${result.blockCount} blocks compared`);
  if (result.overlap.length) {
    result.overlap.slice(0, 12).forEach((o) => {
      console.log(
        `    FAIL p${o.page} ${o.a} x ${o.b}  ${o.area}px^2\n         "${o.aText}"\n         "${o.bText}"`,
      );
    });
    fail("overlap", `${result.overlap.length} colliding block pair(s)`);
  } else {
    console.log("    PASS, no block intersects another");
  }
}

/* --------------------------------------------------- 4. Language scan */

function scanText(label, text, out) {
  const rules = [
    { name: "em dash U+2014", re: /\u2014/g },
    { name: "en dash U+2013", re: /\u2013/g },
    { name: "contraction n't", re: /\w'?n't\b|\bn't\b|\w n't\b|\w+n't\b/gi },
    { name: "contraction 're", re: /\w're\b/gi },
    { name: "contraction 've", re: /\w've\b/gi },
    { name: "contraction 'll", re: /\w'll\b/gi },
    { name: "contraction 'd", re: /\w'd\b/gi },
    { name: "contraction 'm", re: /\bI'm\b/gi },
    { name: "shorthand", re: /\b(shd|ppl|tgt|smth|abt)\b/gi },
  ];
  for (const rule of rules) {
    const found = text.match(rule.re);
    if (found) {
      out.push(`${label}: ${rule.name} x${found.length} (${[...new Set(found)].slice(0, 5).join(", ")})`);
    }
  }
}

function checkLanguage() {
  console.log("\n[4] LANGUAGE, PDF text plus HTML and CSS source");
  const hits = [];

  let pdfText = "";
  try {
    pdfText = execFileSync("pdftotext", [PDF, "-"], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    console.log(`    pdftotext extracted ${pdfText.length} characters`);
    scanText("pdf", pdfText, hits);
  } catch (error) {
    fail("language", `pdftotext failed: ${String(error.message).split("\n")[0]}`);
  }

  scanText("html", fs.readFileSync(HTML, "utf8"), hits);
  scanText("css", fs.readFileSync(path.join(HERE, "styles.css"), "utf8"), hits);
  scanText("content.json", fs.readFileSync(path.join(HERE, "content.json"), "utf8"), hits);

  if (hits.length) {
    hits.forEach((h) => console.log(`    FAIL ${h}`));
    fail("language", `${hits.length} rule violation(s)`);
  } else {
    console.log("    PASS, no em dashes, no en dashes, no contractions, no shorthand");
  }

  /*
   * Apostrophes are reported rather than failed, because possessives are
   * legitimate and only a person can tell the two apart.
   */
  const apostrophes = (pdfText.match(/\w['’]\w/g) || []).filter(
    (m) => !/s['’]/.test(m),
  );
  const unique = [...new Set(apostrophes)];
  if (unique.length) {
    console.log(`    review by hand, apostrophes in the PDF: ${unique.join(", ")}`);
    notes.push(`apostrophes to review: ${unique.join(", ")}`);
  }
}

/* ------------------------------------------------------- Manifest report */

function reportManifest() {
  console.log("\n[report] PROVENANCE, not a build gate");
  const dir = path.join(HERE, "assets", "screenshots");
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
  const listed = new Set(manifest.captures.map((c) => c.file));

  const html = fs.readFileSync(HTML, "utf8");
  const used = [...html.matchAll(/assets\/screenshots\/([^"]+)/g)].map((m) => m[1]);
  const unique = [...new Set(used)];

  const missing = unique.filter((f) => !listed.has(f));
  console.log(`    ${unique.length} distinct screenshots placed, ${listed.size} in the manifest`);
  console.log(`    commit ${manifest.commit}, source ${manifest.source}, scale ${manifest.deviceScaleFactor}x`);
  if (missing.length) {
    console.log(`    WARNING, no manifest entry: ${missing.join(", ")}`);
    notes.push(`unmanifested images: ${missing.join(", ")}`);
  } else {
    console.log("    every placed screenshot has a manifest entry");
  }

  const unusedCount = listed.size - unique.length;
  if (unusedCount > 0) {
    console.log(`    ${unusedCount} captured but not placed, which is expected headroom`);
  }
}

/* ------------------------------------------------------------------ Main */

async function main() {
  console.log("SIDEQUEST synopsis, QA");
  console.log(`  pdf   ${PDF}`);
  console.log(`  html  ${HTML}`);

  await checkGeometry();
  await checkLayout();
  checkLanguage();
  reportManifest();

  console.log(`\n${"".padEnd(60, "=")}`);
  if (failures.length) {
    console.log(`QA FAILED, ${failures.length} problem(s):`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  console.log("QA PASSED, all four checks clean.");
  notes.forEach((n) => console.log(`  note: ${n}`));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
