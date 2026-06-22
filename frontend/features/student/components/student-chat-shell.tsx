"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/features/auth/model/contracts";
import {
  fetchChatBootstrap,
  fetchChatSession,
  sendChatMessage,
} from "@/features/student/api/chat-client";
import {
  buildSelectionFromDraft,
  findCourseById,
  summarizeSelection,
} from "@/features/student/api/course-client";
import { ChatComposer } from "@/features/student/components/chat-composer";
import { ChatHistoryList } from "@/features/student/components/chat-history-list";
import { ChatMessageList } from "@/features/student/components/chat-message-list";
import { ChatScopePicker } from "@/features/student/components/chat-scope-picker";
import type {
  ChatApiError,
  ChatBootstrap,
  ChatCourseOption,
  ChatSessionDetail,
  ChatSessionSummary,
} from "@/features/student/model/chat-types";

type StudentChatShellProps = {
  user?: AuthUser;
};

function normalizeError(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as ChatApiError).message;
  }

  return "Something went wrong while loading chat.";
}

function summarizeSession(
  detail: ChatSessionDetail,
  courseName?: string | null,
): ChatSessionSummary {
  return {
    id: detail.id,
    courseId: detail.courseId,
    title: detail.title,
    lastMessageAt: detail.lastMessageAt,
    courseName: courseName ?? null,
  };
}

function getSelectionLabel(
  draftSelection: ReturnType<typeof buildSelectionFromDraft>,
  activeSessionTitle: string | null,
  activeCourseName: string | null,
) {
  if (activeSessionTitle) {
    return [activeCourseName, activeSessionTitle].filter(Boolean).join(" · ");
  }

  return summarizeSelection(draftSelection) ?? "Select a course and document";
}

function setDraftSelectionFromCourse(
  courses: ChatCourseOption[],
  courseId: string,
): {
  courseId: string;
  documentId: string;
  chapterId: string | null;
} {
  const course = findCourseById(courses, courseId);
  const document = course?.documents[0] ?? null;

  return {
    courseId: course?.id ?? "",
    documentId: document?.id ?? "",
    chapterId: document?.chapters[0]?.id ?? null,
  };
}

