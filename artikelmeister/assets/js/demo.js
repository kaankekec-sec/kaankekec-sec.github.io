// "Der, die or das?" mini quiz.
// Words come from assets/data/words.json:
//   [{ "noun": "Tisch", "article": "der", "en": "table", "tr": "masa" }, ...]
// Turkish pages show `tr` (falling back to `en`), English pages show `en`.
// Everything stays in memory; only the best streak is kept in localStorage.
import { LANG, strings } from "./i18n.js";

const T = strings({
  en: {
    right: "Richtig! ",
    wrongBefore: "Not quite. It's ",
    wrongAfter: ". It'll come back soon.",
    newWord: "New word: ",
    loadTitle: "The word list didn't load.",
    loadMsg: "Check your connection and reload the page to play.",
    fileTitle: "The quiz runs on the live site.",
    fileMsg: "It needs JavaScript and a web server, so it can't run from a file opened on your computer.",
  },
  tr: {
    right: "Richtig! ",
    wrongBefore: "Olmadı. Doğrusu: ",
    wrongAfter: ". Birazdan tekrar gelecek.",
    newWord: "Yeni kelime: ",
    loadTitle: "Kelime listesi yüklenemedi.",
    loadMsg: "Bağlantını kontrol edip sayfayı yenile.",
    fileTitle: "Test canlı sitede çalışıyor.",
    fileMsg: "JavaScript ve bir web sunucusu gerektirdiği için bilgisayarında dosya olarak açıldığında çalışmaz.",
  },
});

// The meaning shown under the noun, in the page language when available.
function meaning(w) {
  if (LANG === "tr" && typeof w.tr === "string" && w.tr) return { text: w.tr, lang: "tr" };
  return { text: typeof w.en === "string" ? w.en : "", lang: "en" };
}

const WORDS_URL = new URL("../data/words.json", import.meta.url);
const ARTICLES = ["der", "die", "das"];
const BEST_KEY = "artikelmeister-demo-best";
const RETRY_GAP = 3; // a missed word comes back this many cards later

function readBest() {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
}
function saveBest(n) {
  try { localStorage.setItem(BEST_KEY, String(n)); } catch { /* storage unavailable: keep it in memory */ }
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function de(text) {
  const span = document.createElement("span");
  span.lang = "de";
  span.textContent = text;
  return span;
}

export async function initDemo(root, { reduceMotion }) {
  const $ = (s) => root.querySelector(s);
  const card = $("[data-demo-card]");
  const slot = $("[data-demo-slot]");
  const noun = $("[data-demo-noun]");
  const en = $("[data-demo-en]");
  const feedback = $("[data-demo-feedback]");
  const nextBtn = $("[data-demo-next]");
  const resetBtn = $("[data-demo-reset]");
  const out = {
    correct: $("[data-demo-correct]"),
    total: $("[data-demo-total]"),
    streak: $("[data-demo-streak]"),
    best: $("[data-demo-best]"),
  };
  const buttons = [...root.querySelectorAll(".choice")];

  // Screen-reader announcement of each new word (the visible card is not a live region).
  const sr = document.createElement("p");
  sr.className = "visually-hidden";
  sr.setAttribute("aria-live", "polite");
  root.append(sr);

  let words;
  try {
    const res = await fetch(WORDS_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    words = (Array.isArray(data) ? data : []).filter(
      (w) => w && typeof w.noun === "string" && ARTICLES.includes(w.article)
    );
    if (words.length < 3) throw new Error("not enough words");
  } catch {
    showError();
    return;
  }

  const staticNote = root.querySelector("[data-demo-static]");
  if (staticNote) staticNote.hidden = true;
  resetBtn.hidden = false;

  let queue = [];
  let word = null;
  let answered = false;
  const score = { correct: 0, total: 0, streak: 0, best: readBest() };
  let visible = false;

  function showError() {
    const box = document.createElement("div");
    box.className = "demo-error";
    const title = document.createElement("strong");
    const local = location.protocol === "file:";
    title.textContent = local ? T.fileTitle : T.loadTitle;
    const msg = document.createElement("span");
    msg.textContent = local ? T.fileMsg : T.loadMsg;
    box.append(title, msg);
    root.replaceChildren(box);
  }

  function renderScore() {
    out.correct.textContent = score.correct;
    out.total.textContent = score.total;
    out.streak.textContent = score.streak;
    out.best.textContent = score.best;
  }

  function nextWord() {
    if (!queue.length) {
      queue = shuffle(words);
      if (word && queue.length > 1 && queue[0] === word) queue.push(queue.shift());
    }
    word = queue.shift();
    answered = false;

    slot.className = "slot";
    slot.textContent = "der"; // transparent placeholder keeps the baseline
    noun.textContent = word.noun;
    const m = meaning(word);
    en.textContent = m.text;
    en.lang = m.lang;
    feedback.textContent = "";
    nextBtn.hidden = true;
    card.classList.remove("is-wrong");
    buttons.forEach((b) => {
      b.disabled = false;
      b.classList.remove("is-right", "is-wrong");
      b.removeAttribute("aria-pressed");
    });
    sr.textContent = `${T.newWord}${word.noun}${m.text ? `, ${m.text}` : ""}.`;
  }

  function answer(article) {
    if (answered || !word) return;
    answered = true;
    const right = article === word.article;
    score.total += 1;

    if (right) {
      score.correct += 1;
      score.streak += 1;
      if (score.streak > score.best) {
        score.best = score.streak;
        saveBest(score.best);
      }
    } else {
      score.streak = 0;
      // Spaced repetition in miniature: bring the missed word back soon.
      queue.splice(Math.min(RETRY_GAP, queue.length), 0, word);
      if (!reduceMotion()) {
        card.classList.remove("is-wrong");
        void card.offsetWidth;
        card.classList.add("is-wrong");
      }
    }

    slot.textContent = word.article;
    slot.className = `slot is-filled a-${word.article}${reduceMotion() ? "" : " is-drop"}`;

    buttons.forEach((b) => {
      b.disabled = true;
      if (b.dataset.article === word.article) b.classList.add("is-right");
      else if (b.dataset.article === article) b.classList.add("is-wrong");
    });

    const msg = document.createElement("span");
    msg.className = right ? "ok" : "no";
    if (right) {
      msg.append(T.right, de(`${word.article} ${word.noun}`), ".");
    } else {
      msg.append(T.wrongBefore, de(`${word.article} ${word.noun}`), T.wrongAfter);
    }
    feedback.replaceChildren(msg);
    sr.textContent = "";
    renderScore();

    nextBtn.hidden = false;
    nextBtn.focus({ preventScroll: true });
  }

  buttons.forEach((b) => b.addEventListener("click", () => answer(b.dataset.article)));
  nextBtn.addEventListener("click", () => {
    nextWord();
    buttons[0].focus({ preventScroll: true });
  });
  resetBtn.addEventListener("click", () => {
    score.correct = score.total = score.streak = 0;
    queue = [];
    renderScore();
    nextWord();
  });

  // Keyboard shortcuts: 1/2/3 and Enter, only while the quiz is on screen or focused.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 }).observe(root);
  }
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const inside = root.contains(document.activeElement);
    if (!inside && !visible) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const idx = ["1", "2", "3"].indexOf(e.key);
    if (idx > -1 && !answered) {
      e.preventDefault();
      answer(ARTICLES[idx]);
    } else if (e.key === "Enter" && answered && !(t instanceof HTMLButtonElement || t instanceof HTMLAnchorElement)) {
      e.preventDefault();
      nextBtn.click();
    }
  });

  renderScore();
  nextWord();
  sr.textContent = "";
}
