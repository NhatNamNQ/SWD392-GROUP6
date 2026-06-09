import { getRoleHomePath } from "@/features/auth/model/role-home";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_SESSION_COOKIE, decodeAuthSession } from "@/features/auth/server/session";
import type { RequireAuthOptions } from "@/features/auth/server/role-guard";

export async function requireAuthSession(pathname: string, options: RequireAuthOptions = {}) {
  const cookieStore = await cookies();
  const session = await decodeAuthSession(cookieStore.get(AUTH_SESSION_COOKIE)?.value);

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  if (options.role && session.user.role !== options.role) {
    redirect(getRoleHomePath(session.user.role));
  }

  return session;
}
