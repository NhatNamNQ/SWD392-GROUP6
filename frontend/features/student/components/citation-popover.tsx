import { Badge } from "@/components/ui/badge";
import type { ChatCitation } from "@/features/student/model/chat-types";

type CitationPopoverProps = {
  citation: ChatCitation;
  index: number;
  open: boolean;
  onToggle: (citationId: string) => void;
};

export function CitationPopover({ citation, index, open, onToggle }: CitationPopoverProps) {
  const label = citation.chapterTitle ?? citation.documentName ?? `Source ${index + 1}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(citation.id)}
        className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700"
      >
        [{index + 1}] {label}
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-10 w-80 rounded-sm border-2 border-slate-700 bg-white p-3 text-xs font-bold text-slate-600 shadow-orbit">
          <div className="mb-2 flex flex-wrap gap-2">
            {citation.documentName ? <Badge variant="blue">{citation.documentName}</Badge> : null}
            {citation.chapterTitle ? <Badge variant="mint">{citation.chapterTitle}</Badge> : null}
            {citation.pageNum != null ? <Badge variant="default">Page {citation.pageNum}</Badge> : null}
          </div>
          {citation.similarityScore != null ? (
            <p className="mb-2 text-xs font-black text-slate-800">
              Similarity score: {citation.similarityScore.toFixed(2)}
            </p>
          ) : null}
          <p>{citation.excerpt}</p>
        </div>
      ) : null}
    </div>
  );
}
