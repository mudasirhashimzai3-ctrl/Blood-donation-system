import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const resolveWsProxyTarget = () => {
  const wsBase = process.env.VITE_WS_BASE_URL?.trim();
  if (wsBase) {
    return null;
  }

  const apiBase = process.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000/api";
  try {
    const url = new URL(apiBase);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:8000";
  }
};

const wsProxyTarget = resolveWsProxyTarget();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: process.env.VITE_BASE_PATH || "/",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@auth": path.resolve(__dirname, "./src/modules/auth"),
      "@settings": path.resolve(__dirname, "./src/modules/settings"),
    },
  },
  server: wsProxyTarget
    ? {
        proxy: {
          "/ws": {
            target: wsProxyTarget,
            ws: true,
            changeOrigin: true,
          },
        },
      }
    : undefined,
});
