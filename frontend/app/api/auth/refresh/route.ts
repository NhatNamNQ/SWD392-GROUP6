import { NextResponse } from "next/server";

import {
  BACKEND_REFRESH_COOKIE,
  buildRefreshCookie,
  createAuthJsonResponse,
  extractBackendRefreshToken,
  readBackendAuthError,
  readBackendAuthSession,
  requestBackend,
} from "@/features/auth/server/backend";
import { readRequestCookie } from "@/features/auth/server/request-session";
import { encodeAuthSession, getSessionCookieOptions } from "@/features/auth/server/session";

export async function POST(request: Request) {
  const refreshToken = readRequestCookie(request, BACKEND_REFRESH_COOKIE);

  if (!refreshToken) {
    return createAuthJsonResponse(
      {
        status: 401,
        message: "Refresh token is missing.",
        code: "AUTH_ERROR",
      },
      401,
    );
  }

  const backendResponse = await requestBackend("/api/auth/refresh", {
    method: "POST",
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
    },
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

  const rotatedRefreshToken = extractBackendRefreshToken(backendResponse);

  if (rotatedRefreshToken) {
    response.cookies.set(buildRefreshCookie(rotatedRefreshToken));
  } else {
    // The current Java backend does not reliably return a replacement refresh cookie on refresh.
    response.cookies.set(buildRefreshCookie(refreshToken));
  }

  return response;
}
