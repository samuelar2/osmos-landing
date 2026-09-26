// Headless-Chrome end-to-end scroll test for meetosmos.com.
// Scrolls the whole page with real input gestures, records every animation frame,
// long animation frames, console errors, failed requests, and screenshots at checkpoints.
// Usage: npm run preview (port 4400), then
//   node scripts/e2e-scroll.mjs "http://localhost:4400/?nointro" e2e-out desktop [cpuThrottle]
//   node scripts/e2e-scroll.mjs "https://meetosmos.com/?nointro" e2e-out mobile
// NOSHOTS=1 skips the screenshots (they stall the renderer and add long frames).
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [url = "http://localhost:4400/?nointro", outDir = "e2e-out", mode = "desktop", throttle = "1"] = process.argv.slice(2);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9300 + Math.floor(Math.random() * 500);
const mobile = mode === "mobile";
const W = mobile ? 390 : 1440;
const H = mobile ? 844 : 900;

await mkdir(outDir, { recursive: true });
const profile = path.join(outDir, `profile-${mode}-${throttle}`);
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  `--window-size=${W},${H}`,
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--autoplay-policy=no-user-gesture-required",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(250);
}
if (!wsUrl) throw new Error("Chrome did not start");

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  } else if (msg.method) listeners.forEach((fn) => fn(msg));
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });

const problems = { console: [], exceptions: [], failed: [], badStatus: [] };
const requests = new Map();
listeners.push((m) => {
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type))
    problems.console.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(" ")}`.slice(0, 300));
  if (m.method === "Runtime.exceptionThrown") problems.exceptions.push(m.params.exceptionDetails.exception?.description?.slice(0, 300) ?? m.params.exceptionDetails.text);
  if (m.method === "Network.requestWillBeSent") requests.set(m.params.requestId, m.params.request.url);
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400)
    problems.badStatus.push(`${m.params.response.status} ${m.params.response.url}`);
  if (m.method === "Network.loadingFailed" && !m.params.canceled)
    problems.failed.push(`${m.params.errorText} ${requests.get(m.params.requestId)}`);
});

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
if (mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 3, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setUserAgentOverride", {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  });
} else {
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 2, mobile: false });
}
if (Number(throttle) > 1) await send("Emulation.setCPUThrottlingRate", { rate: Number(throttle) });

const loaded = new Promise((r) => listeners.push((m) => m.method === "Page.loadEventFired" && r()));
const t0 = Date.now();
await send("Page.navigate", { url });
await loaded;
const loadMs = Date.now() - t0;
await sleep(2500); // let the entrance animation finish

const evalJS = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

const gpu = await evalJS(`(() => { const c = document.createElement('canvas').getContext('webgl'); const e = c && c.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a'; })()`);

// Frame recorder + long animation frames.
await evalJS(`(() => {
  window.__frames = []; window.__loaf = [];
  const tick = (t) => { window.__frames.push(t); if (!window.__stop) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ y: Math.round(scrollY), t: Math.round(e.startTime), d: Math.round(e.duration), render: Math.round((e.renderStart ? (e.startTime + e.duration - e.renderStart) : 0)), style: Math.round(e.styleAndLayoutStart ? (e.startTime + e.duration - e.styleAndLayoutStart) : 0), block: Math.round(e.blockingDuration || 0), scripts: (e.scripts || []).map(s => (s.sourceFunctionName || '') + '@' + (s.sourceURL || '').split('/').pop()).slice(0,3) }); }).observe({ type: 'long-animation-frame', buffered: false }); } catch (e) {}
  return true;
})()`);

const total = await evalJS("document.documentElement.scrollHeight - innerHeight");
const shots = [];
const checkpoints = [0.02, 0.08, 0.14, 0.2, 0.25, 0.3, 0.38, 0.46, 0.55, 0.62, 0.7, 0.8, 0.9, 1];
let shotIdx = 0;

// Scroll with real gestures, in chunks, snapshotting at checkpoints.
const chunk = mobile ? 700 : 900;
const speed = mobile ? 1800 : 2200; // px/s
let pos = 0;
while (pos < total - 2) {
  const step = Math.min(chunk, total - pos);
  await send("Input.synthesizeScrollGesture", {
    x: Math.round(W / 2),
    y: Math.round(H / 2),
    yDistance: -step,
    speed,
    gestureSourceType: mobile ? "touch" : "mouse",
    preventFling: true,
    repeatCount: 1,
  });
  await sleep(mobile ? 120 : 350); // let Lenis / scrub settle a little
  pos = await evalJS("scrollY");
  const frac = pos / total;
  while (!process.env.NOSHOTS && shotIdx < checkpoints.length && frac >= checkpoints[shotIdx] - 0.005) {
    await sleep(500);
    const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
    const file = path.join(outDir, `${mode}-t${throttle}-${String(shotIdx).padStart(2, "0")}-${Math.round(frac * 100)}pct.jpg`);
    await writeFile(file, Buffer.from(data, "base64"));
    shots.push(file);
    shotIdx++;
  }
  if (step < 5) break;
}

const stats = await evalJS(`(() => {
  window.__stop = true;
  const f = window.__frames; const d = [];
  for (let i = 1; i < f.length; i++) d.push(f[i] - f[i-1]);
  const s = [...d].sort((a,b) => a-b);
  const pct = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  const over = (ms) => d.filter(x => x > ms).length;
  const dur = (f[f.length-1] - f[0]) / 1000;
  return {
    frames: d.length, seconds: +dur.toFixed(1), avgFps: +(d.length / dur).toFixed(1),
    p50: +pct(0.5).toFixed(1), p95: +pct(0.95).toFixed(1), p99: +pct(0.99).toFixed(1), max: +Math.max(...d).toFixed(1),
    over20ms: over(20), over34ms: over(34), over50ms: over(50),
    loafCount: window.__loaf.length, loafTop: window.__loaf.sort((a,b)=>b.d-a.d).slice(0,5),
  };
})()`);

// Everything that should have loaded did.
const images = await evalJS(`[...document.images].filter(i => i.loading !== 'lazy' || i.getBoundingClientRect().top < scrollY + innerHeight).map(i => ({ src: (i.currentSrc||i.src).split('/').pop(), ok: i.complete && i.naturalWidth > 0 })).filter(x => !x.ok)`);
const video = await evalJS(`(() => { const v = document.querySelector('[data-horizon-video]'); return v ? { readyState: v.readyState, src: v.currentSrc.split('/').pop() } : null; })()`);

const report = { url, mode, cpuThrottle: Number(throttle), gpu, loadMs, scrollHeight: total, stats, brokenImages: images, video, problems, shots };
await writeFile(path.join(outDir, `report-${mode}-t${throttle}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
ws.close();
chrome.kill();
