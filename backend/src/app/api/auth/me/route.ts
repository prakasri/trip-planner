import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonError, jsonSuccess } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return jsonError("UNAUTHENTICATED", "Not logged in");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return jsonError("UNAUTHENTICATED", "Not logged in");
  }

  return jsonSuccess({ user: { id: user.id, username: user.username } });
}
