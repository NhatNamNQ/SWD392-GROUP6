import { PasswordForm } from "@/features/auth/components/password-form";

export function PasswordPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-border pb-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground">
          Account settings
        </p>
        <h1 className="text-4xl font-black tracking-[-0.05em] text-foreground">
          Change password
        </h1>
        <p className="text-base font-semibold text-muted-foreground">
          Update your login credentials to keep your account secure.
        </p>
      </div>
      <PasswordForm />
    </div>
  );
}
