import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { CourseSearchResponse } from "@/features/course-management/model/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      code?: string;
      pageNo?: number;
      pageSize?: number;
    };
    const params = new URLSearchParams({
      code: payload.code ?? "",
      pageNo: String(payload.pageNo ?? 0),
      pageSize: String(payload.pageSize ?? 10),
    });

    return proxyJavaJson<CourseSearchResponse>(
      request,
      `/api/v1/courses/search?${params.toString()}`,
      {
        method: "POST",
      },
    );
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
