import { requestBackend } from "@/features/auth/server/backend";
import type {
  ChatBootstrap,
  ChatChapterOption,
  ChatCourseOption,
  ChatDocumentOption,
  ChatSessionSummary,
} from "@/features/student/model/chat-types";

const DEFAULT_PROMPT_SUGGESTIONS = [
  "What is a use case model?",
  "Compare sequence and communication diagrams.",
  "When should I use layered architecture?",
];

type BackendEnvelope<T> = {
  status?: number;
  message?: string;
  data?: T;
};

type BackendCourse = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  lecturerId: string | null;
  lecturerName: string | null;
};

type BackendDocument = {
  id: string;
  originalFilename: string;
  status: string;
};

type BackendChapter = {
  id: string;
  documentId: string;
  orderIndex: number;
  title: string;
  description: string | null;
};

type BackendChatSession = {
  id: string;
  courseId: string;
  title: string;
  lastMessageAt: string;
};

async function readJson<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as T;
}

function createChatBackendError(
  response: Response,
  payload: BackendEnvelope<unknown> | null,
  fallbackCode: string,
) {
  return {
    status: payload?.status ?? response.status,
    message: payload?.message ?? "Something went wrong in the chat service.",
    code: fallbackCode,
  };
}

async function requestChatBackend<T>(path: string, accessToken: string, init?: RequestInit) {
  const response = await requestBackend(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  const payload = await readJson<BackendEnvelope<T> | T>(response);

  if (!response.ok) {
    throw createChatBackendError(
      response,
      payload as BackendEnvelope<unknown> | null,
      "CHAT_BACKEND_ERROR",
    );
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw {
      status: 502,
      code: "CHAT_BACKEND_INVALID_RESPONSE",
      message: "Java backend returned an invalid chat payload.",
    };
  }

  return (payload as BackendEnvelope<T>).data as T;
}

async function fetchBackendCourses(accessToken: string) {
  return requestChatBackend<BackendCourse[]>("/api/v1/courses", accessToken);
}

async function fetchBackendDocumentsByCourse(accessToken: string, courseId: string) {
  return requestChatBackend<BackendDocument[]>(`/api/documents/course/${courseId}`, accessToken);
}

async function fetchBackendChaptersByDocument(accessToken: string, documentId: string) {
  return requestChatBackend<BackendChapter[]>(`/api/documents/${documentId}/chapters`, accessToken);
}

async function fetchBackendSessions(accessToken: string) {
  return requestChatBackend<BackendChatSession[]>("/api/chats/sessions", accessToken);
}

function mapCourseDocuments(accessToken: string, course: BackendCourse): Promise<ChatCourseOption> {
  return (async () => {
    const documents = await fetchBackendDocumentsByCourse(accessToken, course.id);
    const indexedDocuments = (documents || []).filter((document) => document.status === "INDEXED");

    const mappedDocuments: ChatDocumentOption[] = await Promise.all(
      indexedDocuments.map(async (document) => {
        const chapters = await fetchBackendChaptersByDocument(accessToken, document.id);

        return {
          id: document.id,
          originalFilename: document.originalFilename,
          status: document.status,
          chapters: (chapters || []).map(
            (chapter): ChatChapterOption => ({
              id: chapter.id,
              documentId: chapter.documentId,
              documentTitle: document.originalFilename,
              orderIndex: chapter.orderIndex,
              title: chapter.title,
              description: chapter.description,
            }),
          ),
        };
      }),
    );

    return {
      id: course.id,
      code: course.code,
      name: course.name,
      active: course.active,
      lecturerId: course.lecturerId,
      lecturerName: course.lecturerName,
      documents: mappedDocuments,
    };
  })();
}

export async function fetchCourseCatalogFromBackend(
  accessToken: string,
): Promise<ChatCourseOption[]> {
  const courses = await fetchBackendCourses(accessToken);

  if (!courses || !Array.isArray(courses)) {
    return [];
  }

  return Promise.all(
    courses
      .filter((course) => course.active)
      .map((course) => mapCourseDocuments(accessToken, course)),
  );
}

export async function fetchChatSessionsFromBackend(
  accessToken: string,
): Promise<ChatSessionSummary[]> {
  const sessions = await fetchBackendSessions(accessToken);

  if (!sessions || !Array.isArray(sessions)) {
    return [];
  }

  return sessions.map((session) => ({
    id: session.id,
    courseId: session.courseId,
    title: session.title,
    lastMessageAt: session.lastMessageAt,
  }));
}

export async function fetchChatBootstrapFromBackend(accessToken: string): Promise<ChatBootstrap> {
  const [courses, sessions] = await Promise.all([
    fetchCourseCatalogFromBackend(accessToken),
    fetchChatSessionsFromBackend(accessToken),
  ]);
  const courseNameById = new Map(courses.map((course) => [course.id, course.name]));

  return {
    courses,
    sessions: sessions.map((session) => ({
      ...session,
      courseName: courseNameById.get(session.courseId) ?? null,
    })),
    promptSuggestions: DEFAULT_PROMPT_SUGGESTIONS,
  };
}

export { DEFAULT_PROMPT_SUGGESTIONS };
