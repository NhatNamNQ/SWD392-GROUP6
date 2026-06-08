import { beforeEach, describe, expect, test, vi } from "vitest";

const cookiesMock = vi.fn();
const redirectMock = vi.fn((location: string) => {
  throw new Error(`REDIRECT:${location}`);
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("requireAuthSession", () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesMock.mockReset();
    redirectMock.mockClear();
  });

  test("redirects to login with the current path when no session is present", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    const { requireAuthSession } = await import("@/features/auth/server/require-session");

    await expect(requireAuthSession("/dashboard")).rejects.toThrow("REDIRECT:/login?next=%2Fdashboard");
  });

  test("returns the decoded session when the cookie is present", async () => {
    const { AUTH_SESSION_COOKIE, encodeAuthSession } = await import(
      "@/features/auth/server/session"
    );
    const encoded = await encodeAuthSession({
      accessToken: "access-token",
      user: {
        id: "user-1",
        email: "student@example.edu",
        fullName: "Student Example",
        role: "STUDENT",
        avatarUrl: null,
      },
    });

    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === AUTH_SESSION_COOKIE ? { value: encoded } : undefined),
    });

    const { requireAuthSession } = await import("@/features/auth/server/require-session");

    await expect(requireAuthSession("/dashboard")).resolves.toEqual({
      accessToken: "access-token",
      user: {
        id: "user-1",
        email: "student@example.edu",
        fullName: "Student Example",
        role: "STUDENT",
        avatarUrl: null,
      },
    });
  });
});
