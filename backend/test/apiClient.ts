import { randomUUID } from "node:crypto";

// A minimal stand-in for a browser: persists cookies across requests and
// sends the Origin header the backend's CSRF check expects, matching how
// the real frontend talks to this API.
export class TestClient {
  private cookie: string | undefined;
  private baseUrl = process.env.TEST_API_BASE_URL as string;
  private origin = process.env.ALLOWED_ORIGIN as string;

  async request(path: string, init: RequestInit = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      redirect: "manual",
      headers: {
        "Content-Type": "application/json",
        Origin: this.origin,
        ...(this.cookie ? { Cookie: this.cookie } : {}),
        ...init.headers,
      },
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) this.cookie = setCookie.split(";")[0];
    const body = await res.json();
    return { status: res.status, body };
  }

  get(path: string) {
    return this.request(path);
  }
  post(path: string, data?: unknown) {
    return this.request(path, { method: "POST", body: data ? JSON.stringify(data) : undefined });
  }
  patch(path: string, data: unknown) {
    return this.request(path, { method: "PATCH", body: JSON.stringify(data) });
  }
  delete(path: string) {
    return this.request(path, { method: "DELETE" });
  }
}

export function uniqueUsername(prefix = "user") {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function newAuthedClient(usernamePrefix = "user") {
  const client = new TestClient();
  const username = uniqueUsername(usernamePrefix);
  const res = await client.post("/api/auth/signup", { username, password: "password123" });
  return { client, username, userId: res.body.data.user.id as string };
}
