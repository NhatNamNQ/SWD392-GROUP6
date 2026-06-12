import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CitationPopover } from "@/features/student/components/citation-popover";
import { PromptSuggestions } from "@/features/student/components/prompt-suggestions";
import type { ChatMessage } from "@/features/student/model/chat-types";

type ChatMessageListProps = {
  activeScopeLabel: string;
  loading: boolean;
  messages: ChatMessage[];
  onCitationToggle: (citationId: string) => void;
  onPromptClick: (prompt: string) => void;
  openCitationId: string | null;
  promptSuggestions: string[];
};

export function ChatMessageList({
  activeScopeLabel,
  loading,
  messages,
  onCitationToggle,
  onPromptClick,
  openCitationId,
  promptSuggestions,
}: ChatMessageListProps) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      {loading ? (
        <div className="grid min-h-full place-items-center px-6 py-10">
          <p className="text-sm font-bold text-slate-500">Loading chat session...</p>
        </div>
      ) : messages.length ? (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn(
                "max-w-[88%] rounded-[1.5rem] border px-5 py-4 shadow-sm md:max-w-[78%]",
                message.role === "user"
                  ? "ml-auto border-sky-200 bg-sky-100/90"
                  : "border-slate-200 bg-white",
              )}
            >
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                {message.role === "user" ? "You" : "OrbitDocs"}
              </p>
              <p className="text-sm font-bold leading-7 text-slate-700">{message.content}</p>
              {message.citations.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.citations.map((citation, index) => (
                    <CitationPopover
                      key={citation.id}
                      citation={citation}
                      index={index}
                      open={openCitationId === citation.id}
                      onToggle={onCitationToggle}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-full place-items-center px-6 py-10">
          <div className="w-full max-w-4xl text-center">
            <Badge variant="blue" className="mx-auto w-fit">
              OrbitDocs shared workspace
            </Badge>
            <h2 className="mt-6 text-balance text-4xl font-black tracking-[-0.05em] text-slate-800 md:text-6xl">
              What should we explore in SWD392?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">
              Ask about models, diagrams, or course concepts. Each reply stays tied to the selected
              course material and keeps citations attached to the active session.
            </p>
            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Active scope: {activeScopeLabel}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PromptSuggestions prompts={promptSuggestions} onPromptClick={onPromptClick} />
            </div>
          </div>
        </div>
      )}
    </ScrollArea>
  );
}
