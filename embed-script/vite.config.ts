import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "widget.js",
        dir: "dist",
      },
    },
  },
});
