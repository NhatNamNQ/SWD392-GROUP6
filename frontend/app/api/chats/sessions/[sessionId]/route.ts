import {
  createJavaJsonResponse,
  requireJavaRequestSession,
  requestJava,
  toJavaErrorResponse,
} from "@/features/java-api/server/java-api";
import type { ChatSessionDetail } from "@/features/student/model/chat-types";

function normalizeChatSessionDetail(detail: ChatSessionDetail): ChatSessionDetail {
  return {
    ...detail,
    messages: detail.messages.map((message) => ({
      ...message,
      role: message.role.toLowerCase() as ChatSessionDetail["messages"][number]["role"],
    })),
  };
}

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const session = await requireJavaRequestSession(request);
    const { sessionId } = await context.params;
    const payload = await requestJava<ChatSessionDetail>(
      session,
      `/api/chats/sessions/${sessionId}`,
    );
    return createJavaJsonResponse(normalizeChatSessionDetail(payload));
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const session = await requireJavaRequestSession(request);
    const { sessionId } = await context.params;
    const body = await request.json();
    const payload = await requestJava<ChatSessionDetail>(
      session,
      `/api/chats/sessions/${sessionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    return createJavaJsonResponse(payload); // Usually don't need normalizeChatSessionDetail here as messages aren't returned or we can normalize it if it does
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
