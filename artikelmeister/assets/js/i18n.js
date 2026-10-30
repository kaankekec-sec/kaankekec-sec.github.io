// Tiny i18n helper. The page language comes from <html lang>; "tr" pages get Turkish, everything else English.
export const LANG = (document.documentElement.lang || "en").toLowerCase().startsWith("tr") ? "tr" : "en";

// pick("text") -> "text"; pick({ en: "...", tr: "..." }) -> the current language, falling back to English.
export function pick(value) {
  if (value && typeof value === "object") return value[LANG] ?? value.en ?? "";
  return value ?? "";
}

// Choose this module's strings for the current language.
export function strings(table) {
  return { ...table.en, ...(table[LANG] || {}) };
}
