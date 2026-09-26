// Turns the image masters in design/ (gitignored) into the AVIF/WebP files under
// public/img/ and writes src/generated/images.json, which <Img id="…"> reads.
// Run with `npm run images` after adding or regenerating a master.
import sharp from "sharp";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "public/img");
const MANIFEST = path.join(ROOT, "src/generated/images.json");

// The iPhone 16 Pro Max simulator draws the Dynamic Island into its screenshots.
// The site's phone frame has its own, so paint the app background over it.
const ISLAND = { left: 466, top: 36, width: 388, height: 122, fill: { r: 18, g: 18, b: 30 } };

const art = (name, widths) => ({ id: name, src: `design/generated/${name}.png`, widths });
const screen = (id, file, extra = {}) => ({ id, src: `design/masters/${file}`, widths: [440, 880], island: true, ...extra });

const JOBS = [
  ...["icon-shield", "icon-envelope", "icon-ticket", "icon-calendar", "icon-card", "icon-notebook", "icon-bolt"].map((n) =>
    art(n, [240, 480]),
  ),
  art("mark-glass", [480, 960]),
  { ...art("stage", [1280, 2400]), opaque: true },
  // First frame of public/video/horizon.mp4; the <video> uses the WebP as its poster.
  { id: "horizon-poster", src: "design/masters/horizon-poster.png", widths: [1280], opaque: true },

  screen("screen-results", "results.png"),
  screen("screen-holding", "holding.png"),
  screen("screen-apps", "apps.png"),
  screen("screen-travel", "travel.png"),
  // Just the hotel photo from the property sheet, for the confirmation card.
  { id: "hotel-photo", src: "design/masters/property.png", crop: { left: 0, top: 392, width: 1320, height: 668 }, widths: [480, 960] },

  ...["calendar", "flights", "hotels", "inbox", "notes", "rail", "reminders", "sandbox", "wallet"].map((t) => ({
    id: `tile-${t}`,
    src: `design/masters/tiles/${t}.png`,
    widths: [144, 288],
  })),
];

const exists = (p) => access(p).then(() => true, () => false);

async function load(job) {
  let img = sharp(path.join(ROOT, job.src));
  if (job.island) {
    const { left, top, width, height, fill } = ISLAND;
    const patch = await sharp({ create: { width, height, channels: 3, background: fill } }).png().toBuffer();
    img = sharp(await img.composite([{ input: patch, left, top }]).png().toBuffer());
  }
  if (job.crop) img = img.extract(job.crop);
  return sharp(await img.png().toBuffer());
}

const manifest = {};
await mkdir(OUT, { recursive: true });
for (const job of JOBS) {
  if (!(await exists(path.join(ROOT, job.src)))) {
    console.warn(`skip ${job.id}: missing ${job.src}`);
    continue;
  }
  const base = await load(job);
  const meta = await base.metadata();
  const entry = { width: meta.width, height: meta.height, avif: [], webp: [] };
  for (const w of job.widths) {
    const width = Math.min(w, meta.width);
    const resized = base.clone().resize({ width });
    const stem = `${job.id}-${width}`;
    await resized.clone().avif({ quality: job.opaque ? 52 : 58, effort: 6 }).toFile(path.join(OUT, `${stem}.avif`));
    await resized.clone().webp({ quality: job.opaque ? 74 : 82, alphaQuality: 90, effort: 6 }).toFile(path.join(OUT, `${stem}.webp`));
    entry.avif.push([`/img/${stem}.avif`, width]);
    entry.webp.push([`/img/${stem}.webp`, width]);
  }
  manifest[job.id] = entry;
  console.log(`${job.id}: ${job.widths.join(", ")}`);
}
await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${Object.keys(manifest).length} images`);
