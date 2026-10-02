import { defineConfig } from "vitest/config";

// Route-level integration tests: spins up a real `next build && next start`
// against the isolated test database (see test/globalSetup.ts) and exercises
// routes over HTTP, since next/headers' cookies() only works inside a real
// Next.js request lifecycle.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/integration/**/*.test.ts"],
    globalSetup: ["./test/globalSetup.ts"],
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 90_000,
  },
});
