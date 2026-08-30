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
node docs/submission/ycm-synopsis/wordcount.js   # word budgets and language rules
node docs/submission/ycm-synopsis/generate.js    # index.html, then the PDF
node docs/submission/ycm-synopsis/qa.js          # four checks, exits non-zero on failure
node docs/submission/ycm-synopsis/preview.js     # PDF pages back to PNG for review
```

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
| `wordcount.js` | Word budget and language check. Run before layout. |
| `qa.js` | The four build gates. |
| `preview.js` | Rasterises the finished PDF with pdf.js for visual review. |
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
  aspect ratio, so nothing is stretched and nothing is cropped by CSS.
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

**The page 3 landscape capture occupies 36 per cent of the content area, not the
60 per cent the brief asked for.** It renders at 192.4 mm by 88.9 mm, which is
50 per cent of the area actually available between the title and the footer. Sixty
per cent of the full content area is not reachable: a 2.16 to 1 image spanning
the full 263 mm text width is 121.5 mm tall, and with a two line title, a caption
and two paragraphs of body the page has about 130 mm of vertical room in total.
The theoretical ceiling, with no body copy at all, is 67 per cent. The image is
still the dominant element on the page.

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
