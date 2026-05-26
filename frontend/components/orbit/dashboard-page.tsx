"use client";

import { startTransition, useDeferredValue, useId, useRef, useState } from "react";
import { BookOpen, Menu, Search, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ViewMode = "chat" | "knowledge";
type MessageRole = "user" | "assistant";

type Citation = {
  id: string;
  label: string;
  snippet: string;
};

type Message = {
  id: string;
  role: MessageRole;
  text: string;
  citations?: Citation[];
};

type Conversation = {
  id: string;
  title: string;
  summary: string;
  messages: Message[];
};

type DocumentRecord = {
  id: string;
  title: string;
  status: "Indexed" | "Processing";
  tag: string;
  size: string;
};

const initialConversations: Conversation[] = [
  {
    id: "use-case",
    title: "Use Case Diagrams Review",
    summary: "Actors, goals, system boundary",
    messages: [
      {
        id: "m1",
        role: "user",
        text: "What does a use case model capture in SWD392?",
      },
      {
        id: "m2",
        role: "assistant",
        text: "A use case model captures how actors reach goals with the system. It keeps the focus on user intent and system scope before internal design details.",
        citations: [
          {
            id: "c1",
            label: "SWD392 Week 2 - Use Case Diagrams",
            snippet:
              "Use cases describe actor goals and system responsibilities without prescribing internal design decisions.",
          },
        ],
      },
    ],
  },
  {
    id: "mvc-layered",
    title: "MVC vs Layered Architecture",
    summary: "Compare architecture styles",
    messages: [
      {
        id: "m3",
        role: "user",
        text: "When would I pick MVC instead of layered architecture?",
      },
      {
        id: "m4",
        role: "assistant",
        text: "MVC helps when UI behavior changes often because it separates interaction flow from display concerns. Layered architecture is stronger when service boundaries and dependency direction matter most.",
        citations: [
          {
            id: "c2",
            label: "SWD392 Architecture Summary",
            snippet:
              "MVC separates model, view, and controller, while layered patterns enforce dependency direction across application boundaries.",
          },
        ],
      },
    ],
  },
  {
    id: "state-machine",
    title: "State Machine Examples",
    summary: "Behavior flow",
    messages: [],
  },
  {
    id: "broker-pattern",
    title: "Broker Pattern in Distributed Systems",
    summary: "Messaging notes",
    messages: [],
  },
  {
    id: "gof",
    title: "GoF Design Patterns",
    summary: "Revision guide",
    messages: [],
  },
];

const initialDocuments: DocumentRecord[] = [
  {
    id: "d1",
    title: "Week 2 - Use Case Diagrams.pdf",
    status: "Indexed",
    tag: "Requirements",
    size: "18 pages",
  },
  {
    id: "d2",
    title: "Architecture Patterns Slides.pptx",
    status: "Indexed",
    tag: "Architecture",
    size: "42 slides",
  },
  {
    id: "d3",
    title: "State Machine Examples.docx",
    status: "Processing",
    tag: "UML",
    size: "9 pages",
  },
  {
    id: "d4",
    title: "GoF Pattern Cheat Sheet.md",
    status: "Indexed",
    tag: "Design Patterns",
    size: "6 sections",
  },
  {
    id: "d5",
    title: "Client Server Reading.pdf",
    status: "Indexed",
    tag: "Distributed Systems",
    size: "24 pages",
  },
  {
    id: "d6",
    title: "Sequence Diagram Tutorial.pdf",
    status: "Processing",
    tag: "UML",
    size: "13 pages",
  },
];

const promptSuggestions = [
  "What is a Use Case Model?",
  "Explain Client-Server Architecture",
  "Compare Sequence and Communication diagrams",
];

const courses = [
  "SWD392: Software Modeling & Design",
  "SWD392: Patterns & Architecture",
  "SWD392: Modeling Fundamentals",
];

function buildAssistantReply(message: string): Message {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    text: `I found the closest course match for "${message}" and kept the explanation scoped to the study materials. The production app will replace this mock with Java and Python backend responses.`,
    citations: [
      {
        id: `mock-${Date.now()}`,
        label: "SWD392 Course Library Index",
        snippet:
          "Course documents are searched by title, tag, and extracted content before a cited answer is created.",
      },
    ],
  };
}

function statusVariant(status: DocumentRecord["status"]): "mint" | "yellow" {
  return status === "Indexed" ? "mint" : "yellow";
}

