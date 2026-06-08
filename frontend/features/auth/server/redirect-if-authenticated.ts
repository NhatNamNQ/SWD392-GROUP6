import { redirect } from "next/navigation";

import { getCurrentAuthSession } from "@/features/auth/server/current-session";

export async function redirectIfAuthenticated() {
  const session = await getCurrentAuthSession();

  if (session) {
    redirect("/dashboard");
  }
}
