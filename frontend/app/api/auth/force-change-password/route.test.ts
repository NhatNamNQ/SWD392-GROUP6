import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("POST /api/auth/force-change-password", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("creates a frontend session from the backend auth envelope and mirrors refresh cookie", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 200,
          message: "Password changed successfully",
          data: {
            accessToken: "fresh-access-token",
            refreshToken: "",
            userResponse: {
              id: "user-6",
              email: "lecturer@example.edu",
              fullName: "Lecturer Example",
              active: true,
              avatarUrl: null,
              createdAt: "2026-06-04T08:00:00Z",
              updatedAt: "2026-06-04T08:00:00Z",
              roleResponse: {
                id: "role-2",
                name: "LECTURER",
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

    const { POST } = await import("@/app/api/auth/force-change-password/route");
    const response = await POST(
      new Request("http://localhost/api/auth/force-change-password", {
        method: "POST",
        headers: {
          authorization: "Bearer temp-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          newPassword: "new-secret123",
        }),
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/api/auth/force-change-password",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer temp-token",
        }),
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      accessToken: "fresh-access-token",
      user: {
        id: "user-6",
        email: "lecturer@example.edu",
        fullName: "Lecturer Example",
        role: "LECTURER",
        avatarUrl: null,
      },
    });

    const cookies = response.headers.getSetCookie().join("\n");
    expect(cookies).toContain("orbitdocs_session=");
    expect(cookies).toContain("orbitdocs_refresh_token=backend-refresh");
  });
});
