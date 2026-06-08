import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.JAVA_BACKEND_URL = "http://java-backend";
  });

  test("returns an OTP verification message after backend registration succeeds", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const { POST } = await import("@/app/api/auth/register/route");
    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "student@example.edu",
          fullName: "Student Example",
          password: "secret123",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      email: "student@example.edu",
      message: "Registration started. Check your email for the OTP code.",
    });
  });
});
