import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { LANGS, open, PAGE_IDS, themeOf } from "./helpers";

async function audit(page: Page, scope?: string) {
  const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);
  if (scope) builder.include(scope);
  const { violations } = await builder.analyze();
  return violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 170).replace(/\s+/g, " ")} ~ ${n.any[0]?.message ?? n.failureSummary?.split("\n").slice(1, 2).join("").trim() ?? ""}`));
}

for (const lang of LANGS) {
  for (const id of PAGE_IDS) {
    test(`${lang}/${id}`, async ({ page }, info) => {
      await open(page, lang, id, themeOf(info.project.name));
      expect(await audit(page)).toEqual([]);
    });
  }
}

const POPUP = ".bt-popup:not(.bt-toasts)";

const STATES: Array<[string, string, (page: Page) => Promise<void>]> = [
  ["acik select listesi", "select", async (page) => { await page.locator(".d-stage .bt-select").first().click(); }],
  ["acik coklu secim", "multi-select", async (page) => { await page.locator(".d-stage .bt-select").first().click(); }],
  ["acik takvim", "date-picker", async (page) => { await page.locator(".d-stage .bt-date-btn").first().click(); }],
  ["acik aralik takvimi", "date-range-picker", async (page) => { await page.locator(".d-stage .bt-date-btn").first().click(); }],
  ["acik pencere", "modal", async (page) => { await page.locator(".d-stage button").first().click(); }],
  ["acik cekmece", "drawer", async (page) => { await page.locator(".d-stage button").first().click(); }],
  ["acik menu", "menu", async (page) => { await page.locator(".d-stage button").first().click(); }],
  ["acik onay", "confirm", async (page) => { await page.locator(".d-stage button").first().click(); }],
  ["kolon menusu", "data-grid", async (page) => { const th = page.locator(".d-stage th[data-key]").nth(3); await th.hover(); await th.locator(".bt-th-menu").click(); }],
];

for (const [name, id, act] of STATES) {
  test(`durum: ${name}`, async ({ page }, info) => {
    await open(page, "tr", id, themeOf(info.project.name));
    await act(page);
    await page.waitForSelector(`${POPUP}, [role=dialog], [role=alertdialog]`);
    await page.waitForTimeout(250);
    expect(await audit(page, `${POPUP}`)).toEqual([]);
  });
}

test("durum: secili cipler bantta okunur", async ({ page }, info) => {
  await open(page, "tr", "data-table", themeOf(info.project.name));
  const chips = page.locator('.bt-band[data-tone="accent"] .bt-chip');
  for (let i = 0; i < await chips.count(); i++) {
    await chips.nth(i).click();
    await page.waitForTimeout(220);
    expect(await audit(page, '.bt-band[data-tone="accent"]')).toEqual([]);
  }
});
