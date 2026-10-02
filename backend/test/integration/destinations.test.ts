import { describe, it, expect } from "vitest";
import { newAuthedClient } from "../apiClient";

async function createTrip(client: Awaited<ReturnType<typeof newAuthedClient>>["client"]) {
  const res = await client.post("/api/trips", { name: "Spring in Japan", tripType: "couple" });
  return res.body.data.trip.id as string;
}

describe("destinations", () => {
  it("creates a destination and computes dayCount", async () => {
    const { client } = await newAuthedClient();
    const tripId = await createTrip(client);

    const create = await client.post(`/api/trips/${tripId}/destinations`, {
      name: "Tokyo",
      startDate: "2027-04-01",
      endDate: "2027-04-04",
    });
    expect(create.status).toBe(201);
    expect(create.body.data.destination.dayCount).toBe(4);
    expect(create.body.data.destination).not.toHaveProperty("tripId");

    const get = await client.get(`/api/trips/${tripId}/destinations/${create.body.data.destination.id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.destination.activities).toEqual([]);
  });

  it("rejects endDate before startDate", async () => {
    const { client } = await newAuthedClient();
    const tripId = await createTrip(client);

    const res = await client.post(`/api/trips/${tripId}/destinations`, {
      name: "Tokyo",
      startDate: "2027-04-04",
      endDate: "2027-04-01",
    });
    expect(res.status).toBe(400);
  });

  it("404s creating a destination under a trip you don't own", async () => {
    const owner = await newAuthedClient("owner");
    const stranger = await newAuthedClient("stranger");
    const tripId = await createTrip(owner.client);

    const res = await stranger.client.post(`/api/trips/${tripId}/destinations`, {
      name: "Tokyo",
      startDate: "2027-04-01",
      endDate: "2027-04-04",
    });
    expect(res.status).toBe(404);
  });

  it("rejects shrinking the date range if it would orphan an Activity", async () => {
    const { client } = await newAuthedClient();
    const tripId = await createTrip(client);
    const destRes = await client.post(`/api/trips/${tripId}/destinations`, {
      name: "Tokyo",
      startDate: "2027-04-01",
      endDate: "2027-04-04",
    });
    const destinationId = destRes.body.data.destination.id;

    await client.post(`/api/trips/${tripId}/destinations/${destinationId}/activities`, {
      dayNumber: 4,
      description: "Depart",
    });

    const shrink = await client.patch(`/api/trips/${tripId}/destinations/${destinationId}`, {
      endDate: "2027-04-02",
    });
    expect(shrink.status).toBe(400);
    expect(shrink.body.error.code).toBe("VALIDATION_ERROR");

    // the destination's dates are unchanged
    const get = await client.get(`/api/trips/${tripId}/destinations/${destinationId}`);
    expect(get.body.data.destination.endDate).toBe("2027-04-04");
  });

  it("allows shrinking the date range when no Activity would be orphaned", async () => {
    const { client } = await newAuthedClient();
    const tripId = await createTrip(client);
    const destRes = await client.post(`/api/trips/${tripId}/destinations`, {
      name: "Tokyo",
      startDate: "2027-04-01",
      endDate: "2027-04-04",
    });
    const destinationId = destRes.body.data.destination.id;

    await client.post(`/api/trips/${tripId}/destinations/${destinationId}/activities`, {
      dayNumber: 1,
      description: "Arrive",
    });

    const shrink = await client.patch(`/api/trips/${tripId}/destinations/${destinationId}`, {
      endDate: "2027-04-02",
    });
    expect(shrink.status).toBe(200);
    expect(shrink.body.data.destination.dayCount).toBe(2);
  });

  it("deleting a destination cascades its activities", async () => {
    const { client } = await newAuthedClient();
    const tripId = await createTrip(client);
    const destRes = await client.post(`/api/trips/${tripId}/destinations`, {
      name: "Tokyo",
      startDate: "2027-04-01",
      endDate: "2027-04-04",
    });
    const destinationId = destRes.body.data.destination.id;
    await client.post(`/api/trips/${tripId}/destinations/${destinationId}/activities`, {
      dayNumber: 1,
      description: "Arrive",
    });

    const del = await client.delete(`/api/trips/${tripId}/destinations/${destinationId}`);
    expect(del.status).toBe(200);

    const get = await client.get(`/api/trips/${tripId}/destinations/${destinationId}`);
    expect(get.status).toBe(404);
  });
});
