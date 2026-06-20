import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("creates a frontend session and mirrors the backend refresh token cookie", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 200,
          message: "Login successfully",
          data: {
            accessToken: "access-token",
            refreshToken: "",
            userResponse: {
              id: "user-1",
              email: "student@example.edu",
              fullName: "Student Example",
              active: true,
              avatarUrl: null,
              createdAt: "2026-06-04T08:00:00Z",
              updatedAt: "2026-06-04T08:00:00Z",
              roleResponse: {
                id: "role-1",
                name: "STUDENT",
              },
            },
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
            "set-cookie": "refreshToken=backend-refresh; Max-Age=604800; Path=/; HttpOnly",
          },
        },
      ),
    );

    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "student@example.edu",
          password: "secret123",
        }),
        headers: {
          "content-type": "application/json",
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

    const cookies = response.headers.getSetCookie().join("\n");
    expect(cookies).toContain("orbitdocs_session=");
    expect(cookies).toContain("orbitdocs_refresh_token=backend-refresh");
  });

  test("returns the backend password-change error as-is when no temp token is provided", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 403,
          message: "You must change your generated password before continuing",
          data: null,
        }),
        {
          status: 403,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "lecturer@example.edu",
          password: "secret123",
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      status: 403,
      code: "AUTH_ERROR",
      data: null,
      message: "You must change your generated password before continuing",
    });
  });
});
