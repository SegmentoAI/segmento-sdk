import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default [
  // Library build (ESM + CJS) for bundler consumers
  defineConfig({
    plugins: [
      dts({ include: ["src"], rollupTypes: true }),
    ],
    build: {
      lib: {
        entry: "src/index.ts",
        formats: ["es", "cjs"],
        fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
      },
      rollupOptions: {
        external: ["@segmento/core"],
      },
    },
  }),

  // IIFE build for <script src> — bundles everything, auto-runs on load
  defineConfig({
    build: {
      emptyOutDir: false,
      lib: {
        entry: "src/auto.ts",
        formats: ["iife"],
        name: "SegmentoAnalytics",
        fileName: () => "script.js",
      },
    },
  }),
];
