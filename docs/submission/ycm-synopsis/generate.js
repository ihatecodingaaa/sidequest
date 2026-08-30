/**
 * Builds index.html from content.json, then renders the PDF.
 *
 * Copy is locked before layout exists, which is why content.json is the input
 * and not a set of strings buried in this file. If a page will not fit, the
 * fix is to cut words in content.json and rerun. Nothing here shrinks type.
 *
 * ---
 *
 * ## Page geometry
 *
 * `preferCSSPageSize: true` takes the size from the `@page` rule in
 * styles.css, which names 297mm by 210mm. `generate.js --explicit` switches to
 * passing `width` and `height` to `page.pdf()` instead. Both paths were tried
 * against the installed Chromium and both produce landscape; the CSS path is
 * the default because the size then lives in one place. qa.js reads the real
 * `/MediaBox` back out of the finished file either way, because a previous
 * attempt shipped A4 portrait while believing it had asked for landscape.
 *
 * ## Which images land where
 *
 * Page 4's landscape slot and page 5's pair are chosen here, at layout time,
 * from the candidates content.json lists. That is deliberate: the choice
 * depends on how the images sit on the page, which is not knowable while the
 * copy is being written.
 *
 * Usage:  node docs/submission/ycm-synopsis/generate.js [--explicit] [--html-only]
 */

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const HERE = __dirname;
const OUT_HTML = path.join(HERE, "index.html");
const OUT_PDF = path.join(
  HERE,
  "..",
  "SIDEQUEST_Content_and_Experience_Synopsis.pdf",
);

const args = process.argv.slice(2);
const useExplicitSize = args.includes("--explicit");
const htmlOnly = args.includes("--html-only");

const content = JSON.parse(fs.readFileSync(path.join(HERE, "content.json"), "utf8"));

/*
 * Captured pixel dimensions, so a frame can be given its image's exact aspect
 * ratio. Without it a contained image sits in a bordered box wider than
 * itself and the letterboxing reads as a mistake. `object-fit: contain` is
 * still what draws the image: the ratio only stops the box being the wrong
 * shape. Nothing is cropped by CSS anywhere in this document.
 */
const manifest = JSON.parse(
  fs.readFileSync(path.join(HERE, "assets", "screenshots", "manifest.json"), "utf8"),
);
const DIMS = Object.fromEntries(manifest.captures.map((c) => [c.file, c.pixels]));
const page = (id) => content.pages.find((p) => p.id === id);

/* ------------------------------------------------------- Layout decisions */

/*
 * Page 4 takes the Quest List for its landscape slot rather than the interior.
 * The page argues that nothing is gated behind walking, and the Quest List is
 * the evidence for that sentence. The interior is a nicer picture and it
 * answers a question this page does not ask.
 */
const PAGE4_LANDSCAPE = "04-streets-quest-list-landscape.png";

/*
 * Page 5 takes REWIND and Norm Mirror. Both are reveals with a labelled before
 * and after on screen, which is the family resemblance the page is describing,
 * and the Norm Mirror frame carries its own prototype data label. BREAKSAFE is
 * the most static of the three and reads perfectly well in words.
 */
const PAGE5_PAIR = [
  "07-rewind-affordance-portrait.png",
  "08-norm-mirror-reveal-portrait.png",
];

const SHOTS = "assets/screenshots";
const QR = "assets/qr/sidequest-prototype.png";

/* ------------------------------------------------------------- Utilities */

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let blockSeq = 0;
/** Every content block carries a data-block. qa.js measures them in pairs. */
function block(className, inner, extra = "") {
  blockSeq += 1;
  return `<div class="${className}" data-block="b${blockSeq}"${extra ? ` ${extra}` : ""}>${inner}</div>`;
}

function shot(file, caption, { className = "" } = {}) {
  const cap = caption ? `<p class="caption">${esc(caption)}</p>` : "";
  const d = DIMS[file];
  const ratio = d ? ` style="aspect-ratio:${d.width}/${d.height}"` : "";
  return `<figure class="figure ${className}" style="margin:0">
      <span class="shot"${ratio}><img src="${SHOTS}/${esc(file)}" alt=""></span>
      ${cap}
    </figure>`;
}

