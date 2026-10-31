import { expect, test, type Page } from "@playwright/test";
import { boxes, open } from "./helpers";

/** Clicking a control must not move it or anything beside it. Width changes read as a jump. */
async function assertSteady(page: Page, group: string, click: string) {
  const items = page.locator(click);
  const count = await items.count();
  expect(count, `${click} bulunamadi`).toBeGreaterThan(0);
  for (let i = 0; i < Math.min(count, 10); i++) {
    const before = await boxes(page, group);
    await items.nth(i).click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(80);
    expect(await boxes(page, group), `${click} #${i}`).toEqual(before);
  }
}

test("cipler secilince boyut degistirmez", async ({ page }) => {
  await open(page, "tr", "chip", "light");
  await assertSteady(page, ".d-stage .bt-chip", ".d-stage .bt-chip");
});

test("sekmeler secilince boyut degistirmez", async ({ page }) => {
  await open(page, "tr", "tabs", "light");
  await assertSteady(page, ".d-stage .bt-tab", ".d-stage .bt-tab:not([data-disabled])");
});

test("sayfalama dugmeleri yer degistirmez", async ({ page }) => {
  await open(page, "tr", "pagination", "light");
  const bar = page.locator(".d-stage .bt-pages").first();
  await bar.getByRole("button", { name: "1", exact: true }).click();
  const before = await boxes(page, ".d-stage .bt-pages >> nth=0 >> > *");
  const next = bar.getByRole("button", { name: "Sonraki sayfa" });
  while ((await next.getAttribute("aria-disabled")) !== "true") {
    await next.click();
    await page.waitForTimeout(30);
    expect(await boxes(page, ".d-stage .bt-pages >> nth=0 >> > *")).toEqual(before);
  }
});

test("son sayfada ileri dugmesi odagi kaybetmez", async ({ page }) => {
  await open(page, "tr", "pagination", "light");
  const bar = page.locator(".d-stage .bt-pages").first();
  const next = bar.getByRole("button", { name: "Sonraki sayfa" });
  while ((await next.getAttribute("aria-disabled")) !== "true") await next.click();
  await expect(next).toBeFocused();
});

test("anahtarlar ve kutular durum degisince yer degistirmez", async ({ page }) => {
  await open(page, "tr", "switch", "light");
  await assertSteady(page, ".d-demo >> nth=0 >> .bt-switch", ".d-demo >> nth=0 >> .bt-switch:not([data-disabled])");
  await open(page, "tr", "checkbox", "light");
  await assertSteady(page, ".d-stage .bt-check", ".d-stage .bt-check:not([data-disabled])");
});

test("tablo kolonlari siralama ve sayfa degisince kaymaz", async ({ page }) => {
  await open(page, "tr", "data-table", "light");
  const table = ".d-demo >> nth=0 >> th";
  await assertSteady(page, table, ".d-demo >> nth=0 >> .bt-sort >> nth=1");
  await assertSteady(page, table, ".d-demo >> nth=0 >> .bt-page:not([data-off]):not([data-active]) >> nth=0");
});

test("grafik animasyonu bitince cubuklar yerinde durur", async ({ page }) => {
  await open(page, "tr", "bar-chart", "light");
  await expect(page.locator(".d-stage .bt-chart-bar").first()).toBeVisible();
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  expect(running).toBe(0);
});

test("sayfa gecisinde bos kare olmaz", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "menu cekmecede");
  await open(page, "tr", "button", "light");
  await page.evaluate(() => {
    const state = { empty: 0 };
    (window as unknown as { __state: typeof state }).__state = state;
    const tick = () => {
      if ((document.querySelector(".d-article") as HTMLElement | null)?.innerText.trim().length === 0) state.empty += 1;
      requestAnimationFrame(tick);
    };
    tick();
  });
  for (const name of ["Select", "Modal", "Tabs"]) await page.locator(".bt-nav-item", { hasText: new RegExp(`^${name}$`) }).first().click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __state: { empty: number } }).__state.empty)).toBe(0);
});

test("yatay tasma yok", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  for (const id of ["home", "button", "data-table", "data-grid", "date-range-picker", "bar-chart", "app-shell"]) {
    await open(page, "tr", id, "light");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), id).toBe(true);
  }
});

test("telefondan genislesince sayfa kilitli kalmaz", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  await open(page, "tr", "button", "light");
  await page.getByRole("button", { name: "Menü" }).click();
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(page.locator(".bt-app")).not.toHaveAttribute("data-nav-open", "");
  await expect(page.locator(".bt-main")).not.toHaveAttribute("inert", "");
});

test("tablo gorunumunden donunce grafik yeniden cizilir", async ({ page }) => {
  await open(page, "tr", "bar-chart", "light");
  const chart = page.locator(".d-stage .bt-chart").first();
  await chart.getByRole("button", { name: "Tablo" }).click();
  await chart.getByRole("button", { name: "Grafik" }).click();
  await expect(chart.locator("svg .bt-chart-bar").first()).toBeVisible();
});

test("bant ciplerinde yazi ve sayi her durumda okunur", async ({ page }) => {
  await open(page, "tr", "data-table", "light");
  const chips = page.locator('.bt-band[data-tone="accent"] .bt-chip[data-tone]');
  expect(await chips.count()).toBeGreaterThan(0);
  for (let i = 0; i < await chips.count(); i++) {
    for (const state of ["bos", "secili"]) {
      if (state === "secili") await chips.nth(i).click();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(220);
      const ratios = await chips.nth(i).evaluate((chip) => {
        const channels = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
        const luminance = (rgb: number[]) => {
          const [r, g, b] = rgb.map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4));
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const ratio = (a: string, b: string) => {
          const [x, y] = [luminance(channels(a)), luminance(channels(b))].sort((m, n) => n - m);
          return (x + 0.05) / (y + 0.05);
        };
        const background = getComputedStyle(chip).backgroundColor;
        const parts = [chip, ...Array.from(chip.querySelectorAll(".bt-chip-count"))];
        return parts.map((part) => ratio(getComputedStyle(part).color, background));
      });
      for (const value of ratios) expect(value, `${state} #${i}`).toBeGreaterThanOrEqual(4.5);
    }
    await chips.nth(i).click();
  }
});

/** Every pixel of a virtual list's viewport must hold a row, wherever it is scrolled to. */
async function viewportIsFull(page: Page, table: string) {
  const area = page.locator(`${table} .bt-table-scroll`).first();
  await area.scrollIntoViewIfNeeded();
  for (const share of [0, 0.37, 0.71]) {
    await area.evaluate((el, at) => { el.scrollTop = (el.scrollHeight - el.clientHeight) * at; }, share);
    await page.waitForTimeout(250);
    const gap = await area.evaluate((el) => {
      const view = el.getBoundingClientRect();
      const head = el.querySelector("thead th")!.getBoundingClientRect().bottom;
      const rows = Array.from(el.querySelectorAll("tbody tr:not([data-spacer])")).map((row) => row.getBoundingClientRect());
      const top = Math.min(...rows.map((b) => b.top));
      const bottom = Math.max(...rows.map((b) => b.bottom));
      return { above: Math.max(0, top - head), below: Math.max(0, view.bottom - bottom) };
    });
    expect(gap, `kaydirma ${share}`).toEqual({ above: 0, below: 0 });
  }
}

test("sanal tablo goruntu alanini her konumda doldurur", async ({ page }) => {
  await open(page, "tr", "data-grid", "light");
  await viewportIsFull(page, '.d-demo:has(.bt-table[data-virtual])');
});
