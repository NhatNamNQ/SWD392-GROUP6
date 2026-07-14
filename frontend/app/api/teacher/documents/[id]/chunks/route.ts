import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { DocumentChunk, PagedResponse } from "@/features/knowledge-base/model/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "20";

    return proxyJavaJson<PagedResponse<DocumentChunk>>(
      request,
      `/api/documents/${id}/chunks?page=${page}&size=${size}`,
    );
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
