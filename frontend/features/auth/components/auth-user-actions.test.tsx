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
  test("shows user details and logout button", () => {
    render(
      <AuthUserActions
        user={{
          id: "user-1",
          email: "user@example.edu",
          fullName: "User Example",
          role: "LECTURER",
          avatarUrl: null,
        }}
      />,
    );

    expect(screen.getByText("User Example")).toBeInTheDocument();
    expect(screen.getByText("LECTURER")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });
});
