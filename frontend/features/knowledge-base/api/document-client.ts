import type {
  CourseOption,
  DocumentChapter,
  DocumentChunk,
  KnowledgeBaseError,
  KnowledgeDocument,
} from "@/features/knowledge-base/model/types";

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
    throw await readJson<KnowledgeBaseError>(response);
  }

  return readJson<T>(response);
}

export function fetchKnowledgeCourses() {
  return request<CourseOption[]>("/api/admin/courses");
}

export function fetchCourseDocuments(courseId: string) {
  return request<KnowledgeDocument[]>(`/api/teacher/courses/${courseId}/documents`);
}

export function uploadDocument(courseId: string, file: File) {
  const formData = new FormData();
  formData.set("courseId", courseId);
  formData.set("file", file);

  return request<KnowledgeDocument>("/api/teacher/documents/upload", {
    method: "POST",
    body: formData,
  });
}

export function fetchDocument(documentId: string) {
  return request<KnowledgeDocument>(`/api/teacher/documents/${documentId}`);
}

export function fetchDocumentChapters(documentId: string) {
  return request<DocumentChapter[]>(`/api/teacher/documents/${documentId}/chapters`);
}

export function fetchDocumentChunks(documentId: string) {
  return request<DocumentChunk[]>(`/api/teacher/documents/${documentId}/chunks`);
}

export function deleteDocument(documentId: string) {
  return request<{ message?: string }>(`/api/teacher/documents/${documentId}`, {
    method: "DELETE",
  });
}

