import { describe, expect, test } from "vitest";

import {
  AUTH_SESSION_COOKIE,
  clearSerializedSession,
  decodeAuthSession,
  encodeAuthSession,
  type AuthSession,
} from "@/features/auth/server/session";

const session: AuthSession = {
  accessToken: "access-token",
  user: {
    id: "user-1",
    email: "student@example.edu",
    fullName: "Student Example",
    role: "STUDENT",
    avatarUrl: null,
  },
};

describe("auth session cookies", () => {
  test("round-trips a signed auth session", async () => {
    const encoded = await encodeAuthSession(session);

    await expect(decodeAuthSession(encoded)).resolves.toEqual(session);
  });

  test("rejects tampered cookie payloads", async () => {
    const encoded = await encodeAuthSession(session);
    const tampered = `${encoded.slice(0, -1)}x`;

    await expect(decodeAuthSession(tampered)).resolves.toBeNull();
  });

  test("returns a cookie clearing instruction for logout", () => {
    expect(clearSerializedSession()).toEqual({
      name: AUTH_SESSION_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 0,
    });
  });
});
