import { createAuthJsonResponse } from "@/features/auth/server/backend";
import { readRequestAuthSession } from "@/features/auth/server/request-session";
import type { ChatApiError } from "@/features/student/model/chat-types";

export function createChatError(status: number, code: string, message: string): ChatApiError {
  return {
    status,
    code,
    message,
  };
}

export async function requireChatRequestSession(request: Request) {
  const session = await readRequestAuthSession(request);

  if (!session) {
    throw createChatError(401, "AUTH_ERROR", "Authentication required.");
  }

  return session;
}

export function createChatJsonResponse(payload: unknown, status = 200) {
  return createAuthJsonResponse(payload, status);
}

export function toChatErrorResponse(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    "code" in error
  ) {
    const chatError = error as { status: number; code: string; message: string };
    return createChatJsonResponse(chatError, chatError.status);
  }

  return createChatJsonResponse(
    {
      status: 500,
      code: "CHAT_INTERNAL_ERROR",
      message: "Something went wrong in the chat service.",
    },
    500,
  );
}
