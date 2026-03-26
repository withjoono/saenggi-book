import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), TanStackRouterVite()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3007,
      cors: true, // CORS 활성화
      proxy: {
        // Hub 중앙 인증 서버 (포트 4000)
        "/api-hub": {
          target: "http://localhost:4000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-hub/, ""),
        },
        // MS 백엔드 (포트 4007)
        "/api-nest": {
          target: "http://localhost:4007",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-nest/, ""),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1600,
    },
  };
});
