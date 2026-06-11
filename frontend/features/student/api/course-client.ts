import type {
  ChatChapterOption,
  ChatCourseOption,
  ChatDocumentOption,
  ChatSelection,
} from "@/features/student/model/chat-types";

export function findCourseById(courses: ChatCourseOption[], courseId: string | null) {
  if (!courseId) {
    return null;
  }

  return courses.find((course) => course.id === courseId) ?? null;
}

export function getDocumentOptions(course: ChatCourseOption | null): ChatDocumentOption[] {
  return course?.documents ?? [];
}

export function getChapterOptions(document: ChatDocumentOption | null): ChatChapterOption[] {
  return document?.chapters ?? [];
}

export function findDocumentById(course: ChatCourseOption | null, documentId: string | null) {
  if (!course || !documentId) {
    return null;
  }

  return course.documents.find((document) => document.id === documentId) ?? null;
}

export function findChapterById(document: ChatDocumentOption | null, chapterId: string | null) {
  if (!document || !chapterId) {
    return null;
  }

  return document.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

export function buildSelectionFromDraft(
  courses: ChatCourseOption[],
  courseId: string | null,
  documentId: string | null,
  chapterId: string | null,
): ChatSelection | null {
  const course = findCourseById(courses, courseId);

  if (!course) {
    return null;
  }

  const document = findDocumentById(course, documentId);

  if (!document) {
    return null;
  }

  const chapter = chapterId ? findChapterById(document, chapterId) : null;

  return {
    courseId: course.id,
    courseName: course.name,
    documentId: document.id,
    documentTitle: document.originalFilename,
    chapterId: chapter?.id ?? null,
    chapterTitle: chapter?.title ?? null,
  };
}

export function summarizeSelection(selection: ChatSelection | null) {
  if (!selection) {
    return null;
  }

  return [
    selection.courseName,
    selection.documentTitle,
    selection.chapterTitle ?? "All chapters",
  ]
    .filter(Boolean)
    .join(" · ");
}
