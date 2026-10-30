window.__amReady = true;

// Site behaviour: sticky header state, scroll reveals, parallax, hero card sequence,
// screenshot gallery and the quiz. Everything respects prefers-reduced-motion.
import { initGallery } from "./gallery.js";
import { initDemo } from "./demo.js";

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduceMotion = () => motionQuery.matches;

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initReveals() {
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty("--i", i));
  });
  const items = document.querySelectorAll(".reveal");
  if (reduceMotion() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  let delivered = false;
  const io = new IntersectionObserver((entries) => {
    delivered = true;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
  items.forEach((el) => io.observe(el));
  // Safety net: if the observer never reports (some headless/embedded renderers),
  // show everything rather than leaving content invisible.
  // Also covers renderers that never paint animation frames, where transitions would stall.
  let painted = false;
  requestAnimationFrame(() => requestAnimationFrame(() => { painted = true; }));
  setTimeout(() => {
    if (delivered && painted) return;
    document.documentElement.classList.add("no-reveal");
    items.forEach((el) => el.classList.add("is-in"));
  }, 1500);
}

// Subtle parallax via the CSS `translate` property, so it never fights `transform`
// used by reveals and the hero card.
function initParallax() {
  const items = [...document.querySelectorAll("[data-parallax]")];
  if (!items.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    if (reduceMotion()) {
      items.forEach((el) => { el.style.translate = ""; });
      return;
    }
    const mid = window.innerHeight / 2;
    items.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0;
      const shift = parseFloat(el.dataset.shift || "0");
      const r = el.getBoundingClientRect();
      const center = r.top - shift + r.height / 2;
      const y = Math.max(-40, Math.min(40, (center - mid) * speed));
      el.dataset.shift = String(y);
      el.style.translate = `0 ${y.toFixed(1)}px`;
    });
  };
  const request = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request, { passive: true });
  motionQuery.addEventListener?.("change", request);
  update();
}

// The hero's one orchestrated moment: articles drop into three cards, once.
function initHero() {
  const card = document.querySelector("[data-hero-card]");
  if (!card || reduceMotion()) return;
  const slot = card.querySelector("[data-hero-slot]");
  const noun = card.querySelector("[data-hero-noun]");
  const tr = card.querySelector("[data-hero-tr]");
  const en = card.querySelector("[data-hero-en]");
  const words = [
    { a: "der", n: "Tisch", tr: "masa", en: "table" },
    { a: "die", n: "Lampe", tr: "lamba", en: "lamp" },
    { a: "das", n: "Buch", tr: "kitap", en: "book" },
  ];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const show = (w) => {
    slot.className = "slot";
    slot.textContent = "der"; // transparent placeholder
    noun.textContent = w.n;
    tr.textContent = w.tr;
    en.textContent = w.en;
  };
  const fill = (w) => {
    slot.textContent = w.a;
    slot.className = `slot is-filled a-${w.a} is-drop`;
  };

  (async () => {
    show(words[0]);
    for (let i = 0; i < words.length; i++) {
      await wait(i === 0 ? 900 : 650);
      if (reduceMotion()) break;
      fill(words[i]);
      if (i === words.length - 1) break;
      await wait(1500);
      card.classList.add("is-leaving");
      await wait(520);
      card.classList.remove("is-leaving");
      card.classList.add("is-entering");
      show(words[i + 1]);
      void card.offsetWidth;
      card.classList.add("is-settling");
      card.classList.remove("is-entering");
      await wait(520);
      card.classList.remove("is-settling");
    }
    if (reduceMotion()) fill(words[words.length - 1]);
  })();
}

initHeader();
initReveals();
initParallax();
initHero();

const gallery = document.querySelector("[data-gallery]");
if (gallery) initGallery(gallery, { reduceMotion });
const demo = document.querySelector("[data-demo]");
if (demo) initDemo(demo, { reduceMotion });
