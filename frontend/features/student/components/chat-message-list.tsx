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
    <ScrollArea className="h-full">
      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
          <p className="text-sm font-semibold text-muted-foreground">Loading chat session...</p>
        </div>
      ) : messages.length ? (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8 md:px-8 md:py-10">
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn(
                "max-w-[88%] rounded-xl border px-5 py-4 shadow-sm md:max-w-[75%]",
                message.role === "user"
                  ? "ml-auto border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              <p
                className={cn(
                  "mb-1.5 text-[10px] font-black uppercase tracking-[0.14em]",
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {message.role === "user" ? "You" : "OrbitDocs"}
              </p>
              <p
                className={cn(
                  "text-sm font-semibold leading-7",
                  message.role === "user" ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {message.content}
              </p>
              {message.citations.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.citations.map((citation, index) => (
                    <CitationPopover
                      key={`${citation.id}-${index}`}
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
        <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl text-center">
            <Badge variant="blue" className="mx-auto w-fit">
              OrbitDocs shared workspace
            </Badge>
            <h2 className="mt-6 text-balance text-4xl font-black tracking-[-0.05em] text-foreground md:text-5xl">
              What should we explore today?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-7 text-muted-foreground">
              Ask about models, diagrams, or course concepts. Each reply stays tied to the selected
              course material with citations attached.
            </p>
            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              Active scope: {activeScopeLabel}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <PromptSuggestions prompts={promptSuggestions} onPromptClick={onPromptClick} />
            </div>
          </div>
        </div>
      )}
    </ScrollArea>
  );
}
