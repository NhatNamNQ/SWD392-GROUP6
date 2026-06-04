import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  return (
    <div className="space-y-6 bg-slate-50 p-6 md:p-8">
      <div className="space-y-2">
        <CardTitle className="text-3xl tracking-[-0.04em] text-slate-800">Register</CardTitle>
        <p className="text-sm font-semibold text-slate-600">Create a new account to get started.</p>
      </div>

      <CardContent className="space-y-6 rounded-md border border-slate-200 bg-white p-6 md:p-8">
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-700" htmlFor="name">
              Full name
            </label>
            <Input id="name" type="text" placeholder="Your name" autoComplete="name" />
          </div>

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
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </div>

          <Button type="button" size="lg" className="w-full gap-2">
            Create account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <Link href="/login" className="transition hover:text-slate-800">
            Already have an account?
          </Link>
          <Link href="/dashboard" className="transition hover:text-slate-800">
            Go to dashboard
          </Link>
        </div>
      </CardContent>
    </div>
  );
}
