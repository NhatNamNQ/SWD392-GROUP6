import { DocumentDetailPage } from "@/features/knowledge-base/document-detail-page";
import { requireAuthSession } from "@/features/auth/server/require-session";

type PageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { documentId } = await params;
  await requireAuthSession(`/teacher/knowledge-base/${documentId}`);

  return <DocumentDetailPage documentId={documentId} />;
}
