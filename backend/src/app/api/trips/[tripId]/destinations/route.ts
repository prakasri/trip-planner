import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnedTrip } from "@/lib/ownership";
import { createDestinationSchema } from "@/lib/validation";
import { dayCount } from "@/lib/dayCount";
import { jsonError, jsonSuccess } from "@/lib/http";

type Params = { params: Promise<{ tripId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { tripId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const trip = await getOwnedTrip(session.userId, tripId);
  if (!trip) return jsonError("NOT_FOUND", "Trip not found");

  const parsed = createDestinationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid destination details", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const destination = await prisma.destination.create({
    data: { ...parsed.data, tripId },
  });

  return jsonSuccess(
    {
      destination: {
        id: destination.id,
        name: destination.name,
        startDate: destination.startDate.toISOString().slice(0, 10),
        endDate: destination.endDate.toISOString().slice(0, 10),
        dayCount: dayCount(destination.startDate, destination.endDate),
        createdAt: destination.createdAt,
        updatedAt: destination.updatedAt,
      },
    },
    201,
  );
}
