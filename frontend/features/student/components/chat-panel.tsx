import type { FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PromptSuggestions } from "@/features/student/components/prompt-suggestions";
import type { Conversation } from "@/features/student/model/types";

type ChatPanelProps = {
  activeConversation?: Conversation;
  chatInput: string;
  course: string;
  onChatInputChange: (value: string) => void;
  onCitationToggle: (citationId: string) => void;
  onPromptClick: (prompt: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  openCitationId: string | null;
  promptSuggestions: string[];
};

export function ChatPanel({
  activeConversation,
  chatInput,
  course,
  onChatInputChange,
  onCitationToggle,
  onPromptClick,
  onSubmit,
  openCitationId,
  promptSuggestions,
}: ChatPanelProps) {
  return (
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
                <p className="text-sm font-bold leading-6 text-slate-700">{message.text}</p>
                {message.citations?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.citations.map((citation, index) => {
                      const open = openCitationId === citation.id;

                      return (
                        <div key={citation.id} className="relative">
                          <button
                            type="button"
                            onClick={() => onCitationToggle(citation.id)}
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
                  Ask about models, patterns, or diagrams. OrbitDocs answers from the course
                  library and shows the exact source.
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <PromptSuggestions prompts={promptSuggestions} onPromptClick={onPromptClick} />
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={onSubmit} className="border-t-2 border-slate-700 bg-slate-50/90 p-4 md:p-5">
        <Card className="overflow-hidden">
          <div className="border-b-2 border-slate-700 bg-sky-50 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-slate-600">
            Searching in: {course}
          </div>
          <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Textarea
              value={chatInput}
              onChange={(event) => onChatInputChange(event.target.value)}
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
  );
}
