"use client";

import { startTransition, useDeferredValue, useId, useMemo, useRef, useState } from "react";
import { Menu } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChatPanel } from "@/features/dashboard/components/chat-panel";
import { DocumentLibrary } from "@/features/dashboard/components/document-library";
import { HistorySidebar } from "@/features/dashboard/components/history-sidebar";
import {
  courses,
  initialConversations,
  initialDocuments,
  promptSuggestions,
} from "@/features/dashboard/data/mock-dashboard";
import { AuthUserActions } from "@/features/auth/components/auth-user-actions";
import type { AuthUser } from "@/features/auth/model/contracts";
import { buildAssistantReply } from "@/features/dashboard/model/reply";
import type { Conversation, DocumentRecord, ViewMode } from "@/features/dashboard/model/types";

type DashboardShellProps = {
  user: AuthUser;
};

export function DashboardShell({ user }: DashboardShellProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<ViewMode>("chat");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [docQuery, setDocQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [course, setCourse] = useState(courses[0]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversations[0]?.id ?? null,
  );
  const [conversations, setConversations] = useState(initialConversations);
  const [documents, setDocuments] = useState(initialDocuments);
  const [openCitationId, setOpenCitationId] = useState<string | null>(null);

  const deferredHistoryQuery = useDeferredValue(historyQuery);
  const deferredDocQuery = useDeferredValue(docQuery);

  const normalizedHistoryQuery = deferredHistoryQuery.trim().toLowerCase();
  const normalizedDocQuery = deferredDocQuery.trim().toLowerCase();

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) =>
        conversation.title.toLowerCase().includes(normalizedHistoryQuery),
      ),
    [conversations, normalizedHistoryQuery],
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

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [activeConversationId, conversations],
  );

  const isNewChat = activeConversationId === null;
  const title =
    view === "knowledge"
      ? "Knowledge Base"
      : isNewChat
        ? "New Chat"
        : (activeConversation?.title ?? "Workspace");
  const subtitle =
    view === "knowledge"
      ? "Upload and organize teacher-approved course documents for cited answers."
      : isNewChat
        ? "Start with a course question, then follow the citations back to the source."
        : "Ask a question and get answers with citations from your course documents.";

  function selectConversation(id: string | null) {
    setActiveConversationId(id);
    setView("chat");
    setSheetOpen(false);
    setOpenCitationId(null);
  }

  function handleNewChat() {
    startTransition(() => {
      setActiveConversationId(null);
      setView("chat");
      setSheetOpen(false);
      setOpenCitationId(null);
    });
  }

  function handlePromptClick(prompt: string) {
    setChatInput(prompt);
    setView("chat");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = chatInput.trim();

    if (!trimmed) {
      return;
    }

    setOpenCitationId(null);

    if (activeConversationId === null) {
      const timestamp = Date.now();
      const createdConversation: Conversation = {
        id: `chat-${timestamp}`,
        title: trimmed.length > 36 ? `${trimmed.slice(0, 36)}...` : trimmed,
        summary: "Latest question",
        messages: [
          {
            id: `user-${timestamp}`,
            role: "user",
            text: trimmed,
          },
          buildAssistantReply(trimmed),
        ],
      };

      startTransition(() => {
        setConversations((current) => [createdConversation, ...current]);
        setActiveConversationId(createdConversation.id);
        setChatInput("");
      });

      return;
    }

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  id: `user-${Date.now()}`,
                  role: "user",
                  text: trimmed,
                },
                buildAssistantReply(trimmed),
              ],
            }
          : conversation,
      ),
    );
    setChatInput("");
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) {
      return;
    }

    const uploaded: DocumentRecord[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      title: file.name,
      status: "Processing",
      tag: course.replace("SWD392: ", ""),
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));

    startTransition(() => {
      setDocuments((current) => [...uploaded, ...current]);
      setView("knowledge");
    });
  }

  const sidebar = (
    <HistorySidebar
      activeConversationId={activeConversationId}
      filteredConversations={filteredConversations}
      historyQuery={historyQuery}
      onHistoryQueryChange={setHistoryQuery}
      onNewChat={handleNewChat}
      onSelectConversation={selectConversation}
      onViewChange={setView}
      view={view}
    />
  );

  return (
    <div className="min-h-screen">
      <SiteHeader variant="app" actions={<AuthUserActions user={user} />} />
      <div className="px-4 py-4 md:px-5 md:py-5">
        <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1280px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="hidden lg:block">{sidebar}</div>

          <div className="flex min-w-0 flex-col gap-4">
            <Card className="overflow-hidden">
              <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
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
                      {title}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-600 md:text-base">
                      {subtitle}
                    </p>
                  </div>
                </div>

                <label className="grid gap-2 text-sm font-extrabold text-slate-700">
                  Course
                  <select
                    className="h-11 rounded-sm border-2 border-slate-300 bg-white px-3 font-bold text-slate-700 shadow-chip outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                  >
                    {courses.map((courseName) => (
                      <option key={courseName}>{courseName}</option>
                    ))}
                  </select>
                </label>
              </CardContent>
            </Card>

            <Tabs
              value={view}
              onValueChange={(value) => setView(value as ViewMode)}
              className="flex-1"
            >
              <TabsContent value="chat" className="mt-0">
                <ChatPanel
                  activeConversation={activeConversation}
                  chatInput={chatInput}
                  course={course}
                  onChatInputChange={setChatInput}
                  onCitationToggle={(citationId) =>
                    setOpenCitationId((current) => (current === citationId ? null : citationId))
                  }
                  onPromptClick={handlePromptClick}
                  onSubmit={handleSubmit}
                  openCitationId={openCitationId}
                  promptSuggestions={promptSuggestions}
                />
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
