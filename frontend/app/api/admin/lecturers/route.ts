import { proxyJavaJson, toJavaErrorResponse } from "@/features/java-api/server/java-api";
import type { CreateLecturerPayload, UserRecord } from "@/features/admin-governance/model/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateLecturerPayload;
    return proxyJavaJson<UserRecord>(
      request,
      "/api/admin/lecturers",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      200,
    );
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
