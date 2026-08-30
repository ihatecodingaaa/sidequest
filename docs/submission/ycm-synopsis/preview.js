/**
 * Renders the finished PDF back to PNG, one file per page, for visual review.
 *
 * The pages are rasterised with pdf.js from the PDF's own bytes. Screenshotting
 * the `.page` elements out of index.html would be easier and would prove the
 * wrong thing: it checks the HTML, not the artefact, and it is exactly the
 * substitution that would have let a portrait PDF through while every element
 * measured correctly in the browser.
 *
 * pdf.js ships as ES modules, which a file:// page cannot import, so the files
 * are served over a short lived local HTTP server for the duration of the run.
 *
 * Usage:  node docs/submission/ycm-synopsis/preview.js [--scale=2]
 */

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const HERE = __dirname;
const ROOT = path.join(HERE, "..", "..", "..");
const PDF_REL = "docs/submission/SIDEQUEST_Content_and_Experience_Synopsis.pdf";
const OUT = path.join(HERE, "assets", "preview");

const scaleArg = process.argv.find((a) => a.startsWith("--scale="));
const SCALE = scaleArg ? Number(scaleArg.slice(8)) : 2;

const TYPES = {
  ".mjs": "text/javascript",
  ".js": "text/javascript",
  ".pdf": "application/pdf",
  ".html": "text/html",
  ".wasm": "application/wasm",
  ".bcmap": "application/octet-stream",
};

const PAGE_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:#22242e}
  canvas{display:block}
</style></head>
<body>
<script type="module">
  import * as pdfjs from "/node_modules/pdfjs-dist/build/pdf.min.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.min.mjs";

  window.renderAll = async (url, scale) => {
    const doc = await pdfjs.getDocument({ url, cMapUrl: "/node_modules/pdfjs-dist/cmaps/", cMapPacked: true }).promise;
    const sizes = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
      const p = await doc.getPage(n);
      const viewport = p.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.id = "page" + n;
      document.body.appendChild(canvas);
      await p.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      const unscaled = p.getViewport({ scale: 1 });
      sizes.push({ page: n, widthPt: unscaled.width, heightPt: unscaled.height });
    }
    return { pages: doc.numPages, sizes };
  };
</script>
</body></html>`;

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      if (url === "/preview.html") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(PAGE_HTML);
        return;
      }
      const file = path.join(ROOT, url.replace(/^\/+/, ""));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
      });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f), { force: true });

  const server = await serve();
  const port = server.address().port;

  const browser = await chromium.launch({ args: ["--hide-scrollbars"] });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const tab = await context.newPage();
  tab.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

  await tab.goto(`http://127.0.0.1:${port}/preview.html`, { waitUntil: "load" });
  await tab.waitForFunction(() => typeof window.renderAll === "function");

  const info = await tab.evaluate(
    ([url, scale]) => window.renderAll(url, scale),
    [`/${PDF_REL}`, SCALE],
  );

  console.log(`rendered ${info.pages} pages from the PDF at ${SCALE}x`);
  const unique = [...new Set(info.sizes.map((s) => `${s.widthPt.toFixed(2)} x ${s.heightPt.toFixed(2)} pt`))];
  console.log(`page sizes reported by pdf.js: ${unique.join(", ")}`);

  for (let n = 1; n <= info.pages; n += 1) {
    const file = path.join(OUT, `page-${String(n).padStart(2, "0")}.png`);
    await tab.locator(`#page${n}`).screenshot({ path: file });
  }

  await browser.close();
  server.close();

  console.log(`written to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
