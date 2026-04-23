import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/auto.ts",
      formats: ["iife"],
      name: "SegmentoAnalytics",
      fileName: () => "script.js",
    },
  },
});
