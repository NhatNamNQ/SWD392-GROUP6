import type {
  CoursePayload,
  CourseRecord,
  CourseSearchResponse,
} from "@/features/course-management/model/types";

type CourseApiError = {
  status: number;
  message: string;
  code: string;
};

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
    throw await readJson<CourseApiError>(response);
  }

  return readJson<T>(response);
}

export function fetchCourses() {
  return request<CourseRecord[]>("/api/admin/courses");
}

export function searchCourses(code: string, pageNo = 0, pageSize = 10) {
  return request<CourseSearchResponse>("/api/admin/courses/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ code, pageNo, pageSize }),
  });
}

export function fetchCourse(courseId: string) {
  return request<CourseRecord>(`/api/admin/courses/${courseId}`);
}

export function createCourse(payload: CoursePayload) {
  return request<CourseRecord>("/api/admin/courses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function updateCourse(courseId: string, payload: CoursePayload) {
  return request<CourseRecord>(`/api/admin/courses/${courseId}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function assignLecturer(courseId: string, lecturerId: string) {
  return request<null>(`/api/admin/courses/${courseId}/lecturers/${lecturerId}`, {
    method: "POST",
  });
}

