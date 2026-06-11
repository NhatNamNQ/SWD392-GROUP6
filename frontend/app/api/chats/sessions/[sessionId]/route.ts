import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { ChatSessionDetail } from "@/features/student/model/chat-types";

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;
    return proxyJavaJson<ChatSessionDetail>(request, `/api/chats/sessions/${sessionId}`);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
