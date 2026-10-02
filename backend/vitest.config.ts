import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests only (pure functions in src/lib) — fast, no server/DB needed.
// See vitest.integration.config.ts for route-level integration tests.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
