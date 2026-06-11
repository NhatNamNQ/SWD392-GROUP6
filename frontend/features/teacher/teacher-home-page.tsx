import Link from "next/link";
import { BookOpen, Files, Upload } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthUser } from "@/features/auth/model/contracts";

type TeacherHomePageProps = {
  user: AuthUser;
};

const teacherActions = [
  {
    href: "/teacher/knowledge-base",
    title: "Knowledge base",
    description: "Review indexed PDFs, refresh document state, and manage course files.",
    icon: Files,
    tone: "bg-sky-50",
  },
  {
    href: "/teacher/knowledge-base",
    title: "Upload course material",
    description: "Add new PDFs for the current course workspace and trigger indexing.",
    icon: Upload,
    tone: "bg-emerald-50",
  },
  {
    href: "/settings/password",
    title: "Password settings",
    description: "Keep your teacher workspace access aligned with the Java auth session.",
    icon: BookOpen,
    tone: "bg-white",
  },
];

export function TeacherHomePage({ user }: TeacherHomePageProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500">
          <section className="orbit-frame orbit-grid overflow-hidden">
            <div className="grid gap-6 border-b-2 border-slate-700 bg-sky-50/80 px-6 py-6 lg:grid-cols-[1.6fr_0.8fr] lg:items-end">
              <div className="space-y-3">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                  Teacher workspace
                </p>
                <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-800">
                  Manage your course knowledge base.
                </h1>
                <p className="max-w-2xl text-base font-semibold text-slate-600">
                  Use OrbitDocs to upload source material, keep course documents organized, and
                  monitor what students will query against.
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
              {teacherActions.map((action) => {
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
  );
}
