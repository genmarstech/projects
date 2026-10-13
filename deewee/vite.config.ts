import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Absolute base: deployed to its own domain root.
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: { outDir: "dist", sourcemap: false },
});
