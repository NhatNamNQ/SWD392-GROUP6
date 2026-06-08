import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import type { AuthUser } from "@/features/auth/model/contracts";

type AuthUserActionsProps = {
  user: AuthUser;
};

export function AuthUserActions({ user }: AuthUserActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right md:block">
        <p className="text-sm font-black text-slate-800">{user.fullName}</p>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{user.role}</p>
      </div>
      <Link
        href="/settings/password"
        className="rounded-sm border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-chip transition hover:border-slate-400"
      >
        Password
      </Link>
      <LogoutButton />
    </div>
  );
}
