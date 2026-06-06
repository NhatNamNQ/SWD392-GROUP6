 "use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { startTransition, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthNoticeBanner } from "@/features/auth/components/auth-notice";
import {
  loginWithPassword,
  toAuthNotice,
  validateLoginPayload,
  type AuthNotice,
} from "@/features/auth/model/forms";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const derivedNotice =
    notice ??
    (searchParams.get("verified") === "1"
      ? {
          tone: "success" as const,
          message: "Account verified. Sign in to continue.",
        }
      : null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateLoginPayload({ email, password });

    if (validationError) {
      setNotice({ tone: "error", message: validationError });
      return;
    }

    setPending(true);
    setNotice(null);

    startTransition(async () => {
      try {
        await loginWithPassword({ email, password });
        const next = searchParams.get("next") || "/dashboard";
        router.replace(next);
        router.refresh();
      } catch (error) {
        setNotice(toAuthNotice(error));
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <div className="space-y-6 bg-slate-50 p-6 md:p-8">
      <div className="space-y-2">
        <CardTitle className="text-3xl tracking-[-0.04em] text-slate-800">Login</CardTitle>
        <p className="text-sm font-semibold text-slate-600">
          Enter your account details to continue.
        </p>
      </div>

      <CardContent className="space-y-6 rounded-md border border-slate-200 bg-white p-6 md:p-8">
        <AuthNoticeBanner notice={derivedNotice} />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-700" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@school.edu"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}
            disabled={pending}
          >
            {pending ? "Signing in..." : "Sign in"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <span className="text-slate-500">
            Password reset email flow is not exposed by the backend yet.
          </span>
          <Link href="/settings/password" className="transition hover:text-slate-800">
            Change password
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <Link href="/verify-otp" className="transition hover:text-slate-800">
            Have an OTP code?
          </Link>
          <Link href="/register" className="transition hover:text-slate-800">
            Create an account
          </Link>
        </div>

        <div className="rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          New to OrbitDocs? Register first, confirm the OTP, then sign in to unlock the study workspace.
        </div>
      </CardContent>
    </div>
  );
}
