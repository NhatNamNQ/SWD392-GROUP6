import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordRoute() {
  return <AuthShell benefits={null} form={<ForgotPasswordForm />} />;
}
