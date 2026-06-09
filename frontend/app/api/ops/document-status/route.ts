import { requestJava, requireJavaRequestSession, createJavaJsonResponse, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { CourseRecord } from "@/features/course-management/model/types";
import type { KnowledgeDocument } from "@/features/knowledge-base/model/types";
import type { DocumentStatusSummary } from "@/features/ops-visibility/model/types";

export async function GET(request: Request) {
  try {
    const session = await requireJavaRequestSession(request);
    const courses = await requestJava<CourseRecord[]>(session, "/api/v1/courses");
    const documents = (
      await Promise.all(
        courses.map((course) =>
          requestJava<KnowledgeDocument[]>(session, `/api/documents/course/${course.id}`).catch(
            () => [],
          ),
        ),
      )
    ).flat();

    const summary: DocumentStatusSummary = {
      total: documents.length,
      uploaded: documents.filter((document) => document.status === "UPLOADED").length,
      processing: documents.filter((document) => document.status === "PROCESSING").length,
      indexed: documents.filter((document) => document.status === "INDEXED").length,
      failed: documents.filter((document) => document.status === "FAILED").length,
    };

    return createJavaJsonResponse(summary);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

