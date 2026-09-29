import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * No router, no server, no API — the whole dashboard is one page holding its
 * own state, which is why this is Vite and not Next. `npm run build` emits a
 * static bundle that can be served from anywhere.
 */
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "dist", sourcemap: false },
});
