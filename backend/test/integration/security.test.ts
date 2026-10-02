import { describe, it, expect } from "vitest";
import { newAuthedClient } from "../apiClient";

const baseUrl = () => process.env.TEST_API_BASE_URL as string;

describe("CSRF / CORS", () => {
  it("rejects a mutating request from a disallowed Origin", async () => {
    const res = await fetch(`${baseUrl()}/api/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://evil.example.com" },
      body: JSON.stringify({ name: "x", tripType: "solo" }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("FORBIDDEN_ORIGIN");
  });

  it("allows a mutating request from the allowed Origin", async () => {
    const { client } = await newAuthedClient();
    const res = await client.post("/api/trips", { name: "x", tripType: "solo" });
    expect(res.status).toBe(201);
  });

  it("does not require an Origin check on GET requests", async () => {
    const res = await fetch(`${baseUrl()}/api/auth/me`, {
      headers: { Origin: "http://evil.example.com" },
    });
    // Unauthenticated, but specifically not blocked by the Origin check.
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("sets CORS headers scoped to the allowed origin, not a wildcard", async () => {
    const res = await fetch(`${baseUrl()}/api/auth/me`);
    expect(res.headers.get("access-control-allow-origin")).toBe(process.env.ALLOWED_ORIGIN);
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });
});