function foot(n, label) {
  return `<div class="page-foot" data-block="foot${n}">
      <span>SIDEQUEST, Content and Experience Synopsis</span>
      <span>${esc(label)}</span>
      <span class="num">${n} / 11</span>
    </div>`;
}

/* --------------------------------------------------------- Signal glyphs */

/*
 * The four silhouettes, redrawn from `drawSignal` in
 * src/features/streets/game/world-engine.ts at the same proportions. A ring, a
 * flat topped shield, an asymmetric chevron and an octagon. Nothing here was
 * invented for this document: the shapes, the colours and the labels are the
 * product's own, and the reason they carry shape as well as colour is that
 * around one in twelve men has a red-green colour vision deficiency.
 *
 * The engine draws in a 12 unit box around a centre point. This keeps that
 * box and moves the origin to the top left so it can be a standalone icon.
 */
function signalGlyph(mode, colour, light) {
  const c = 6.4;
  const body = {
    connect: `<circle cx="${c}" cy="${c}" r="4.6" fill="${colour}"/>
              <circle cx="${c}" cy="${c}" r="1.9" fill="#0a0b12"/>`,
    prevent: `<path d="M${c - 4.4} ${c - 4.4} H${c + 4.4} V${c + 0.6}
              Q${c + 4.4} ${c + 4.2} ${c} ${c + 5.4}
              Q${c - 4.4} ${c + 4.2} ${c - 4.4} ${c + 0.6} Z" fill="${colour}"/>`,
    redirect: `<path d="M${c - 5} ${c - 4.6} H${c + 0.4} L${c + 5.2} ${c}
               L${c + 0.4} ${c + 4.6} H${c - 5} L${c - 0.6} ${c} Z" fill="${colour}"/>`,
    protect: (() => {
      const pts = [];
      for (let i = 0; i < 8; i += 1) {
        const a = (Math.PI / 4) * i + Math.PI / 8;
        pts.push(`${(c + Math.cos(a) * 5.2).toFixed(2)},${(c + Math.sin(a) * 5.2).toFixed(2)}`);
      }
      return `<polygon points="${pts.join(" ")}" fill="${colour}"/>`;
    })(),
  }[mode];

  // The same top-left highlight the engine paints on everything in the world.
  const highlight = `<rect x="${c - 2.4}" y="${c - 4.8}" width="3" height="1.4" fill="${light}"/>`;

  return `<svg class="signal-glyph" viewBox="0 0 12.8 12.8" role="img" aria-label="${esc(mode)} signal">
      ${body}${highlight}
    </svg>`;
}

/* ------------------------------------------------------------- The pages */

/*
 * The cover is a full width hero band with the title block beneath it.
 *
 * The brief asked for a title block on the left 40 per cent and the hero on
 * the right 60 per cent. That split cannot be honoured for this image without
 * breaking one of the brief's own rules. The hero is 2.16 to 1; a 60 per cent
 * column is roughly 0.85 to 1. Filling that column means a CSS crop, which the
 * layout rules forbid, and which showed 39 per cent of the frame. Containing
 * the image in that column instead leaves about 150mm of empty page.
 *
 * A full width band resolves it in favour of the picture: the hero runs 297mm
 * rather than 178mm, nothing is cropped, and the whole street is visible. The
 * deviation is recorded in README.md.
 */
function coverPage() {
  const p = page("cover");
  const d = DIMS[p.image];
  return `<section class="page cover">
    <div class="page-inner">
      ${block(
        "cover-band",
        `<span class="shot" style="aspect-ratio:${d.width}/${d.height}"><img src="${SHOTS}/${p.image}" alt=""></span>`,
      )}
      ${block(
        "cover-bottom",
        `<div>
          <h1 class="cover-wordmark">${esc(p.title)}</h1>
          <div class="cover-rule"></div>
          <p class="cover-subtitle">${esc(p.subtitle)}</p>
          <p class="cover-meta">${esc(p.meta)}</p>
        </div>
        <div class="cover-say">
          <p class="cover-hero">${esc(p.hero)}</p>
          <p class="cover-descriptor">${esc(p.descriptor)}</p>
          <p class="cover-availability">${esc(p.availability)}</p>
          <p class="cover-url">${esc(content.document.urlShort)}</p>
        </div>
        <div>
          <div class="qr"><img src="${QR}" alt=""></div>
          <p class="qr-caption">${esc(p.qrCaption)}</p>
        </div>`,
      )}
    </div>
  </section>`;
}

