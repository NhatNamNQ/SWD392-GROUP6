import { createChatJsonResponse, requireChatRequestSession, toChatErrorResponse } from "@/features/dashboard/server/chat-route";
import {
  DEFAULT_PROMPT_SUGGESTIONS,
  fetchCourseCatalogFromBackend,
} from "@/features/dashboard/server/chat-backend";
import { listChatSessions } from "@/features/dashboard/server/chat-store";

export async function GET(request: Request) {
  try {
    const session = await requireChatRequestSession(request);
    const courses = await fetchCourseCatalogFromBackend(session.accessToken);

    return createChatJsonResponse({
      courses,
      sessions: listChatSessions(session.user.id),
      promptSuggestions: DEFAULT_PROMPT_SUGGESTIONS,
    });
  } catch (error) {
    return toChatErrorResponse(error);
  }
}
