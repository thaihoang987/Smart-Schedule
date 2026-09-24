import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"));

// base: "./" bat buoc de asset path hoat dong dung qua HA Ingress (base
// path dong theo tung phien, xem SPEC.md muc "Quyet dinh lech spec" #3).
export default defineConfig({
  base: "./",
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    proxy: {
      "/api": "http://localhost:8123",
      "/ws": { target: "ws://localhost:8123", ws: true },
    },
  },
  build: {
    outDir: "dist",
  },
});
