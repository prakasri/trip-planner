import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnedActivity, getOwnedDestination } from "@/lib/ownership";
import { updateActivitySchema } from "@/lib/validation";
import { dayCount } from "@/lib/dayCount";
import { jsonError, jsonSuccess } from "@/lib/http";

type Params = { params: Promise<{ tripId: string; destinationId: string; activityId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { tripId, destinationId, activityId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const existing = await getOwnedActivity(session.userId, tripId, destinationId, activityId);
  if (!existing) return jsonError("NOT_FOUND", "Activity not found");

  const parsed = updateActivitySchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid activity details", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  if (parsed.data.dayNumber !== undefined) {
    const destination = await getOwnedDestination(session.userId, tripId, destinationId);
    const maxDay = dayCount(destination!.startDate, destination!.endDate);
    if (parsed.data.dayNumber > maxDay) {
      return jsonError("VALIDATION_ERROR", `dayNumber must be between 1 and ${maxDay}`, { dayNumber: `must be between 1 and ${maxDay}` });
    }
  }

  const activity = await prisma.activity.update({ where: { id: activityId }, data: parsed.data });
  return jsonSuccess({ activity });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { tripId, destinationId, activityId } = await params;
  const session = await getSession();
  if (!session.userId) return jsonError("UNAUTHENTICATED", "Not logged in");

  const existing = await getOwnedActivity(session.userId, tripId, destinationId, activityId);
  if (!existing) return jsonError("NOT_FOUND", "Activity not found");

  await prisma.activity.delete({ where: { id: activityId } });
  return jsonSuccess(null);
}
