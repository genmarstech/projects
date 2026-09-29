import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * One page, no router, no server. The storefront holds its own state and
 * `npm run build` emits a static bundle that serves from anywhere.
 */
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "dist", sourcemap: false },
});
