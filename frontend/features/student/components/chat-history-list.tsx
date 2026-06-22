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
    /* Fill the sidebar column — no extra card border since aside already has border-r */
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Brand header — same height as main header bar (h-16) */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 font-black text-primary text-sm">
          OD
        </div>
        <div>
          <p className="text-base font-black tracking-[-0.03em] text-foreground">OrbitDocs</p>
          <p className="text-[11px] font-semibold text-muted-foreground">Student workspace</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <Button
          type="button"
          className="h-10 w-full shrink-0 justify-start rounded-md"
          onClick={onNewChat}
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New chat
        </Button>

        {scopeControls ? (
          <div className="shrink-0 rounded-lg border border-border bg-secondary/50 p-3">
            {scopeControls}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <p className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            Conversation history
          </p>
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-md border border-border bg-secondary/80 pl-9 shadow-none"
              type="search"
              value={historyQuery}
              onChange={(event) => onHistoryQueryChange(event.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
            />
          </div>
          <ScrollArea className="flex-1">
            <div className="grid gap-1 pb-4">
              {sessions.length ? (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-left transition-all",
                      session.id === activeSessionId
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <p className={cn("text-sm font-semibold truncate", session.id === activeSessionId ? "text-primary" : "text-foreground")}>
                      {session.title}
                    </p>
                    <p className={cn("text-xs font-medium truncate mt-0.5", session.id === activeSessionId ? "text-primary/70" : "text-muted-foreground")}>
                      {session.courseName ?? "Course"} · {formatRelativeDate(session.lastMessageAt)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-border bg-secondary/40 px-4 py-5 text-sm font-semibold text-muted-foreground">
                  No saved chats yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* User menu — same bottom pattern as admin/teacher sidebar */}
        <div className="shrink-0 border-t border-border pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md border border-border bg-secondary/50 p-3 text-left transition hover:bg-secondary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {user?.fullName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-foreground">
                    {user?.fullName ?? "Member"}
                  </p>
                  <p className="truncate text-xs font-bold text-muted-foreground">
                    {user?.role ?? "Student"}
                  </p>
                </div>
                <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              className="w-64 p-2 mb-2"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  My Account
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role === "LECTURER" ? (
                <DropdownMenuItem asChild className="cursor-pointer rounded-md px-3 py-2.5 text-sm font-semibold">
                  <Link href={getRoleHomePath(user.role)}>
                    <ArrowLeft className="mr-3 h-4 w-4 text-muted-foreground" />
                    Teacher Workspace
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem asChild className="cursor-pointer rounded-md px-3 py-2.5 text-sm font-semibold">
                <Link href="/settings/password">
                  <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                  Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-1">
                <LogoutButton className="h-9 w-full rounded-md text-xs font-bold" />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
