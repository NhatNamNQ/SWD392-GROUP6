 "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthNoticeBanner } from "@/features/auth/components/auth-notice";
import {
  registerAccount,
  toAuthNotice,
  validateRegisterPayload,
  type AuthNotice,
} from "@/features/auth/model/forms";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateRegisterPayload({ fullName, email, password });

    if (validationError) {
      setNotice({ tone: "error", message: validationError });
      return;
    }

    setPending(true);
    setNotice(null);

    startTransition(async () => {
      try {
        const result = await registerAccount({ fullName, email, password });
        router.replace(`/verify-otp?email=${encodeURIComponent(result.email)}`);
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
        <CardTitle className="text-3xl tracking-[-0.04em] text-slate-800">Register</CardTitle>
        <p className="text-sm font-semibold text-slate-600">Create a new account to get started.</p>
      </div>

      <CardContent className="space-y-6 rounded-md border border-slate-200 bg-white p-6 md:p-8">
        <AuthNoticeBanner notice={notice} />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-700" htmlFor="name">
              Full name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

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
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <Link href="/login" className="transition hover:text-slate-800">
            Already have an account?
          </Link>
          <Link href="/verify-otp" className="transition hover:text-slate-800">
            Verify OTP
          </Link>
        </div>
      </CardContent>
    </div>
  );
}
