import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/features/auth/server/request-session", () => ({
  readRequestAuthSession: vi.fn(),
}));

describe("GET /api/ops/health", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("rejects unauthenticated health requests", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue(null);

    const { GET } = await import("@/app/api/ops/health/route");
    const response = await GET(new Request("http://localhost/api/ops/health"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "AUTH_ERROR",
      message: "Authentication required.",
      status: 401,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns raw actuator health instead of unwrapping it as ApiResponse", async () => {
    const { readRequestAuthSession } = await import("@/features/auth/server/request-session");
    vi.mocked(readRequestAuthSession).mockResolvedValue({
      accessToken: "ops-token",
      user: {
        id: "ops-1",
        email: "ops@example.edu",
        fullName: "Ops Example",
        role: "ADMIN",
        avatarUrl: null,
      },
    });
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "UP",
          components: {
            db: {
              status: "UP",
            },
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

    const { GET } = await import("@/app/api/ops/health/route");
    const response = await GET(new Request("http://localhost/api/ops/health"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "UP",
      components: {
        db: {
          status: "UP",
        },
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://java-backend/actuator/health",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer ops-token",
        }),
      }),
    );
  });
});
