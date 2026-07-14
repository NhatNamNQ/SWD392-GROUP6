import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { DocumentChunk } from "@/features/knowledge-base/model/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyJavaJson<DocumentChunk[]>(request, `/api/documents/${id}/chunks`);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
