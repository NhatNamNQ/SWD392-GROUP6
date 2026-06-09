import { createChatJsonResponse, requireChatRequestSession, toChatErrorResponse } from "@/features/dashboard/server/chat-route";
import { getChatSession } from "@/features/dashboard/server/chat-store";

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
