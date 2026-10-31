import { defineConfig, devices } from "@playwright/test";

const PORT = 4180;

export default defineConfig({
  testDir: "e2e",
  // Baselines are drawn in the Linux container, the same one CI uses. See README.
  snapshotPathTemplate: "e2e/__screenshots__/{projectName}/{arg}{ext}",
  timeout: 90000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" } },
  use: { baseURL: `http://localhost:${PORT}`, reducedMotion: "reduce", locale: "tr-TR", timezoneId: "Europe/Istanbul", trace: "retain-on-failure" },
  projects: [
    { name: "light", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "dark", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 }, colorScheme: "dark" }, testMatch: /(a11y|visual)\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /(visual|stability)\.spec/ },
  ],
  webServer: { command: `npm run build:docs && npx vite preview --config docs/vite.config.ts --port ${PORT} --strictPort`, port: PORT, reuseExistingServer: !process.env.CI, timeout: 120000 },
});
