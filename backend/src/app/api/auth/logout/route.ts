import { getSession } from "@/lib/session";
import { jsonSuccess } from "@/lib/http";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return jsonSuccess(null);
}
