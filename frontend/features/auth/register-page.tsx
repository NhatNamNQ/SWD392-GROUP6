import { BadgeCheck, BookOpen, Sparkles } from "lucide-react";

import { AuthBenefits } from "@/features/auth/components/auth-benefits";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

const benefits = [
  "Save your study history",
  "Keep course documents organized",
  "Return to cited answers later",
];

const items = [
  {
    icon: BookOpen,
    label: "Study history",
    copy: "Pick up where you left off on any course topic.",
  },
  {
    icon: BadgeCheck,
    label: "Verified access",
    copy: "Keep the workspace tied to your school account.",
  },
  {
    icon: Sparkles,
    label: "Citations ready",
    copy: "Answers stay linked to the source materials.",
  },
];

export function RegisterPage() {
  return (
    <AuthShell
      benefits={
        <AuthBenefits
          badge="SWD392 workspace"
          title="Create your OrbitDocs account."
          description="Register once and keep your SWD392 chats, study materials, and source-backed answers in one workspace."
          items={items}
          benefits={benefits}
        />
      }
      form={<RegisterForm />}
    />
  );
}
