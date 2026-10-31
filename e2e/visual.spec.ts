import { expect, test, type Page } from "@playwright/test";
import { open, PAGE_IDS, themeOf } from "./helpers";

/** Keeps moving parts out of the picture. */
const FREEZE = ".bt-spinner, .bt-skeleton, .bt-btn-spin, .bt-progress-bar[data-indeterminate] { animation: none !important; }";

async function shot(page: Page, name: string, target = page.locator(".d-demo").first()) {
  await page.addStyleTag({ content: FREEZE });
  await target.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(target).toHaveScreenshot(`${name}.png`);
}

for (const id of PAGE_IDS.filter((p) => !["installation", "theming", "localization", "introduction", "patterns", "home"].includes(p))) {
  test(id, async ({ page }, info) => {
    await open(page, "tr", id, themeOf(info.project.name));
    await shot(page, id);
  });
}

for (const id of ["home", "introduction", "theming"]) {
  test(`sayfa ${id}`, async ({ page }, info) => {
    await open(page, "tr", id, themeOf(info.project.name));
    await page.addStyleTag({ content: FREEZE });
    await expect(page).toHaveScreenshot(`page-${id}.png`);
  });
}

const STATES: Array<[string, string, (page: Page) => Promise<void>]> = [
  ["select-acik", "select", (page) => page.locator(".d-stage .bt-select").first().click()],
  ["takvim-acik", "date-picker", (page) => page.locator(".d-stage .bt-date-btn").first().click()],
  ["aralik-acik", "date-range-picker", (page) => page.locator(".d-stage .bt-date-btn").first().click()],
  ["pencere-acik", "modal", (page) => page.locator(".d-stage button").first().click()],
  ["cekmece-acik", "drawer", (page) => page.locator(".d-stage button").first().click()],
  ["menu-acik", "menu", (page) => page.locator(".d-stage button").first().click()],
];

for (const [name, id, act] of STATES) {
  test(`durum ${name}`, async ({ page }, info) => {
    await open(page, "tr", id, themeOf(info.project.name));
    await page.addStyleTag({ content: FREEZE });
    await act(page);
    await page.waitForTimeout(400);
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot(`state-${name}.png`);
  });
}
