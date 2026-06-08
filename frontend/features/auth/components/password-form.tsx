"use client";

import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import Link from "next/link";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthNoticeBanner } from "@/features/auth/components/auth-notice";
import {
  changePassword,
  toAuthNotice,
  validateChangePasswordPayload,
  type AuthNotice,
} from "@/features/auth/model/forms";

export function PasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateChangePasswordPayload({ oldPassword, newPassword });

    if (validationError) {
      setNotice({ tone: "error", message: validationError });
      return;
    }

    setPending(true);
    setNotice(null);

    startTransition(async () => {
      try {
        const result = await changePassword({ oldPassword, newPassword });
        setNotice({ tone: "success", message: result.message });
        setOldPassword("");
        setNewPassword("");
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
              Protected settings
            </p>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-800">
              Update your password
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-sm border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-chip transition hover:border-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                <KeyRound className="h-5 w-5" />
                Password settings
              </CardTitle>
              <p className="text-sm font-semibold text-slate-600">
                This flow uses the Java backend `PATCH /api/users/change-password` contract through
                the frontend BFF session.
              </p>
            </div>

            <AuthNoticeBanner notice={notice} />

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-extrabold text-slate-700" htmlFor="current-password">
                  Current password
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </div>

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
                {pending ? "Saving..." : "Save password"}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
