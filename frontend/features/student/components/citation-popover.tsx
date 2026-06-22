import { Badge } from "@/components/ui/badge";
import type { ChatCitation } from "@/features/student/model/chat-types";

type CitationPopoverProps = {
  uniqueId: string;
  citation: ChatCitation;
  index: number;
  open: boolean;
  onToggle: (citationId: string) => void;
};

export function CitationPopover({ uniqueId, citation, index, open, onToggle }: CitationPopoverProps) {
  const label = citation.chapterTitle ?? citation.documentName ?? `Source ${index + 1}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(uniqueId)}
        className="rounded-full border border-border bg-card px-3 py-1 text-xs font-extrabold text-muted-foreground hover:bg-muted hover:text-primary transition"
      >
        [{index + 1}] {label}
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-10 w-80 rounded-md border border-primary bg-card p-3 text-xs font-semibold text-muted-foreground shadow-lg">
          <div className="mb-2 flex flex-wrap gap-2">
            {citation.documentName ? <Badge variant="blue">{citation.documentName}</Badge> : null}
            {citation.chapterTitle ? <Badge variant="mint">{citation.chapterTitle}</Badge> : null}
            {citation.pageNum != null ? (
              <Badge variant="default">Page {citation.pageNum}</Badge>
            ) : null}
          </div>
          <p>{citation.excerpt}</p>
        </div>
      ) : null}
    </div>
  );
}