function problemPage() {
  const p = page("problem");
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">The problem</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "problem-body",
        `<div>
          <p class="statement">${esc(p.lead)}</p>
          <div style="margin-top:7mm" class="card">
            <p class="body-tight" style="color:var(--chalk)">${esc(p.argument)}</p>
          </div>
        </div>
        <div>
          <div class="figure-block">
            <div class="figure-value">${esc(p.figure.value)}</div>
            <div>
              <p class="figure-unit">${esc(p.figure.unit)}</p>
              <p class="body-tight">${esc(p.figure.caption)}</p>
            </div>
          </div>
          <ul class="statements">
            ${p.statements.map((s) => `<li>${esc(s)}</li>`).join("")}
          </ul>
          <p class="source-line">Source: ${esc(p.sourceLine)}</p>
        </div>`,
      )}
      ${block(
        "compare-split",
        `<div class="compare-side">
          <span class="compare-label">${esc(p.comparison.beforeLabel)}</span>
          <div class="chips">${p.comparison.before.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
        </div>
        <span class="compare-arrow">&#8594;</span>
        <div class="compare-side">
          <span class="compare-label">${esc(p.comparison.afterLabel)}</span>
          <div class="chips">${p.comparison.after.map((c) => `<span class="chip chip-live">${esc(c)}</span>`).join("")}</div>
        </div>`,
      )}
      ${foot(2, "The problem")}
    </div>
  </section>`;
}

function worldPage() {
  const p = page("world");
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">SIDEQUEST Streets</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "world-grid",
        `${shot(p.image, p.imageCaption)}
         <div class="world-body">
           ${p.body.map((t) => `<p class="body">${esc(t)}</p>`).join("")}
         </div>`,
      )}
      ${foot(3, "Streets, the world")}
    </div>
  </section>`;
}

function alivePage() {
  const p = page("alive");
  const portrait = p.images[0];
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">SIDEQUEST Streets</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "alive-grid",
        `<div class="features">
          ${p.features
            .map(
              (f) => `<div class="feature">
                <span class="feature-label">${esc(f.label)}</span>
                <span class="feature-text">${esc(f.text)}</span>
              </div>`,
            )
            .join("")}
        </div>
        ${shot(portrait.file, portrait.caption)}
        <div class="alive-right">
          ${shot(PAGE4_LANDSCAPE, "The Quest List")}
          <div class="card card-strong">
            <p class="body-tight" style="color:var(--chalk)">${esc(p.accessibility)}</p>
          </div>
        </div>`,
      )}
      ${block(
        "",
        `<span class="compare-label" style="display:block;margin-bottom:2.5mm">${esc(p.loopLabel)}</span>
         <div class="loop">
           ${p.loop
             .map(
               (s, i) =>
                 `${i ? '<span class="loop-arrow">&#8594;</span>' : ""}<span class="loop-step">${esc(s)}</span>`,
             )
             .join("")}
         </div>`,
      )}
      ${foot(4, "Streets, alive")}
    </div>
  </section>`;
}

function mechanicsPage() {
  const p = page("mechanics");
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">Core mechanics</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "mechanics-grid",
        `<div class="mechanic-list">
          ${p.mechanics
            .map(
              (m) => `<div class="mechanic">
                <span class="mechanic-rule"></span>
                <div>
                  <p class="mechanic-name">${esc(m.name)}</p>
                  <p class="body-tight">${esc(m.text)}</p>
                </div>
              </div>`,
            )
            .join("")}
        </div>
        <div class="shot-pair">
          ${PAGE5_PAIR.map((f) => shot(f, p.imageCaptions[f])).join("")}
        </div>`,
      )}
      ${block(
        "",
        `<div class="card card-strong">
          <p class="body-tight" style="color:var(--chalk)">${esc(p.crewShiftNote)}</p>
          <p class="footnote" style="margin-top:2.5mm">${esc(p.noScores)}</p>
        </div>`,
      )}
      ${foot(5, "Core mechanics")}
    </div>
  </section>`;
}

