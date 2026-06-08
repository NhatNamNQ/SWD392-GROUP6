export type ViewMode = "chat" | "knowledge";
export type MessageRole = "user" | "assistant";
export type DocumentStatus = "Indexed" | "Processing";

export type Citation = {
  id: string;
  label: string;
  snippet: string;
};

export type Message = {
  id: string;
  role: MessageRole;
  text: string;
  citations?: Citation[];
};

export type Conversation = {
  id: string;
  title: string;
  summary: string;
  messages: Message[];
};

export type DocumentRecord = {
  id: string;
  title: string;
  status: DocumentStatus;
  tag: string;
  size: string;
};
