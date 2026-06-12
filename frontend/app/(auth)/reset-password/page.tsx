import { Suspense } from "react";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordRoute() {
  return (
    <AuthShell
      benefits={null}
      form={
        <Suspense fallback={<div className="h-40" />}>
          <ResetPasswordForm />
        </Suspense>
      }
    />
  );
}
