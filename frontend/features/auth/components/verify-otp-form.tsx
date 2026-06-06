"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthNoticeBanner } from "@/features/auth/components/auth-notice";
import { confirmOtp, toAuthNotice, validateOtpPayload, type AuthNotice } from "@/features/auth/model/forms";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateOtpPayload({ email, otp });

    if (validationError) {
      setNotice({ tone: "error", message: validationError });
      return;
    }

    setPending(true);
    setNotice(null);

    startTransition(async () => {
      try {
        const result = await confirmOtp({ email, otp });
        router.replace(`/login?email=${encodeURIComponent(result.email)}&verified=1`);
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
        <CardTitle className="text-3xl tracking-[-0.04em] text-slate-800">Verify OTP</CardTitle>
        <p className="text-sm font-semibold text-slate-600">
          Confirm the 6-digit code sent to your email to finish registration.
        </p>
      </div>

      <CardContent className="space-y-6 rounded-md border border-slate-200 bg-white p-6 md:p-8">
        <AuthNoticeBanner notice={notice} />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-700" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@school.edu"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-700" htmlFor="otp">
              OTP code
            </label>
            <Input
              id="otp"
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="123456"
              autoComplete="one-time-code"
              maxLength={6}
            />
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={pending}>
            {pending ? "Verifying..." : "Verify code"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <Link href="/register" className="transition hover:text-slate-800">
            Back to register
          </Link>
          <Link href="/login" className="transition hover:text-slate-800">
            Already verified?
          </Link>
        </div>
      </CardContent>
    </div>
  );
}
