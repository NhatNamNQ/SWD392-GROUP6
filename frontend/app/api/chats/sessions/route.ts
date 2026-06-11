import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { ChatSessionSummary } from "@/features/student/model/chat-types";

export async function GET(request: Request) {
  try {
    return proxyJavaJson<ChatSessionSummary[]>(request, "/api/chats/sessions");
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
