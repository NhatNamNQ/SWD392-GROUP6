import { NextResponse } from "next/server";

import {
  buildRefreshCookie,
  createAuthJsonResponse,
  extractBackendRefreshToken,
  readBackendAuthError,
  readBackendAuthSession,
  requestBackend,
} from "@/features/auth/server/backend";
import { getSessionCookieOptions, encodeAuthSession } from "@/features/auth/server/session";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const payload = await request.json();
  const backendResponse = await requestBackend("/api/auth/force-change-password", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!backendResponse.ok) {
    return createAuthJsonResponse(
      await readBackendAuthError(backendResponse),
      backendResponse.status,
    );
  }

  const session = await readBackendAuthSession(backendResponse);
  const response = NextResponse.json(session);

  response.cookies.set(getSessionCookieOptions(await encodeAuthSession(session)));

  const backendRefreshToken = extractBackendRefreshToken(backendResponse);

  if (backendRefreshToken) {
    response.cookies.set(buildRefreshCookie(backendRefreshToken));
  }

  return response;
}
