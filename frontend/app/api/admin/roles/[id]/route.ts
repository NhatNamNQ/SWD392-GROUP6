import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { RolePayload, RoleRecord } from "@/features/admin-governance/model/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyJavaJson<RoleRecord>(request, `/api/roles/${id}`);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as RolePayload;

    return proxyJavaJson<RoleRecord>(request, `/api/roles/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyJavaJson<null>(request, `/api/roles/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
