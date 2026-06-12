"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  resetPassword,
  toAuthNotice,
  validateResetPasswordPayload,
} from "@/features/auth/model/forms";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resetToken = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateResetPasswordPayload({ resetToken, newPassword });

    if (validationError) {
      toast({ title: "Error", description: validationError, variant: "destructive" });
      return;
    }

    setPending(true);

    startTransition(async () => {
      try {
        await resetPassword({ resetToken, newPassword });
        router.replace(`/login?email=${encodeURIComponent(email)}&reset=1`);
      } catch (error) {
        const authNotice = toAuthNotice(error);
        toast({
          title: authNotice.tone === "error" ? "Error" : "Success",
          description: authNotice.message,
          variant: authNotice.tone === "error" ? "destructive" : "default",
        });
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 p-6 sm:p-12">
      <div className="flex w-full flex-col space-y-2 text-center">
        <CardTitle className="text-4xl font-black tracking-tight text-slate-900">
          Reset password
        </CardTitle>
        <p className="text-sm font-medium text-slate-500">
          {email
            ? `Recovery code sent to ${email}.`
            : "Enter the recovery code from your email."}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="new-password">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className="h-12 bg-white/50 transition-all focus:bg-white focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <Button type="submit" className="w-full h-12 gap-2 mt-4 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm" disabled={pending}>
            {pending ? "Saving..." : "Reset password"}
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </form>

        <div className="text-center text-sm font-medium text-slate-500">
          <Link
            href="/login"
            className="text-sky-600 hover:text-sky-500 transition-colors font-semibold"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
