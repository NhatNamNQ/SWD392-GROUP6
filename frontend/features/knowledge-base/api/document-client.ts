import type {
  CourseOption,
  DocumentChapter,
  DocumentChunk,
  KnowledgeBaseError,
  KnowledgeDocument,
  PagedResponse,
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

export function fetchDocumentChunks(documentId: string, page = 0, size = 20) {
  return request<PagedResponse<DocumentChunk>>(
    `/api/teacher/documents/${documentId}/chunks?page=${page}&size=${size}`,
  );
}

export function deleteDocument(documentId: string) {
  return request<{ message?: string }>(`/api/teacher/documents/${documentId}`, {
    method: "DELETE",
  });
}

/** Returns the URL to stream the PDF — used directly in <iframe src="..."> */
export function getDocumentPdfUrl(documentId: string) {
  return `/api/teacher/documents/${documentId}/file`;
}

export function uploadDocumentWithProgress(
  courseId: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<KnowledgeDocument> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.set("courseId", courseId);
    formData.set("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as KnowledgeDocument;
          resolve(response);
        } catch {
          reject(new Error("Invalid response from server"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText) as KnowledgeBaseError;
          reject(error);
        } catch {
          reject(new Error(xhr.statusText || "Upload failed"));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error occurred"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("POST", "/api/teacher/documents/upload");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(formData);
  });
}
