export type ViewMode = "chat" | "knowledge";
export type ChatMode = "chapter" | "all";
export type ChatRole = "user" | "assistant";

export type ChatChapterOption = {
  id: string;
  label: string;
  documentTitle?: string;
};

export type ChatCourseOption = {
  id: string;
  name: string;
  chapters: ChatChapterOption[];
};

export type ChatScope = {
  courseId: string;
  courseName: string;
  chapterId: string | null;
  chapterLabel: string;
  mode: ChatMode;
};

export type ChatCitation = {
  id: string;
  documentTitle: string;
  chapterTitle: string;
  excerpt: string;
  pageNumber?: number;
  similarityScore?: number;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  citations: ChatCitation[];
};

export type ChatSessionSummary = {
  id: string;
  title: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  scope: ChatScope;
};

export type ChatSessionDetail = ChatSessionSummary & {
  messages: ChatMessage[];
};

export type ChatBootstrap = {
  courses: ChatCourseOption[];
  sessions: ChatSessionSummary[];
  promptSuggestions: string[];
};

export type ChatMessageResponse = {
  sessionId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  sessionSummary: ChatSessionSummary;
};

export type ChatApiError = {
  code: string;
  message: string;
  status: number;
};
