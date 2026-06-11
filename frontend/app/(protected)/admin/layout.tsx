import { requireAuthSession } from "@/features/auth/server/require-session";
import { AdminLayout } from "@/features/admin-governance/components/admin-layout";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuthSession("/admin", { role: "ADMIN" });

  return <AdminLayout user={session.user}>{children}</AdminLayout>;
}
