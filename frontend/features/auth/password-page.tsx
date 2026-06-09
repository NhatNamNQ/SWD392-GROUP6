import { PasswordForm } from "@/features/auth/components/password-form";
import type { AuthUser } from "@/features/auth/model/contracts";

type PasswordPageProps = {
  user: AuthUser;
};

export function PasswordPage({ user }: PasswordPageProps) {
  return <PasswordForm user={user} />;
}
