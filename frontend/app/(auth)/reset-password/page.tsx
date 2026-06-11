import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
