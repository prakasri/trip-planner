import { describe, it, expect } from "vitest";
import { TestClient, newAuthedClient } from "../apiClient";

describe("trips", () => {
  it("rejects unauthenticated access", async () => {
    const res = await new TestClient().get("/api/trips");
    expect(res.status).toBe(401);
  });

  it("creates, lists, fetches, updates, and deletes a trip", async () => {
    const { client } = await newAuthedClient();

    const create = await client.post("/api/trips", { name: "Spring in Japan", tripType: "couple" });
    expect(create.status).toBe(201);
    const trip = create.body.data.trip;
    expect(trip).toMatchObject({ name: "Spring in Japan", tripType: "couple" });
    expect(trip).not.toHaveProperty("userId");

    const list = await client.get("/api/trips");
    expect(list.status).toBe(200);
    expect(list.body.data.trips).toHaveLength(1);
    expect(list.body.data.trips[0]).toMatchObject({
      id: trip.id,
      destinationCount: 0,
      startDate: null,
      endDate: null,
    });

    const get = await client.get(`/api/trips/${trip.id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.trip.destinations).toEqual([]);

    const update = await client.patch(`/api/trips/${trip.id}`, { name: "Spring in Japan (updated)" });
    expect(update.status).toBe(200);
    expect(update.body.data.trip.name).toBe("Spring in Japan (updated)");

    const del = await client.delete(`/api/trips/${trip.id}`);
    expect(del.status).toBe(200);

    const getAfterDelete = await client.get(`/api/trips/${trip.id}`);
    expect(getAfterDelete.status).toBe(404);
  });

  it("rejects an invalid tripType", async () => {
    const { client } = await newAuthedClient();
    const res = await client.post("/api/trips", { name: "x", tripType: "honeymoon" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("isolates trips between users: a trip is 404 (not 403) to a non-owner", async () => {
    const owner = await newAuthedClient("owner");
    const stranger = await newAuthedClient("stranger");

    const create = await owner.client.post("/api/trips", { name: "Private trip", tripType: "solo" });
    const tripId = create.body.data.trip.id;

    const strangerGet = await stranger.client.get(`/api/trips/${tripId}`);
    expect(strangerGet.status).toBe(404);

    const strangerPatch = await stranger.client.patch(`/api/trips/${tripId}`, { name: "hijacked" });
    expect(strangerPatch.status).toBe(404);

    const strangerDelete = await stranger.client.delete(`/api/trips/${tripId}`);
    expect(strangerDelete.status).toBe(404);

    // still there for the real owner
    const ownerGet = await owner.client.get(`/api/trips/${tripId}`);
    expect(ownerGet.status).toBe(200);
  });
});
