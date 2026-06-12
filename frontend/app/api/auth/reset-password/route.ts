import {
  createAuthJsonResponse,
  readBackendApiResponse,
  readBackendAuthError,
  requestBackend,
} from "@/features/auth/server/backend";

export async function POST(request: Request) {
  const payload = await request.json();
  const backendResponse = await requestBackend("/api/auth/reset-password", {
    method: "POST",
    headers: {
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

  const response = await readBackendApiResponse<null>(backendResponse);
  return createAuthJsonResponse({
    message: response.message ?? "Password reset successfully.",
  });
}
