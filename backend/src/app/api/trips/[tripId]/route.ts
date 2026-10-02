import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnedTrip } from "@/lib/ownership";
import { updateTripSchema } from "@/lib/validation";
import { dayCount } from "@/lib/dayCount";
import { jsonError, jsonSuccess } from "@/lib/http";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { tripId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.userId },
    include: { destinations: { orderBy: { startDate: "asc" } } },
  });
  if (!trip) return jsonError("NOT_FOUND", "Trip not found");

  return jsonSuccess({
    trip: {
      id: trip.id,
      name: trip.name,
      tripType: trip.tripType,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      destinations: trip.destinations.map((d) => ({
        id: d.id,
        name: d.name,
        startDate: d.startDate.toISOString().slice(0, 10),
        endDate: d.endDate.toISOString().slice(0, 10),
        dayCount: dayCount(d.startDate, d.endDate),
      })),
    },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { tripId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const owned = await getOwnedTrip(session.userId, tripId);
  if (!owned) return jsonError("NOT_FOUND", "Trip not found");

  const parsed = updateTripSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid trip details", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const trip = await prisma.trip.update({ where: { id: tripId }, data: parsed.data });
  return jsonSuccess({ trip });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { tripId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const owned = await getOwnedTrip(session.userId, tripId);
  if (!owned) return jsonError("NOT_FOUND", "Trip not found");

  await prisma.trip.delete({ where: { id: tripId } }); // cascades to Destinations/Activities
  return jsonSuccess(null);
}
