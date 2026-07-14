"use client";

import { useState } from "react";
import { Copy, Check, Hash, Clock, Layers, Eye } from "lucide-react";
import type { DocumentChunk } from "@/features/knowledge-base/model/types";

type ChunkDetailPanelProps = {
  chunk: DocumentChunk | null;
  onLocateInPdf?: (page: number) => void;
};

export function ChunkDetailPanel({ chunk, onLocateInPdf }: ChunkDetailPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!chunk) return;
    await navigator.clipboard.writeText(chunk.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!chunk) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <Layers className="mb-3 h-10 w-10 text-muted-foreground/45" />
        <p className="text-sm font-bold text-muted-foreground">Select a chunk to view its content</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Click any chunk in the list on the left
        </p>
      </div>
    );
  }

  const metadataEntries = Object.entries(chunk.metadata ?? {});
  const rawPage = chunk.metadata?.page ?? chunk.metadata?.page_num ?? chunk.metadata?.pageNum;
  const page = typeof rawPage === "number" ? rawPage : null;

  function formatMetadataKey(key: string): string {
    switch (key.toLowerCase()) {
      case "page_num":
      case "page":
      case "pagenum":
        return "Số trang";
      case "chapter_title":
      case "chaptertitle":
        return "Tên chương";
      case "document_id":
      case "documentid":
        return "Mã tài liệu";
      default:
        return key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-[11px] font-black text-primary-foreground">
            <Hash className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-black text-foreground">Chunk {chunk.chunkIndex + 1}</h2>
        </div>
        <div className="flex gap-1.5">
          {page != null && (
            <button
              type="button"
              onClick={() => onLocateInPdf?.(page)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              title="Locate in PDF"
            >
              <Eye className="h-3.5 w-3.5" />
              Đối chiếu
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Index
            </p>
            <p className="text-sm font-black text-foreground">{chunk.chunkIndex}</p>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Tokens
            </p>
            <p className="text-sm font-black text-foreground">{chunk.tokenCount ?? "—"}</p>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Chars
            </p>
            <p className="text-sm font-black text-foreground">{chunk.content.length}</p>
          </div>
        </div>

        {/* Content block */}
        <div className="p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Content
          </p>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
              {chunk.content}
            </pre>
          </div>
        </div>

        {/* Metadata */}
        {metadataEntries.length > 0 && (
          <div className="px-4 pb-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Metadata
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-border">
                  {metadataEntries.map(([key, value]) => (
                    <tr key={key} className="bg-card/40 transition hover:bg-muted/35">
                      <td className="w-36 px-3 py-2 font-black text-muted-foreground/80">
                        {formatMetadataKey(key)}
                      </td>
                      <td className="px-3 py-2 font-bold text-foreground">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Created at */}
        <div className="flex items-center gap-1.5 border-t border-border px-4 py-2.5">
          <Clock className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-[11px] font-semibold text-muted-foreground/60">
            Created {new Date(chunk.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
