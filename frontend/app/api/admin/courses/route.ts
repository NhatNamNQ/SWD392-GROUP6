import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { CoursePayload, CourseRecord } from "@/features/course-management/model/types";

export async function GET(request: Request) {
  try {
    return proxyJavaJson<CourseRecord[]>(request, "/api/v1/courses");
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CoursePayload;
    return proxyJavaJson<CourseRecord>(
      request,
      "/api/v1/courses",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      201,
    );
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

