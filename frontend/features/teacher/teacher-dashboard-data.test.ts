import { describe, expect, test } from "vitest";

import { buildTeacherDashboardData, selectLecturerCourses } from "@/features/teacher/teacher-dashboard-data";
import type { CourseRecord } from "@/features/course-management/model/types";
import type { KnowledgeDocument } from "@/features/knowledge-base/model/types";

const courses: CourseRecord[] = [
  {
    id: "course-1",
    code: "SWD392",
    name: "Software Architecture",
    description: "Architecture patterns",
    active: true,
    lecturerId: "lecturer-1",
    lecturerName: "Lecturer One",
    createdAt: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "course-2",
    code: "PRM392",
    name: "Mobile Programming",
    description: "Mobile",
    active: true,
    lecturerId: "lecturer-1",
    lecturerName: "Lecturer One",
    createdAt: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "course-3",
    code: "DBI202",
    name: "Databases",
    description: "DB",
    active: true,
    lecturerId: "lecturer-2",
    lecturerName: "Lecturer Two",
    createdAt: "2026-06-01T08:00:00.000Z",
  },
];

const documentsByCourse: Record<string, KnowledgeDocument[]> = {
  "course-1": [
    {
      id: "doc-1",
      courseId: "course-1",
      uploadedBy: "lecturer-1",
      originalFilename: "use-case.pdf",
      fileType: "PDF",
      fileSizeBytes: 2048,
      status: "INDEXED",
      chunkCount: 20,
      indexedAt: "2026-06-10T09:00:00.000Z",
      createdAt: "2026-06-09T09:00:00.000Z",
      updatedAt: "2026-06-10T09:00:00.000Z",
    },
    {
      id: "doc-2",
      courseId: "course-1",
      uploadedBy: "lecturer-1",
      originalFilename: "sequence.pdf",
      fileType: "PDF",
      fileSizeBytes: 1024,
      status: "PROCESSING",
      chunkCount: null,
      indexedAt: null,
      createdAt: "2026-06-11T09:00:00.000Z",
      updatedAt: null,
    },
  ],
  "course-2": [
    {
      id: "doc-3",
      courseId: "course-2",
      uploadedBy: "lecturer-1",
      originalFilename: "android.pdf",
      fileType: "PDF",
      fileSizeBytes: 4096,
      status: "FAILED",
      chunkCount: null,
      indexedAt: null,
      createdAt: "2026-06-12T09:00:00.000Z",
      updatedAt: null,
    },
  ],
};

describe("teacher dashboard data", () => {
  test("selects only courses assigned to the lecturer", () => {
    expect(selectLecturerCourses(courses, "lecturer-1").map((course) => course.id)).toEqual([
      "course-1",
      "course-2",
    ]);
  });

  test("builds real document and chat readiness summaries from owned courses", () => {
    const data = buildTeacherDashboardData({
      courses,
      lecturerId: "lecturer-1",
      documentsByCourse,
    });

    expect(data.summary.totalCourses).toBe(2);
    expect(data.summary.totalDocuments).toBe(3);
    expect(data.summary.indexedDocuments).toBe(1);
    expect(data.summary.processingDocuments).toBe(1);
    expect(data.summary.failedDocuments).toBe(1);
    expect(data.summary.chatReadyCourses).toBe(1);
    expect(data.chatReadyCourses.map((course) => course.courseId)).toEqual(["course-1"]);
    expect(data.recentDocuments.map((document) => document.document.id)).toEqual([
      "doc-3",
      "doc-2",
      "doc-1",
    ]);
  });

  test("returns empty summaries when the lecturer has no assigned course", () => {
    const data = buildTeacherDashboardData({
      courses,
      lecturerId: "missing-lecturer",
      documentsByCourse: {},
    });

    expect(data.summary).toEqual({
      totalCourses: 0,
      totalDocuments: 0,
      indexedDocuments: 0,
      processingDocuments: 0,
      failedDocuments: 0,
      chatReadyCourses: 0,
    });
    expect(data.ownedCourses).toEqual([]);
    expect(data.chatReadyCourses).toEqual([]);
    expect(data.recentDocuments).toEqual([]);
  });
});
