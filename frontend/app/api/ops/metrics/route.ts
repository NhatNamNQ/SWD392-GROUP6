import {
  createJavaJsonResponse,
  requireJavaRequestSession,
  requestJava,
  toJavaErrorResponse,
} from "@/features/java-api/server/java-api";
import type { JavaMetrics } from "@/features/ops-visibility/model/types";

export async function GET(request: Request) {
  try {
    const session = await requireJavaRequestSession(request);
    const metrics = await requestJava<JavaMetrics>(session, "/actuator/metrics", undefined, {
      unwrap: false,
    });
    return createJavaJsonResponse(metrics);
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}

