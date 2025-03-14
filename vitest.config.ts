import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()], // Enables tsconfig path resolution
  test: {
    globals: true,
    environment: "jsdom", // Ensure JSDOM for DOM testing
  },
});
