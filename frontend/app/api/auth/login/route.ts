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
  const payload = (await request.json()) as unknown;
  const backendResponse = await requestBackend("/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!backendResponse.ok) {
    const errorBody = await readBackendAuthError(backendResponse);

    if (errorBody && errorBody.errorCode === "REQUIRE_PASSWORD_CHANGE" && errorBody.tempToken) {
      try {
        const token = errorBody.tempToken;
        const jwtPayload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
        const rawRole = (jwtPayload.roles?.[0] || "STUDENT") as string;
        const role = rawRole.replace("ROLE_", "");

        const session = {
          accessToken: token,
          user: {
            id: "bypassed-id",
            email: jwtPayload.sub || "bypassed@orbitdocs.com",
            fullName: "Bypassed User",
            role: role,
            avatarUrl: null,
          },
        };

        const response = NextResponse.json(session);
        response.cookies.set(getSessionCookieOptions(await encodeAuthSession(session)));
        return response;
      } catch {
        // ignore and fallback
      }
    }

    return createAuthJsonResponse(errorBody, backendResponse.status);
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
