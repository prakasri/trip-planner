import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnedDestination } from "@/lib/ownership";
import { updateDestinationSchema } from "@/lib/validation";
import { dayCount } from "@/lib/dayCount";
import { jsonError, jsonSuccess } from "@/lib/http";

type Params = { params: Promise<{ tripId: string; destinationId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { tripId, destinationId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const destination = await prisma.destination.findFirst({
    where: { id: destinationId, tripId, trip: { userId: session.userId } },
    include: { activities: { orderBy: { dayNumber: "asc" } } },
  });
  if (!destination) return jsonError("NOT_FOUND", "Destination not found");

  return jsonSuccess({
    destination: {
      id: destination.id,
      name: destination.name,
      startDate: destination.startDate.toISOString().slice(0, 10),
      endDate: destination.endDate.toISOString().slice(0, 10),
      dayCount: dayCount(destination.startDate, destination.endDate),
      activities: destination.activities.map((a) => ({
        id: a.id,
        dayNumber: a.dayNumber,
        description: a.description,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { tripId, destinationId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const existing = await getOwnedDestination(session.userId, tripId, destinationId);
  if (!existing) return jsonError("NOT_FOUND", "Destination not found");

  const parsed = updateDestinationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid destination details", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const nextStart = parsed.data.startDate ?? existing.startDate;
  const nextEnd = parsed.data.endDate ?? existing.endDate;
  if (nextEnd < nextStart) {
    return jsonError("VALIDATION_ERROR", "endDate must be on or after startDate", { endDate: "must be on or after startDate" });
  }

  const nextDayCount = dayCount(nextStart, nextEnd);
  const orphan = await prisma.activity.findFirst({
    where: { destinationId, dayNumber: { gt: nextDayCount } },
  });
  if (orphan) {
    // Reject rather than cascade-delete — see specs/api-contract-spec.md > Open Questions (resolved)
    return jsonError(
      "VALIDATION_ERROR",
      `This date range would orphan an Activity on day ${orphan.dayNumber}; move or delete it first`,
    );
  }

  const destination = await prisma.destination.update({
    where: { id: destinationId },
    data: parsed.data,
  });

  return jsonSuccess({
    destination: {
      id: destination.id,
      name: destination.name,
      startDate: destination.startDate.toISOString().slice(0, 10),
      endDate: destination.endDate.toISOString().slice(0, 10),
      dayCount: dayCount(destination.startDate, destination.endDate),
      createdAt: destination.createdAt,
      updatedAt: destination.updatedAt,
    },
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { tripId, destinationId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const existing = await getOwnedDestination(session.userId, tripId, destinationId);
  if (!existing) return jsonError("NOT_FOUND", "Destination not found");

  await prisma.destination.delete({ where: { id: destinationId } }); // cascades to Activities
  return jsonSuccess(null);
}
