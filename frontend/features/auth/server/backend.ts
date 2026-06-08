import {
  createAuthError,
  normalizeAuthSession,
  type AuthError,
  type BackendApiError,
  type BackendAuthResponse,
} from "@/features/auth/model/contracts";

const DEFAULT_BACKEND_URL = "http://localhost:8080";

export const BACKEND_REFRESH_COOKIE = "orbitdocs_refresh_token";

function getBackendBaseUrl() {
  return process.env.JAVA_BACKEND_URL ?? DEFAULT_BACKEND_URL;
}

export function createAuthJsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

export function extractBackendRefreshToken(response: Response) {
  const cookies = response.headers.getSetCookie();

  for (const cookie of cookies) {
    const match = cookie.match(/(?:^|,\s*)refreshToken=([^;]+)/);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function buildRefreshCookie(value: string) {
  return {
    name: BACKEND_REFRESH_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function clearRefreshCookie() {
  return {
    name: BACKEND_REFRESH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

async function parseJsonBody<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as T;
}

export async function requestBackend(path: string, init: RequestInit) {
  return fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function readBackendAuthError(response: Response): Promise<AuthError> {
  const payload = await parseJsonBody<BackendApiError>(response);
  return createAuthError(response.status, payload);
}

export async function readBackendAuthSession(response: Response) {
  const payload = await parseJsonBody<BackendAuthResponse>(response);

  if (!payload) {
    throw new Error("Missing auth payload.");
  }

  return normalizeAuthSession(payload);
}
