import { cookies } from "next/headers";

import { AUTH_SESSION_COOKIE, decodeAuthSession } from "@/features/auth/server/session";

export async function getCurrentAuthSession() {
  const cookieStore = await cookies();
  return decodeAuthSession(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
}
