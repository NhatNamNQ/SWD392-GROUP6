import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { CoursePayload, CourseRecord } from "@/features/course-management/model/types";

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await context.params;
    return proxyJavaJson<CourseRecord>(request, `/api/v1/courses/${courseId}`);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await context.params;
    const payload = (await request.json()) as CoursePayload;

    return proxyJavaJson<CourseRecord>(request, `/api/v1/courses/${courseId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
