import type { CourseRecord } from "@/features/course-management/model/types";
import type { KnowledgeDocument } from "@/features/knowledge-base/model/types";

export type TeacherCourseDocuments = {
  course: CourseRecord;
  documents: KnowledgeDocument[];
};

export type TeacherDashboardSummary = {
  totalCourses: number;
  totalDocuments: number;
  indexedDocuments: number;
  processingDocuments: number;
  failedDocuments: number;
  chatReadyCourses: number;
};

export type TeacherChatReadyCourse = {
  courseId: string;
  courseCode: string;
  courseName: string;
  indexedDocuments: number;
};

export type TeacherRecentDocument = {
  course: CourseRecord;
  document: KnowledgeDocument;
};

export type TeacherDashboardData = {
  ownedCourses: CourseRecord[];
  courseDocuments: TeacherCourseDocuments[];
  chatReadyCourses: TeacherChatReadyCourse[];
  recentDocuments: TeacherRecentDocument[];
  summary: TeacherDashboardSummary;
};

export function selectLecturerCourses(courses: CourseRecord[], lecturerId: string) {
  return courses.filter((course) => course.lecturerId === lecturerId);
}

export function buildTeacherDashboardData({
  courses,
  lecturerId,
  documentsByCourse,
}: {
  courses: CourseRecord[];
  lecturerId: string;
  documentsByCourse: Record<string, KnowledgeDocument[]>;
}): TeacherDashboardData {
  const ownedCourses = selectLecturerCourses(courses, lecturerId);
  const courseDocuments = ownedCourses.map((course) => ({
    course,
    documents: documentsByCourse[course.id] ?? [],
  }));

  const recentDocuments = courseDocuments
    .flatMap(({ course, documents }) => documents.map((document) => ({ course, document })))
    .sort(
      (left, right) =>
        new Date(right.document.createdAt).getTime() - new Date(left.document.createdAt).getTime(),
    );

  const indexedDocuments = recentDocuments.filter((entry) => entry.document.status === "INDEXED");
  const processingDocuments = recentDocuments.filter(
    (entry) => entry.document.status === "PROCESSING",
  );
  const failedDocuments = recentDocuments.filter((entry) => entry.document.status === "FAILED");

  const chatReadyCourses = courseDocuments
    .map(({ course, documents }) => ({
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      indexedDocuments: documents.filter((document) => document.status === "INDEXED").length,
    }))
    .filter((course) => course.indexedDocuments > 0);

  return {
    ownedCourses,
    courseDocuments,
    chatReadyCourses,
    recentDocuments,
    summary: {
      totalCourses: ownedCourses.length,
      totalDocuments: recentDocuments.length,
      indexedDocuments: indexedDocuments.length,
      processingDocuments: processingDocuments.length,
      failedDocuments: failedDocuments.length,
      chatReadyCourses: chatReadyCourses.length,
    },
  };
}
