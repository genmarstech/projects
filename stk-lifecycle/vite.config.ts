import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Absolute base, unlike the other projects here: this one is deployed to its
// own domain root rather than opened from a file path, and the font and
// favicon URLs in index.html and styles.css are root-relative to match.
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: { outDir: "dist", sourcemap: false },
});
