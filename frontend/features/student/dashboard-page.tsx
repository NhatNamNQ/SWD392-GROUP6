import { DashboardShell } from "@/features/student/components/dashboard-shell";
import type { AuthUser } from "@/features/auth/model/contracts";

type DashboardPageProps = {
  user: AuthUser;
};

export function DashboardPage({ user }: DashboardPageProps) {
  return <DashboardShell user={user} />;
}
