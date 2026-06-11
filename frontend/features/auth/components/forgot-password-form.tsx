"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  forgotPassword,
  toAuthNotice,
  validateForgotPasswordPayload,
} from "@/features/auth/model/forms";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForgotPasswordPayload({ email });

    if (validationError) {
      toast({ title: "Error", description: validationError , variant: "destructive" });
      return;
    }

    setPending(true);

    startTransition(async () => {
      try {
        const result = await forgotPassword({ email });
        router.replace(`/verify-otp?email=${encodeURIComponent(result.email)}&type=FORGET_PASSWORD`);
      } catch (error) {
        const authNotice = toAuthNotice(error);
        toast({ title: authNotice.tone === "error" ? "Error" : "Success", description: authNotice.message, variant: authNotice.tone === "error" ? "destructive" : "default" });
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 p-6 sm:p-12">
      <div className="flex w-full flex-col space-y-2 text-center">
        <CardTitle className="text-4xl font-black tracking-tight text-slate-900">
          Forgot password
        </CardTitle>
        <p className="text-sm font-medium text-slate-500">
          We will send a one-time code to your email so you can reset access.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-6">

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@school.edu"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 bg-white/50 transition-all focus:bg-white focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 gap-2 mt-4 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            disabled={pending}
          >
            {pending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Sending code...
              </div>
            ) : (
              <>
                Send reset code
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm font-medium text-slate-500">
          <Link href="/login" className="text-sky-600 hover:text-sky-500 transition-colors font-semibold">
            Back to login
          </Link>
          <span className="mx-2 text-slate-300">|</span>
          <Link href="/register" className="text-sky-600 hover:text-sky-500 transition-colors font-semibold">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
