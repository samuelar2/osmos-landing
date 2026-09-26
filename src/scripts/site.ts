import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
// Phones and portrait tablets get the stacked hero (keep in sync with global.css).
const MOBILE = "(max-width: 899px), (orientation: portrait) and (max-width: 1100px)";
const DESKTOP = "(min-width: 900px) and (orientation: landscape), (min-width: 1101px)";
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
// ?still renders the hero's resting state with no entrance motion (used to capture public/og.jpg).
const still = /[?&]still\b/.test(location.search);

/* ------------------------------------------------------------------
   Smooth scroll (wheel only; touch keeps native momentum)
------------------------------------------------------------------- */
let lenis: Lenis | null = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

for (const a of $$<HTMLAnchorElement>('a[href^="#"]')) {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href")!;
    const target = id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target) : target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
}

/* ------------------------------------------------------------------
   Nav: glass once scrolled, hides on the way down, returns on the way up
------------------------------------------------------------------- */
{
  const nav = $("[data-nav]");
  let last = 0;
  const onScroll = (y: number) => {
    nav.classList.toggle("is-scrolled", y > 40);
    if (y > last + 6 && y > 320) nav.classList.add("is-hidden");
    else if (y < last - 6 || y < 320) nav.classList.remove("is-hidden");
    last = y;
  };
  if (lenis) lenis.on("scroll", (l: Lenis) => onScroll(l.scroll));
  else addEventListener("scroll", () => onScroll(scrollY), { passive: true });
}

