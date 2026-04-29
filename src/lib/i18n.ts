export type Locale = "en" | "zh";

export function t<T extends { en: string; zh: string }>(value: T, locale: Locale) {
  return value[locale];
}

export function formatNodeCount(count: number, locale: Locale) {
  return locale === "zh" ? `${count} 个节点` : `${count.toString().padStart(2, "0")} nodes`;
}
