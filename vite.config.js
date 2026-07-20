import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0, // ne pas ré-inliner les modules JS/CSS externes
  },
});
