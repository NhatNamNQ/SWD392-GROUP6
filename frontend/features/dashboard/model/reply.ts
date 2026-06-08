import type { DocumentStatus, Message } from "@/features/dashboard/model/types";

export function buildAssistantReply(message: string): Message {
  const timestamp = Date.now();

  return {
    id: `assistant-${timestamp}`,
    role: "assistant",
    text: `I found the closest course match for "${message}" and kept the explanation scoped to the study materials. The production app will replace this mock with Java and Python backend responses.`,
    citations: [
      {
        id: `mock-${timestamp}`,
        label: "SWD392 Course Library Index",
        snippet:
          "Course documents are searched by title, tag, and extracted content before a cited answer is created.",
      },
    ],
  };
}

export function statusVariant(status: DocumentStatus): "mint" | "blue" {
  return status === "Indexed" ? "mint" : "blue";
}
