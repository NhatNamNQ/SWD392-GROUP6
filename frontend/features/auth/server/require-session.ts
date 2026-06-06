import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_SESSION_COOKIE, decodeAuthSession } from "@/features/auth/server/session";

export async function requireAuthSession(pathname: string) {
  const cookieStore = await cookies();
  const session = await decodeAuthSession(cookieStore.get(AUTH_SESSION_COOKIE)?.value);

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  return session;
}
