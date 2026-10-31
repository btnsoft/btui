import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  platform: "neutral",
  external: ["react", "react-dom", "react/jsx-runtime", /^@base-ui\/react/],
  copy: [{ from: "src/styles.css", to: "dist" }],
  outputOptions: { banner: '"use client";' },
});
