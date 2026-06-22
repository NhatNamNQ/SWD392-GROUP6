import type {
  ChatApiError,
  ChatBootstrap,
  ChatResponse,
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

export function fetchChatSessions() {
  return request<ChatSessionSummary[]>("/api/chats/sessions");
}

export function fetchChatSession(sessionId: string) {
  return request<ChatSessionDetail>(`/api/chats/sessions/${sessionId}`);
}

export function sendChatMessage(payload: {
  courseId: string;
  documentId?: string;
  chapterIds?: string[];
  sessionId?: string;
  query: string;
}) {
  return request<ChatResponse>("/api/chats", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function renameChatSession(sessionId: string, newTitle: string) {
  return request<ChatSessionDetail>(`/api/chats/sessions/${sessionId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ newTitle }),
  });
}