function threadsPage() {
  const p = page("threads");
  const modes = content.signals.modes;
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">Prevention Threads and Signals</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "threads-grid",
        `${shot(p.image, p.imageCaption)}
        <div class="threads-right">
          <div>
            <p class="thread-name">${esc(p.threadName)}</p>
            <p class="body">${esc(p.thread)}</p>
          </div>
          <div>
            <span class="compare-label" style="display:block;margin-bottom:3mm">${esc(p.signalsLabel)}</span>
            <div class="signals">
              ${modes
                .map(
                  (m) => `<div class="signal">
                    ${signalGlyph(m.id, m.colour, m.colourLight)}
                    <span class="signal-label" style="color:${m.colour}">${esc(m.label)}</span>
                    <span class="signal-means">${esc(m.means)}</span>
                  </div>`,
                )
                .join("")}
            </div>
          </div>
          <div class="card">
            <p class="body-tight" style="color:var(--chalk)">${esc(p.signalsNote)}</p>
            <p class="footnote" style="margin-top:2mm">${esc(p.channelsNote)}</p>
          </div>
        </div>`,
      )}
      ${block("", `<p class="guardrail">${esc(p.guardrail)}</p>`)}
      ${foot(6, "Threads and Signals")}
    </div>
  </section>`;
}

function participationPage() {
  const p = page("participation");
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">Youth participation</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "participation-grid",
        `<div class="roles">
          ${p.roles
            .map(
              (r) => `<div class="role">
                <span class="role-name">${esc(r.name)}</span>
                <span class="role-text">${esc(r.text)}</span>
              </div>`,
            )
            .join("")}
        </div>
        <div class="shot-pair">
          ${p.images.map((i) => shot(i.file, i.caption)).join("")}
        </div>`,
      )}
      ${block(
        "",
        `<div class="card card-strong">
          <p class="body-tight" style="color:var(--chalk)">${esc(p.rolesNote)}</p>
          <p class="footnote" style="margin-top:2.5mm">${esc(p.crewNote)}</p>
        </div>`,
      )}
      ${foot(7, "Youth participation")}
    </div>
  </section>`;
}

function rewardsPage() {
  const p = page("rewards");
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">Rewards and integrity</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "rewards-grid",
        `${shot(p.image, p.imageCaption)}
        <div class="rewards-right">
          <div class="points">
            ${p.points
              .map(
                (pt) => `<div>
                  <p class="point-label">${esc(pt.label)}</p>
                  <p class="body-tight">${esc(pt.text)}</p>
                </div>`,
              )
              .join("")}
          </div>
          <div class="honesty">
            <p class="body" style="color:var(--chalk)">${esc(p.partnerHonesty)}</p>
          </div>
          <div>
            <span class="compare-label" style="display:block;margin-bottom:3mm">Guardrails</span>
            <ul class="guardrails">
              ${p.guardrails.map((g) => `<li>${esc(g)}</li>`).join("")}
            </ul>
          </div>
        </div>`,
      )}
      ${foot(8, "Rewards and integrity")}
    </div>
  </section>`;
}

function pilotPage() {
  const p = page("pilot");
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">Six month pilot</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "pilot-grid",
        `<div class="starting">
          <span class="starting-tag">Starting position</span>
          <p class="body" style="color:var(--chalk)">${esc(p.startingPosition)}</p>
        </div>
        <div class="timeline">
          <span class="timeline-rail"></span>
          ${p.timeline
            .map(
              (t) => `<div class="stop">
                <span class="stop-when">${esc(t.when)}</span>
                <span class="stop-what">${esc(t.what)}</span>
              </div>`,
            )
            .join("")}
        </div>
        <div>
          <p class="target-line" style="margin-bottom:5mm">${esc(p.target)}</p>
          <div class="pilot-notes">
            <p class="body-tight">${esc(p.sessionsNote)}</p>
            <p class="body-tight">${esc(p.risk)}</p>
          </div>
        </div>`,
      )}
      ${foot(9, "Six month pilot")}
    </div>
  </section>`;
}

