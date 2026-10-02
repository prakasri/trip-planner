import { describe, it, expect } from "vitest";
import { TestClient, uniqueUsername } from "../apiClient";

describe("auth", () => {
  it("signs up, reports the current user, and logs out", async () => {
    const client = new TestClient();
    const username = uniqueUsername();

    const signup = await client.post("/api/auth/signup", { username, password: "password123" });
    expect(signup.status).toBe(201);
    expect(signup.body.data.user.username).toBe(username);

    const me = await client.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.data.user.username).toBe(username);

    const logout = await client.post("/api/auth/logout");
    expect(logout.status).toBe(200);

    const meAfterLogout = await client.get("/api/auth/me");
    expect(meAfterLogout.status).toBe(401);
    expect(meAfterLogout.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("rejects signup with a duplicate username (case-insensitive)", async () => {
    const client = new TestClient();
    const username = uniqueUsername();
    await client.post("/api/auth/signup", { username, password: "password123" });

    const dup = await new TestClient().post("/api/auth/signup", {
      username: username.toUpperCase(),
      password: "password123",
    });
    expect(dup.status).toBe(400);
    expect(dup.body.error.code).toBe("USERNAME_TAKEN");
  });

  it("rejects signup with an invalid username or short password", async () => {
    const client = new TestClient();
    const res = await client.post("/api/auth/signup", { username: "a", password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("logs in with correct credentials and rejects incorrect ones", async () => {
    const username = uniqueUsername();
    await new TestClient().post("/api/auth/signup", { username, password: "password123" });

    const loginClient = new TestClient();
    const goodLogin = await loginClient.post("/api/auth/login", { username, password: "password123" });
    expect(goodLogin.status).toBe(200);

    const badLogin = await new TestClient().post("/api/auth/login", { username, password: "wrongpassword" });
    expect(badLogin.status).toBe(401);
    expect(badLogin.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});
