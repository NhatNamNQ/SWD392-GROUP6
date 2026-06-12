import {
  createChatJsonResponse,
  requireChatRequestSession,
  toChatErrorResponse,
} from "@/features/student/server/chat-route";
import { fetchChatBootstrapFromBackend } from "@/features/student/server/chat-backend";

export async function GET(request: Request) {
  try {
    const session = await requireChatRequestSession(request);
    return createChatJsonResponse(await fetchChatBootstrapFromBackend(session.accessToken));
  } catch (error) {
    console.error("Bootstrap Error:", error);
    return toChatErrorResponse(error);
  }
}
