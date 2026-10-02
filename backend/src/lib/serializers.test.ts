import { describe, it, expect } from "vitest";
import type { Trip, Destination, Activity } from "@prisma/client";
import { serializeTrip, serializeDestination, serializeActivity } from "./serializers";

// Regression tests for the userId/destinationId leak fixed after local
// testing — see git history. These assert the internal FK fields never
// reappear in a serialized response.

describe("serializeTrip", () => {
  it("never includes userId", () => {
    const trip: Trip = {
      id: "trip-1",
      userId: "user-1",
      name: "Spring in Japan",
      tripType: "couple",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = serializeTrip(trip);
    expect(result).not.toHaveProperty("userId");
    expect(result).toEqual({
      id: "trip-1",
      name: "Spring in Japan",
      tripType: "couple",
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    });
  });
});

describe("serializeDestination", () => {
  it("never includes tripId and computes dayCount", () => {
    const destination: Destination = {
      id: "dest-1",
      tripId: "trip-1",
      name: "Tokyo",
      startDate: new Date("2027-04-01"),
      endDate: new Date("2027-04-04"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = serializeDestination(destination);
    expect(result).not.toHaveProperty("tripId");
    expect(result.dayCount).toBe(4);
    expect(result.startDate).toBe("2027-04-01");
    expect(result.endDate).toBe("2027-04-04");
  });
});

describe("serializeActivity", () => {
  it("never includes destinationId", () => {
    const activity: Activity = {
      id: "activity-1",
      destinationId: "dest-1",
      dayNumber: 1,
      description: "Arrive",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = serializeActivity(activity);
    expect(result).not.toHaveProperty("destinationId");
    expect(result).toEqual({
      id: "activity-1",
      dayNumber: 1,
      description: "Arrive",
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    });
  });
});
