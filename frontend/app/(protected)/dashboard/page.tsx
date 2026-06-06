import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { requireAuthSession } from "@/features/auth/server/require-session";

export default async function DashboardRoute() {
  const session = await requireAuthSession("/dashboard");
  return <DashboardPage user={session.user} />;
}
