import { beforeEach, describe, expect, test, vi } from "vitest";

import { encodeAuthSession } from "@/features/auth/server/session";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("POST /api/auth/change-password", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("uses the signed frontend session for the backend password change request", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
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
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

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

    const { POST } = await import("@/app/api/auth/change-password/route");
    const response = await POST(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `orbitdocs_session=${encoded}`,
        },
        body: JSON.stringify({
          oldPassword: "secret123",
          newPassword: "new-secret123",
        }),
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/api/users/change-password",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
        body: JSON.stringify({
          id: "user-1",
          oldPassword: "secret123",
          newPassword: "new-secret123",
        }),
      }),
    );
    expect(response.status).toBe(200);
  });
});
