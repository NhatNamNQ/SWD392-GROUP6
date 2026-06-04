import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginForm() {
  return (
    <div className="space-y-6 bg-slate-50 p-6 md:p-8">
      <div className="space-y-2">
        <CardTitle className="text-3xl tracking-[-0.04em] text-slate-800">Login</CardTitle>
        <p className="text-sm font-semibold text-slate-600">
          Enter your account details to continue.
        </p>
      </div>

      <CardContent className="space-y-6 rounded-md border border-slate-200 bg-white p-6 md:p-8">
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-700" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@school.edu" autoComplete="email" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-700" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}>
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </form>

        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <Link href="#" className="transition hover:text-slate-800">
            Forgot password?
          </Link>
          <Link href="/dashboard" className="transition hover:text-slate-800">
            Go to dashboard
          </Link>
        </div>

        <div className="rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          New to OrbitDocs? Use your school account or continue to the dashboard if you only need
          the study workspace.
        </div>
      </CardContent>
    </div>
  );
}
