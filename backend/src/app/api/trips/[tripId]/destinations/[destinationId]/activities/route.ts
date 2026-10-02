import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnedDestination } from "@/lib/ownership";
import { createActivitySchema } from "@/lib/validation";
import { dayCount } from "@/lib/dayCount";
import { jsonError, jsonSuccess } from "@/lib/http";
import { serializeActivity } from "@/lib/serializers";

type Params = { params: Promise<{ tripId: string; destinationId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { tripId, destinationId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const destination = await getOwnedDestination(session.userId, tripId, destinationId);
  if (!destination) return jsonError("NOT_FOUND", "Destination not found");

  const parsed = createActivitySchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid activity details", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const maxDay = dayCount(destination.startDate, destination.endDate);
  if (parsed.data.dayNumber > maxDay) {
    return jsonError("VALIDATION_ERROR", `dayNumber must be between 1 and ${maxDay}`, { dayNumber: `must be between 1 and ${maxDay}` });
  }

  const activity = await prisma.activity.create({
    data: { ...parsed.data, destinationId },
  });

  return jsonSuccess({ activity: serializeActivity(activity) }, 201);
}
