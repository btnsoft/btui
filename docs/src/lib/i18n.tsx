import { createContext, useCallback, useContext } from "react";

export type Lang = "tr" | "en";
export type Text = string | { tr: string; en: string };

export const LangContext = createContext<Lang>("tr");

export function useLang() {
  return useContext(LangContext);
}

/** Picks the current language from a `{ tr, en }` pair. Plain strings pass through. */
export function useText() {
  const lang = useLang();
  return useCallback((text: Text) => (typeof text === "string" ? text : text[lang]), [lang]);
}
