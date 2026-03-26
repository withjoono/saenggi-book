// vite.config.ts
import { defineConfig } from "file:///E:/Dev/github/MySanggibu/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Dev/github/MySanggibu/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { TanStackRouterVite } from "file:///E:/Dev/github/MySanggibu/frontend/node_modules/@tanstack/router-vite-plugin/dist/esm/index.js";
var __vite_injected_original_dirname = "E:\\Dev\\github\\MySanggibu\\frontend";
var vite_config_default = defineConfig(() => {
  return {
    plugins: [react(), TanStackRouterVite()],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    server: {
      port: 3007,
      cors: true,
      // CORS 활성화
      proxy: {
        // Hub 중앙 인증 서버 (포트 4000)
        "/api-hub": {
          target: "http://localhost:4000",
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api-hub/, "")
        },
        // MS 백엔드 (포트 4007)
        "/api-nest": {
          target: "http://localhost:4007",
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api-nest/, "")
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1600
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxEZXZcXFxcZ2l0aHViXFxcXE15U2FuZ2dpYnVcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXERldlxcXFxnaXRodWJcXFxcTXlTYW5nZ2lidVxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovRGV2L2dpdGh1Yi9NeVNhbmdnaWJ1L2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBUYW5TdGFja1JvdXRlclZpdGUgfSBmcm9tIFwiQHRhbnN0YWNrL3JvdXRlci12aXRlLXBsdWdpblwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgcGx1Z2luczogW3JlYWN0KCksIFRhblN0YWNrUm91dGVyVml0ZSgpXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogMzAwNyxcclxuICAgICAgY29yczogdHJ1ZSwgLy8gQ09SUyBcdUQ2NUNcdUMxMzFcdUQ2NTRcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAvLyBIdWIgXHVDOTExXHVDNTU5IFx1Qzc3OFx1Qzk5RCBcdUMxMUNcdUJDODQgKFx1RDNFQ1x1RDJCOCA0MDAwKVxyXG4gICAgICAgIFwiL2FwaS1odWJcIjoge1xyXG4gICAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NDAwMFwiLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS1odWIvLCBcIlwiKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIE1TIFx1QkMzMVx1QzVENFx1QjREQyAoXHVEM0VDXHVEMkI4IDQwMDcpXHJcbiAgICAgICAgXCIvYXBpLW5lc3RcIjoge1xyXG4gICAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NDAwN1wiLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS1uZXN0LywgXCJcIiksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDE2MDAsXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStSLFNBQVMsb0JBQW9CO0FBQzVULE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUywwQkFBMEI7QUFIbkMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLE1BQU07QUFDaEMsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQztBQUFBLElBQ3ZDLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQTtBQUFBLE1BQ04sT0FBTztBQUFBO0FBQUEsUUFFTCxZQUFZO0FBQUEsVUFDVixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxjQUFjLEVBQUU7QUFBQSxRQUNsRDtBQUFBO0FBQUEsUUFFQSxhQUFhO0FBQUEsVUFDWCxRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxlQUFlLEVBQUU7QUFBQSxRQUNuRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCx1QkFBdUI7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
