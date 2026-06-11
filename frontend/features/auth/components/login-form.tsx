"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { startTransition, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthNoticeBanner } from "@/features/auth/components/auth-notice";
import {
  FORCE_CHANGE_TEMP_TOKEN_KEY,
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
      : searchParams.get("reset") === "1"
        ? {
            tone: "success" as const,
            message: "Password reset successfully. Sign in with your new password.",
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
        const session = await loginWithPassword({ email, password });
        let next = searchParams.get("next");

        if (!next) {
          if (session.user.role === "ADMIN") {
            next = "/admin";
          } else if (session.user.role === "LECTURER") {
            next = "/teacher";
          } else {
            next = "/student";
          }
        }

        router.replace(next);
        router.refresh();
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "errorCode" in error &&
          (error as { errorCode?: string }).errorCode === "REQUIRE_PASSWORD_CHANGE" &&
          "tempToken" in error &&
          typeof (error as { tempToken?: unknown }).tempToken === "string"
        ) {
          window.sessionStorage.setItem(
            FORCE_CHANGE_TEMP_TOKEN_KEY,
            (error as { tempToken: string }).tempToken,
          );
          router.replace("/force-change-password");
          return;
        }

        setNotice(toAuthNotice(error));
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 p-6 sm:p-12">
      <div className="flex w-full flex-col space-y-2 text-center">
        <CardTitle className="text-4xl font-black tracking-tight text-slate-900">
          Welcome back
        </CardTitle>
        <p className="text-sm font-medium text-slate-500">
          Enter your credentials to access your workspace.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <AuthNoticeBanner notice={derivedNotice} />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@school.edu"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 bg-white/50 transition-all focus:bg-white focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-sky-600 transition-colors hover:text-sky-500"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 bg-white/50 transition-all focus:bg-white focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <button
            type="submit"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group mt-4 h-12 w-full gap-2 font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]",
              pending && "pointer-events-none opacity-70",
            )}
            disabled={pending}
          >
            {pending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Signing in...
              </div>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm font-medium text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-sky-600 transition-colors hover:text-sky-500"
          >
            Sign up
          </Link>
          <span className="mx-2 text-slate-300">|</span>
          <Link
            href="/verify-otp"
            className="font-semibold text-sky-600 transition-colors hover:text-sky-500"
          >
            Verify OTP
          </Link>
        </div>
      </div>
    </div>
  );
}
