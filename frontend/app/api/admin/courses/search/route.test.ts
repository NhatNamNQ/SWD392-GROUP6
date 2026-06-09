import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/features/auth/server/request-session", () => ({
  readRequestAuthSession: vi.fn(),
}));

describe("POST /api/admin/courses/search", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("sends code, pageNo, pageSize, and bearer token to Java", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue({
      accessToken: "admin-token",
      user: {
        id: "admin-1",
        email: "admin@example.edu",
        fullName: "Admin Example",
        role: "ADMIN",
        avatarUrl: null,
      },
    });

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 200,
          message: "Success",
          data: {
            content: [
              {
                id: "course-1",
                code: "SWD392",
                name: "Software Design",
              },
            ],
            pageNo: 1,
            pageSize: 20,
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

    const { POST } = await import("@/app/api/admin/courses/search/route");
    const response = await POST(
      new Request("http://localhost/api/admin/courses/search", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: "SWD392",
          pageNo: 1,
          pageSize: 20,
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      content: [
        {
          code: "SWD392",
          id: "course-1",
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/api/v1/courses/search?code=SWD392&pageNo=1&pageSize=20",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer admin-token",
        }),
      }),
    );
  });
});
