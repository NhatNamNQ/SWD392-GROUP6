import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type {
  CreateUserPayload,
  UserPayload,
  UserRecord,
} from "@/features/admin-governance/model/types";

export async function GET(request: Request) {
  try {
    return proxyJavaJson<UserRecord[]>(request, "/api/users");
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateUserPayload;
    return proxyJavaJson<UserRecord>(
      request,
      "/api/users",
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

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as UserPayload;
    return proxyJavaJson<UserRecord>(request, "/api/users", {
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
