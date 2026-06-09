import { createChatJsonResponse, requireChatRequestSession, toChatErrorResponse } from "@/features/student/server/chat-route";
import { fetchCourseCatalogFromBackend } from "@/features/student/server/chat-backend";
import { appendChatMessage } from "@/features/student/server/chat-store";

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await requireChatRequestSession(request);
    const { sessionId } = await context.params;
    const payload = (await request.json()) as { content: string };
    const courses = await fetchCourseCatalogFromBackend(session.accessToken);

    return createChatJsonResponse(
      appendChatMessage(session.user.id, sessionId, payload.content, courses),
    );
  } catch (error) {
    return toChatErrorResponse(error);
  }
}
