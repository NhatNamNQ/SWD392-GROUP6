import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { UserRecord } from "@/features/admin-governance/model/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyJavaJson<UserRecord>(request, `/api/users/${id}`);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyJavaJson<null>(request, `/api/users/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

