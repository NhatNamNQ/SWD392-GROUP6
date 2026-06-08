import { beforeEach, describe, expect, test, vi } from "vitest";

import { encodeAuthSession } from "@/features/auth/server/session";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("forwards logout to the backend and clears frontend auth cookies", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

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

    const { POST } = await import("@/app/api/auth/logout/route");
    const response = await POST(
      new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: {
          cookie: `orbitdocs_session=${encoded}; orbitdocs_refresh_token=backend-refresh`,
        },
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/api/auth/logout",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      }),
    );
    expect(response.status).toBe(200);
    const cookies = response.headers.getSetCookie().join("\n");
    expect(cookies).toContain("orbitdocs_session=;");
    expect(cookies).toContain("orbitdocs_refresh_token=;");
  });
});
