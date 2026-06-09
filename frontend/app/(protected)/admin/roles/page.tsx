import { requireAuthSession } from "@/features/auth/server/require-session";
import { RolesPage } from "@/features/admin-governance/roles-page";

export default async function Page() {
  await requireAuthSession("/admin/roles");

  return <RolesPage />;
}
