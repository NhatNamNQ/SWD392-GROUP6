import { requireAuthSession } from "@/features/auth/server/require-session";
import { UsersPage } from "@/features/admin-governance/users-page";

export default async function Page() {
  await requireAuthSession("/admin/users", { role: "ADMIN" });

  return <UsersPage />;
}
