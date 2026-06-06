import { createAuthJsonResponse } from "@/features/auth/server/backend";
import { readRequestAuthSession } from "@/features/auth/server/request-session";

export async function GET(request: Request) {
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

  return createAuthJsonResponse(session);
}
