import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  benefits: ReactNode;
  form: ReactNode;
};

export function AuthShell({ benefits, form }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="absolute inset-0 orbit-grid opacity-50" />
      <div className="relative">
        <SiteHeader
          variant="app"
          actions={
            <div className="flex items-center gap-2">
              <Link href="/login" className={cn(buttonVariants({ variant: "secondary" }))}>
                Login
              </Link>
              <Link href="/register" className={cn(buttonVariants())}>
                Register
              </Link>
            </div>
          }
        />

        <main className="orbit-shell px-1 py-5 md:py-6">
          <section className="orbit-frame overflow-hidden">
            <div className="grid min-h-[calc(100vh-9rem)] gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="hidden border-r-2 border-slate-700 bg-white md:flex md:flex-col">
                <div className="flex items-center justify-between gap-3 border-b-2 border-slate-700 bg-sky-50 px-6 py-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                      Workspace overview
                    </p>
                    <p className="text-sm font-extrabold text-slate-700">
                      Course access, cited answers, and role-based entry
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-slate-700 bg-white shadow-chip">
                    <Sparkles className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
                <div className="flex-1 px-6 py-6 lg:px-8 lg:py-8">{benefits}</div>
              </div>

              <div className="flex flex-col bg-slate-50">
                <div className="flex items-center justify-between gap-3 border-b-2 border-slate-700 bg-emerald-50 px-5 py-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                      Account access
                    </p>
                    <p className="text-sm font-extrabold text-slate-700">
                      Sign in with your course workspace credentials
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-slate-700 bg-white shadow-chip">
                    <Sparkles className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-center bg-white p-2 sm:p-4">
                  <div className="w-full max-w-xl">{form}</div>
                </div>
                <div className="border-t-2 border-slate-700 bg-sky-50 px-5 py-5 md:hidden">
                  {benefits}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
