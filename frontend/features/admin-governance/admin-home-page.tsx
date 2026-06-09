import Link from "next/link";
import { BookCopy, ShieldCheck, Users } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthUserActions } from "@/features/auth/components/auth-user-actions";
import type { AuthUser } from "@/features/auth/model/contracts";

type AdminHomePageProps = {
  user: AuthUser;
};

const adminActions = [
  {
    href: "/admin/users",
    title: "Users",
    description: "Manage accounts, assign roles, and keep access active for the right people.",
    icon: Users,
    tone: "bg-sky-50",
  },
  {
    href: "/admin/courses",
    title: "Courses",
    description: "Create and maintain course records that feed teacher and student workspaces.",
    icon: BookCopy,
    tone: "bg-emerald-50",
  },
  {
    href: "/admin/roles",
    title: "Roles",
    description: "Review the governance catalog and keep role definitions in sync.",
    icon: ShieldCheck,
    tone: "bg-white",
  },
];

export function AdminHomePage({ user }: AdminHomePageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader variant="app" actions={<AuthUserActions user={user} />} />
      <main className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="orbit-frame orbit-grid overflow-hidden">
            <div className="grid gap-6 border-b-2 border-slate-700 bg-emerald-50/80 px-6 py-6 lg:grid-cols-[1.6fr_0.8fr] lg:items-end">
              <div className="space-y-3">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                  Admin governance
                </p>
                <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-800">
                  Oversee users, roles, and course structure.
                </h1>
                <p className="max-w-2xl text-base font-semibold text-slate-600">
                  This admin workspace is the entry point for the operational side of OrbitDocs:
                  account governance, course structure, and role catalog maintenance.
                </p>
              </div>
              <div className="rounded-md border-2 border-slate-700 bg-white p-5 shadow-chip">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Signed in as
                </p>
                <p className="mt-2 text-2xl font-black text-slate-800">{user.fullName}</p>
                <p className="text-sm font-bold text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
              {adminActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Card key={action.title} className="overflow-hidden">
                    <CardHeader className={`border-b-2 border-slate-700 ${action.tone}`}>
                      <div className="flex items-center gap-3">
                        <div className="rounded-sm border-2 border-slate-700 bg-white p-2">
                          <Icon className="h-5 w-5 text-slate-700" />
                        </div>
                        <CardTitle className="text-base">{action.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <p className="text-sm font-semibold leading-6 text-slate-600">
                        {action.description}
                      </p>
                      <Link href={action.href} className={buttonVariants()}>
                        Open
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
