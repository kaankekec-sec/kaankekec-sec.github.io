// Screenshot gallery data.
//
// To add a real screenshot:
//   1. Drop the image into assets/screenshots/ (PNG, JPG or WebP).
//   2. Put its file name in `file` below and write a short `alt` text in both languages.
// Entries with an empty `file` show a "coming soon" frame instead.
//
// Fields:
//   file     image file name inside assets/screenshots/ ("" = placeholder frame)
//   device   "phone" (tall frame, for Android) or "desktop" (wide frame, for macOS)
//   title    { en: "...", tr: "..." }  shown under the frame
//   caption  { en: "...", tr: "..." }  small line under the title (e.g. the platform)
//   alt      { en: "...", tr: "..." }  image description for screen readers
//   width, height (optional) the image's real pixel size; reserves space so the page
//            does not jump while loading. Defaults: phone 1080x2340, desktop 1440x900.
// title/caption/alt may also be a plain string, which is then used for both languages.
// The English page uses `en`, the Turkish page (tr/) uses `tr`, falling back to `en`.

export const SCREENSHOTS = [
  { file: "", device: "phone",   title: { en: "Studying a deck",   tr: "Deste çalışma" },        caption: "Android", alt: { en: "", tr: "" } },
  { file: "", device: "desktop", title: { en: "Word list",         tr: "Kelime listesi" },       caption: "macOS",   alt: { en: "", tr: "" } },
  { file: "", device: "phone",   title: { en: "AI word generator", tr: "Yapay zekâ ile kelime" }, caption: "Android", alt: { en: "", tr: "" } },
  { file: "", device: "desktop", title: { en: "Studying a deck",   tr: "Deste çalışma" },        caption: "macOS",   alt: { en: "", tr: "" } },
  { file: "", device: "phone",   title: { en: "CSV import",        tr: "CSV içe aktarma" },      caption: "Android", alt: { en: "", tr: "" } },
];
