import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/features/auth/server/request-session", () => ({
  readRequestAuthSession: vi.fn(),
}));

describe("GET /api/chats/sessions/[sessionId]", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("normalizes Java chat roles to the FE role contract", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue({
      accessToken: "student-token",
      user: {
        id: "student-1",
        email: "student@example.edu",
        fullName: "Student Example",
        role: "STUDENT",
        avatarUrl: null,
      },
    });

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 200,
          message: "Success",
          data: {
            id: "session-1",
            courseId: "course-1",
            title: "Session Title",
            lastMessageAt: "2026-06-20T08:00:00Z",
            messages: [
              {
                id: "message-1",
                role: "USER",
                content: "What is a use case model?",
                createdAt: "2026-06-20T08:01:00Z",
                citations: [],
              },
              {
                id: "message-2",
                role: "ASSISTANT",
                content: "A use case model describes actors and goals.",
                createdAt: "2026-06-20T08:01:02Z",
                citations: [
                  {
                    excerpt: "Actors and goals",
                    similarityScore: 0.93,
                    pageNum: 4,
                    documentName: "Use Case Guide",
                    chapterTitle: "Introduction",
                  },
                ],
              },
            ],
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

    const { GET } = await import("@/app/api/chats/sessions/[sessionId]/route");
    const response = await GET(
      new Request("http://localhost/api/chats/sessions/session-1", {
        headers: {
          cookie: "orbitdocs_session=encoded",
        },
      }),
      { params: Promise.resolve({ sessionId: "session-1" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "session-1",
      courseId: "course-1",
      title: "Session Title",
      lastMessageAt: "2026-06-20T08:00:00Z",
      messages: [
        {
          id: "message-1",
          role: "user",
          content: "What is a use case model?",
          createdAt: "2026-06-20T08:01:00Z",
          citations: [],
        },
        {
          id: "message-2",
          role: "assistant",
          content: "A use case model describes actors and goals.",
          createdAt: "2026-06-20T08:01:02Z",
          citations: [
            {
              excerpt: "Actors and goals",
              similarityScore: 0.93,
              pageNum: 4,
              documentName: "Use Case Guide",
              chapterTitle: "Introduction",
            },
          ],
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/api/chats/sessions/session-1",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer student-token",
        }),
      }),
    );
  });
});
