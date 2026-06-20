import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/features/auth/server/request-session", () => ({
  readRequestAuthSession: vi.fn(),
}));

describe("POST /api/teacher/documents/upload", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("rejects unauthenticated upload requests", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue(null);

    const { POST } = await import("@/app/api/teacher/documents/upload/route");
    const response = await POST(
      new Request("http://localhost/api/teacher/documents/upload", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "AUTH_ERROR",
      message: "Authentication required.",
      status: 401,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("forwards multipart form data with the signed bearer token", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue({
      accessToken: "access-token",
      user: {
        id: "teacher-1",
        email: "teacher@example.edu",
        fullName: "Teacher Example",
        role: "LECTURER",
        avatarUrl: null,
      },
    });

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 200,
          message: "Success",
          data: {
            id: "document-1",
            originalFilename: "syllabus.pdf",
            status: "UPLOADED",
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

    const formData = new FormData();
    formData.set("courseId", "course-1");
    formData.set("file", new File(["pdf"], "syllabus.pdf", { type: "application/pdf" }));

    const { POST } = await import("@/app/api/teacher/documents/upload/route");
    const response = await POST(
      new Request("http://localhost/api/teacher/documents/upload", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "document-1",
      originalFilename: "syllabus.pdf",
      status: "UPLOADED",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/api/documents/upload",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer access-token",
        }),
      }),
    );
    const forwardedInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(typeof (forwardedInit.body as FormData).get).toBe("function");
    expect((forwardedInit.body as FormData).get("courseId")).toBe("course-1");
    expect(forwardedInit.headers).not.toHaveProperty("content-type");
    expect(forwardedInit.headers).not.toHaveProperty("Content-Type");
  });

  test("rejects non-lecturer upload requests before calling Java", async () => {
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

    const { POST } = await import("@/app/api/teacher/documents/upload/route");
    const formData = new FormData();
    formData.set("courseId", "course-1");
    formData.set("file", new File(["pdf"], "syllabus.pdf", { type: "application/pdf" }));

    const response = await POST(
      new Request("http://localhost/api/teacher/documents/upload", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "AUTH_ERROR",
      message: "Only lecturers can upload documents.",
      status: 403,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