export function DashboardPage() {
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

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(deferredHistoryQuery.toLowerCase()),
  );

  const filteredDocuments = documents.filter((document) =>
    `${document.title} ${document.tag} ${document.status}`
      .toLowerCase()
      .includes(deferredDocQuery.toLowerCase()),
  );

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
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
      const createdConversation: Conversation = {
        id: `chat-${Date.now()}`,
        title: trimmed.length > 36 ? `${trimmed.slice(0, 36)}...` : trimmed,
        summary: "Latest question",
        messages: [
          {
            id: `user-${Date.now()}`,
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

    const uploaded = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      title: file.name,
      status: "Processing" as const,
      tag: course.replace("SWD392: ", ""),
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));

    startTransition(() => {
      setDocuments((current) => [...uploaded, ...current]);
      setView("knowledge");
    });
  }

  const sidebar = (
    <div className="flex h-full flex-col overflow-hidden rounded-md border-2 border-slate-700 bg-white shadow-orbit">
      <div className="border-b-2 border-slate-700 bg-indigo-50 px-4 py-3 text-sm font-extrabold text-slate-700">
        Workspace Navigation
      </div>
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-sm border-2 border-slate-700 bg-emerald-100 font-black text-emerald-800 shadow-chip">
            OD
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">OrbitDocs</h1>
            <p className="text-xs font-bold text-slate-500">Learn from course files</p>
          </div>
        </div>

        <Button className="w-full justify-center" onClick={handleNewChat}>
          + New Chat
        </Button>

        <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
          <TabsList className="grid gap-2">
            <TabsTrigger value="chat">
              <span>Chat Workspace</span>
              <span className="text-[11px] font-extrabold text-slate-500">Student</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <span>Knowledge Base</span>
              <span className="text-[11px] font-extrabold text-slate-500">Teacher</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
            Conversation History
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              type="search"
              value={historyQuery}
              onChange={(event) => setHistoryQuery(event.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
            />
          </div>
          <ScrollArea className="h-[280px] rounded-md">
            <div className="grid gap-2 pr-3">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  className={cn(
                    "rounded-sm border-2 px-3 py-3 text-left shadow-chip transition",
                    conversation.id === activeConversationId
                      ? "border-slate-700 bg-sky-100"
                      : "border-slate-300 bg-white",
                  )}
                >
                  <p className="text-sm font-extrabold text-slate-800">{conversation.title}</p>
                  <p className="text-xs font-bold text-slate-500">{conversation.summary}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-auto rounded-sm border-2 border-slate-700 bg-pink-100 p-3">
          <p className="text-sm font-extrabold text-slate-800">Minh Anh</p>
          <p className="text-xs font-bold text-slate-600">SWD392 student</p>
          <p className="text-xs font-bold text-slate-500">Course library access enabled</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-4 md:px-5 md:py-5">
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
                  <SheetContent>{sidebar}</SheetContent>
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
              <div className="orbit-frame flex min-h-[720px] flex-col overflow-hidden">
                <ScrollArea className="h-[500px] flex-1 bg-white/70 px-4 py-4 md:px-5">
                  {activeConversation?.messages?.length ? (
                    <div className="space-y-4 pr-2">
                      {activeConversation.messages.map((message) => (
                        <article
                          key={message.id}
                          className={cn(
                            "max-w-[90%] rounded-md border-2 px-4 py-4 shadow-chip md:max-w-[80%]",
                            message.role === "user"
                              ? "ml-auto border-sky-300 bg-sky-100"
                              : "border-slate-300 bg-white",
                          )}
                        >
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                            {message.role === "user" ? "You" : "OrbitDocs"}
                          </p>
                          <p className="text-sm font-bold leading-6 text-slate-700">
                            {message.text}
                          </p>
                          {message.citations?.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.citations.map((citation, index) => {
                                const open = openCitationId === citation.id;

                                return (
                                  <div key={citation.id} className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenCitationId((current) =>
                                          current === citation.id ? null : citation.id,
                                        )
                                      }
                                      className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700"
                                    >
                                      [{index + 1}] {citation.label}
                                    </button>
                                    {open ? (
                                      <div className="absolute left-0 top-[calc(100%+0.5rem)] z-10 w-72 rounded-sm border-2 border-slate-700 bg-white p-3 text-xs font-bold text-slate-600 shadow-orbit">
                                        <p className="mb-1 text-xs font-black text-slate-800">
                                          {citation.label}
                                        </p>
                                        <p>{citation.snippet}</p>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="grid min-h-full place-items-center">
                      <Card className="w-full max-w-3xl bg-paper">
                        <CardHeader className="space-y-4">
                          <Badge variant="blue" className="w-fit">
                            SWD392 study helper
                          </Badge>
                          <CardTitle className="text-3xl md:text-4xl">
                            What would you like to learn today?
                          </CardTitle>
                          <p className="max-w-2xl text-sm font-semibold text-slate-600 md:text-base">
                            Ask about models, patterns, or diagrams. OrbitDocs answers from the
                            course library and shows the exact source.
                          </p>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                          {promptSuggestions.map((prompt) => (
                            <button
                              key={prompt}
                              type="button"
                              className="orbit-chip text-left"
                              onClick={() => handlePromptClick(prompt)}
                            >
                              {prompt}
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </ScrollArea>

                <form
                  onSubmit={handleSubmit}
                  className="border-t-2 border-slate-700 bg-slate-50/90 p-4 md:p-5"
                >
                  <Card className="overflow-hidden">
                    <div className="border-b-2 border-slate-700 bg-amber-50 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-slate-600">
                      Searching in: {course}
                    </div>
                    <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <Textarea
                        value={chatInput}
                        onChange={(event) => setChatInput(event.target.value)}
                        placeholder="Ask about a lecture, diagram, pattern, or assignment..."
                        aria-label="Chat input"
                        className="min-h-[116px]"
                      />
                      <Button type="submit" size="lg" className="md:h-[116px] md:w-[120px]">
                        Send
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="mt-0">
              <div className="orbit-frame min-h-[720px] overflow-hidden">
                <div className="grid gap-4 p-4 md:p-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <Card className="overflow-hidden">
                    <div className="orbit-panel-head bg-emerald-50 text-slate-700">
                      Knowledge Base
                    </div>
                    <CardContent className="space-y-4 p-5">
                      <div>
                        <CardTitle className="text-3xl md:text-4xl">
                          Teach the AI with clean course materials.
                        </CardTitle>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 md:text-base">
                          Teachers can add lecture slides, PDFs, and handouts here without crowding
                          the student chat. Students only see cited answers from approved files.
                        </p>
                      </div>
                      <div className="rounded-md border-2 border-dashed border-slate-400 bg-slate-50 p-5">
                        <div className="flex items-start gap-3">
                          <div className="rounded-sm border-2 border-slate-700 bg-white p-2 shadow-chip">
                            <Upload className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-800">
                              Drop lecture slides or PDFs here
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-600">
                              PDF, DOCX, PPTX, or Markdown. New files appear as processing cards
                              below.
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <input
                            id={fileInputId}
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={(event) => addFiles(event.target.files)}
                          />
                          <Button type="button" onClick={() => fileInputRef.current?.click()}>
                            Choose files
                          </Button>
                          <Badge variant="peach">Prototype upload flow</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <div className="orbit-panel-head bg-indigo-50 text-slate-700">
                      Document Library
                    </div>
                    <CardContent className="space-y-4 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xl font-black text-slate-800">Teacher files</p>
                          <p className="text-sm font-semibold text-slate-500">
                            Filter by document or tag
                          </p>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            className="pl-9"
                            type="search"
                            value={docQuery}
                            onChange={(event) => setDocQuery(event.target.value)}
                            placeholder="Filter documents"
                            aria-label="Filter documents"
                          />
                        </div>
                      </div>

                      <ScrollArea className="h-[470px] rounded-md">
                        <div className="grid gap-3 pr-3">
                          {filteredDocuments.map((document) => (
                            <Card key={document.id} className="shadow-chip">
                              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="rounded-sm border-2 border-slate-700 bg-slate-50 p-2">
                                    <BookOpen className="h-4 w-4 text-slate-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-extrabold text-slate-800">
                                      {document.title}
                                    </p>
                                    <p className="text-xs font-bold text-slate-500">
                                      {document.size}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant={statusVariant(document.status)}>
                                    {document.status}
                                  </Badge>
                                  <Badge variant="blue">{document.tag}</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t-2 border-slate-700 bg-orange-50 px-5 py-4 text-sm font-bold text-slate-600">
                  Knowledge Base is a teacher workspace. The student chat stays focused on
                  questions, answers, and citations.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
