import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";

export async function POST(
  request: Request,
  context: { params: Promise<{ courseId: string; lecturerId: string }> },
) {
  try {
    const { courseId, lecturerId } = await context.params;
    return proxyJavaJson<null>(
      request,
      `/api/v1/courses/${courseId}/lecturers/${lecturerId}`,
      {
        method: "POST",
      },
    );
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

