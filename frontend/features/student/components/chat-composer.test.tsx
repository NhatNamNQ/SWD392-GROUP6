import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ChatComposer } from "@/features/student/components/chat-composer";

describe("ChatComposer", () => {
  test("renders scope controls inside the composer workspace", () => {
    render(
      <ChatComposer
        input=""
        loading={false}
        onInputChange={vi.fn()}
        onSubmit={(event) => event.preventDefault()}
        scopeLabel="SWD392 · Use Case Diagram"
      />,
    );

    expect(screen.getByText("Scope: SWD392 · Use Case Diagram")).toBeInTheDocument();
  });
});
