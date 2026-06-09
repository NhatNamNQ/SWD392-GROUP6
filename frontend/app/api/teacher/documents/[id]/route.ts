import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { KnowledgeDocument } from "@/features/knowledge-base/model/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyJavaJson<KnowledgeDocument>(request, `/api/documents/${id}`);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyJavaJson<{ message: string }>(
      request,
      `/api/documents/${id}`,
      {
        method: "DELETE",
      },
    );
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

