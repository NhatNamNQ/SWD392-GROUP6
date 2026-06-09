import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("refreshes the frontend session and preserves the mirrored refresh cookie when backend does not rotate it", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: "new-access-token",
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
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const { POST } = await import("@/app/api/auth/refresh/route");
    const response = await POST(
      new Request("http://localhost/api/auth/refresh", {
        method: "POST",
        headers: {
          cookie: "orbitdocs_refresh_token=backend-refresh",
        },
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/api/auth/refresh",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Cookie: "refreshToken=backend-refresh",
        }),
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      accessToken: "new-access-token",
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
});
