import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { signupSchema } from "@/lib/validation";
import { jsonError, jsonSuccess } from "@/lib/http";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid signup details", parsed.error.flatten().fieldErrors as Record<string, string>);
  }
  const { username, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  if (existing) {
    return jsonError("USERNAME_TAKEN", "That username is already taken");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, passwordHash } });

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return jsonSuccess({ user: { id: user.id, username: user.username } }, 201);
}
