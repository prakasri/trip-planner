import { config } from "dotenv";
import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

// Integration tests hit a real `next start` server (not mocked route
// handlers) because route handlers use next/headers' cookies(), which only
// works inside an actual Next.js request lifecycle — see backend-spec.md.
// Running against the built app also means tests exercise the same code
// path as production, not a test-only shortcut.

let server: ChildProcess | undefined;

export async function setup() {
  config({ path: ".env.test" });
  const port = process.env.TEST_SERVER_PORT as string;
  process.env.TEST_API_BASE_URL = `http://localhost:${port}`;

  await run("npx", ["next", "build"], process.env);

  server = spawn("npx", ["next", "start", "-p", port], {
    env: process.env,
    stdio: "pipe",
  });
  server.stdout?.on("data", (d) => process.env.DEBUG_TESTS && console.log(`[server] ${d}`));
  server.stderr?.on("data", (d) => console.error(`[server] ${d}`));

  await waitForServer(process.env.TEST_API_BASE_URL);
}

export async function teardown() {
  server?.kill();
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))));
  });
}

async function waitForServer(baseUrl: string, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/api/auth/me`);
      if (res.status === 401) return; // server is up; this route just correctly reports "not logged in"
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}
