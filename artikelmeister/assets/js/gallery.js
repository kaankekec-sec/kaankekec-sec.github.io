// Screenshot carousel built from the SCREENSHOTS array.
// Missing or broken images fall back to a "coming soon" frame, never a broken icon.
import { SCREENSHOTS } from "./screenshots.js";
import { pick, strings } from "./i18n.js";

const T = strings({
  en: {
    soon: "Screenshot coming soon",
    carousel: "carousel",
    slide: "slide",
    position: (i, n) => `${i} of ${n}`,
    alt: (title, caption) => `${title} screen of ArtikelMeister on ${caption}`,
  },
  tr: {
    soon: "Ekran görüntüsü yakında",
    carousel: "kaydırmalı galeri",
    slide: "slayt",
    position: (i, n) => `${i} / ${n}`,
    alt: (title, caption) => `ArtikelMeister, ${caption}: ${title} ekranı`,
  },
});

const DIR = new URL("../screenshots/", import.meta.url);
const DEFAULT_SIZE = { phone: [1080, 2340], desktop: [1440, 900] };

function placeholder() {
  const box = document.createElement("div");
  box.className = "screen screen--soon";
  const inner = document.createElement("div");
  const word = document.createElement("span");
  word.className = "soon-word";
  word.lang = "de";
  word.textContent = "bald";
  const sub = document.createElement("span");
  sub.className = "soon-sub";
  sub.textContent = T.soon;
  inner.append(word, sub);
  box.append(inner);
  return box;
}

function slide(item, index, count) {
  const title = pick(item.title);
  const caption = pick(item.caption);
  const device = item.device === "desktop" ? "desktop" : "phone";
  const li = document.createElement("div");
  li.className = "gallery-slide";
  li.setAttribute("role", "group");
  li.setAttribute("aria-roledescription", T.slide);
  li.setAttribute("aria-label", `${T.position(index + 1, count)}: ${title}`);

  const fig = document.createElement("figure");
  fig.style.margin = "0";
  const frame = document.createElement("div");
  frame.className = `device device--${device}`;

  if (item.file) {
    const screen = document.createElement("div");
    screen.className = "screen";
    const img = document.createElement("img");
    const [w, h] = [item.width, item.height].every(Boolean) ? [item.width, item.height] : DEFAULT_SIZE[device];
    img.width = w;
    img.height = h;
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = pick(item.alt) || T.alt(title, caption);
    img.addEventListener("error", () => screen.replaceWith(placeholder()), { once: true });
    img.src = new URL(item.file, DIR).href;
    screen.append(img);
    frame.append(screen);
  } else {
    frame.append(placeholder());
  }

  const cap = document.createElement("figcaption");
  const strong = document.createElement("strong");
  strong.textContent = title;
  cap.append(strong, document.createTextNode(caption));
  fig.append(frame, cap);
  li.append(fig);
  return li;
}

export function initGallery(root, { reduceMotion }) {
  const track = root.querySelector("[data-gallery-track]");
  const prev = root.querySelector("[data-gallery-prev]");
  const next = root.querySelector("[data-gallery-next]");
  const status = root.querySelector("[data-gallery-status]");
  if (!track) return;
  track.setAttribute("aria-roledescription", T.carousel);

  // Replace the static placeholder markup with slides built from the data array.
  track.replaceChildren(...SCREENSHOTS.map((item, i) => slide(item, i, SCREENSHOTS.length)));
  const controls = root.querySelector("[data-gallery-controls]");
  if (controls) controls.hidden = false;
  const slides = [...track.children];
  if (!slides.length) {
    root.hidden = true;
    return;
  }

  const current = () => {
    const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const x = track.scrollLeft;
    let best = 0;
    slides.forEach((s, i) => {
      if (Math.abs(s.offsetLeft - pad - x) < Math.abs(slides[best].offsetLeft - pad - x)) best = i;
    });
    return best;
  };

  const goTo = (i) => {
    const target = slides[Math.max(0, Math.min(slides.length - 1, i))];
    const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    track.scrollTo({ left: target.offsetLeft - pad, behavior: reduceMotion() ? "auto" : "smooth" });
  };

  let lastAnnounced = -1;
  const update = () => {
    const i = current();
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = atEnd;
    const shown = atEnd ? slides.length - 1 : i;
    if (shown !== lastAnnounced) {
      status.textContent = T.position(shown + 1, slides.length);
      lastAnnounced = shown;
    }
  };

  prev.addEventListener("click", () => goTo(current() - 1));
  next.addEventListener("click", () => goTo(current() + 1));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(current() + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current() - 1); }
  });

  let raf = 0;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}
