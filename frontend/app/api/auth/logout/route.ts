import { NextResponse } from "next/server";

import { clearRefreshCookie, requestBackend } from "@/features/auth/server/backend";
import { readRequestAuthSession } from "@/features/auth/server/request-session";
import { clearSerializedSession } from "@/features/auth/server/session";

export async function POST(request: Request) {
  const session = await readRequestAuthSession(request);

  if (session) {
    try {
      await requestBackend("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
    } catch {
      // Frontend logout should still complete even if backend logout fails.
    }
  }

  const response = NextResponse.json({ message: "Signed out." });
  response.cookies.set(clearSerializedSession());
  response.cookies.set(clearRefreshCookie());
  return response;
}
