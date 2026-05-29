import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Conversation, ViewMode } from "@/features/dashboard/model/types";

type HistorySidebarProps = {
  activeConversationId: string | null;
  filteredConversations: Conversation[];
  historyQuery: string;
  onHistoryQueryChange: (value: string) => void;
  onNewChat: () => void;
  onSelectConversation: (id: string | null) => void;
  onViewChange: (value: ViewMode) => void;
  view: ViewMode;
};

export function HistorySidebar({
  activeConversationId,
  filteredConversations,
  historyQuery,
  onHistoryQueryChange,
  onNewChat,
  onSelectConversation,
  onViewChange,
  view,
}: HistorySidebarProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border-2 border-slate-700 bg-white shadow-orbit">
      <div className="border-b-2 border-slate-700 bg-sky-50 px-4 py-3 text-sm font-extrabold text-slate-700">
        Workspace Navigation
      </div>
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-sm border-2 border-slate-700 bg-emerald-100 font-black text-emerald-800 shadow-chip">
            OD
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">OrbitDocs</h1>
            <p className="text-xs font-bold text-slate-500">Learn from course files</p>
          </div>
        </div>

        <Button className="w-full justify-center" onClick={onNewChat}>
          + New Chat
        </Button>

        <Tabs value={view} onValueChange={(value) => onViewChange(value as ViewMode)}>
          <TabsList className="grid gap-2">
            <TabsTrigger value="chat">
              <span>Chat Workspace</span>
              <span className="text-[11px] font-extrabold text-slate-500">Student</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <span>Knowledge Base</span>
              <span className="text-[11px] font-extrabold text-slate-500">Teacher</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
            Conversation History
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              type="search"
              value={historyQuery}
              onChange={(event) => onHistoryQueryChange(event.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
            />
          </div>
          <ScrollArea className="h-[280px] rounded-md">
            <div className="grid gap-2 pr-3">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "rounded-sm border-2 px-3 py-3 text-left shadow-chip transition",
                    conversation.id === activeConversationId
                      ? "border-slate-700 bg-sky-100"
                      : "border-slate-300 bg-white",
                  )}
                >
                  <p className="text-sm font-extrabold text-slate-800">{conversation.title}</p>
                  <p className="text-xs font-bold text-slate-500">{conversation.summary}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-auto rounded-sm border-2 border-slate-700 bg-sky-50 p-3">
          <p className="text-sm font-extrabold text-slate-800">Minh Anh</p>
          <p className="text-xs font-bold text-slate-600">SWD392 student</p>
          <p className="text-xs font-bold text-slate-500">Course library access enabled</p>
        </div>
      </div>
    </div>
  );
}
