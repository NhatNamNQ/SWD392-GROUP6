"use client";

import { startTransition, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Menu } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { createChatSession, fetchChatBootstrap, fetchChatSession, sendChatMessage } from "@/features/dashboard/api/chat-client";
import { buildScopeFromSelection } from "@/features/dashboard/api/course-client";
import { ChatComposer } from "@/features/dashboard/components/chat-composer";
import { ChatHistoryList } from "@/features/dashboard/components/chat-history-list";
import { ChatMessageList } from "@/features/dashboard/components/chat-message-list";
import { ChatScopePicker } from "@/features/dashboard/components/chat-scope-picker";
import { DocumentLibrary } from "@/features/dashboard/components/document-library";
import { initialDocuments } from "@/features/dashboard/data/mock-dashboard";
import type {
  ChatApiError,
  ChatBootstrap,
  ChatSessionDetail,
  ViewMode,
} from "@/features/dashboard/model/chat-types";
import { AuthUserActions } from "@/features/auth/components/auth-user-actions";
import type { AuthUser } from "@/features/auth/model/contracts";

type StudentChatShellProps = {
  user?: AuthUser;
};

function normalizeError(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as ChatApiError).message;
  }

  return "Something went wrong while loading chat.";
}

export function StudentChatShell({ user }: StudentChatShellProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<ViewMode>("chat");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [docQuery, setDocQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [chatSubmitting, setChatSubmitting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [bootstrap, setBootstrap] = useState<ChatBootstrap | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedChapterValue, setSelectedChapterValue] = useState("all");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSessionDetail | null>(null);
  const [openCitationId, setOpenCitationId] = useState<string | null>(null);
  const [documents, setDocuments] = useState(initialDocuments);

  const deferredHistoryQuery = useDeferredValue(historyQuery);
  const deferredDocQuery = useDeferredValue(docQuery);

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
        setSelectedCourseId(payload.courses[0]?.id ?? null);
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

  const normalizedHistoryQuery = deferredHistoryQuery.trim().toLowerCase();
  const normalizedDocQuery = deferredDocQuery.trim().toLowerCase();

  const sessions = useMemo(() => bootstrap?.sessions ?? [], [bootstrap]);
  const courses = useMemo(() => bootstrap?.courses ?? [], [bootstrap]);
  const promptSuggestions = useMemo(() => bootstrap?.promptSuggestions ?? [], [bootstrap]);

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) =>
        `${session.title} ${session.lastMessagePreview} ${session.scope.chapterLabel}`
          .toLowerCase()
          .includes(normalizedHistoryQuery),
      ),
    [normalizedHistoryQuery, sessions],
  );

  const filteredDocuments = useMemo(
    () =>
      documents.filter((document) =>
        `${document.title} ${document.tag} ${document.status}`
          .toLowerCase()
          .includes(normalizedDocQuery),
      ),
    [documents, normalizedDocQuery],
  );

  const draftScope = useMemo(
    () => buildScopeFromSelection(courses, selectedCourseId, selectedChapterValue),
    [courses, selectedChapterValue, selectedCourseId],
  );

  const activeScopeLabel = activeSession?.scope.chapterLabel ?? draftScope?.chapterLabel ?? "All chapters";
  const draftScopeLabel =
    activeSession && draftScope && draftScope.chapterLabel !== activeSession.scope.chapterLabel
      ? draftScope.chapterLabel
      : activeSession
        ? null
        : draftScope?.chapterLabel ?? null;

  function updateSessionList(nextDetail: ChatSessionDetail) {
    setBootstrap((current) => {
      if (!current) {
        return current;
      }

      const withoutCurrent = current.sessions.filter((session) => session.id !== nextDetail.id);

      return {
        ...current,
        sessions: [
          {
            id: nextDetail.id,
            title: nextDetail.title,
            lastMessagePreview: nextDetail.lastMessagePreview,
            lastMessageAt: nextDetail.lastMessageAt,
            scope: nextDetail.scope,
          },
          ...withoutCurrent,
        ],
      };
    });
  }

  async function openSession(sessionId: string) {
    try {
      setChatLoading(true);
      setChatError(null);
      const detail = await fetchChatSession(sessionId);
      setActiveSession(detail);
      setActiveSessionId(detail.id);
      setOpenCitationId(null);
      setView("chat");
      setSheetOpen(false);
    } catch (error) {
      setChatError(normalizeError(error));
    } finally {
      setChatLoading(false);
    }
  }

  function handleNewChat() {
    startTransition(() => {
      setActiveSessionId(null);
      setActiveSession(null);
      setChatInput("");
      setOpenCitationId(null);
      setView("chat");
      setSheetOpen(false);
      setChatError(null);
    });
  }

  function handleCourseChange(value: string) {
    setSelectedCourseId(value);
    setSelectedChapterValue("all");
  }

  function handlePromptClick(prompt: string) {
    setChatInput(prompt);
    setView("chat");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = chatInput.trim();

    if (!trimmed || !draftScope) {
      return;
    }

    try {
      setChatSubmitting(true);
      setChatError(null);
      setOpenCitationId(null);

      if (!activeSessionId) {
        const created = await createChatSession({
          courseId: draftScope.courseId,
          chapterId: draftScope.chapterId,
          mode: draftScope.mode,
          initialMessage: trimmed,
        });

        setActiveSession(created);
        setActiveSessionId(created.id);
        updateSessionList(created);
        setChatInput("");
        return;
      }

      const messageResponse = await sendChatMessage(activeSessionId, trimmed);

      setActiveSession((current) => {
        if (!current || current.id !== activeSessionId) {
          return current;
        }

        const updated: ChatSessionDetail = {
          ...current,
          lastMessageAt: messageResponse.sessionSummary.lastMessageAt,
          lastMessagePreview: messageResponse.sessionSummary.lastMessagePreview,
          messages: [...current.messages, messageResponse.userMessage, messageResponse.assistantMessage],
        };

        updateSessionList(updated);
        return updated;
      });
      setChatInput("");
    } catch (error) {
      setChatError(normalizeError(error));
    } finally {
      setChatSubmitting(false);
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length || !selectedCourseId) {
      return;
    }

    const courseName = courses.find((course) => course.id === selectedCourseId)?.name ?? "SWD392";

    startTransition(() => {
      setDocuments((current) => [
        ...Array.from(fileList).map((file) => ({
          id: `${file.name}-${file.lastModified}`,
          title: file.name,
          status: "Processing" as const,
          tag: courseName.replace("SWD392: ", ""),
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        })),
        ...current,
      ]);
      setView("knowledge");
    });
  }

  const sidebar = (
    <ChatHistoryList
      activeSessionId={activeSessionId}
      historyQuery={historyQuery}
      onHistoryQueryChange={setHistoryQuery}
      onNewChat={handleNewChat}
      onSelectSession={(sessionId) => void openSession(sessionId)}
      onViewChange={setView}
      sessions={filteredSessions}
      user={user}
      view={view}
    />
  );

  return (
    <div className="min-h-screen">
      <SiteHeader variant="app" actions={user ? <AuthUserActions user={user} /> : null} />
      <div className="px-4 py-4 md:px-5 md:py-5">
        <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1280px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="hidden lg:block">{sidebar}</div>

          <div className="flex min-w-0 flex-col gap-4">
            <Card className="overflow-hidden">
              <CardContent className="grid gap-3 p-4">
                <div className="flex items-start gap-3">
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="secondary" size="icon" className="lg:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader className="sr-only">
                        <SheetTitle>Workspace navigation</SheetTitle>
                      </SheetHeader>
                      {sidebar}
                    </SheetContent>
                  </Sheet>

                  <div>
                    <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-800 md:text-4xl">
                      {activeSession?.title ?? "New Chat"}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-600 md:text-base">
                      Build one scoped study thread at a time, then revisit it from history with
                      citations intact.
                    </p>
                  </div>
                </div>

                {courses.length ? (
                  <ChatScopePicker
                    activeScopeLabel={activeSession?.scope.chapterLabel ?? null}
                    chapterValue={selectedChapterValue}
                    courseValue={selectedCourseId ?? courses[0].id}
                    courses={courses}
                    draftScopeLabel={draftScopeLabel}
                    onChapterChange={setSelectedChapterValue}
                    onCourseChange={handleCourseChange}
                  />
                ) : null}

                {chatError ? (
                  <div className="rounded-sm border-2 border-rose-300 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                    {chatError}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Tabs
              value={view}
              onValueChange={(value) => setView(value as ViewMode)}
              className="flex-1"
            >
              <TabsContent value="chat" className="mt-0">
                <div className="orbit-frame flex min-h-[720px] flex-col overflow-hidden">
                  <ChatMessageList
                    activeScopeLabel={activeScopeLabel}
                    loading={chatLoading}
                    messages={activeSession?.messages ?? []}
                    onCitationToggle={(citationId) =>
                      setOpenCitationId((current) => (current === citationId ? null : citationId))
                    }
                    onPromptClick={handlePromptClick}
                    openCitationId={openCitationId}
                    promptSuggestions={promptSuggestions}
                  />
                  <ChatComposer
                    disabled={!draftScope}
                    input={chatInput}
                    loading={chatSubmitting}
                    onInputChange={setChatInput}
                    onSubmit={handleSubmit}
                    scopeLabel={activeSession?.scope.chapterLabel ?? draftScope?.chapterLabel ?? "All chapters"}
                  />
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="mt-0">
                <DocumentLibrary
                  docQuery={docQuery}
                  fileInputId={fileInputId}
                  fileInputRef={fileInputRef}
                  filteredDocuments={filteredDocuments}
                  onAddFiles={addFiles}
                  onDocQueryChange={setDocQuery}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
