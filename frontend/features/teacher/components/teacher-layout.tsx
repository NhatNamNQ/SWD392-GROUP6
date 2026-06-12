"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Files, LayoutDashboard, Settings } from "lucide-react";

import { AuthUserActions } from "@/features/auth/components/auth-user-actions";
import type { AuthUser } from "@/features/auth/model/contracts";
import { cn } from "@/lib/utils";

type TeacherLayoutProps = {
  children: React.ReactNode;
  user: AuthUser;
};

const navigation = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "Knowledge Base", href: "/teacher/knowledge-base", icon: Files },
  { name: "Password Settings", href: "/settings/password", icon: Settings },
];

export function TeacherLayout({ children, user }: TeacherLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r-2 border-slate-700 bg-white md:flex">
        <div className="flex h-16 shrink-0 items-center border-b-2 border-slate-700 px-6">
          <Link href="/teacher" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-white shadow-chip">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-[-0.05em] text-slate-800">
              Lecturer<span className="text-sky-600">Hub</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-4 px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-all",
                  isActive
                    ? "bg-slate-100 text-slate-900 shadow-[inset_4px_0_0_0_#0284c7]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t-2 border-slate-700 p-4">
          <div className="flex items-center gap-3 rounded-md border-2 border-slate-200 bg-slate-50 p-3 shadow-chip">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
              {user.fullName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-black text-slate-800">{user.fullName}</p>
              <p className="truncate text-xs font-bold text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header & Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b-2 border-slate-700 bg-white px-4 md:px-8">
          <div className="flex items-center md:hidden">
            <Link href="/teacher" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-[-0.05em] text-slate-800">
                Lecturer<span className="text-sky-600">Hub</span>
              </span>
            </Link>
          </div>

          {/* Breadcrumb or Page Title placeholder on desktop */}
          <div className="hidden md:block">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              {navigation.find((n) => n.href === pathname)?.name || "Dashboard"} Workspace
            </p>
          </div>

          <div className="flex items-center gap-4">
            <AuthUserActions user={user} />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
