import { MessageSquarePlus, Search, Settings, ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/features/auth/components/logout-button";
import type { AuthUser } from "@/features/auth/model/contracts";
import { getRoleHomePath } from "@/features/auth/model/role-home";
import type { ChatSessionSummary } from "@/features/student/model/chat-types";

type ChatHistoryListProps = {
  activeSessionId: string | null;
  historyQuery: string;
  onHistoryQueryChange: (value: string) => void;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  sessions: ChatSessionSummary[];
  user?: AuthUser;
  scopeControls?: ReactNode;
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
  scopeControls,
}: ChatHistoryListProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_18px_48px_rgba(15,23,42,0.10)] backdrop-blur">
      <div className="border-b border-slate-200/80 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-emerald-100 font-black text-emerald-800 shadow-sm">
            OD
          </div>
          <div>
            <h1 className="text-lg font-black tracking-[-0.03em] text-slate-800">OrbitDocs</h1>
            <p className="text-xs font-bold text-slate-500">Chat across shared course documents</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
        <Button
          type="button"
          className="shrink-0 h-12 w-full justify-start rounded-full px-4"
          onClick={onNewChat}
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New chat
        </Button>

        {scopeControls ? (
          <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            {scopeControls}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <p className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
            Conversation history
          </p>
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-11 rounded-full border border-slate-200 bg-slate-50/80 pl-9 shadow-none"
              type="search"
              value={historyQuery}
              onChange={(event) => onHistoryQueryChange(event.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
            />
          </div>
          <ScrollArea className="flex-1 pr-3">
            <div className="grid gap-2 pb-4">
              {sessions.length ? (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      "rounded-[1.35rem] border px-4 py-3 text-left shadow-sm transition",
                      session.id === activeSessionId
                        ? "border-sky-300 bg-sky-100/85"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <p className="text-sm font-extrabold text-slate-800">{session.title}</p>
                    <p className="text-xs font-bold text-slate-500">
                      {session.courseName ?? "Course"} · {formatRelativeDate(session.lastMessageAt)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">
                  No saved chats yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-auto pt-4 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    {user?.fullName ?? "Member"}
                  </p>
                  <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-500">
                    {user?.role ?? "Authenticated user"}
                  </p>
                </div>
                <MoreHorizontal className="h-5 w-5 shrink-0 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              className="w-[280px] rounded-[1.25rem] p-2 mb-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  My Account
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-2 my-1" />
              {user?.role === "LECTURER" ? (
                <DropdownMenuItem
                  asChild
                  className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:bg-sky-50 focus:text-sky-900 cursor-pointer"
                >
                  <Link href={getRoleHomePath(user.role)}>
                    <ArrowLeft className="mr-3 h-4 w-4 text-slate-400" />
                    Teacher Workspace
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                asChild
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:bg-sky-50 focus:text-sky-900 cursor-pointer"
              >
                <Link href="/settings/password">
                  <Settings className="mr-3 h-4 w-4 text-slate-400" />
                  Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-2 my-1" />
              <div className="p-1">
                <LogoutButton className="h-10 w-full rounded-xl text-xs font-bold" />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
