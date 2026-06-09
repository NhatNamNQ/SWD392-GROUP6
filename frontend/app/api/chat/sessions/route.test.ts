import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/features/auth/server/request-session", () => ({
  readRequestAuthSession: vi.fn(),
}));

describe("POST /api/chat/sessions", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
  });

  test("creates a session with all-chapters scope and the initial user message", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue({
      accessToken: "access-token",
      user: {
        id: "student-1",
        email: "student@example.edu",
        fullName: "Student Example",
        role: "STUDENT",
        avatarUrl: null,
      },
    });
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 200,
            message: "Success",
            data: [
              {
                id: "course-swd392-core",
                code: "SWD392",
                name: "SWD392: Software Modeling & Design",
                active: true,
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 200,
            message: "Success",
            data: [
              {
                id: "document-1",
                originalFilename: "Week 2 - Use Case Diagrams.pdf",
                status: "INDEXED",
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 200,
            message: "Success",
            data: [
              {
                id: "chapter-use-case",
                title: "Use Case Modeling",
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      );

    const { POST } = await import("@/app/api/chat/sessions/route");
    const response = await POST(
      new Request("http://localhost/api/chat/sessions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          courseId: "course-swd392-core",
          chapterId: null,
          mode: "all",
          initialMessage: "Summarize use case models",
        }),
      }),
    );

    expect(response.status).toBe(201);

    await expect(response.json()).resolves.toMatchObject({
      title: "Summarize use case models",
      scope: {
        courseId: "course-swd392-core",
        chapterId: null,
        mode: "all",
      },
      messages: [
        expect.objectContaining({
          role: "user",
          content: "Summarize use case models",
        }),
        expect.objectContaining({
          role: "assistant",
          citations: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              documentTitle: expect.any(String),
              excerpt: expect.any(String),
            }),
          ]),
        }),
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test("rejects invalid scope payloads", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue({
      accessToken: "access-token",
      user: {
        id: "student-1",
        email: "student@example.edu",
        fullName: "Student Example",
        role: "STUDENT",
        avatarUrl: null,
      },
    });
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 200,
            message: "Success",
            data: [
              {
                id: "course-swd392-core",
                code: "SWD392",
                name: "SWD392: Software Modeling & Design",
                active: true,
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 200,
            message: "Success",
            data: [],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      );

    const { POST } = await import("@/app/api/chat/sessions/route");
    const response = await POST(
      new Request("http://localhost/api/chat/sessions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          courseId: "course-swd392-core",
          chapterId: null,
          mode: "chapter",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "CHAT_SCOPE_INVALID",
      message: "A chapter must be selected when mode is chapter.",
      status: 400,
    });
  });
});
