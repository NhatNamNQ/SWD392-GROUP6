import {
  createJavaJsonResponse,
  requireJavaRequestSession,
  requestJava,
  toJavaErrorResponse,
} from "@/features/java-api/server/java-api";
import type { JavaHealth } from "@/features/ops-visibility/model/types";

export async function GET(request: Request) {
  try {
    const session = await requireJavaRequestSession(request);
    const health = await requestJava<JavaHealth>(session, "/actuator/health", undefined, {
      unwrap: false,
    });
    return createJavaJsonResponse(health);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

