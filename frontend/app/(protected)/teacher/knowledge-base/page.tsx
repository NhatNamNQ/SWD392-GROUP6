import { requireAuthSession } from "@/features/auth/server/require-session";
import { KnowledgeBasePage } from "@/features/knowledge-base/knowledge-base-page";

export default async function Page() {
  const session = await requireAuthSession("/teacher/knowledge-base", { role: "LECTURER" });

  return <KnowledgeBasePage user={session.user} />;
}
