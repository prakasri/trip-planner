import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnedTrip } from "@/lib/ownership";
import { updateTripSchema } from "@/lib/validation";
import { jsonError, jsonSuccess } from "@/lib/http";
import { serializeTrip, serializeDestination } from "@/lib/serializers";

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
      ...serializeTrip(trip),
      destinations: trip.destinations.map(serializeDestination),
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
  return jsonSuccess({ trip: serializeTrip(trip) });
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
