// Screenshot gallery data.
//
// To add a real screenshot:
//   1. Drop the image into assets/screenshots/ (PNG, JPG or WebP).
//   2. Put its file name in `file` below and write a short `alt` text.
// Entries with an empty `file` show a "coming soon" frame instead.
//
// device: "phone" (tall frame, for Android) or "desktop" (wide frame, for macOS).
// width/height are optional: the image's real pixel size. They reserve space so
// the page does not jump while the image loads. Defaults: phone 1080x2340, desktop 1440x900.

export const SCREENSHOTS = [
  { file: "", device: "phone",   title: "Studying a deck",   caption: "Android", alt: "" },
  { file: "", device: "desktop", title: "Word list",         caption: "macOS",   alt: "" },
  { file: "", device: "phone",   title: "AI word generator", caption: "Android", alt: "" },
  { file: "", device: "desktop", title: "Studying a deck",   caption: "macOS",   alt: "" },
  { file: "", device: "phone",   title: "CSV import",        caption: "Android", alt: "" },
];
