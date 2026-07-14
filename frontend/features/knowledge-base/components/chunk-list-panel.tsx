"use client";

import { Search, Hash, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import type { DocumentChunk } from "@/features/knowledge-base/model/types";

type ChunkListPanelProps = {
  chunks: DocumentChunk[];
  selectedChunkId: string | null;
  onSelectChunk: (chunk: DocumentChunk) => void;
  totalPages: number;
  currentPage: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  query: string;
  onQueryChange: (q: string) => void;
};

export function ChunkListPanel({
  chunks,
  selectedChunkId,
  onSelectChunk,
  totalPages,
  currentPage,
  totalElements,
  onPageChange,
  loading,
  query,
  onQueryChange,
}: ChunkListPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <FileText className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-black text-foreground">
          Chunks
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {totalElements}
          </span>
        </h2>
      </div>

      {/* Search */}
      <div className="border-b border-border px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Filter chunks…"
            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
          />
        </div>
      </div>

      {/* Chunk list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-muted/50"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : chunks.length === 0 ? (
          <p className="p-4 text-center text-xs font-semibold text-muted-foreground">
            No chunks found.
          </p>
        ) : (
          <ul className="space-y-1 p-2">
            {chunks.map((chunk) => {
              const isSelected = chunk.id === selectedChunkId;
              const preview = chunk.content.slice(0, 90).trim();

              return (
                <li key={chunk.id}>
                  <button
                    type="button"
                    onClick={() => onSelectChunk(chunk)}
                    className={[
                      "group w-full rounded-xl border p-3 text-left transition-all duration-200",
                      isSelected
                        ? "border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm"
                        : "border-transparent hover:border-border hover:bg-muted/50",
                    ].join(" ")}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                        ].join(" ")}
                      >
                        <Hash className="h-3 w-3" />
                      </span>
                      <span
                        className={[
                          "text-xs font-black",
                          isSelected ? "text-primary" : "text-foreground",
                        ].join(" ")}
                      >
                        Chunk {chunk.chunkIndex + 1}
                      </span>
                      <div className="ml-auto flex gap-1">
                        {chunk.tokenCount != null && (
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {chunk.tokenCount}t
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {preview}
                      {chunk.content.length > 90 ? "…" : ""}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