function measurementPage() {
  const p = page("measurement");
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">Measurement</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "",
        `<table class="measure-table">
          <thead><tr>
            ${p.columns.map((c) => `<th>${esc(c)}</th>`).join("")}
          </tr></thead>
          <tbody>
            ${p.measures
              .map(
                (m) => `<tr>
                  <td class="m-name">${esc(m.measure)}</td>
                  <td class="m-asks">${esc(m.asks)}</td>
                  <td class="m-expected">${esc(m.expected)}</td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>`,
      )}
      ${block(
        "boundary-grid",
        `<div>
          <p class="body" style="color:var(--chalk)">${esc(p.boundary)}</p>
          <p class="footnote" style="margin-top:3mm">${esc(p.privacy)}</p>
        </div>
        <div class="pull">
          <p class="pull-quote">&#8220;${esc(p.verbatim)}&#8221;</p>
          <p class="pull-source">${esc(p.verbatimSource)}</p>
        </div>`,
      )}
      ${foot(10, "Measurement")}
    </div>
  </section>`;
}

function scalePage() {
  const p = page("scale");
  const d = p.diagram;
  return `<section class="page">
    <div class="page-inner">
      ${block(
        "",
        `<p class="eyebrow">Scale</p><h2 class="page-title">${esc(p.title)}</h2>`,
      )}
      ${block(
        "scale-grid",
        `<div class="pipeline">
          <span class="tier tier-engine">${esc(d.engine)}</span>
          <span class="pipe-arrow">&#8594;</span>
          <div>
            <span class="tier tier-packs" style="display:block;margin-bottom:5mm">${esc(d.packs)}</span>
            <div class="destinations">
              ${d.destinations.map((x) => `<span class="destination">${esc(x)}</span>`).join("")}
            </div>
          </div>
        </div>
        <p class="body">${esc(p.body)}</p>`,
      )}
      ${block(
        "close-grid",
        `<div>
          <p class="close-hero">${esc(p.hero)}</p>
          <p class="cover-url">${esc(content.document.urlShort)}</p>
        </div>
        <div>
          <div class="qr"><img src="${QR}" alt=""></div>
          <p class="qr-caption">${esc(p.qrCaption)}</p>
        </div>
        <div>
          <p class="sources-label">Sources</p>
          <ul class="sources">
            ${p.sources.map((s) => `<li>${esc(s)}</li>`).join("")}
          </ul>
        </div>`,
      )}
      ${foot(11, "Scale and close")}
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ Build */

function buildHtml() {
  const pages = [
    coverPage(),
    problemPage(),
    worldPage(),
    alivePage(),
    mechanicsPage(),
    threadsPage(),
    participationPage(),
    rewardsPage(),
    pilotPage(),
    measurementPage(),
    scalePage(),
  ].join("\n");

  return `<!doctype html>
<html lang="en-SG">
<head>
<meta charset="utf-8">
<title>SIDEQUEST, Content and Experience Synopsis</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
${pages}
</body>
</html>
`;
}

async function main() {
  const html = buildHtml();
  fs.writeFileSync(OUT_HTML, html);
  console.log(`html      ${OUT_HTML}`);
  if (htmlOnly) return;

  const browser = await chromium.launch({ args: ["--hide-scrollbars"] });
  const context = await browser.newContext();
  const tab = await context.newPage();

  await tab.goto(`file://${OUT_HTML.replace(/\\/g, "/")}`, {
    waitUntil: "load",
  });
  // Fonts decide line breaks, so nothing is measured or printed before they
  // are ready. `load` alone does not wait for a woff2 that CSS asked for.
  await tab.evaluate(() => document.fonts.ready);
  await tab.waitForTimeout(400);

  const options = useExplicitSize
    ? { path: OUT_PDF, printBackground: true, width: "297mm", height: "210mm" }
    : { path: OUT_PDF, printBackground: true, preferCSSPageSize: true };

  await tab.pdf(options);
  await browser.close();

  const size = fs.statSync(OUT_PDF).size;
  console.log(`pdf       ${OUT_PDF}`);
  console.log(`size      ${(size / 1048576).toFixed(2)} MB`);
  console.log(`geometry  ${useExplicitSize ? "explicit width and height" : "preferCSSPageSize"}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
