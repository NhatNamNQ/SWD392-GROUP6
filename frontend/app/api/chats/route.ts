import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { ChatResponse } from "@/features/student/model/chat-types";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return proxyJavaJson<ChatResponse>(
      request,
      "/api/chats",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      201,
    );
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
