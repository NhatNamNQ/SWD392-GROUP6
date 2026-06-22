"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Files, LayoutDashboard } from "lucide-react";

import { SidebarUserMenu } from "@/features/auth/components/sidebar-user-menu";
import type { AuthUser } from "@/features/auth/model/contracts";
import { cn } from "@/lib/utils";

type TeacherLayoutProps = {
  children: React.ReactNode;
  user: AuthUser;
};

const navigation = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "Courses", href: "/teacher/courses", icon: BookOpen },
  { name: "Knowledge Base", href: "/teacher/knowledge-base", icon: Files },
];

export function TeacherLayout({ children, user }: TeacherLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
          <Link href="/teacher" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-[-0.05em] text-foreground">
              Lecturer<span className="text-primary">Hub</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-4 px-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
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
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <SidebarUserMenu user={user} passwordHref="/teacher/password" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-8">
          <Link href="/teacher" className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-[-0.05em] text-foreground">
              Lecturer<span className="text-primary">Hub</span>
            </span>
          </Link>
          {/* Spacer on desktop */}
          <div className="hidden md:block" />
          {/* Mobile-only user info */}
          <div className="flex items-center gap-3 md:hidden">
            <span className="text-sm font-bold text-muted-foreground">{user.fullName}</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-background">{children}</div>
      </main>
    </div>
  );
}
