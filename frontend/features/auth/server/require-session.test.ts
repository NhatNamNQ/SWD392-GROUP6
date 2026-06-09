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

  test("returns the decoded session when the user matches the required role", async () => {
    const { AUTH_SESSION_COOKIE, encodeAuthSession } = await import(
      "@/features/auth/server/session"
    );
    const encoded = await encodeAuthSession({
      accessToken: "access-token",
      user: {
        id: "admin-1",
        email: "admin@example.edu",
        fullName: "Admin Example",
        role: "ADMIN",
        avatarUrl: null,
      },
    });

    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === AUTH_SESSION_COOKIE ? { value: encoded } : undefined),
    });

    const { requireAuthSession } = await import("@/features/auth/server/require-session");

    await expect(requireAuthSession("/admin/users", { role: "ADMIN" })).resolves.toEqual({
      accessToken: "access-token",
      user: {
        id: "admin-1",
        email: "admin@example.edu",
        fullName: "Admin Example",
        role: "ADMIN",
        avatarUrl: null,
      },
    });
  });

  test("redirects an authenticated student away from admin routes", async () => {
    const { AUTH_SESSION_COOKIE, encodeAuthSession } = await import(
      "@/features/auth/server/session"
    );
    const encoded = await encodeAuthSession({
      accessToken: "access-token",
      user: {
        id: "student-1",
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

    await expect(requireAuthSession("/admin/users", { role: "ADMIN" })).rejects.toThrow(
      "REDIRECT:/student",
    );
  });

  test("redirects an authenticated lecturer away from admin routes", async () => {
    const { AUTH_SESSION_COOKIE, encodeAuthSession } = await import(
      "@/features/auth/server/session"
    );
    const encoded = await encodeAuthSession({
      accessToken: "access-token",
      user: {
        id: "lecturer-1",
        email: "lecturer@example.edu",
        fullName: "Lecturer Example",
        role: "LECTURER",
        avatarUrl: null,
      },
    });

    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === AUTH_SESSION_COOKIE ? { value: encoded } : undefined),
    });

    const { requireAuthSession } = await import("@/features/auth/server/require-session");

    await expect(requireAuthSession("/admin/courses", { role: "ADMIN" })).rejects.toThrow(
      "REDIRECT:/teacher",
    );
  });

  test("redirects an authenticated admin away from teacher routes", async () => {
    const { AUTH_SESSION_COOKIE, encodeAuthSession } = await import(
      "@/features/auth/server/session"
    );
    const encoded = await encodeAuthSession({
      accessToken: "access-token",
      user: {
        id: "admin-1",
        email: "admin@example.edu",
        fullName: "Admin Example",
        role: "ADMIN",
        avatarUrl: null,
      },
    });

    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === AUTH_SESSION_COOKIE ? { value: encoded } : undefined),
    });

    const { requireAuthSession } = await import("@/features/auth/server/require-session");

    await expect(
      requireAuthSession("/teacher/knowledge-base", { role: "LECTURER" }),
    ).rejects.toThrow("REDIRECT:/admin");
  });
});
