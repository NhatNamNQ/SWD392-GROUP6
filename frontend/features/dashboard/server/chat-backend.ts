import { requestBackend } from "@/features/auth/server/backend";
import type {
  ChatApiError,
  ChatCourseOption,
} from "@/features/dashboard/model/chat-types";

const DEFAULT_PROMPT_SUGGESTIONS = [
  "What is a use case model?",
  "Compare sequence and communication diagrams.",
  "When should I use layered architecture?",
];

type BackendEnvelope<T> = {
  status: number;
  message: string;
  data?: T;
};

type BackendCourse = {
  id: string;
  code: string;
  name: string;
  active: boolean;
};

async function parseJson<T>(response: Response) {
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
): ChatApiError {
  return {
    status: payload?.status ?? response.status,
    message: payload?.message ?? "Something went wrong in the chat service.",
    code: fallbackCode,
  };
}

async function requestChatBackend<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await requestBackend(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  const payload = await parseJson<BackendEnvelope<T>>(response);

  if (!response.ok) {
    throw createChatBackendError(response, payload, "CHAT_BACKEND_ERROR");
  }

  if (!payload?.data) {
    throw {
      status: 502,
      code: "CHAT_BACKEND_INVALID_RESPONSE",
      message: "Java backend returned an invalid chat payload.",
    } satisfies ChatApiError;
  }

  return payload.data;
}

async function fetchBackendCourses(accessToken: string) {
  return requestChatBackend<BackendCourse[]>("/api/v1/courses", accessToken);
}

async function fetchBackendDocumentsByCourse(accessToken: string, courseId: string) {
  return requestChatBackend<
    Array<{
      id: string;
      originalFilename: string;
      status: string;
    }>
  >(`/api/documents/course/${courseId}`, accessToken);
}

async function fetchBackendChaptersByDocument(accessToken: string, documentId: string) {
  return requestChatBackend<
    Array<{
      id: string;
      title: string;
    }>
  >(`/api/documents/${documentId}/chapters`, accessToken);
}

export async function fetchCourseCatalogFromBackend(accessToken: string): Promise<ChatCourseOption[]> {
  const courses = await fetchBackendCourses(accessToken);

  return Promise.all(
    courses
      .filter((course) => course.active)
      .map(async (course) => {
        const documents = await fetchBackendDocumentsByCourse(accessToken, course.id);
        const indexedDocuments = documents.filter((document) => document.status === "INDEXED");
        const chapterByTitle = new Map<string, ChatCourseOption["chapters"][number]>();

        for (const document of indexedDocuments) {
          const chapters = await fetchBackendChaptersByDocument(accessToken, document.id);

          for (const chapter of chapters) {
            if (!chapterByTitle.has(chapter.title)) {
              chapterByTitle.set(chapter.title, {
                id: chapter.id,
                label: chapter.title,
                documentTitle: document.originalFilename,
              });
            }
          }
        }

        return {
          id: course.id,
          name: course.name,
          chapters: Array.from(chapterByTitle.values()).sort((left, right) =>
            left.label.localeCompare(right.label),
          ),
        };
      }),
  );
}

export { DEFAULT_PROMPT_SUGGESTIONS };
