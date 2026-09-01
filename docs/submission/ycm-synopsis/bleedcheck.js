/**
 * Confirms a full bleed band actually reaches the paper edge.
 *
 * Reads the rasterised PDF pages, not the HTML. The same method found the
 * scrollbar gutter during capture: sample the outermost pixel columns and see
 * whether they are picture or page background. A band that stops one millimetre
 * short looks fine in a browser and looks like a mistake in print, and no
 * layout assertion catches it because the CSS is correct either way.
 *
 * Run preview.js first.
 *
 * Usage:  node docs/submission/ycm-synopsis/bleedcheck.js
 */

const path = require("node:path");
const sharp = require("sharp");

const HERE = __dirname;
const PREVIEW = path.join(HERE, "assets", "preview");

/** The page background, from styles.css --paper. Anything else is picture. */
const PAPER = { r: 0x0a, g: 0x0b, b: 0x12 };
/** Room for the page sheen gradient, which tints the background slightly. */
const NEAR = 26;

const BANDS = [
  { page: 1, name: "cover-band", sampleAtY: 0.18 },
  { page: 3, name: "page-3-band", sampleAtY: 0.3 },
];

function isPaper(px) {
  return (
    Math.abs(px[0] - PAPER.r) <= NEAR &&
    Math.abs(px[1] - PAPER.g) <= NEAR &&
    Math.abs(px[2] - PAPER.b) <= NEAR
  );
}

async function main() {
  let failed = 0;
  console.log("BLEED CHECK, sampled from the rasterised PDF pages\n");

  for (const band of BANDS) {
    const file = path.join(PREVIEW, `page-${String(band.page).padStart(2, "0")}.png`);
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    const y = Math.floor(height * band.sampleAtY);
    const at = (x) => {
      const i = (y * width + x) * channels;
      return [data[i], data[i + 1], data[i + 2]];
    };

    const left = at(0);
    const right = at(width - 1);
    const leftOk = !isPaper(left);
    const rightOk = !isPaper(right);

    // How far in the picture actually starts, in millimetres, from each side.
    const mmPerPx = 297 / width;
    let insetL = 0;
    while (insetL < width && isPaper(at(insetL))) insetL += 1;
    let insetR = 0;
    while (insetR < width && isPaper(at(width - 1 - insetR))) insetR += 1;

    const verdict = leftOk && rightOk ? "PASS" : "FAIL";
    if (verdict === "FAIL") failed += 1;

    console.log(`  ${verdict}  p${band.page} ${band.name}, row y=${y} of ${height}`);
    console.log(
      `        leftmost  rgb(${left.join(",")})  ${leftOk ? "picture" : "PAGE BACKGROUND"}` +
        `${insetL ? `, picture starts ${(insetL * mmPerPx).toFixed(2)}mm in` : ""}`,
    );
    console.log(
      `        rightmost rgb(${right.join(",")})  ${rightOk ? "picture" : "PAGE BACKGROUND"}` +
        `${insetR ? `, picture starts ${(insetR * mmPerPx).toFixed(2)}mm in` : ""}`,
    );
  }

  console.log("");
  if (failed) {
    console.log(`BLEED CHECK FAILED, ${failed} band(s) do not reach the edge.`);
    process.exit(1);
  }
  console.log("BLEED CHECK PASSED, every band reaches both paper edges.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
