import type { ReactNode } from "react";

import { SiteHeader } from "@/components/shared/site-header";

type AuthShellProps = {
  benefits: ReactNode;
  form: ReactNode;
};

export function AuthShell({ benefits, form }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="absolute inset-0 orbit-grid opacity-50" />
      <div className="relative">
        <SiteHeader variant="app" />

        <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-[480px] rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_18px_48px_rgba(15,23,42,0.10)] backdrop-blur">
            {form}
          </div>
          <div className="hidden">{benefits}</div>
        </main>
      </div>
    </div>
  );
}
