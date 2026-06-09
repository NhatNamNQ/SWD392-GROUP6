import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { AuthUserActions } from "@/features/auth/components/auth-user-actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("AuthUserActions", () => {
  test("shows student-safe navigation without teacher or admin shortcuts", () => {
    render(
      <AuthUserActions
        user={{
          id: "student-1",
          email: "student@example.edu",
          fullName: "Student Example",
          role: "STUDENT",
          avatarUrl: null,
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Password" })).toHaveAttribute(
      "href",
      "/settings/password",
    );
    expect(screen.queryByRole("link", { name: "Knowledge" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });

  test("shows teacher shortcuts for knowledge-base work", () => {
    render(
      <AuthUserActions
        user={{
          id: "lecturer-1",
          email: "lecturer@example.edu",
          fullName: "Lecturer Example",
          role: "LECTURER",
          avatarUrl: null,
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Teacher home" })).toHaveAttribute("href", "/teacher");
    expect(screen.getByRole("link", { name: "Knowledge" })).toHaveAttribute(
      "href",
      "/teacher/knowledge-base",
    );
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });

  test("shows admin shortcuts for governance work", () => {
    render(
      <AuthUserActions
        user={{
          id: "admin-1",
          email: "admin@example.edu",
          fullName: "Admin Example",
          role: "ADMIN",
          avatarUrl: null,
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Admin home" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("href", "/admin/users");
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
      "href",
      "/admin/courses",
    );
    expect(screen.getByRole("link", { name: "Roles" })).toHaveAttribute("href", "/admin/roles");
    expect(screen.queryByRole("link", { name: "Knowledge" })).not.toBeInTheDocument();
  });
});
