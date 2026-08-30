# YCM synopsis, build

Generates `docs/submission/SIDEQUEST_Content_and_Experience_Synopsis.pdf`, the
Young ChangeMakers / Delta Challenge 2026 Track B submission document. Eleven
pages, A4 landscape.

This is an evaluator document, not an engineering handover.

## The governing rule

Nothing in the document asserts a fact the build did not establish. That covers
statistics, partnerships and pilot results, and it covers screenshots: an image
with no recorded provenance is an unestablished claim, so every image in the PDF
has an entry in `assets/screenshots/manifest.json` naming the route, the
viewport, the device scale factor, the capture time, the git commit and whether
it came from the live deployment or a local build.

External figures live in `sources.json` with their publisher, URL and retrieval
date. A figure that is not in that file may not appear in the document.

## Running it

```bash
node docs/submission/ycm-synopsis/capture.js     # screenshots, writes manifest.json
node docs/submission/ycm-synopsis/crop.js        # deliberate crops, adds manifest.derived
node docs/submission/ycm-synopsis/wordcount.js   # word budgets and language rules
node docs/submission/ycm-synopsis/generate.js    # index.html, then the PDF
node docs/submission/ycm-synopsis/qa.js          # five checks, exits non-zero on failure
node docs/submission/ycm-synopsis/preview.js     # PDF pages back to PNG for review
node docs/submission/ycm-synopsis/bleedcheck.js  # bleed bands reach the paper edge
```

`crop.js` must run after `capture.js`, which rewrites `manifest.json` from
scratch. `bleedcheck.js` must run after `preview.js`, which is what it reads.

`capture.js --local` points at `http://127.0.0.1:3100` instead of the live
deployment. `generate.js --explicit` passes an explicit page width and height to
`page.pdf()` rather than relying on `preferCSSPageSize`.

## Files

| File | What it is |
| ---- | ---------- |
| `content.json` | Every word in the document, with a word budget per page. Copy is locked here before any layout exists. |
| `sources.json` | External figures, with publisher, URL and retrieval date. |
| `styles.css` | Print stylesheet. A4 landscape geometry, type scale, page layouts. |
| `generate.js` | Builds `index.html` from `content.json`, then renders the PDF. Chooses which capture lands in which slot. |
| `capture.js` | Playwright screenshot capture. Writes `manifest.json`. |
| `crop.js` | Deliberate crops from the originals, recorded in `manifest.derived`. |
| `wordcount.js` | Word budget and language check. Run before layout. |
| `qa.js` | The five build gates. |
| `preview.js` | Rasterises the finished PDF with pdf.js for visual review. |
| `bleedcheck.js` | Samples the rasterised pages to confirm each bleed band reaches both paper edges. |
| `index.html` | Generated. Do not edit by hand: `generate.js` overwrites it. |

## QA, and why each check exists

Every check is aimed at a defect that actually shipped in an earlier attempt,
not at one that is merely conceivable.

1. **Page geometry**, read from the PDF's own `/MediaBox` with `pdf-lib`. The
   earlier attempt produced A4 portrait while believing it had asked for
   landscape, so this reads the artefact rather than the intent.
2. **Overflow, per element**, `scrollHeight > clientHeight` on every element
   inside a `.page`. Deliberately per element and not per document: the dominant
   defect last time was card bodies clipped mid sentence, which a document level
   test cannot see.
3. **Overlap**, bounding box intersection between every pair of `[data-block]`
   elements on a page. Catches a callout dropped on top of live text.
4. **Language**, over `pdftotext` output plus the HTML, CSS and `content.json`
   source. No U+2014, no U+2013, no contractions, no shorthand. Apostrophes are
   reported for review rather than failed, because possessives are legitimate.
5. **Safe area**, every `[data-block]` at least 14 mm inside all four page
   edges, measured on the content box rather than the border box so that a full
   width container whose own padding insets its text is not failed for the width
   of its background. Two blocks are exempt and both are named in the output:
   `cover-band` on page 1 and `page-3-band` on page 3. The rule is not relaxed.
   Exemption requires a `data-bleed` attribute, so a third bleeding block fails.

`bleedcheck.js` runs outside the suite and confirms from the rasterised pages
that each named bleed band actually reaches the paper. It found both bands
stopping 0.18 mm short on the left and 0.35 mm short on the right: sub pixel
rounding between the frame box and a contained image. Bands now size by width
with the height left to follow, so there is no box for the picture to be centred
in and nothing to round.

Page count, file size and manifest coverage are reported alongside. Manifest
coverage is a report, not a gate.

## Measured geometry

