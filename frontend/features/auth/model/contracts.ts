export type AuthRole = "STUDENT" | "LECTURER" | "ADMIN" | string;

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
  avatarUrl: string | null;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type AuthError = {
  status: number;
  message: string;
  code: "AUTH_ERROR";
  errorCode?: string;
  tempToken?: string;
  data?: unknown;
};

export type BackendApiResponse<T> = {
  status?: number;
  statusCode?: number;
  message?: string;
  data?: T;
};

export type BackendRoleResponse = {
  id: string;
  name: string;
};

export type BackendAuthUser = {
  id: string;
  email: string;
  fullName: string;
  active: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  roleResponse: BackendRoleResponse;
};

export type BackendAuthResponse = {
  userResponse: BackendAuthUser;
  accessToken: string;
  refreshToken: string;
};

export type BackendApiError = {
  status?: number;
  message?: string;
  errorCode?: string;
  tempToken?: string;
  data?: unknown;
};

const FALLBACK_AUTH_MESSAGE = "Something went wrong. Please try again.";

export function normalizeAuthSession(payload: BackendAuthResponse): AuthSession {
  if (!payload.userResponse.active) {
    throw new Error("Account is inactive.");
  }

  return {
    accessToken: payload.accessToken,
    user: {
      id: payload.userResponse.id,
      email: payload.userResponse.email,
      fullName: payload.userResponse.fullName,
      role: payload.userResponse.roleResponse.name,
      avatarUrl: payload.userResponse.avatarUrl,
    },
  };
}

export function createAuthError(status: number, payload: BackendApiError | null): AuthError {
  return {
    status: payload?.status ?? status,
    message: payload?.message ?? FALLBACK_AUTH_MESSAGE,
    code: "AUTH_ERROR",
    errorCode: payload?.errorCode,
    tempToken: payload?.tempToken,
    data: payload?.data,
  };
}
