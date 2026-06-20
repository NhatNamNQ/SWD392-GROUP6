import { LogoutButton } from "@/features/auth/components/logout-button";
import type { AuthUser } from "@/features/auth/model/contracts";

type AuthUserActionsProps = {
  user: AuthUser;
};

export function AuthUserActions({ user }: AuthUserActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="hidden text-right md:block">
        <p className="text-sm font-black text-slate-800">{user.fullName}</p>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{user.role}</p>
      </div>
      <LogoutButton />
    </div>
  );
}
