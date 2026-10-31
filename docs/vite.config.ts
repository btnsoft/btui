import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = (path: string) => fileURLToPath(new URL(`../src/${path}`, import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "./",
  plugins: [react()],
  resolve: { alias: [{ find: "btui/styles.css", replacement: src("styles.css") }, { find: /^btui$/, replacement: src("index.ts") }] },
  build: { outDir: "dist", emptyOutDir: true },
});
