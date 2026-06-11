import { MailCheck, ShieldCheck, Sparkles } from "lucide-react";

import { AuthBenefits } from "@/features/auth/components/auth-benefits";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";

const benefits = [
  "Complete the two-step signup flow",
  "Finish activation before entering the workspace",
  "Keep account verification scoped to SWD392",
];

const items = [
  {
    icon: MailCheck,
    label: "Email confirmation",
    copy: "Use the OTP from your inbox to activate the account.",
  },
  {
    icon: ShieldCheck,
    label: "Protected sign-up",
    copy: "Registration is staged until the OTP is confirmed.",
  },
  {
    icon: Sparkles,
    label: "Ready for study",
    copy: "Once verified, you can sign in and access your course workspace.",
  },
];

export function VerifyOtpPage() {
  return (
    <AuthShell
      benefits={
        <AuthBenefits
          badge="SWD392 workspace"
          title="Verify your OrbitDocs account."
          description="A verification code has been sent to your email. Please enter it below to activate your account."
          items={items}
          benefits={benefits}
        />
      }
      form={<VerifyOtpForm />}
    />
  );
}
