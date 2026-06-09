import { redirect } from "next/navigation";

import { getRoleHomePath } from "@/features/auth/model/role-home";
import { getCurrentAuthSession } from "@/features/auth/server/current-session";

export async function redirectIfAuthenticated() {
  const session = await getCurrentAuthSession();

  if (session) {
    redirect(getRoleHomePath(session.user.role));
  }
}
