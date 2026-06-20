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
    const payload = await requestJava<ChatSessionDetail>(session, `/api/chats/sessions/${sessionId}`);
    return createJavaJsonResponse(normalizeChatSessionDetail(payload));
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
