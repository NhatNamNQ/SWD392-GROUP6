import type { AuthError, AuthSession } from "@/features/auth/model/contracts";

export type AuthNotice = {
  tone: "error" | "success" | "info";
  message: string;
};

export type RegisterPayload = {
  email: string;
  fullName: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ConfirmOtpPayload = {
  email: string;
  otp: string;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export function validateLoginPayload(payload: LoginPayload) {
  if (!payload.email.trim() || !payload.password) {
    return "Email and password are required.";
  }

  return null;
}

export function validateRegisterPayload(payload: RegisterPayload) {
  if (!payload.fullName.trim() || !payload.email.trim() || !payload.password) {
    return "Full name, email, and password are required.";
  }

  if (payload.password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
}

export function validateOtpPayload(payload: ConfirmOtpPayload) {
  if (!payload.email.trim() || !payload.otp.trim()) {
    return "Email and OTP are required.";
  }

  if (!/^\d{6}$/.test(payload.otp.trim())) {
    return "OTP must be 6 digits.";
  }

  return null;
}

export function validateChangePasswordPayload(payload: ChangePasswordPayload) {
  if (!payload.oldPassword || !payload.newPassword) {
    return "Current password and new password are required.";
  }

  if (payload.newPassword.length < 6) {
    return "New password must be at least 6 characters.";
  }

  return null;
}

async function readJson<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as T;
}

async function postJson<T>(url: string, payload?: unknown) {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: payload
      ? {
          "content-type": "application/json",
        }
      : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const error = await readJson<AuthError>(response);
    throw error ?? {
      status: response.status,
      message: "Something went wrong. Please try again.",
      code: "AUTH_ERROR",
    };
  }

  return (await readJson<T>(response)) as T;
}

export function toAuthNotice(error: unknown): AuthNotice {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return {
      tone: "error",
      message: error.message,
    };
  }

  return {
    tone: "error",
    message: "Something went wrong. Please try again.",
  };
}

export async function loginWithPassword(payload: LoginPayload) {
  return postJson<AuthSession>("/api/auth/login", payload);
}

export async function registerAccount(payload: RegisterPayload) {
  return postJson<{ email: string; message: string }>("/api/auth/register", payload);
}

export async function confirmOtp(payload: ConfirmOtpPayload) {
  return postJson<{ email: string; message: string }>("/api/auth/confirm-otp", payload);
}

export async function logoutSession() {
  return postJson<{ message: string }>("/api/auth/logout");
}

export async function changePassword(payload: ChangePasswordPayload) {
  return postJson<{ message: string }>("/api/auth/change-password", payload);
}
