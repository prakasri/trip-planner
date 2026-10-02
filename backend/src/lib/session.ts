import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
}

// sameSite: "none" is required because the frontend (Vercel) and this backend
// (AWS Amplify) are different domains — see backend-spec.md > Authentication & Authorization.
export const sessionOptions: SessionOptions = {
  cookieName: "evergreen_travels_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
