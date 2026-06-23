import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CitationPopover } from "@/features/student/components/citation-popover";
import { PromptSuggestions } from "@/features/student/components/prompt-suggestions";
import type { ChatMessage } from "@/features/student/model/chat-types";
import { User, Bot } from "lucide-react";

type ChatMessageListProps = {
  activeScopeLabel: string;
  loading: boolean;
  messages: ChatMessage[];
  onCitationToggle: (citationId: string) => void;
  onPromptClick: (prompt: string) => void;
  openCitationId: string | null;
  promptSuggestions: string[];
  isSubmitting?: boolean;
  optimisticUserMessage?: string | null;
};

export function ChatMessageList({
  activeScopeLabel,
  loading,
  messages,
  onCitationToggle,
  onPromptClick,
  openCitationId,
  promptSuggestions,
  isSubmitting,
  optimisticUserMessage,
}: ChatMessageListProps) {
  return (
    <ScrollArea className="h-full">
      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
          <p className="text-sm font-semibold text-muted-foreground">Loading chat session...</p>
        </div>
      ) : messages.length || optimisticUserMessage ? (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 md:px-8 md:py-10">
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn(
                "flex gap-4 max-w-[95%] rounded-xl border px-5 py-4 shadow-sm md:max-w-[85%]",
                message.role === "user"
                  ? "ml-auto border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              <div className="shrink-0 pt-0.5">
                {message.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "mb-1.5 text-[10px] font-black uppercase tracking-[0.14em]",
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {message.role === "user" ? "You" : "OrbitDocs"}
                </p>
                <div
                  className={cn(
                    "text-sm font-semibold leading-7",
                    message.role === "user" ? "text-primary-foreground" : "text-foreground",
                  )}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <div className="prose prose-sm prose-stone max-w-none prose-p:leading-7 prose-p:my-2 prose-headings:my-3 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
                {message.citations.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.citations.map((citation, index) => (
                        <CitationPopover
                          key={`${message.id}-${citation.id}-${index}`}
                          uniqueId={`${message.id}-${citation.id}-${index}`}
                          citation={citation}
                          index={index}
                          open={openCitationId === `${message.id}-${citation.id}-${index}`}
                          onToggle={onCitationToggle}
                        />
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}

          {optimisticUserMessage ? (
            <article
              className={cn(
                "flex gap-4 max-w-[95%] rounded-xl border px-5 py-4 shadow-sm md:max-w-[85%]",
                "ml-auto border-primary bg-primary text-primary-foreground",
              )}
            >
              <div className="shrink-0 pt-0.5">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary-foreground/70">
                  You
                </p>
                <div className="text-sm font-semibold leading-7 text-primary-foreground">
                  {optimisticUserMessage}
                </div>
              </div>
            </article>
          ) : null}

          {isSubmitting ? (
            <article
              className={cn(
                "flex gap-4 max-w-[95%] rounded-xl border px-5 py-4 shadow-sm md:max-w-[85%]",
                "border-border bg-card text-foreground",
              )}
            >
              <div className="shrink-0 pt-0.5">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                  OrbitDocs
                </p>
                <div className="flex items-center gap-1.5 h-7">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </article>
          ) : null}
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
