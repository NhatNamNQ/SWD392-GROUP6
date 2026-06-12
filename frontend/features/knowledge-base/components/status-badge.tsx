import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/features/knowledge-base/model/types";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const variant = status === "INDEXED" ? "mint" : status === "PROCESSING" ? "blue" : "default";

  return <Badge variant={variant}>{status}</Badge>;
}
