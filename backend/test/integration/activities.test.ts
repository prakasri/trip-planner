import { describe, it, expect } from "vitest";
import { newAuthedClient } from "../apiClient";

async function createDestination(client: Awaited<ReturnType<typeof newAuthedClient>>["client"]) {
  const tripRes = await client.post("/api/trips", { name: "Spring in Japan", tripType: "couple" });
  const tripId = tripRes.body.data.trip.id as string;
  const destRes = await client.post(`/api/trips/${tripId}/destinations`, {
    name: "Tokyo",
    startDate: "2027-04-01",
    endDate: "2027-04-04",
  });
  return { tripId, destinationId: destRes.body.data.destination.id as string };
}

describe("activities", () => {
  it("creates, updates, and deletes an activity", async () => {
    const { client } = await newAuthedClient();
    const { tripId, destinationId } = await createDestination(client);
    const base = `/api/trips/${tripId}/destinations/${destinationId}/activities`;

    const create = await client.post(base, { dayNumber: 1, description: "Arrive" });
    expect(create.status).toBe(201);
    expect(create.body.data.activity).not.toHaveProperty("destinationId");
    const activityId = create.body.data.activity.id;

    const update = await client.patch(`${base}/${activityId}`, { dayNumber: 2, description: "Arrive (moved)" });
    expect(update.status).toBe(200);
    expect(update.body.data.activity).toMatchObject({ dayNumber: 2, description: "Arrive (moved)" });

    const del = await client.delete(`${base}/${activityId}`);
    expect(del.status).toBe(200);

    const get = await client.get(`/api/trips/${tripId}/destinations/${destinationId}`);
    expect(get.body.data.destination.activities).toEqual([]);
  });

  it("rejects a dayNumber beyond the destination's dayCount", async () => {
    const { client } = await newAuthedClient();
    const { tripId, destinationId } = await createDestination(client);

    const res = await client.post(`/api/trips/${tripId}/destinations/${destinationId}/activities`, {
      dayNumber: 10,
      description: "Too far out",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.fields?.dayNumber).toMatch(/between 1 and 4/);
  });

  it("rejects updating a dayNumber beyond the destination's dayCount", async () => {
    const { client } = await newAuthedClient();
    const { tripId, destinationId } = await createDestination(client);
    const create = await client.post(`/api/trips/${tripId}/destinations/${destinationId}/activities`, {
      dayNumber: 1,
      description: "Arrive",
    });

    const res = await client.patch(
      `/api/trips/${tripId}/destinations/${destinationId}/activities/${create.body.data.activity.id}`,
      { dayNumber: 99 },
    );
    expect(res.status).toBe(400);
  });

  it("404s an activity accessed through someone else's destination", async () => {
    const owner = await newAuthedClient("owner");
    const stranger = await newAuthedClient("stranger");
    const { tripId, destinationId } = await createDestination(owner.client);
    const create = await owner.client.post(`/api/trips/${tripId}/destinations/${destinationId}/activities`, {
      dayNumber: 1,
      description: "Arrive",
    });

    const res = await stranger.client.delete(
      `/api/trips/${tripId}/destinations/${destinationId}/activities/${create.body.data.activity.id}`,
    );
    expect(res.status).toBe(404);
  });
});
