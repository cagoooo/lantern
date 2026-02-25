import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  base: "/lantern/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // The user's provided snippet implies adding themePlugin() here,
    // but it's not present in the original file's imports.
    // Assuming themePlugin() is a placeholder or needs to be imported.
    // For now, I will only move the base property as per the explicit instruction
    // and the structure implied by the Code Edit snippet,
    // without adding themePlugin() as it's not defined or imported.
    // If themePlugin() was intended to be added, it would need an import statement.
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer(),
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) =>
          m.devBanner(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  optimizeDeps: {
    include: ["three", "@react-three/fiber", "@react-three/drei", "lucide-react", "canvas-confetti"],
  },
});
