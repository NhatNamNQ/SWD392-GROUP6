import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";

import { AuthBenefits } from "@/features/auth/components/auth-benefits";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

const benefits = [
  "Access your SWD392 study sessions",
  "Keep document-based answers in one place",
  "Resume chats with cited sources",
];

const items = [
  {
    icon: BookOpen,
    label: "Study first",
    copy: "Keep lecture notes and chats in one flow.",
  },
  {
    icon: ShieldCheck,
    label: "Protected access",
    copy: "Use your school account to stay scoped to SWD392.",
  },
  {
    icon: Sparkles,
    label: "Cited answers",
    copy: "Review responses with linked source snippets.",
  },
];

export function LoginPage() {
  return (
    <AuthShell
      benefits={
        <AuthBenefits
          badge="SWD392 workspace"
          title="Sign in to OrbitDocs."
          description="Use the same workspace for student chat, study materials, and cited answers from your course documents."
          items={items}
          benefits={benefits}
        />
      }
      form={<LoginForm />}
    />
  );
}
