// Composited-layer budget per section, measured in headless Chrome at iPhone size (390x844 @3x).
// iOS Safari kills the tab when WebKit's layer memory gets too big (the old CSS-3D tunnel walls
// were ~200 MB each at 3x), so run this after adding big transformed/masked elements.
// Usage: npm run preview (port 4400), then  node scripts/layer-memory.mjs [url]
// Prints each section's total and its largest layers ("#document" is tiled, so it costs far less).
import { spawn } from "node:child_process";

const url = process.argv[2] || "http://localhost:4400/?nointro";
const SECTIONS = [".hero", "[data-statement]", "[data-tunnel]", "[data-stage-section]", ".light", ".bento", ".trust", "[data-cta]"];
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DPR = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const port = 9650 + Math.floor(Math.random() * 40);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/layer-memory-${Date.now()}`, "about:blank"], { stdio: "ignore" });
let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
let layers = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id) {
    pending.get(m.id)?.(m.result);
    pending.delete(m.id);
  } else if (m.method === "LayerTree.layerTreeDidChange" && m.params.layers) layers = m.params.layers;
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const n = ++id;
    pending.set(n, r);
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: DPR, mobile: true });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url });
await sleep(3500);
await send("DOM.enable");
await send("LayerTree.enable");

for (const sel of SECTIONS) {
  await send("Runtime.evaluate", { expression: `(() => { const s = document.querySelector('${sel}'); if (s) window.scrollTo(0, s.offsetTop + s.offsetHeight * 0.3); })()` });
  await sleep(2200);
  await send("DOM.getDocument", { depth: -1 });
  const rows = [];
  for (const l of layers.filter((l) => l.drawsContent && !l.invisible)) {
    let name = "?";
    if (l.backendNodeId) {
      const n = (await send("DOM.describeNode", { backendNodeId: l.backendNodeId }))?.node;
      if (n) {
        const a = n.attributes || [];
        const i = a.indexOf("class");
        name = n.nodeName.toLowerCase() + (i >= 0 ? "." + String(a[i + 1]).trim().split(/\s+/)[0] : "");
      }
    }
    rows.push({ name, size: `${Math.round(l.width)}x${Math.round(l.height)}`, mb: (l.width * l.height * DPR * DPR * 4) / 1048576 });
  }
  rows.sort((a, b) => b.mb - a.mb);
  const total = rows.reduce((s, r) => s + r.mb, 0);
  const top = rows
    .filter((r) => r.name !== "#document")
    .slice(0, 3)
    .map((r) => `${r.name} ${r.size} ${Math.round(r.mb)}MB`)
    .join(", ");
  console.log(`${sel.padEnd(22)} ${String(Math.round(total)).padStart(4)} MB @3x  | ${top}`);
}
ws.close();
chrome.kill();
