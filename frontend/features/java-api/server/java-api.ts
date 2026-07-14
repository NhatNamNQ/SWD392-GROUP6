import { createAuthJsonResponse, requestBackend } from "@/features/auth/server/backend";
import { readRequestAuthSession } from "@/features/auth/server/request-session";
import type { AuthSession } from "@/features/auth/server/session";

export type JavaApiError = {
  status: number;
  code: "JAVA_API_ERROR" | "AUTH_ERROR";
  message: string;
};

type JavaEnvelope<T> = {
  status?: number;
  message?: string;
  data?: T;
};

async function readJson<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as T;
}

function unwrapJavaPayload<T>(payload: JavaEnvelope<T> | T | null) {
  if (
    payload &&
    typeof payload === "object" &&
    ("data" in payload || "status" in payload || "message" in payload)
  ) {
    return (payload as JavaEnvelope<T>).data as T;
  }

  return payload as T;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }

  return JSON.parse(
    JSON.stringify(value, (_key, entry) => (typeof entry === "bigint" ? entry.toString() : entry)),
  ) as unknown;
}

export async function requireJavaRequestSession(request: Request): Promise<AuthSession> {
  const session = await readRequestAuthSession(request);

  if (!session) {
    throw {
      status: 401,
      code: "AUTH_ERROR",
      message: "Authentication required.",
    } satisfies JavaApiError;
  }

  return session;
}

export function createJavaJsonResponse(payload: unknown, status = 200) {
  return createAuthJsonResponse(sanitizeJsonValue(payload), status);
}

export function toJavaErrorResponse(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    "code" in error
  ) {
    const javaError = error as JavaApiError;
    return createJavaJsonResponse(javaError, javaError.status);
  }

  return createJavaJsonResponse(
    {
      status: 500,
      code: "JAVA_API_ERROR",
      message: "Something went wrong while calling the Java backend.",
    } satisfies JavaApiError,
    500,
  );
}

export async function requestJava<T>(
  session: AuthSession,
  path: string,
  init?: RequestInit,
  options?: { unwrap?: boolean },
): Promise<T> {
  const response = await requestBackend(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  const payload = await readJson<JavaEnvelope<T> | T>(response);

  if (!response.ok) {
    const envelope = payload as JavaEnvelope<T> | null;

    throw {
      status: envelope?.status ?? response.status,
      code: "JAVA_API_ERROR",
      message: envelope?.message ?? "Java backend request failed.",
    } satisfies JavaApiError;
  }

  return options?.unwrap === false ? (payload as T) : unwrapJavaPayload<T>(payload);
}

export async function proxyJavaJson<T>(
  request: Request,
  path: string,
  init?: RequestInit,
  status = 200,
) {
  const session = await requireJavaRequestSession(request);
  const payload = await requestJava<T>(session, path, init);
  return createJavaJsonResponse(payload, status);
}
