import {
  createAuthError,
  normalizeAuthSession,
  type AuthError,
  type BackendApiError,
  type BackendAuthResponse,
  type BackendApiResponse,
} from "@/features/auth/model/contracts";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8080";

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

function isApiEnvelope<T>(
  payload: BackendApiResponse<T> | T | null,
): payload is BackendApiResponse<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export async function readBackendApiResponse<T>(response: Response) {
  const payload = await parseJsonBody<BackendApiResponse<T> | T>(response);

  if (!payload) {
    throw new Error("Missing backend payload.");
  }

  if (isApiEnvelope(payload)) {
    return payload;
  }

  return {
    status: response.status,
    message: "Success",
    data: payload as T,
  } satisfies BackendApiResponse<T>;
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
  const error = createAuthError(response.status, payload);

  if (
    error.status === 403 &&
    !error.tempToken &&
    error.message === "You must change your generated password before continuing"
  ) {
    return {
      ...error,
      errorCode: "REQUIRE_PASSWORD_CHANGE",
      data: {
        blocker: "BACKEND_TEMP_TOKEN_MISSING",
      },
      message:
        "Backend requires a password change but did not return a temporary token. The FE cannot continue this flow until the backend contract is fixed.",
    };
  }

  return error;
}

export async function readBackendAuthSession(response: Response) {
  const payload = await readBackendApiResponse<BackendAuthResponse>(response);
  const authResponse = payload.data;

  if (!authResponse) {
    throw new Error("Missing auth payload.");
  }

  return normalizeAuthSession(authResponse);
}
