import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative, so the build runs from any path — a Vercel project root, a
  // subdirectory, or a file:// open. Nothing here assumes a domain root.
  base: "./",
  build: { outDir: "dist", sourcemap: false },
});
