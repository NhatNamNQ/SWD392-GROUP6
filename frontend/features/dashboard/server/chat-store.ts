import type {
  ChatCitation,
  ChatCourseOption,
  ChatMessage,
  ChatMessageResponse,
  ChatMode,
  ChatScope,
  ChatSessionDetail,
  ChatSessionSummary,
} from "@/features/dashboard/model/chat-types";

const sessionStore = new Map<string, Map<string, ChatSessionDetail>>();

let idCounter = 0;

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function truncateTitle(message: string) {
  const trimmed = message.trim();
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed;
}

function getUserSessions(userId: string) {
  const existing = sessionStore.get(userId);

  if (existing) {
    return existing;
  }

  const created = new Map<string, ChatSessionDetail>();
  sessionStore.set(userId, created);
  return created;
}

function getCourse(courses: ChatCourseOption[], scope: ChatScope) {
  return courses.find((course) => course.id === scope.courseId) ?? null;
}

function createCitation(courses: ChatCourseOption[], scope: ChatScope, content: string): ChatCitation {
  const course = getCourse(courses, scope);
  const chapter = course?.chapters.find((entry) => entry.id === (scope.chapterId ?? course.chapters[0]?.id));
  const documentTitle = chapter?.documentTitle ?? `${scope.courseName} source packet`;

  return {
    id: nextId("citation"),
    documentTitle,
    chapterTitle: scope.chapterLabel,
    excerpt:
      content.length > 180
        ? `${content.slice(0, 180)}...`
        : `This answer is scoped to ${scope.chapterLabel.toLowerCase()} in ${scope.courseName} and stays inside the indexed SWD392 materials.`,
    pageNumber: 1,
    similarityScore: 0.91,
  };
}

function buildAssistantContent(scope: ChatScope, prompt: string) {
  if (scope.mode === "all") {
    return `Across ${scope.courseName}, "${prompt}" is explained through the indexed course materials. Start from actor goals, system boundary, and the cited examples before moving into design details.`;
  }

  return `Within ${scope.chapterLabel}, "${prompt}" is answered using the indexed chapter materials. Focus on the cited explanation first, then use the follow-up examples in the same session for deeper revision.`;
}

function createAssistantMessage(courses: ChatCourseOption[], scope: ChatScope, prompt: string): ChatMessage {
  const createdAt = new Date().toISOString();
  const content = buildAssistantContent(scope, prompt);

  return {
    id: nextId("assistant"),
    role: "assistant",
    content,
    createdAt,
    citations: [createCitation(courses, scope, content)],
  };
}

function toSummary(session: ChatSessionDetail): ChatSessionSummary {
  return {
    id: session.id,
    title: session.title,
    lastMessagePreview: session.lastMessagePreview,
    lastMessageAt: session.lastMessageAt,
    scope: session.scope,
  };
}

function sortSessions(sessions: ChatSessionDetail[]) {
  return sessions.sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt));
}

export function createChatError(status: number, code: string, message: string) {
  return {
    status,
    code,
    message,
  };
}

export function requireValidScope(input: {
  courseId: string;
  chapterId: string | null;
  mode: ChatMode;
}, courses: ChatCourseOption[]): ChatScope {
  const course = courses.find((entry) => entry.id === input.courseId);

  if (!course) {
    throw createChatError(404, "COURSE_NOT_FOUND", "The selected course was not found.");
  }

  if (input.mode === "all") {
    return {
      courseId: course.id,
      courseName: course.name,
      chapterId: null,
      chapterLabel: "All chapters",
      mode: "all",
    };
  }

  if (!input.chapterId) {
    throw createChatError(
      400,
      "CHAT_SCOPE_INVALID",
      "A chapter must be selected when mode is chapter.",
    );
  }

  const chapter = course.chapters.find((entry) => entry.id === input.chapterId);

  if (!chapter) {
    throw createChatError(404, "CHAPTER_NOT_FOUND", "The selected chapter was not found.");
  }

  return {
    courseId: course.id,
    courseName: course.name,
    chapterId: chapter.id,
    chapterLabel: chapter.label,
    mode: "chapter",
  };
}

export function listChatSessions(userId: string, courseId?: string) {
  const sessions = Array.from(getUserSessions(userId).values());
  const filtered = courseId
    ? sessions.filter((session) => session.scope.courseId === courseId)
    : sessions;

  return sortSessions(filtered).map(toSummary);
}

export function getChatSession(userId: string, sessionId: string) {
  const session = getUserSessions(userId).get(sessionId);

  if (!session) {
    throw createChatError(404, "SESSION_NOT_FOUND", "The requested session was not found.");
  }

  return session;
}

export function createChatSession(
  userId: string,
  input: {
    courseId: string;
    chapterId: string | null;
    mode: ChatMode;
    initialMessage?: string;
  },
  courses: ChatCourseOption[],
) {
  const scope = requireValidScope(input, courses);
  const createdAt = new Date().toISOString();
  const messages: ChatMessage[] = [];

  if (input.initialMessage?.trim()) {
    messages.push({
      id: nextId("user"),
      role: "user",
      content: input.initialMessage.trim(),
      createdAt,
      citations: [],
    });
    messages.push(createAssistantMessage(courses, scope, input.initialMessage.trim()));
  }

  const detail: ChatSessionDetail = {
    id: nextId("session"),
    title: truncateTitle(input.initialMessage?.trim() || `${scope.chapterLabel} chat`),
    lastMessagePreview:
      messages.at(-1)?.content ?? `Ready for questions in ${scope.chapterLabel.toLowerCase()}.`,
    lastMessageAt: messages.at(-1)?.createdAt ?? createdAt,
    scope,
    messages,
  };

  getUserSessions(userId).set(detail.id, detail);
  return detail;
}

export function appendChatMessage(
  userId: string,
  sessionId: string,
  content: string,
  courses: ChatCourseOption[],
): ChatMessageResponse {
  const session = getChatSession(userId, sessionId);
  const trimmed = content.trim();

  if (!trimmed) {
    throw createChatError(400, "MESSAGE_EMPTY", "Message content is required.");
  }

  const userMessage: ChatMessage = {
    id: nextId("user"),
    role: "user",
    content: trimmed,
    createdAt: new Date().toISOString(),
    citations: [],
  };
  const assistantMessage = createAssistantMessage(courses, session.scope, trimmed);

  session.messages.push(userMessage, assistantMessage);
  session.lastMessageAt = assistantMessage.createdAt;
  session.lastMessagePreview = assistantMessage.content;

  return {
    sessionId: session.id,
    userMessage,
    assistantMessage,
    sessionSummary: toSummary(session),
  };
}
