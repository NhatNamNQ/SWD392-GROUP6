import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import type { AuthUser } from "@/features/auth/model/contracts";
import { getRoleHomePath } from "@/features/auth/model/role-home";

type AuthUserActionsProps = {
  user: AuthUser;
};

export function AuthUserActions({ user }: AuthUserActionsProps) {
  const roleHomePath = getRoleHomePath(user.role);
  const roleLinks =
    user.role === "ADMIN"
      ? [
          { href: roleHomePath, label: "Admin home" },
          { href: "/student", label: "Chat workspace" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/courses", label: "Courses" },
          { href: "/admin/roles", label: "Roles" },
        ]
      : user.role === "LECTURER"
        ? [
            { href: roleHomePath, label: "Teacher home" },
            { href: "/student", label: "Chat workspace" },
            { href: "/teacher/knowledge-base", label: "Knowledge" },
          ]
        : [{ href: "/student", label: "Chat workspace" }];

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="hidden text-right md:block">
        <p className="text-sm font-black text-slate-800">{user.fullName}</p>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{user.role}</p>
      </div>
      {roleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-sm border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-chip transition hover:border-slate-400"
        >
          {link.label}
        </Link>
      ))}
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
