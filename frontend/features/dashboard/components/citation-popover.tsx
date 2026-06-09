import { Badge } from "@/components/ui/badge";
import type { ChatCitation } from "@/features/dashboard/model/chat-types";

type CitationPopoverProps = {
  citation: ChatCitation;
  index: number;
  open: boolean;
  onToggle: (citationId: string) => void;
};

export function CitationPopover({ citation, index, open, onToggle }: CitationPopoverProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(citation.id)}
        className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700"
      >
        [{index + 1}] {citation.chapterTitle}
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-10 w-80 rounded-sm border-2 border-slate-700 bg-white p-3 text-xs font-bold text-slate-600 shadow-orbit">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="blue">{citation.documentTitle}</Badge>
            <Badge variant="mint">{citation.chapterTitle}</Badge>
          </div>
          <p className="mb-2 text-xs font-black text-slate-800">
            Page {citation.pageNumber ?? "n/a"}
          </p>
          <p>{citation.excerpt}</p>
        </div>
      ) : null}
    </div>
  );
}
