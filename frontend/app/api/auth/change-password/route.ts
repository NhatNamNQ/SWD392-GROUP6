import { createAuthJsonResponse, readBackendAuthError, requestBackend } from "@/features/auth/server/backend";
import { readRequestAuthSession } from "@/features/auth/server/request-session";

export async function POST(request: Request) {
  const session = await readRequestAuthSession(request);

  if (!session) {
    return createAuthJsonResponse(
      {
        status: 401,
        message: "You need to sign in first.",
        code: "AUTH_ERROR",
      },
      401,
    );
  }

  const payload = await request.json();
  const backendResponse = await requestBackend("/api/users/change-password", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      id: session.user.id,
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    }),
  });

  if (!backendResponse.ok) {
    return createAuthJsonResponse(await readBackendAuthError(backendResponse), backendResponse.status);
  }

  return createAuthJsonResponse({
    message: "Password updated successfully.",
  });
}
