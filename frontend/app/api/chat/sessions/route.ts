import { createChatJsonResponse, requireChatRequestSession, toChatErrorResponse } from "@/features/student/server/chat-route";
import { fetchCourseCatalogFromBackend } from "@/features/student/server/chat-backend";
import { createChatSession, listChatSessions } from "@/features/student/server/chat-store";

export async function GET(request: Request) {
  try {
    const session = await requireChatRequestSession(request);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") ?? undefined;

    return createChatJsonResponse(listChatSessions(session.user.id, courseId));
  } catch (error) {
    return toChatErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireChatRequestSession(request);
    const payload = (await request.json()) as {
      courseId: string;
      chapterId: string | null;
      mode: "chapter" | "all";
      initialMessage?: string;
    };

    const courses = await fetchCourseCatalogFromBackend(session.accessToken);
    const created = createChatSession(session.user.id, payload, courses);
    return createChatJsonResponse(created, 201);
  } catch (error) {
    return toChatErrorResponse(error);
  }
}
