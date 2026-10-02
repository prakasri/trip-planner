import type { Trip, Destination, Activity } from "@prisma/client";
import { dayCount } from "./dayCount";

// Response shapes mirror specs/api-contract-spec.md exactly — never return a
// raw Prisma row, which would leak internal fields like userId/destinationId.

export function serializeTrip(trip: Trip) {
  return {
    id: trip.id,
    name: trip.name,
    tripType: trip.tripType,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}

export function serializeDestination(destination: Destination) {
  return {
    id: destination.id,
    name: destination.name,
    startDate: destination.startDate.toISOString().slice(0, 10),
    endDate: destination.endDate.toISOString().slice(0, 10),
    dayCount: dayCount(destination.startDate, destination.endDate),
    createdAt: destination.createdAt,
    updatedAt: destination.updatedAt,
  };
}

export function serializeActivity(activity: Activity) {
  return {
    id: activity.id,
    dayNumber: activity.dayNumber,
    description: activity.description,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  };
}
