import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/features/auth/server/request-session", () => ({
  readRequestAuthSession: vi.fn(),
}));

describe("GET /api/chat/bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
  });

  test("returns student chat bootstrap data for an authenticated user", async () => {
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
                id: "course-1",
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
                id: "chapter-1",
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

    const { GET } = await import("@/app/api/chat/bootstrap/route");
    const response = await GET(new Request("http://localhost/api/chat/bootstrap"));

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toMatchObject({
      courses: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          chapters: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              label: expect.any(String),
            }),
          ]),
        }),
      ]),
      sessions: [],
      promptSuggestions: expect.arrayContaining([expect.any(String)]),
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/api/v1/courses",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer access-token",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/api/documents/course/course-1",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer access-token",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8080/api/documents/document-1/chapters",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer access-token",
        }),
      }),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/chat/bootstrap",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer access-token",
        }),
      }),
    );
  });

  test("rejects unauthenticated requests", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue(null);

    const { GET } = await import("@/app/api/chat/bootstrap/route");
    const response = await GET(new Request("http://localhost/api/chat/bootstrap"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "AUTH_ERROR",
      message: "Authentication required.",
      status: 401,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
