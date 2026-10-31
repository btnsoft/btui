import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";

export const LANGS = ["tr", "en"] as const;
export const PAGE_IDS = ["home", ...Array.from(readFileSync(new URL("../docs/src/lib/nav.ts", import.meta.url), "utf8").matchAll(/id: "([a-z-]+)"/g), (m) => m[1])];

/** Everything that would make a screenshot differ between two runs is pinned here. */
export async function open(page: Page, lang: string, id: string, theme: "light" | "dark") {
  await page.clock.setFixedTime(new Date("2026-10-15T09:00:00+03:00"));
  await page.addInitScript((value) => {
    localStorage.clear();
    localStorage.setItem("btui-docs-theme", value);
    localStorage.setItem("btui-docs-lang", "tr");
  }, theme);
  await page.goto(`/#/${lang}/${id}`);
  await page.waitForSelector(".d-h2, .h-home");
  await page.evaluate(() => document.fonts.ready);
}

export const themeOf = (name: string) => (name === "dark" ? "dark" : "light");

/** Size and place of every match, so a state change can be compared to the one before. */
export async function boxes(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    return `${Math.round(box.left)},${Math.round(box.width)},${Math.round(box.height)}`;
  }));
}

export async function expectNoConsoleErrors(errors: string[]) {
  expect(errors, "console and page errors").toEqual([]);
}
