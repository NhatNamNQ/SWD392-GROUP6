import {
  createAuthJsonResponse,
  readBackendApiResponse,
  readBackendAuthError,
  requestBackend,
} from "@/features/auth/server/backend";

export async function POST(request: Request) {
  const payload = await request.json();
  const backendResponse = await requestBackend("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!backendResponse.ok) {
    return createAuthJsonResponse(await readBackendAuthError(backendResponse), backendResponse.status);
  }

  const response = await readBackendApiResponse<{ email: string; expireIn: number }>(backendResponse);
  return createAuthJsonResponse({
    email: response.data?.email ?? payload.email,
    expireIn: response.data?.expireIn ?? 0,
    message: response.message ?? "OTP sent successfully.",
  });
}
