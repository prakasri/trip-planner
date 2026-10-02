import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnedTrip } from "@/lib/ownership";
import { createDestinationSchema } from "@/lib/validation";
import { jsonError, jsonSuccess } from "@/lib/http";
import { serializeDestination } from "@/lib/serializers";

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

  return jsonSuccess({ destination: serializeDestination(destination) }, 201);
}
