import { createHmac, timingSafeEqual } from "node:crypto";

import type { AuthSession } from "@/features/auth/model/contracts";

export const AUTH_SESSION_COOKIE = "orbitdocs_session";

const SESSION_TTL_SECONDS = 60 * 15;

type SessionCookiePayload = {
  session: AuthSession;
  expiresAt: string;
};

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET ?? "dev-auth-session-secret-change-me";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

export async function encodeAuthSession(session: AuthSession) {
  const payload = base64UrlEncode(
    JSON.stringify({
      session,
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString(),
    } satisfies SessionCookiePayload),
  );

  return `${payload}.${sign(payload)}`;
}

export async function decodeAuthSession(serialized: string | undefined | null) {
  if (!serialized) {
    return null;
  }

  const [payload, signature] = serialized.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);

  if (
    expectedSignature.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as SessionCookiePayload;

    if (isExpired(parsed.expiresAt)) {
      return null;
    }

    return parsed.session;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(value: string) {
  return {
    name: AUTH_SESSION_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function clearSerializedSession() {
  return {
    name: AUTH_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export type { AuthSession };
