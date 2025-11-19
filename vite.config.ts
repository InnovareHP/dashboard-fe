import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add more aliases as needed, e.g.,
      // '@components': path.resolve(__dirname, './src/components'),
    },
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Externalize sonner so build doesn't fail if it's not installed
        // It will be loaded at runtime via dynamic import
        if (id === 'sonner' || id.includes('sonner')) {
          return true;
        }
        return false;
      },
      onwarn(warning, warn) {
        // Suppress warnings about sonner not being resolved
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.id?.includes('sonner')) {
          return;
        }
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    exclude: ['sonner'], // Don't pre-bundle sonner
  },
});
