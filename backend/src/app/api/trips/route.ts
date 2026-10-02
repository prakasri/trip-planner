import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createTripSchema } from "@/lib/validation";
import { jsonError, jsonSuccess } from "@/lib/http";
import { serializeTrip } from "@/lib/serializers";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const trips = await prisma.trip.findMany({
    where: { userId: session.userId },
    include: { destinations: { select: { startDate: true, endDate: true } } },
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess({
    trips: trips.map((trip) => {
      const starts = trip.destinations.map((d) => d.startDate.getTime());
      const ends = trip.destinations.map((d) => d.endDate.getTime());
      return {
        id: trip.id,
        name: trip.name,
        tripType: trip.tripType,
        destinationCount: trip.destinations.length,
        startDate: starts.length ? new Date(Math.min(...starts)).toISOString().slice(0, 10) : null,
        endDate: ends.length ? new Date(Math.max(...ends)).toISOString().slice(0, 10) : null,
        createdAt: trip.createdAt,
      };
    }),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const parsed = createTripSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid trip details", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const trip = await prisma.trip.create({
    data: { ...parsed.data, userId: session.userId },
  });

  return jsonSuccess({ trip: serializeTrip(trip) }, 201);
}
