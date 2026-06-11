"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthNoticeBanner } from "@/features/auth/components/auth-notice";
import {
  resetPassword,
  toAuthNotice,
  validateResetPasswordPayload,
  type AuthNotice,
} from "@/features/auth/model/forms";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resetToken = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateResetPasswordPayload({ resetToken, newPassword });

    if (validationError) {
      setNotice({ tone: "error", message: validationError });
      return;
    }

    setPending(true);
    setNotice(null);

    startTransition(async () => {
      try {
        await resetPassword({ resetToken, newPassword });
        router.replace(`/login?email=${encodeURIComponent(email)}&reset=1`);
      } catch (error) {
        setNotice(toAuthNotice(error));
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
              Account recovery
            </p>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-800">
              Reset your password
            </h1>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-sm border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-chip transition hover:border-slate-400"
          >
            Back to login
          </Link>
        </div>

        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                <KeyRound className="h-5 w-5" />
                Choose a new password
              </CardTitle>
              <p className="text-sm font-semibold text-slate-600">
                {email ? `Recovery code sent to ${email}.` : "Enter the recovery code from your email."}
              </p>
            </div>

            <AuthNoticeBanner notice={notice} />

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-extrabold text-slate-700" htmlFor="new-password">
                  New password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" size="lg" className="gap-2" disabled={pending}>
                {pending ? "Saving..." : "Reset password"}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
