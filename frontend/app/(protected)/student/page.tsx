import { DashboardPage } from "@/features/student/dashboard-page";
import { requireAuthSession } from "@/features/auth/server/require-session";

export default async function StudentRoute() {
  const session = await requireAuthSession("/student");
  return <DashboardPage user={session.user} />;
}
