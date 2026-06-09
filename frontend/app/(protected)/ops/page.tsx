import { requireAuthSession } from "@/features/auth/server/require-session";
import { OpsPage } from "@/features/ops-visibility/ops-page";

export default async function Page() {
  await requireAuthSession("/ops");

  return <OpsPage />;
}
