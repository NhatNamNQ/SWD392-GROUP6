import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/features/auth/server/request-session", () => ({
  readRequestAuthSession: vi.fn(),
}));

describe("admin course routes", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("POST /api/admin/courses mirrors the current Java success contract", async () => {
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
            id: "course-1",
            code: "SWD392",
            name: "Software Design",
            description: "Core course",
            active: true,
            lecturerId: "lecturer-1",
            lecturerName: "Lecturer Example",
            createdAt: "2026-06-20T08:00:00Z",
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

    const { POST } = await import("@/app/api/admin/courses/route");
    const response = await POST(
      new Request("http://localhost/api/admin/courses", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: "SWD392",
          name: "Software Design",
          description: "Core course",
          lecturerId: "lecturer-1",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "course-1",
      code: "SWD392",
      name: "Software Design",
      description: "Core course",
      active: true,
      lecturerId: "lecturer-1",
      lecturerName: "Lecturer Example",
      createdAt: "2026-06-20T08:00:00Z",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/api/v1/courses",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer admin-token",
          "content-type": "application/json",
        }),
        body: JSON.stringify({
          code: "SWD392",
          name: "Software Design",
          description: "Core course",
          lecturerId: "lecturer-1",
        }),
      }),
    );
  });
});
