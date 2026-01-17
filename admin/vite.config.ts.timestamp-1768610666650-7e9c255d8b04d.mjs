// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/USER/Documents/DIVA/legendary-palm-tree/admin/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/USER/Documents/DIVA/legendary-palm-tree/admin/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"]
        }
      }
    }
  },
  server: {
    port: 5174
    // Remove proxy for Render deployment - will use direct API calls
    // For local development with proxy:
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true
    //   },
    //   '/uploads': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true
    //   }
    // }
  },
  define: {
    // Use Vite's loadEnv with fallback
    NODE_ENV: JSON.stringify(loadEnv("NODE_ENV", "development"))
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERvY3VtZW50c1xcXFxESVZBXFxcXGxlZ2VuZGFyeS1wYWxtLXRyZWVcXFxcYWRtaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVTRVJcXFxcRG9jdW1lbnRzXFxcXERJVkFcXFxcbGVnZW5kYXJ5LXBhbG0tdHJlZVxcXFxhZG1pblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVVNFUi9Eb2N1bWVudHMvRElWQS9sZWdlbmRhcnktcGFsbS10cmVlL2FkbWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgcm9vdDogJy4nLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgICAgICBzdXBhYmFzZTogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTc0LFxyXG4gICAgLy8gUmVtb3ZlIHByb3h5IGZvciBSZW5kZXIgZGVwbG95bWVudCAtIHdpbGwgdXNlIGRpcmVjdCBBUEkgY2FsbHNcclxuICAgIC8vIEZvciBsb2NhbCBkZXZlbG9wbWVudCB3aXRoIHByb3h5OlxyXG4gICAgLy8gcHJveHk6IHtcclxuICAgIC8vICAgJy9hcGknOiB7XHJcbiAgICAvLyAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcclxuICAgIC8vICAgICBjaGFuZ2VPcmlnaW46IHRydWVcclxuICAgIC8vICAgfSxcclxuICAgIC8vICAgJy91cGxvYWRzJzoge1xyXG4gICAgLy8gICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXHJcbiAgICAvLyAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH1cclxuICB9LFxyXG4gIGRlZmluZToge1xyXG4gICAgLy8gVXNlIFZpdGUncyBsb2FkRW52IHdpdGggZmFsbGJhY2tcclxuICAgIE5PREVfRU5WOiBKU09OLnN0cmluZ2lmeShsb2FkRW52KCdOT0RFX0VOVicsICdkZXZlbG9wbWVudCcpKVxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVyxTQUFTLGNBQWMsZUFBZTtBQUN4WSxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUM3QixVQUFVLENBQUMsdUJBQXVCO0FBQUEsUUFDcEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWFSO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVOLFVBQVUsS0FBSyxVQUFVLFFBQVEsWUFBWSxhQUFhLENBQUM7QUFBQSxFQUM3RDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
