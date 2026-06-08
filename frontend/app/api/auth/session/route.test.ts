import { beforeEach, describe, expect, test } from "vitest";

import { encodeAuthSession } from "@/features/auth/server/session";

describe("GET /api/auth/session", () => {
  beforeEach(() => {
    process.env.AUTH_SESSION_SECRET = "test-secret";
  });

  test("returns 401 when the frontend session cookie is missing", async () => {
    const { GET } = await import("@/app/api/auth/session/route");
    const response = await GET(new Request("http://localhost/api/auth/session"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      status: 401,
      message: "You need to sign in first.",
      code: "AUTH_ERROR",
    });
  });

  test("returns the normalized frontend session when the cookie is valid", async () => {
    const encoded = await encodeAuthSession({
      accessToken: "access-token",
      user: {
        id: "user-1",
        email: "student@example.edu",
        fullName: "Student Example",
        role: "STUDENT",
        avatarUrl: null,
      },
    });

    const { GET } = await import("@/app/api/auth/session/route");
    const response = await GET(
      new Request("http://localhost/api/auth/session", {
        headers: {
          cookie: `orbitdocs_session=${encoded}`,
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      accessToken: "access-token",
      user: {
        id: "user-1",
        email: "student@example.edu",
        fullName: "Student Example",
        role: "STUDENT",
        avatarUrl: null,
      },
    });
  });
});