/* ------------------------------------------------------------------
   Intro: app glyphs resolve into the osmos mark, then open onto the hero
------------------------------------------------------------------- */
function dust(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w = 0,
    h = 0,
    raf = 0;
  const size = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener("resize", size);
  const R = Math.min(w, h);
  const ps = Array.from({ length: 170 }, () => ({
    a: Math.random() * Math.PI * 2,
    r: 70 + Math.random() * R * 0.34,
    s: (0.0012 + Math.random() * 0.004) * (Math.random() < 0.5 ? -1 : 1),
    z: Math.random(),
    tw: Math.random() * Math.PI * 2,
  }));
  let pull = 0;
  const tick = (t: number) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2,
      cy = h / 2;
    for (const p of ps) {
      p.a += p.s;
      const r = p.r * (1 - pull * 0.55);
      const x = cx + Math.cos(p.a) * r;
      const y = cy + Math.sin(p.a) * r * 0.6;
      const a = (0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.002 + p.tw))) * (0.35 + p.z * 0.65);
      ctx.fillStyle = `rgba(228,222,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + p.z * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    pull: (v: number) => (pull = v),
    stop: () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    },
  };
}

function runIntro(reveal: () => void, done: () => void) {
  const root = document.documentElement;
  const el = document.getElementById("intro");
  if (!el || !root.classList.contains("has-intro")) {
    reveal();
    return done();
  }
  try {
    sessionStorage.setItem("osmos-intro", "1");
  } catch {}
  lenis?.stop();
  const particles = dust(el.querySelector("canvas")!);
  const glyphs = $$(".intro__glyph", el);
  const state = { pull: 0 };
  const tl = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: finish });
  glyphs.forEach((g, i) => {
    const last = i === glyphs.length - 1;
    tl.fromTo(
      g,
      { opacity: 0, scale: 0.5, filter: "blur(12px)" },
      { opacity: 1, scale: last ? 1.35 : 1, filter: "blur(0px)", duration: last ? 0.5 : 0.36 },
      i === 0 ? 0.2 : ">-0.1",
    );
    if (!last) tl.to(g, { opacity: 0, scale: 1.3, filter: "blur(10px)", duration: 0.28, ease: "power2.in" }, "+=0.2");
  });
  tl.to(state, { pull: 1, duration: 0.9, ease: "power2.in", onUpdate: () => particles.pull(state.pull) }, "<-0.3")
    .to(glyphs[glyphs.length - 1], { scale: 22, opacity: 0, duration: 0.75, ease: "power3.in" }, "+=0.15")
    .call(reveal, [], "<0.3")
    .to(el, { opacity: 0, duration: 0.5, ease: "power1.out" }, "<0.1");

  let skipped = false;
  const skip = () => {
    if (skipped) return;
    skipped = true;
    tl.timeScale(3.5);
  };
  addEventListener("wheel", skip, { once: true, passive: true });
  addEventListener("touchstart", skip, { once: true, passive: true });
  addEventListener("keydown", skip, { once: true });
  el.addEventListener("click", skip);

  function finish() {
    particles.stop();
    el!.remove();
    root.classList.remove("has-intro");
    scrollTo(0, 0);
    lenis?.start();
    done();
  }
}

/* ------------------------------------------------------------------
   Dynamic Island live activity (hero)
------------------------------------------------------------------- */
function islandActivity() {
  const island = $("[data-device] [data-island]");
  const text = $("[data-island-text]", island);
  const ring = $<SVGCircleElement>("[data-island-ring]", island);
  const pct = $("[data-island-pct]", island);
  if (!text || !ring) return;
  const C = 2 * Math.PI * 16;
  const jobs = ["Booking your table…", "Replying to Jonas…", "Holding your Eurostar…", "Filing your receipt…", "Checking your day…"];
  let i = 0;
  let p = 0.12;
  let running = true;
  const state = { p };
  const set = () => {
    ring.style.strokeDashoffset = String(C * (1 - state.p));
    pct.textContent = `${Math.round(state.p * 100)}%`;
  };
  const cycle = () => {
    if (!running) return;
    gsap.fromTo(state, { p: 0.08 }, { p: 1, duration: 2.1, ease: "power1.inOut", onUpdate: set, onComplete: next });
  };
  const next = () => {
    if (!running) return;
    text.classList.add("is-out");
    gsap.delayedCall(0.35, () => {
      i = (i + 1) % jobs.length;
      text.textContent = jobs[i];
      text.classList.remove("is-out");
      cycle();
    });
  };
  text.textContent = jobs[0];
  if (still) {
    state.p = 0.88;
    set();
    return;
  }
  set();
  cycle();
  return {
    pause: () => {
      running = false;
      gsap.killTweensOf(state);
    },
    resume: () => {
      if (running) return;
      running = true;
      cycle();
    },
  };
}

/* ------------------------------------------------------------------
   Hero: the giant phone shrinks, then plays Ask → Approve → Done
------------------------------------------------------------------- */
function hero() {
  const stage = $("[data-stage]");
  const wrap = $("[data-device-wrap]");
  const device = $("[data-device]");
  const copy = $("[data-hero-copy]");
  const horizon = $("[data-horizon]");
  const heroGlow = $("[data-hero-glow]");
  const floaters = $$("[data-floater]");
  const island = $("[data-island]", device);
  const deviceGlow = $(".device__glow", device);
  const L = Object.fromEntries($$("[data-layer]", device).map((el) => [el.dataset.layer, el])) as Record<string, HTMLElement>;
  const W = Object.fromEntries($$("[data-word]", stage).map((el) => [el.dataset.word, el])) as Record<string, HTMLElement>;
  const receipt = $("[data-receipt]", stage);
  const composer = $("[data-composer]", device);
  const placeholder = $("[data-placeholder]", composer);
  const typed = $("[data-typed]", composer);
  const caret = $("[data-caret]", composer);
  const sendBtn = $(".composer__send", composer);
  const bubble = $("[data-bubble]", device);
  const working = $("[data-working]", device);
  const sheet = $("[data-sheet]", device);
  const sheetDim = $("[data-sheet-dim]", device);
  const book = $("[data-book]", device);
  const tap1 = $('[data-tap="1"]', device);
  const tap2 = $('[data-tap="2"]', device);
  const doneCard = $("[data-done-card]", device);
  const PROMPT = "Book me a 5-star hotel in Monte Carlo tonight";

  const video = $<HTMLVideoElement>("[data-horizon-video]");
  const activity = islandActivity();

  // The layers start hidden in CSS (.layer--off) so a no-JS render shows the hero screen.
  for (const el of Object.values(L)) el.classList.remove("layer--off");
  gsap.set([L.home, L.chat, L.results, L.holding, L.sheet, L.done], { autoAlpha: 0 });
  gsap.set(sheet, { yPercent: 100 });
  gsap.set(sheetDim, { opacity: 0 });
  gsap.set(Object.values(W), { autoAlpha: 0 });
  gsap.set([tap1, tap2], { opacity: 0, scale: 0.3 });
  gsap.set(receipt, { autoAlpha: 0 });

  const typer = { n: 0 };
  const renderTyped = () => {
    const n = Math.round(typer.n);
    typed.textContent = PROMPT.slice(0, n);
    placeholder.style.display = n > 0 ? "none" : "";
    caret.hidden = n === 0;
  };

  // Hide the live activity once the phone starts to move.
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "+=60",
    onUpdate: (self) => {
      const live = self.progress < 1;
      island.classList.toggle("is-live", live);
      live ? activity?.resume() : activity?.pause();
    },
  });

  // The horizon loop starts once the page has loaded and the entrance has played (its poster is
  // the first frame, so nothing jumps), and only decodes while the hero is on screen.
  if (video) {
    const start = () =>
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? video.play().catch(() => {}) : video.pause()),
      });
    const afterLoad = () => (document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true })));
    Promise.all([afterLoad(), heroShown]).then(() => gsap.delayedCall(1.2, start));
  }

  const mm = gsap.matchMedia();
  mm.add({ desktop: DESKTOP, mobile: MOBILE }, (ctx) => {
    const desktop = !!ctx.conditions!.desktop;
    const m = { s1: 1, y1: 0, fs: 1, rY: 0, vh: 0 };
    const measure = () => {
      const vh = stage.clientHeight;
      const devW = device.offsetWidth;
      const devH = (devW * 984) / 468;
      const top = wrap.offsetTop;
      m.vh = vh;
      m.fs = devW / 468;
      if (desktop) {
        const finalH = Math.min(vh * 0.74, 820);
        m.s1 = finalH / devH;
        const finalTop = (vh - finalH) / 2 - vh * 0.03;
        m.y1 = finalTop - top;
        m.rY = finalTop + finalH * 0.45;
        stage.style.setProperty("--phone-half", `${(devW * m.s1) / 2}px`);
      } else {
        m.s1 = 1;
        const finalTop = Math.max(64, (vh - devH) / 2 - vh * 0.06);
        m.y1 = finalTop - top;
        m.rY = finalTop + devH * 0.45;
        stage.style.setProperty("--phone-half", `${devW / 2}px`);
      }
    };
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
    });

    /* A · the phone comes to you */
    tl.to(copy, { autoAlpha: 0, y: desktop ? -50 : -90, scale: desktop ? 0.84 : 1, filter: "blur(10px)", ease: "power1.in", duration: 0.38 }, 0)
      .to(wrap, { scale: () => m.s1, y: () => m.y1, ease: "power2.inOut", duration: 1 }, 0)
      .to(horizon, { opacity: 0.12, y: () => m.vh * 0.2, scale: 1.08, ease: "power1.in", duration: 1 }, 0)
      .to(heroGlow, { opacity: 0, duration: 0.6 }, 0.05)
      .to(floaters[0], { x: -260, y: 160, autoAlpha: 0, duration: 0.6 }, 0)
      .to(floaters[1], { x: 280, y: -120, autoAlpha: 0, duration: 0.6 }, 0)
      .to(floaters[2], { x: -200, y: -160, autoAlpha: 0, duration: 0.5 }, 0)
      .to(deviceGlow, { opacity: 1, duration: 0.45 }, 0.55)
      .to(L.home, { autoAlpha: 1, duration: 0.3 }, 0.5)
      .to(L.hero, { autoAlpha: 0, duration: 0.3 }, 0.62);

    /* B · Ask. */
    tl.fromTo(W.ask, { autoAlpha: 0, x: desktop ? -40 : 0, y: desktop ? 0 : 20, filter: "blur(12px)" }, { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", duration: 0.22, ease: "power2.out" }, 1.0)
      .to(typer, { n: PROMPT.length, duration: 0.62, onUpdate: renderTyped }, 1.08)
      .to(sendBtn, { backgroundColor: "#8b7cf7", borderColor: "#8b7cf7", duration: 0.04 }, 1.7)
      .to(L.home, { autoAlpha: 0, duration: 0.12 }, 1.84)
      .to(L.chat, { autoAlpha: 1, duration: 0.1 }, 1.84)
      .fromTo(bubble, { y: () => 640 * m.fs, scale: 0.92 }, { y: 0, scale: 1, duration: 0.2, ease: "power3.out" }, 1.84)
      .fromTo(working, { autoAlpha: 0, y: () => 12 * m.fs }, { autoAlpha: 1, y: 0, duration: 0.08 }, 1.98)
      .fromTo(L.results, { autoAlpha: 0, y: () => 60 * m.fs }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }, 2.14)
      .to(L.chat, { autoAlpha: 0, duration: 0.1 }, 2.3);

    /* C · Approve. */
    tl.to(W.ask, { autoAlpha: desktop ? 0.16 : 0, filter: desktop ? "blur(0px)" : "blur(8px)", duration: 0.18 }, 2.44)
      .fromTo(W.approve, { autoAlpha: 0, x: desktop ? 40 : 0, y: desktop ? 0 : 20, filter: "blur(12px)" }, { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", duration: 0.22, ease: "power2.out" }, 2.46)
      .to(tap1, { opacity: 0.55, scale: 1, duration: 0.06 }, 2.6)
      .to(tap1, { opacity: 0, scale: 1.7, duration: 0.1 }, 2.66)
      .to(L.holding, { autoAlpha: 1, duration: 0.05 }, 2.65)
      .to(L.sheet, { autoAlpha: 1, duration: 0.01 }, 2.8)
      .to(sheetDim, { opacity: 1, duration: 0.2 }, 2.8)
      .to(sheet, { yPercent: 0, duration: 0.3, ease: "power3.out" }, 2.8)
      .to(tap2, { opacity: 0.5, scale: 1.1, duration: 0.06 }, 3.18)
      .to(tap2, { opacity: 0, scale: 1.9, duration: 0.1 }, 3.24)
      .to(book, { scale: 0.97, duration: 0.05, yoyo: true, repeat: 1 }, 3.18);

    /* D · Done. */
    tl.to(W.approve, { autoAlpha: desktop ? 0.16 : 0, duration: 0.18 }, 3.36)
      .to(W.ask, { autoAlpha: desktop ? 0.1 : 0, duration: 0.18 }, 3.36)
      .fromTo(W.done, { autoAlpha: 0, y: 40, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.24, ease: "power2.out" }, 3.4)
      .to(wrap, { y: () => m.y1 - m.vh * (desktop ? 0.05 : 0.04), duration: 0.3, ease: "power1.inOut" }, 3.36)
      .fromTo(
        receipt,
        { autoAlpha: 0, scale: 0.5, yPercent: -50, y: () => m.rY + 40 },
        { autoAlpha: 1, scale: 1, y: () => m.rY - m.vh * 0.05, duration: 0.34, ease: "back.out(1.5)" },
        3.44,
      )
      .to(receipt, { autoAlpha: 0, scale: 0.55, y: () => m.rY - m.vh * 0.12, duration: 0.28, ease: "power2.in" }, 4.06)
      .to(L.sheet, { autoAlpha: 0, duration: 0.12 }, 4.1)
      .to(L.done, { autoAlpha: 1, duration: 0.14 }, 4.1)
      .fromTo(doneCard, { autoAlpha: 0, y: () => 40 * m.fs, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: "power2.out" }, 4.16)
      .to([W.ask, W.approve], { autoAlpha: 0, duration: 0.2 }, 4.5)
      .to({}, { duration: 0.3 }, 4.7);

    return () => ScrollTrigger.removeEventListener("refreshInit", measure);
  });

  // Mouse parallax on the floating glass (desktop only).
  if (finePointer) {
    const layers = $$("[data-float-m]").map((el, i) => ({ el, depth: [18, 26, 10][i] ?? 14 }));
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    addEventListener("mousemove", (e) => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
    });
    gsap.ticker.add(() => {
      if (scrollY > innerHeight * 1.5) return;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      for (const l of layers) l.el.style.transform = `translate3d(${cx * l.depth * 2}px, ${cy * l.depth * 2}px, 0)`;
    });
  }
}

let markHeroShown: () => void = () => {};
const heroShown = new Promise<void>((r) => (markHeroShown = r));

function heroIntro() {
  markHeroShown();
  document.documentElement.classList.add("js-ready");
  if (still) {
    gsap.set("[data-hero-in], [data-device-enter]", { autoAlpha: 1 });
    return;
  }
  gsap.fromTo("[data-hero-in]", { y: 34, autoAlpha: 0, filter: "blur(10px)" }, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.09, ease: "power3.out", delay: 0.05, clearProps: "filter" });
  gsap.fromTo("[data-device-enter]", { y: 140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.5, ease: "power3.out" });
  gsap.from("[data-horizon-in]", { scale: 1.06, duration: 1.8, ease: "power2.out" });
  gsap.from("[data-float-in]", { scale: 0.6, autoAlpha: 0, duration: 1.3, stagger: 0.12, ease: "back.out(1.6)", delay: 0.25 });
}

/* ------------------------------------------------------------------
   Statement: words light up as you scroll
------------------------------------------------------------------- */
function statement() {
  const words = $$(".statement .w");
  gsap.to(words, {
    opacity: 1,
    ease: "none",
    stagger: 0.14,
    duration: 0.3,
    scrollTrigger: { trigger: "[data-statement]", start: "top 25%", end: "bottom bottom", scrub: 0.5 },
  });
}

/* ------------------------------------------------------------------
   Tunnel: grid walls stream past, cards fly in and out of depth
------------------------------------------------------------------- */
function tunnel() {
  const walls = $$("[data-wall]");
  const cards = $$("[data-fcard]");
  const CELL = 120;
  gsap.set(walls[0], { rotationY: 90, transformOrigin: "0% 50%" });
  gsap.set(walls[1], { rotationY: -90, transformOrigin: "100% 50%" });
  ScrollTrigger.create({
    trigger: "[data-tunnel]",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const off = (self.progress * CELL * 26) % CELL;
      gsap.set(walls[0], { x: -off });
      gsap.set(walls[1], { x: off });
    },
  });

  const mm = gsap.matchMedia();
  mm.add({ wide: "(min-width: 900px)", narrow: "(max-width: 899px)" }, (ctx) => {
    const wide = !!ctx.conditions!.wide;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "[data-tunnel]", start: "top top", end: "bottom bottom", scrub: 0.8 },
    });
    if (wide) {
      const spread = () => Math.min(380, innerWidth * 0.27);
      const slots = [
        { x: () => -spread(), z: -80, ry: 24, rz: -2 },
        { x: () => 0, z: 40, ry: 0, rz: 0 },
        { x: () => spread(), z: -80, ry: -24, rz: 2 },
      ];
      cards.forEach((card, i) => {
        const s = slots[i];
        tl.fromTo(
          card,
          { x: 0, y: 60, z: -1800, rotationY: 0, rotationZ: 0, rotationX: 14, opacity: 0 },
          { x: s.x, y: 0, z: s.z, rotationY: s.ry, rotationZ: s.rz, rotationX: 0, opacity: 1, duration: 0.34, ease: "power2.out" },
          0.04 + i * 0.13,
        );
      });
      tl.to({}, { duration: 0.14 });
      cards.forEach((card, i) => {
        const t = 0.72 + i * 0.03;
        tl.to(card, { z: 420, x: () => slots[i].x() * 1.7, y: -30, duration: 0.3, ease: "power2.in" }, t).to(
          card,
          { opacity: 0, duration: 0.16, ease: "power1.in" },
          t + 0.08,
        );
      });
    } else {
      cards.forEach((card, i) => {
        const t0 = i * 0.33;
        tl.fromTo(card, { z: -1500, y: 40, rotationX: 16, opacity: 0 }, { z: 0, y: 0, rotationX: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, t0)
          .to(card, { z: 380, y: -40, duration: 0.12, ease: "power2.in" }, t0 + 0.24)
          .to(card, { opacity: 0, duration: 0.07 }, t0 + 0.27);
      });
    }
  });
}

/* ------------------------------------------------------------------
   Stage: the card opens to full bleed, the phone rises onto the plinth
------------------------------------------------------------------- */
function stageSection() {
  const card = $("[data-stage-card]");
  const bg = $("[data-stage-bg]");
  const phone = $("[data-stage-phone]");
  const words = $$("[data-stage-word]");
  const sides = $$("[data-stage-side]");
  const narrow = () => innerWidth < 900;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: "[data-stage-section]", start: "top 80%", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true },
  });
  tl.fromTo(card, { "--clip-y": () => (narrow() ? "14%" : "18%"), "--clip-x": () => (narrow() ? "12%" : "36%") }, { "--clip-y": "0%", "--clip-x": "0%", duration: 0.5, ease: "power2.inOut" }, 0)
    .fromTo(bg, { scale: 1.25 }, { scale: 1, duration: 0.55, ease: "power2.out" }, 0)
    .fromTo(phone, { y: 140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: "power3.out" }, 0.28)
    .fromTo(words, { autoAlpha: 0, y: 40, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.2, stagger: 0.08, ease: "power2.out" }, 0.42)
    .fromTo(sides, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.08, ease: "power2.out" }, 0.58)
    .to({}, { duration: 0.2 });

  // Logo tiles tick over, one after another, while the stage is on screen.
  const cycle = $("[data-logo-cycle]");
  // Logos that read on the white tiles (github and zendesk are white marks).
  const pool = ["whatsapp", "slack", "notion", "googledrive", "linear", "figma", "hubspot", "zoom", "trello", "stripe", "calendly", "dropbox", "asana", "jira"];
  let k = 4;
  let timer = 0;
  const swap = (slot: HTMLElement) => {
    const old = slot.querySelector("img")!;
    const img = new Image(36, 36);
    const slug = pool[k++ % pool.length];
    img.src = `/logos/${slug}.png`;
    img.alt = slug;
    img.className = "is-in";
    slot.appendChild(img);
    img.getBoundingClientRect(); // commit the start state so the transition runs
    img.classList.remove("is-in");
    old.classList.add("is-out");
    setTimeout(() => old.remove(), 600);
  };
  const tick = () => {
    if (document.hidden) return;
    $$("span", cycle).forEach((slot, i) => setTimeout(() => swap(slot), i * 140));
  };
  ScrollTrigger.create({
    trigger: "[data-stage-section]",
    start: "top center",
    end: "bottom top",
    onToggle: (self) => {
      clearInterval(timer);
      if (self.isActive) timer = window.setInterval(tick, 2400);
    },
  });
}

/* ------------------------------------------------------------------
   Orbit: app tiles circle the mark; notifications land around it
------------------------------------------------------------------- */
function orbit() {
  const root = $("[data-orbit]");
  const tiles = $$("[data-orbit-tile]", root);
  const notes = $$("[data-note]", root);
  const ring = $("[data-orbit-ring]", root);
  const SHEAR = 0.08; // tilt the path a little, like a planet's ring
  let rx = 0,
    ry = 0;
  const size = () => {
    const w = root.clientWidth;
    rx = w < 700 ? w * 0.4 : Math.min(430, w * 0.3);
    ry = w < 700 ? w * 0.17 : Math.min(140, w * 0.1);
    ring.style.width = `${rx * 2}px`;
    ring.style.height = `${ry * 2}px`;
    ring.style.transform = `translate(-50%, -50%) skewY(${(-Math.atan(SHEAR) * 180) / Math.PI}deg)`;
  };
  size();
  addEventListener("resize", size);
  let raf = 0;
  let t0 = performance.now();
  const frame = (now: number) => {
    const t = (now - t0) / 1000;
    tiles.forEach((el, i) => {
      const a = t * 0.16 + (i / tiles.length) * Math.PI * 2;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry - x * SHEAR;
      const depth = (Math.sin(a) + 1) / 2; // 0 = back, 1 = front
      const s = 0.62 + depth * 0.5;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      el.style.zIndex = depth > 0.5 ? "3" : "1";
      el.style.opacity = String(0.55 + depth * 0.45);
      el.style.filter = depth < 0.3 ? `blur(${(0.3 - depth) * 6}px)` : "";
    });
    raf = requestAnimationFrame(frame);
  };
  if (reduceMotion) {
    frame(t0 + 1000);
    cancelAnimationFrame(raf);
  } else {
    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(frame);
    }).observe(root);
  }
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      notes.forEach((n, i) => setTimeout(() => n.classList.add("is-in"), 150 + i * 160));
      io.disconnect();
    },
    { threshold: 0.35 },
  );
  io.observe(root);
}

/* ------------------------------------------------------------------
   Small things: reveals, counter, logo wobble, CTA parallax
------------------------------------------------------------------- */
function reveals() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
  );
  $$("[data-reveal]").forEach((el) => io.observe(el));
}

function counter() {
  const el = $("[data-count]");
  if (!el || reduceMotion) return;
  const to = Number(el.dataset.count);
  const obj = { v: 0 };
  el.textContent = "0";
  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => gsap.to(obj, { v: to, duration: 1.6, ease: "power3.out", onUpdate: () => (el.textContent = String(Math.round(obj.v))) }),
  });
}

function wobble() {
  if (!finePointer || reduceMotion) return;
  let px = 0,
    py = 0,
    vx = 0,
    vy = 0;
  addEventListener("mousemove", (e) => {
    vx = e.clientX - px;
    vy = e.clientY - py;
    px = e.clientX;
    py = e.clientY;
  });
  for (const el of $$("[data-wobble]")) {
    el.addEventListener("mouseenter", () => {
      gsap.killTweensOf(el);
      gsap
        .timeline()
        .to(el, { x: gsap.utils.clamp(-18, 18, vx * 1.6), y: gsap.utils.clamp(-18, 18, vy * 1.6), rotation: (Math.random() - 0.5) * 22, duration: 0.18, ease: "power2.out" })
        .to(el, { x: 0, y: 0, rotation: 0, duration: 1.1, ease: "elastic.out(1, 0.32)" });
    });
  }
}

function cta() {
  const phone = $("[data-cta-phone]");
  gsap.fromTo(phone, { y: 160 }, { y: 0, ease: "none", scrollTrigger: { trigger: "[data-cta]", start: "top 90%", end: "bottom bottom", scrub: 0.6 } });
  for (const obj of $$("[data-cta-obj]")) {
    const d = Number(obj.dataset.ctaObj);
    gsap.fromTo(
      obj,
      { y: 120 * d, rotation: -10 * d },
      { y: -40 * d, rotation: 6 * d, ease: "none", scrollTrigger: { trigger: "[data-cta]", start: "top bottom", end: "bottom bottom", scrub: 0.8 } },
    );
  }
}

/* ------------------------------------------------------------------
   Boot
------------------------------------------------------------------- */
function whenVisible(fn: () => void) {
  if (document.visibilityState === "visible") return fn();
  const onChange = () => {
    if (document.visibilityState !== "visible") return;
    document.removeEventListener("visibilitychange", onChange);
    fn();
  };
  document.addEventListener("visibilitychange", onChange);
}

function staticHero() {
  // Reduced motion: show the phone mid-story, no pinning.
  const device = $("[data-device]");
  for (const el of $$("[data-layer]", device)) el.classList.toggle("layer--off", el.dataset.layer !== "results");
  $("[data-island]", device).classList.remove("is-live");
  // The horizon stays as its poster frame; nothing plays.
}

if (reduceMotion) {
  staticHero();
  orbit();
  reveals();
} else {
  hero();
  statement();
  tunnel();
  stageSection();
  orbit();
  reveals();
  counter();
  wobble();
  cta();
  // A tab opened in the background waits, so the intro and entrance play when someone is looking.
  whenVisible(() => runIntro(heroIntro, () => ScrollTrigger.refresh()));
}

addEventListener("load", () => ScrollTrigger.refresh());
