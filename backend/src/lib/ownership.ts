import { prisma } from "./prisma";

// Every lookup is scoped to the owning user's id, per specs/backend-spec.md
// > Authentication & Authorization: mismatches/absence are indistinguishable
// (both resolve to null -> the caller returns NOT_FOUND, never FORBIDDEN).

export function getOwnedTrip(userId: string, tripId: string) {
  return prisma.trip.findFirst({ where: { id: tripId, userId } });
}

export function getOwnedDestination(userId: string, tripId: string, destinationId: string) {
  return prisma.destination.findFirst({
    where: { id: destinationId, tripId, trip: { userId } },
  });
}

export function getOwnedActivity(
  userId: string,
  tripId: string,
  destinationId: string,
  activityId: string,
) {
  return prisma.activity.findFirst({
    where: { id: activityId, destinationId, destination: { tripId, trip: { userId } } },
  });
}
