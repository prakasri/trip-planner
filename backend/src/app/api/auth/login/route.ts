import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { jsonError, jsonSuccess } from "@/lib/http";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid login details");
  }
  const { username, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return jsonError("INVALID_CREDENTIALS", "Username or password is incorrect");
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return jsonSuccess({ user: { id: user.id, username: user.username } });
}
