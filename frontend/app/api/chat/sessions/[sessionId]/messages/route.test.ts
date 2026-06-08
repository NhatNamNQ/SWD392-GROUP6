import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/features/auth/server/request-session", () => ({
  readRequestAuthSession: vi.fn(),
}));

describe("POST /api/chat/sessions/:sessionId/messages", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
  });

  test("appends a follow-up message and returns an assistant reply with citations", async () => {
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
      )
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

    const { POST: createSession } = await import("@/app/api/chat/sessions/route");
    const createResponse = await createSession(
      new Request("http://localhost/api/chat/sessions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          courseId: "course-swd392-core",
          chapterId: "chapter-use-case",
          mode: "chapter",
          initialMessage: "What is a use case?",
        }),
      }),
    );
    const createdSession = await createResponse.json();

    const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route");
    const response = await POST(
      new Request(`http://localhost/api/chat/sessions/${createdSession.id}/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          content: "Give me another example of it",
        }),
      }),
      {
        params: Promise.resolve({
          sessionId: createdSession.id,
        }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      sessionId: createdSession.id,
      userMessage: expect.objectContaining({
        role: "user",
        content: "Give me another example of it",
      }),
      assistantMessage: expect.objectContaining({
        role: "assistant",
        citations: expect.arrayContaining([
          expect.objectContaining({
            chapterTitle: expect.any(String),
          }),
        ]),
      }),
    });
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });
});
