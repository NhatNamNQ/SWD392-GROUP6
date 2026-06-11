import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/features/auth/model/contracts";
import type { ChatSessionSummary } from "@/features/student/model/chat-types";

type ChatHistoryListProps = {
  activeSessionId: string | null;
  historyQuery: string;
  onHistoryQueryChange: (value: string) => void;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  sessions: ChatSessionSummary[];
  user?: AuthUser;
};

function formatRelativeDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatHistoryList({
  activeSessionId,
  historyQuery,
  onHistoryQueryChange,
  onNewChat,
  onSelectSession,
  sessions,
  user,
}: ChatHistoryListProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border-2 border-slate-700 bg-white shadow-orbit">
      <div className="border-b-2 border-slate-700 bg-sky-50 px-4 py-3 text-sm font-extrabold text-slate-700">
        Shared Workspace
      </div>
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-sm border-2 border-slate-700 bg-emerald-100 font-black text-emerald-800 shadow-chip">
            OD
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">OrbitDocs</h1>
            <p className="text-xs font-bold text-slate-500">Chat across shared course documents</p>
          </div>
        </div>

        <Button type="button" className="w-full justify-center" onClick={onNewChat}>
          + New Chat
        </Button>

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
          <ScrollArea className="h-[320px] rounded-md">
            <div className="grid gap-2 pr-3">
              {sessions.length ? (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      "rounded-sm border-2 px-3 py-3 text-left shadow-chip transition",
                      session.id === activeSessionId
                        ? "border-slate-700 bg-sky-100"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    <p className="text-sm font-extrabold text-slate-800">{session.title}</p>
                    <p className="text-xs font-bold text-slate-500">
                      {session.courseName ?? "Course"} · {formatRelativeDate(session.lastMessageAt)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-sm border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-sm font-bold text-slate-500">
                  No saved chats yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-auto rounded-sm border-2 border-slate-700 bg-sky-50 p-3">
          <p className="text-sm font-extrabold text-slate-800">{user?.fullName ?? "Member"}</p>
          <p className="text-xs font-bold text-slate-600">{user?.role ?? "Authenticated user"}</p>
          <p className="text-xs font-bold text-slate-500">Shared chat workspace enabled</p>
        </div>
      </div>
    </div>
  );
}
