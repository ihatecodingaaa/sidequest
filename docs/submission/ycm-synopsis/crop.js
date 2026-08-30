/**
 * Deliberate crops, produced from the original captures with a real image
 * operation.
 *
 * The layout rules forbid cropping with CSS, because a CSS crop is invisible in
 * the source, unrecorded, and changes whenever a column changes width. A crop
 * that is a real file has a size, a parent, and an entry in the manifest.
 *
 * Run after capture.js, which rewrites manifest.json from scratch:
 *
 *   node docs/submission/ycm-synopsis/capture.js
 *   node docs/submission/ycm-synopsis/crop.js
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const sharp = require("sharp");

const HERE = __dirname;
const SHOTS = path.join(HERE, "assets", "screenshots");
const MANIFEST = path.join(SHOTS, "manifest.json");

/**
 * The page 3 band.
 *
 * Page 3 runs the district capture full bleed across all 297mm. At the
 * capture's own 2.16 to 1 that band is 137.2mm tall, which leaves about 44mm
 * for an eyebrow, a two line title, a caption, two paragraphs and the footer.
 * That does not fit, and the two ways out that are not allowed are shrinking
 * the body below 10.5pt and pushing the footer into the bottom margin.
 *
 * So the picture gives way instead. Trimming 196 pixels off the bottom takes
 * the frame to 2.60 to 1, which is 114.2mm at full width and leaves about 81mm
 * below it. The 196 pixels are taken entirely from the bottom rather than split,
 * because that is where the first run hint and the chat button sit: the crop
 * removes two pieces of transient interface chrome and keeps the XP pill, the
 * place name and the minimap intact. The touch pad and the court run off the
 * bottom edge, which is what a bleed is supposed to look like.
 */
const CROPS = [
  {
    from: "02-streets-district-landscape.png",
    to: "02b-streets-district-band.png",
    region: { left: 0, top: 0, width: 2532, height: 974 },
    why:
      "Trimmed 196px from the bottom to reach 2.60:1 for the page 3 full bleed " +
      "band. Removes the first run hint and the chat button. Nothing is added, " +
      "moved or retouched.",
  },
];

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const byFile = Object.fromEntries(manifest.captures.map((c) => [c.file, c]));
  const derived = [];

  for (const crop of CROPS) {
    const parent = byFile[crop.from];
    if (!parent) throw new Error(`no manifest entry for parent ${crop.from}`);

    const src = path.join(SHOTS, crop.from);
    const out = path.join(SHOTS, crop.to);
    await sharp(src).extract(crop.region).png().toFile(out);

    const meta = await sharp(out).metadata();
    const ratio = (meta.width / meta.height).toFixed(3);
    console.log(
      `  ${crop.to}  ${meta.width}x${meta.height}  ${ratio}:1  from ${crop.from}`,
    );

    derived.push({
      file: crop.to,
      derivedFrom: crop.from,
      operation: "crop",
      region: crop.region,
      why: crop.why,
      pixels: { width: meta.width, height: meta.height },
      aspect: Number(ratio),
      // Provenance is inherited: a crop of a live capture is still that capture.
      route: parent.route,
      url: parent.url,
      viewport: parent.viewport,
      deviceScaleFactor: parent.deviceScaleFactor,
      capturedAt: parent.capturedAt,
      croppedAt: new Date().toISOString(),
      commit: execSync("git rev-parse HEAD", { cwd: path.join(HERE, "..", "..", "..") })
        .toString()
        .trim(),
      source: parent.source,
      method: "sharp extract, from the original capture. No CSS clipping anywhere.",
    });
  }

  manifest.derived = derived;
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n  ${derived.length} derived image(s) recorded in manifest.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
