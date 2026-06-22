"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { KeyRound, LogOut } from "lucide-react";

import { logoutSession, toAuthNotice } from "@/features/auth/model/forms";
import type { AuthUser } from "@/features/auth/model/contracts";
import { cn } from "@/lib/utils";

type SidebarUserMenuProps = {
  user: AuthUser;
  /** Path to the Change Password page within this dashboard, e.g. "/admin/password" */
  passwordHref: string;
};

export function SidebarUserMenu({ user, passwordHref }: SidebarUserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  function handleLogout() {
    setPending(true);
    startTransition(async () => {
      try {
        await logoutSession();
        router.replace("/login");
        router.refresh();
      } catch (error) {
        const notice = toAuthNotice(error);
        window.alert(notice.message);
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <div className="relative">
      {/* Popup Menu */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Link
              href={passwordHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
              Change password
            </Link>
            <div className="border-t border-border" />
            <button
              type="button"
              onClick={handleLogout}
              disabled={pending}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors",
                "text-destructive hover:bg-destructive/10",
                pending && "cursor-not-allowed opacity-60",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {pending ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </>
      )}

      {/* Trigger: user card */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md p-3 text-left transition-all",
          "border border-border bg-secondary/50 shadow-sm",
          "hover:bg-secondary hover:shadow-md",
          open && "bg-secondary ring-2 ring-primary/20",
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {user.fullName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-black text-foreground">{user.fullName}</p>
          <p className="truncate text-xs font-bold text-muted-foreground">{user.email}</p>
        </div>
        <span
          className={cn(
            "text-xs text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        >
          ▲
        </span>
      </button>
    </div>
  );
}
