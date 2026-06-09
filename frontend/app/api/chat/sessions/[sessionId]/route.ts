import { createChatJsonResponse, requireChatRequestSession, toChatErrorResponse } from "@/features/student/server/chat-route";
import { getChatSession } from "@/features/student/server/chat-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await requireChatRequestSession(request);
    const { sessionId } = await context.params;

    return createChatJsonResponse(getChatSession(session.user.id, sessionId));
  } catch (error) {
    return toChatErrorResponse(error);
  }
}
