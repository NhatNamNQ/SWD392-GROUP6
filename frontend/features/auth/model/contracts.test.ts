import { describe, expect, test } from "vitest";

import {
  createAuthError,
  normalizeAuthSession,
  type BackendAuthResponse,
  type BackendAuthUser,
} from "@/features/auth/model/contracts";

function makeUser(overrides: Partial<BackendAuthUser> = {}): BackendAuthUser {
  return {
    id: "2cf1a65e-bdf2-4b2a-a6a0-0aa54e5f6d14",
    email: "student@example.edu",
    fullName: "Student Example",
    active: true,
    avatarUrl: null,
    createdAt: "2026-06-04T08:00:00Z",
    updatedAt: "2026-06-04T08:00:00Z",
    roleResponse: {
      id: "9eb2e590-7688-4d8b-b96f-767824159e5f",
      name: "STUDENT",
    },
    ...overrides,
  };
}

describe("normalizeAuthSession", () => {
  test("maps the Java auth payload into the frontend session contract", () => {
    const payload: BackendAuthResponse = {
      accessToken: "access-token",
      refreshToken: "",
      userResponse: makeUser(),
    };

    expect(normalizeAuthSession(payload)).toEqual({
      accessToken: "access-token",
      user: {
        id: "2cf1a65e-bdf2-4b2a-a6a0-0aa54e5f6d14",
        email: "student@example.edu",
        fullName: "Student Example",
        role: "STUDENT",
        avatarUrl: null,
      },
    });
  });

  test("rejects inactive users instead of creating a live session", () => {
    expect(() =>
      normalizeAuthSession({
        accessToken: "access-token",
        refreshToken: "",
        userResponse: makeUser({ active: false }),
      }),
    ).toThrow("Account is inactive.");
  });
});

describe("createAuthError", () => {
  test("uses backend ApiResponse status/message when present", () => {
    expect(
      createAuthError(429, {
        status: 429,
        message: "Too many failed attempts",
      }),
    ).toEqual({
      status: 429,
      message: "Too many failed attempts",
      code: "AUTH_ERROR",
    });
  });

  test("falls back to a generic message when the backend payload is missing", () => {
    expect(createAuthError(500, null)).toEqual({
      status: 500,
      message: "Something went wrong. Please try again.",
      code: "AUTH_ERROR",
    });
  });
});