export function StudentChatShell({ user }: StudentChatShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bootstrap, setBootstrap] = useState<ChatBootstrap | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [chatSubmitting, setChatSubmitting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSessionDetail | null>(null);
  const [openCitationId, setOpenCitationId] = useState<string | null>(null);

  const deferredHistoryQuery = useDeferredValue(historyQuery);

  useEffect(() => {
    let cancelled = false;

    async function loadBootstrap() {
      try {
        setChatLoading(true);
        setChatError(null);
        const payload = await fetchChatBootstrap();

        if (cancelled) {
          return;
        }

        setBootstrap(payload);

        const initialDraft = setDraftSelectionFromCourse(
          payload.courses,
          payload.courses[0]?.id ?? "",
        );
        setSelectedCourseId(initialDraft.courseId);
        setSelectedDocumentId(initialDraft.documentId);
        setSelectedChapterId(initialDraft.chapterId);
      } catch (error) {
        if (!cancelled) {
          setChatError(normalizeError(error));
        }
      } finally {
        if (!cancelled) {
          setChatLoading(false);
        }
      }
    }

    void loadBootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const courses = useMemo(() => bootstrap?.courses ?? [], [bootstrap]);
  const sessions = useMemo(() => bootstrap?.sessions ?? [], [bootstrap]);
  const promptSuggestions = useMemo(() => bootstrap?.promptSuggestions ?? [], [bootstrap]);
  const courseNameById = useMemo(
    () => new Map(courses.map((course) => [course.id, course.name])),
    [courses],
  );
  const resolvedCourseId = useMemo(() => {
    if (!courses.length) {
      return "";
    }

    return findCourseById(courses, selectedCourseId)?.id ?? courses[0]?.id ?? "";
  }, [courses, selectedCourseId]);

  const resolvedCourse = useMemo(
    () => findCourseById(courses, resolvedCourseId),
    [courses, resolvedCourseId],
  );

  const resolvedDocumentId = useMemo(() => {
    if (!resolvedCourse) {
      return "";
    }

    const document =
      resolvedCourse.documents.find((entry) => entry.id === selectedDocumentId) ??
      resolvedCourse.documents[0];
    return document?.id ?? "";
  }, [resolvedCourse, selectedDocumentId]);

  const resolvedDocument = useMemo(() => {
    if (!resolvedCourse || !resolvedDocumentId) {
      return null;
    }

    return resolvedCourse.documents.find((entry) => entry.id === resolvedDocumentId) ?? null;
  }, [resolvedCourse, resolvedDocumentId]);

  const resolvedChapterId = useMemo(() => {
    if (!resolvedDocument) {
      return null;
    }

    if (
      selectedChapterId &&
      resolvedDocument.chapters.some((chapter) => chapter.id === selectedChapterId)
    ) {
      return selectedChapterId;
    }

    return resolvedDocument.chapters[0]?.id ?? null;
  }, [resolvedDocument, selectedChapterId]);

  const draftSelection = useMemo(
    () => buildSelectionFromDraft(courses, resolvedCourseId, resolvedDocumentId, resolvedChapterId),
    [courses, resolvedCourseId, resolvedDocumentId, resolvedChapterId],
  );

  const draftScopeLabel = summarizeSelection(draftSelection);
  const activeSessionCourseName = activeSession
    ? (courseNameById.get(activeSession.courseId) ?? null)
    : null;
  const activeScopeLabel = getSelectionLabel(
    draftSelection,
    activeSession?.title ?? null,
    activeSessionCourseName,
  );
  const filteredSessions = useMemo(() => {
    const normalizedQuery = deferredHistoryQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      const courseName = session.courseName ?? courseNameById.get(session.courseId) ?? "";
      return `${session.title} ${courseName}`.toLowerCase().includes(normalizedQuery);
    });
  }, [courseNameById, deferredHistoryQuery, sessions]);

  function upsertSession(detail: ChatSessionDetail) {
    const courseName = courseNameById.get(detail.courseId) ?? null;

    setBootstrap((current) =>
      current
        ? {
            ...current,
            sessions: [
              summarizeSession(detail, courseName),
              ...current.sessions.filter((session) => session.id !== detail.id),
            ],
          }
        : current,
    );
  }

  async function openSession(sessionId: string) {
    try {
      setChatLoading(true);
      setChatError(null);
      const detail = await fetchChatSession(sessionId);
      setActiveSession(detail);
      setActiveSessionId(detail.id);
      setOpenCitationId(null);
      setSheetOpen(false);
    } catch (error) {
      setChatError(normalizeError(error));
    } finally {
      setChatLoading(false);
    }
  }

  function handleNewChat() {
    startTransition(() => {
      setActiveSession(null);
      setActiveSessionId(null);
      setChatInput("");
      setOpenCitationId(null);
      setChatError(null);
      setSheetOpen(false);
    });
  }

  function handleCourseChange(courseId: string) {
    const draft = setDraftSelectionFromCourse(courses, courseId);
    setSelectedCourseId(draft.courseId);
    setSelectedDocumentId(draft.documentId);
    setSelectedChapterId(draft.chapterId);
  }

  function handleDocumentChange(documentId: string) {
    const course = resolvedCourse;
    const document = course?.documents.find((entry) => entry.id === documentId) ?? null;

    setSelectedDocumentId(document?.id ?? "");
    setSelectedChapterId(document?.chapters[0]?.id ?? null);
  }

  function handleChapterChange(chapterId: string) {
    setSelectedChapterId(chapterId === "all" ? null : chapterId);
  }

  function handlePromptClick(prompt: string) {
    setChatInput(prompt);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = chatInput.trim();

    if (!trimmed) {
      return;
    }

    if (!draftSelection && !activeSession) {
      setChatError("Select a course and document first.");
      return;
    }

    try {
      setChatSubmitting(true);
      setChatError(null);
      setOpenCitationId(null);

      const response = await sendChatMessage(
        activeSession
          ? {
              courseId: activeSession.courseId,
              sessionId: activeSession.id,
              query: trimmed,
            }
          : {
              courseId: draftSelection!.courseId,
              documentId: draftSelection!.documentId,
              chapterId: draftSelection!.chapterId,
              query: trimmed,
            },
      );

      const detail = await fetchChatSession(response.sessionId);
      setActiveSession(detail);
      setActiveSessionId(detail.id);
      upsertSession(detail);
      setChatInput("");
    } catch (error) {
      setChatError(normalizeError(error));
    } finally {
      setChatSubmitting(false);
    }
  }

  const scopeLabel = activeSession
    ? [activeSessionCourseName, activeSession.title].filter(Boolean).join(" · ") ||
      activeSession.title
    : (draftScopeLabel ?? "Select a course and document");

  const scopeControls = (
    <ChatScopePicker
      activeScopeLabel={activeSession ? activeScopeLabel : null}
      chapterValue={resolvedChapterId ?? "all"}
      courseValue={resolvedCourseId}
      courses={courses}
      draftScopeLabel={draftScopeLabel}
      documentValue={resolvedDocumentId}
      onChapterChange={handleChapterChange}
      onCourseChange={handleCourseChange}
      onDocumentChange={handleDocumentChange}
    />
  );

  const sidebar = (
    <ChatHistoryList
      activeSessionId={activeSessionId}
      historyQuery={historyQuery}
      onHistoryQueryChange={setHistoryQuery}
      onNewChat={handleNewChat}
      onSelectSession={(sessionId) => void openSession(sessionId)}
      sessions={filteredSessions}
      user={user}
      scopeControls={scopeControls}
    />
  );

  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* ── Desktop collapsible sidebar ── */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-card transition-[width] duration-300 ease-in-out lg:flex lg:flex-col overflow-hidden",
          sidebarOpen ? "w-80" : "w-0 border-r-0",
        )}
      >
        {/* Inner wrapper keeps content at full width so it clips cleanly */}
        <div className="w-80 flex-1 flex flex-col overflow-hidden">
          {sidebar}
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Desktop toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Sheet trigger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80 border-r border-border bg-card p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Workspace navigation</SheetTitle>
                </SheetHeader>
                {sidebar}
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                Student workspace
              </p>
              <h1 className="truncate text-xl font-black tracking-[-0.04em] text-foreground">
                {activeSession?.title ?? "New chat"}
              </h1>
            </div>
          </div>
        </header>

        {/* Chat content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          {chatError ? (
            <div className="mx-auto mt-4 w-full max-w-5xl px-4">
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
                {chatError}
              </div>
            </div>
          ) : null}

          {/* Message area */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatMessageList
              activeScopeLabel={scopeLabel}
              loading={chatLoading || (chatSubmitting && !activeSession)}
              messages={activeSession?.messages ?? []}
              onCitationToggle={(citationId) =>
                setOpenCitationId((current) => (current === citationId ? null : citationId))
              }
              onPromptClick={handlePromptClick}
              openCitationId={openCitationId}
              promptSuggestions={promptSuggestions}
            />
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-border bg-card">
            <ChatComposer
              disabled={!draftSelection && !activeSession}
              input={chatInput}
              loading={chatSubmitting}
              onInputChange={setChatInput}
              onSubmit={handleSubmit}
              scopeLabel={scopeLabel}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
