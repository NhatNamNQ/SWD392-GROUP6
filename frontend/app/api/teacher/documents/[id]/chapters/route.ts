import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { DocumentChapter } from "@/features/knowledge-base/model/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyJavaJson<DocumentChapter[]>(request, `/api/documents/${id}/chapters`);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
