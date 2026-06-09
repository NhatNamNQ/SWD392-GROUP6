import { requestBackend } from "@/features/auth/server/backend";
import {
  createJavaJsonResponse,
  requireJavaRequestSession,
  toJavaErrorResponse,
} from "@/features/java-api/server/java-api";

export async function POST(request: Request) {
  try {
    const session = await requireJavaRequestSession(request);
    const formData = await request.formData();

    const response = await requestBackend("/api/documents/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    const payload = await response.json();
    return createJavaJsonResponse(payload.data ?? payload, response.status);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

