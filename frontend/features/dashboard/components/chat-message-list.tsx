import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CitationPopover } from "@/features/dashboard/components/citation-popover";
import { PromptSuggestions } from "@/features/dashboard/components/prompt-suggestions";
import type { ChatMessage } from "@/features/dashboard/model/chat-types";

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
    <ScrollArea className="h-[500px] flex-1 bg-white/70 px-4 py-4 md:px-5">
      {loading ? (
        <div className="grid min-h-full place-items-center">
          <p className="text-sm font-bold text-slate-500">Loading chat session...</p>
        </div>
      ) : messages.length ? (
        <div className="space-y-4 pr-2">
          {messages.map((message) => (
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
              <p className="text-sm font-bold leading-6 text-slate-700">{message.content}</p>
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
                Ask about models, patterns, or diagrams. OrbitDocs stays inside the selected
                course scope and shows the exact source.
              </p>
              <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                Active scope: {activeScopeLabel}
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <PromptSuggestions prompts={promptSuggestions} onPromptClick={onPromptClick} />
            </CardContent>
          </Card>
        </div>
      )}
    </ScrollArea>
  );
}
