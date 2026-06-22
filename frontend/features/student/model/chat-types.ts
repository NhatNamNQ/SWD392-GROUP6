export type ViewMode = "chat" | "knowledge";
export type ChatMode = "chapter" | "all";
export type ChatRole = "user" | "assistant";

export type ChatCitation = {
  id: string;
  excerpt: string;
  similarityScore?: number | null;
  pageNum?: number | null;
  documentName?: string | null;
  chapterTitle?: string | null;
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
  courseId: string;
  title: string;
  lastMessageAt: string;
  courseName?: string | null;
};

export type ChatSessionDetail = ChatSessionSummary & {
  messages: ChatMessage[];
};

export type ChatResponse = {
  sessionId: string;
  messageId: string;
  answer: string;
  citations: ChatCitation[];
};

export type ChatChapterOption = {
  id: string;
  documentId: string;
  documentTitle: string;
  orderIndex: number;
  title: string;
  description: string | null;
};

export type ChatDocumentOption = {
  id: string;
  originalFilename: string;
  status: string;
  chapters: ChatChapterOption[];
};

export type ChatCourseOption = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  lecturerId: string | null;
  lecturerName: string | null;
  documents: ChatDocumentOption[];
};

export type ChatBootstrap = {
  courses: ChatCourseOption[];
  sessions: ChatSessionSummary[];
  promptSuggestions: string[];
};

export type ChatSelection = {
  courseId: string;
  courseName: string;
  documentId: string;
  documentTitle: string;
  chapterIds: string[];
  chapterTitles: string[];
};

export type ChatApiError = {
  code: string;
  message: string;
  status: number;
};
