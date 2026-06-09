import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { RolePayload, RoleRecord } from "@/features/admin-governance/model/types";

export async function GET(request: Request) {
  try {
    return proxyJavaJson<RoleRecord[]>(request, "/api/roles");
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RolePayload;
    return proxyJavaJson<RoleRecord>(
      request,
      "/api/roles",
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