`pdf-lib` reads every page as **841.92 x 594.96 pt**. A4 landscape is 841.89 x
595.28 pt, so each page is within 0.33 pt, about 0.12 mm, on both axes. The
difference is Chromium rounding millimetres to points when it writes the
`/MediaBox`, and it is the same on the `preferCSSPageSize` path and the explicit
width and height path. The check allows 0.5 pt.

## Layout rules

- Every content block participates in a grid and carries a `data-block`
  attribute. Nothing is absolutely positioned over flowing content.
- No fixed height on anything containing text. Cards size to their content.
- Images are `object-fit: contain` and each frame carries its capture's own
  aspect ratio, so nothing is stretched and nothing is cropped by CSS. Full
  bleed bands are the exception: they size by width with the height left to
  follow, which is what removes the sub pixel gap at the paper edge. Where a
  crop is genuinely needed it is a real file made by `crop.js`, never CSS.
- Body copy never goes below 10.5 pt. When a page will not fit, the words are
  cut in `content.json`, never the type size and never the images.
- `::-webkit-scrollbar` is zeroed. Chromium reserves a 15 CSS pixel scrollbar
  gutter, and a gutter appearing during `page.pdf()` shifts every column on the
  page. The same fix was needed during capture for the same reason.

## Fonts

Plus Jakarta Sans and Space Grotesk, the product's own faces, copied from the
application build at `.next/static/media/` into `assets/fonts/`. Nothing was
downloaded. Both are variable faces: Plus Jakarta Sans 200 to 800, Space Grotesk
300 to 700.

Tight display leading leaves the inline box taller than its line box, because an
inline box is as tall as the font ascent plus descent, about 1.16 em for Space
Grotesk. Rather than loosen the leading, the difference is absorbed with
`padding-block` so the element genuinely contains its own text and check 2
passes honestly.

## Deviations from the original brief, and why

**The cover is a full width hero band with the title block beneath it, not a
title block on the left 40 per cent and the hero on the right 60 per cent.**

Those two instructions conflict for this image. The hero is 2.16 to 1; a 60 per
cent column on A4 landscape is about 0.85 to 1. Filling that column means a CSS
crop, which the brief's own image rule forbids, and which showed 39 per cent of
the frame. Containing the image in that column instead leaves about 150 mm of
empty page. The band resolves it in favour of the picture: the hero runs 297 mm
rather than 178 mm, and the whole street is visible with nothing cropped.

**Page 3 crops its capture to 2.60 to 1 rather than running the original 2.16 to
1 frame.** The page runs the district capture full bleed across all 297 mm. At
the original ratio that band is 137.2 mm tall and leaves about 44 mm for an
eyebrow, a two line title, a caption, two paragraphs and the footer, which does
not fit. Shrinking the body below 10.5 pt and pushing the footer into the bottom
margin were both ruled out, so the picture gave way instead.

`crop.js` trims 196 pixels from the bottom of the original with a real image
operation, never with CSS. Taking it all from the bottom rather than splitting it
removes the first run hint and the chat button and keeps the XP pill, the place
name and the minimap intact. The result is 114.2 mm tall at full width, which
leaves 95.8 mm below it, and the band is **71.7 per cent of the content area**,
comfortably past the 60 per cent the brief asked for. The crop is recorded in
`manifest.derived` with its parent, its region and its reason.

## Dependencies

Installed with `npm install --no-save`, so `package.json` and the lockfile are
untouched. Resolved versions at build time:

| Package | Version | Used for |
| ------- | ------- | -------- |
| `playwright` | 1.62.1 | Capture, PDF rendering, layout checks |
| `sharp` | 0.35.3 | Contact sheet, image inspection |
| `qrcode` | 1.5.4 | QR generation |
| `pdf-lib` | 1.17.1 | Reading `/MediaBox` and page count from the PDF |
| `pdfjs-dist` | 6.3.289 | Rasterising PDF pages for visual review |
| `jsqr` | 1.4.0 | Decoding the QR back out of a rendered page |

`playwright`, `sharp` and `qrcode` are already project dependencies. The other
three are QA only.

`pdftotext` comes from poppler and ships with Git for Windows. `pdfinfo` and
`pdftoppm` are **not** available in this environment, which is why page geometry
is read with `pdf-lib` and pages are rasterised with `pdf.js` rather than with
poppler.

## What is committed, and what is not

The repository already excludes bulk screenshots from version control:
`.gitignore` excludes `/artifacts` with a written rationale, and `/.shots`
alongside it. That convention is kept here. The generation source, the manifest,
the fonts, the QR and the finished PDF are committed. The raw captures and the
page previews are not: both are regenerable from committed source, and together
they are over 10 MB of PNG.

The PDF itself is the exception to the no-binaries convention, and deliberately
so: it is the submission artefact. It is 3.9 MB.
