import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

// E2E tests run against real, separately-built frontend and backend servers
// (not dev servers) pointed at the same local Postgres test database the
// backend's integration tests use (see backend/vitest.integration.config.ts)
// — different ports, so the two suites never collide if run together.
const FRONTEND_PORT = 3300;
const BACKEND_PORT = 3301;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

const backendEnv = {
  DATABASE_URL: "postgresql://prakashsrinivasan@127.0.0.1:5433/trip_planner_test",
  DIRECT_URL: "postgresql://prakashsrinivasan@127.0.0.1:5433/trip_planner_test",
  SESSION_SECRET: "e2e-session-secret-0000000000000000000000000000000000",
  ALLOWED_ORIGIN: FRONTEND_URL,
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // tests share one server + database
  retries: 0,
  reporter: "list",
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `npm run build && npm run start -- -p ${BACKEND_PORT}`,
      cwd: path.join(__dirname, "backend"),
      url: `${BACKEND_URL}/api/auth/me`,
      env: backendEnv,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npm run build && npm run start -- -p ${FRONTEND_PORT}`,
      cwd: path.join(__dirname, "frontend"),
      url: FRONTEND_URL,
      env: { NEXT_PUBLIC_API_BASE_URL: BACKEND_URL },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
