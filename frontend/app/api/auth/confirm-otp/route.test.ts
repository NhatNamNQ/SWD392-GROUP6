import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("POST /api/auth/confirm-otp", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("returns a frontend success message when OTP confirmation succeeds", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "user-1",
          email: "student@example.edu",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const { POST } = await import("@/app/api/auth/confirm-otp/route");
    const response = await POST(
      new Request("http://localhost/api/auth/confirm-otp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "student@example.edu",
          otp: "123456",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      email: "student@example.edu",
      message: "Account verified. You can sign in now.",
    });
  });
});
