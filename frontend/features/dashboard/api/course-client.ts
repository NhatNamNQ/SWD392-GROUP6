import type {
  ChatChapterOption,
  ChatCourseOption,
  ChatMode,
  ChatScope,
} from "@/features/dashboard/model/chat-types";

export function findCourseById(courses: ChatCourseOption[], courseId: string | null) {
  if (!courseId) {
    return null;
  }

  return courses.find((course) => course.id === courseId) ?? null;
}

export function getChapterOptions(course: ChatCourseOption | null): ChatChapterOption[] {
  return course?.chapters ?? [];
}

export function buildScopeFromSelection(
  courses: ChatCourseOption[],
  courseId: string | null,
  chapterValue: string | null,
): ChatScope | null {
  const course = findCourseById(courses, courseId);

  if (!course) {
    return null;
  }

  if (!chapterValue || chapterValue === "all") {
    return {
      courseId: course.id,
      courseName: course.name,
      chapterId: null,
      chapterLabel: "All chapters",
      mode: "all",
    };
  }

  const chapter = course.chapters.find((entry) => entry.id === chapterValue);

  if (!chapter) {
    return {
      courseId: course.id,
      courseName: course.name,
      chapterId: null,
      chapterLabel: "All chapters",
      mode: "all",
    };
  }

  return {
    courseId: course.id,
    courseName: course.name,
    chapterId: chapter.id,
    chapterLabel: chapter.label,
    mode: "chapter" satisfies ChatMode,
  };
}
