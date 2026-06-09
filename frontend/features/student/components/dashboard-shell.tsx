import { StudentChatShell } from "@/features/student/components/student-chat-shell";
import type { AuthUser } from "@/features/auth/model/contracts";

type DashboardShellProps = {
  user: AuthUser;
};

export function DashboardShell({ user }: DashboardShellProps) {
  return <StudentChatShell user={user} />;
}
