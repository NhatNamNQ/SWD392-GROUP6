"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  confirmOtp,
  resendOtp,
  toAuthNotice,
  validateOtpPayload,
  type OtpType,
} from "@/features/auth/model/forms";

function normalizeOtpType(value: string | null): OtpType {
  return value === "FORGET_PASSWORD" ? "FORGET_PASSWORD" : "REGISTER";
}

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [pending, setPending] = useState(false);
  const { toast } = useToast();
  const otpType = normalizeOtpType(searchParams.get("type"));
  const isForgotPassword = otpType === "FORGET_PASSWORD";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateOtpPayload({ email, otp, type: otpType });

    if (validationError) {
      toast({ title: "Error", description: validationError, variant: "destructive" });
      return;
    }

    setPending(true);

    startTransition(async () => {
      try {
        const result = await confirmOtp({ email, otp, type: otpType });

        if (isForgotPassword) {
          if (
            typeof result.data !== "object" ||
            result.data === null ||
            !("resetToken" in result.data) ||
            typeof (result.data as { resetToken?: unknown }).resetToken !== "string"
          ) {
            throw new Error("Reset token missing from OTP confirmation response.");
          }

          router.replace(
            `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
              (result.data as { resetToken: string }).resetToken,
            )}`,
          );
          return;
        }

        router.replace(`/login?email=${encodeURIComponent(email)}&verified=1`);
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

  function handleResend() {
    if (!email.trim()) {
      toast({ title: "Error", description: "Email is required.", variant: "destructive" });
      return;
    }

    setResending(true);

    startTransition(async () => {
      try {
        const result = await resendOtp({ email, type: otpType });
        toast({
          title: "Success",
          description: `OTP sent to ${result.email}. It expires in ${Math.max(
            1,
            Math.ceil(result.expireIn / 60),
          )} minutes.`,
        });
      } catch (error) {
        const authNotice = toAuthNotice(error);
        toast({
          title: authNotice.tone === "error" ? "Error" : "Success",
          description: authNotice.message,
          variant: authNotice.tone === "error" ? "destructive" : "default",
        });
      } finally {
        setResending(false);
      }
    });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 p-6 sm:p-12">
      <div className="flex w-full flex-col space-y-2 text-center">
        <CardTitle className="text-4xl font-black tracking-tight text-slate-900">
          {isForgotPassword ? "Reset access" : "Verify Email"}
        </CardTitle>
        <p className="text-sm font-medium text-slate-500">
          {isForgotPassword
            ? "Enter the OTP sent to your email so you can reset your password."
            : "Enter the OTP sent to your school email."}
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="otp">
              One-Time Password
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="h-12 bg-white/50 transition-all focus:bg-white focus:ring-2 focus:ring-sky-500/20 tracking-widest text-center text-lg font-mono"
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
                Verifying...
              </div>
            ) : (
              <>
                Confirm code
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full h-12 gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={resending || pending}
            onClick={handleResend}
          >
            {resending ? "Resending..." : "Resend code"}
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
