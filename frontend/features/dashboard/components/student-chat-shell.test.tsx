import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { StudentChatShell } from "@/features/dashboard/components/student-chat-shell";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("StudentChatShell", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  test("creates a session with all-chapters scope and keeps the scope fixed when the draft scope changes later", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            courses: [
              {
                id: "course-swd392-core",
                name: "SWD392: Software Modeling & Design",
                chapters: [
                  { id: "chapter-use-case", label: "Use Case Modeling" },
                  { id: "chapter-sequence", label: "Sequence Diagrams" },
                ],
              },
            ],
            sessions: [],
            promptSuggestions: ["What is a use case model?"],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "session-1",
            title: "Explain use case models",
            lastMessagePreview: "I found the answer in the course materials.",
            lastMessageAt: "2026-06-08T10:00:00.000Z",
            scope: {
              courseId: "course-swd392-core",
              courseName: "SWD392: Software Modeling & Design",
              chapterId: null,
              chapterLabel: "All chapters",
              mode: "all",
            },
            messages: [
              {
                id: "user-1",
                role: "user",
                content: "Explain use case models",
                createdAt: "2026-06-08T10:00:00.000Z",
                citations: [],
              },
              {
                id: "assistant-1",
                role: "assistant",
                content: "I found the answer in the course materials.",
                createdAt: "2026-06-08T10:00:05.000Z",
                citations: [
                  {
                    id: "citation-1",
                    documentTitle: "Week 2 - Use Case Diagrams.pdf",
                    chapterTitle: "Use Case Modeling",
                    excerpt: "Use cases describe actor goals and system responsibilities.",
                    pageNumber: 5,
                    similarityScore: 0.92,
                  },
                ],
              },
            ],
          }),
          {
            status: 201,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    render(<StudentChatShell />);

    await screen.findByText("What would you like to learn today?");

    await userEvent.selectOptions(screen.getByLabelText("Chapter scope"), "all");
    await userEvent.type(screen.getByLabelText("Chat input"), "Explain use case models");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    await screen.findByRole("button", { name: /\[1\] Use Case Modeling/i });
    expect(screen.getByText("Scope: All chapters")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Chapter scope"), "chapter-use-case");

    expect(screen.getByText("Active scope: All chapters")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/chat/sessions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          courseId: "course-swd392-core",
          chapterId: null,
          mode: "all",
          initialMessage: "Explain use case models",
        }),
      }),
    );
  });

  test("reopens an existing session and shows its messages", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            courses: [
              {
                id: "course-swd392-core",
                name: "SWD392: Software Modeling & Design",
                chapters: [{ id: "chapter-use-case", label: "Use Case Modeling" }],
              },
            ],
            sessions: [
              {
                id: "session-1",
                title: "Use Case Review",
                lastMessagePreview: "Actors and goals define the scope.",
                lastMessageAt: "2026-06-08T10:00:00.000Z",
                scope: {
                  courseId: "course-swd392-core",
                  courseName: "SWD392: Software Modeling & Design",
                  chapterId: "chapter-use-case",
                  chapterLabel: "Use Case Modeling",
                  mode: "chapter",
                },
              },
            ],
            promptSuggestions: [],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "session-1",
            title: "Use Case Review",
            lastMessagePreview: "Actors and goals define the scope.",
            lastMessageAt: "2026-06-08T10:00:00.000Z",
            scope: {
              courseId: "course-swd392-core",
              courseName: "SWD392: Software Modeling & Design",
              chapterId: "chapter-use-case",
              chapterLabel: "Use Case Modeling",
              mode: "chapter",
            },
            messages: [
              {
                id: "user-1",
                role: "user",
                content: "What is a use case?",
                createdAt: "2026-06-08T10:00:00.000Z",
                citations: [],
              },
              {
                id: "assistant-1",
                role: "assistant",
                content: "Actors and goals define the scope.",
                createdAt: "2026-06-08T10:00:05.000Z",
                citations: [],
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    render(<StudentChatShell />);

    await screen.findByRole("button", { name: /Use Case Review/i });
    await userEvent.click(screen.getByRole("button", { name: /Use Case Review/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Actors and goals define the scope.").length).toBeGreaterThan(0);
    });

    expect(screen.getByText("Active scope: Use Case Modeling")).toBeInTheDocument();
  });
});
