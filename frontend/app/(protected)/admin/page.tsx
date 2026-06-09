import { AdminHomePage } from "@/features/admin-governance/admin-home-page";
import { requireAuthSession } from "@/features/auth/server/require-session";

export default async function AdminRoute() {
  const session = await requireAuthSession("/admin", { role: "ADMIN" });

  return <AdminHomePage user={session.user} />;
}
