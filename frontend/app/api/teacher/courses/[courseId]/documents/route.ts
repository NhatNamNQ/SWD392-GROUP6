import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { KnowledgeDocument } from "@/features/knowledge-base/model/types";

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await context.params;
    return proxyJavaJson<KnowledgeDocument[]>(request, `/api/documents/course/${courseId}`);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
