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
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-10 w-80 rounded-2xl border border-primary/20 bg-card p-4 text-xs font-semibold text-muted-foreground shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
          <div className="mb-3 flex flex-col gap-1.5 border-b border-border pb-2.5 text-[11px] font-bold text-foreground">
            {citation.documentName && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60 font-semibold">Tài liệu:</span>
                <span className="truncate max-w-[200px] font-black" title={citation.documentName}>
                  {citation.documentName}
                </span>
              </div>
            )}
            {citation.chapterTitle && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60 font-semibold">Chương:</span>
                <span className="truncate max-w-[200px] font-black" title={citation.chapterTitle}>
                  {citation.chapterTitle}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {citation.pageNum != null && (
                <Badge variant="default" className="text-[10px] font-black py-0.5 px-2">
                  Trang {citation.pageNum}
                </Badge>
              )}
              {citation.chunkIndex != null && (
                <Badge variant="mint" className="text-[10px] font-black py-0.5 px-2">
                  Chunk #{citation.chunkIndex}
                </Badge>
              )}
            </div>
          </div>
          <p className="leading-relaxed text-[11px] font-semibold">{citation.excerpt}</p>
        </div>
      ) : null}
    </div>
  );
}
