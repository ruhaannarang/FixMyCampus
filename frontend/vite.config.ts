import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  }
}));
