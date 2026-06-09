import type {
  ChatApiError,
  ChatBootstrap,
  ChatMessageResponse,
  ChatSessionDetail,
  ChatSessionSummary,
} from "@/features/student/model/chat-types";

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

async function request<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw await readJson<ChatApiError>(response);
  }

  return readJson<T>(response);
}

export function fetchChatBootstrap() {
  return request<ChatBootstrap>("/api/chat/bootstrap");
}

export function fetchChatSessions(courseId?: string) {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
  return request<ChatSessionSummary[]>(`/api/chat/sessions${query}`);
}

export function fetchChatSession(sessionId: string) {
  return request<ChatSessionDetail>(`/api/chat/sessions/${sessionId}`);
}

export function createChatSession(payload: {
  courseId: string;
  chapterId: string | null;
  mode: "chapter" | "all";
  initialMessage?: string;
}) {
  return request<ChatSessionDetail>("/api/chat/sessions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function sendChatMessage(sessionId: string, content: string) {
  return request<ChatMessageResponse>(`/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
}
