"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  BookMarked,
  AlertCircle,
} from "lucide-react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { DocumentStatusBadge } from "@/features/knowledge-base/components/status-badge";
import { ChunkListPanel } from "@/features/knowledge-base/components/chunk-list-panel";
import { ChunkDetailPanel } from "@/features/knowledge-base/components/chunk-detail-panel";
import { PdfViewerPanel } from "@/features/knowledge-base/components/pdf-viewer-panel";
import {
  fetchDocument,
  fetchDocumentChapters,
  fetchDocumentChunks,
  getDocumentPdfUrl,
} from "@/features/knowledge-base/api/document-client";
import type {
  DocumentChapter,
  DocumentChunk,
  KnowledgeBaseError,
  KnowledgeDocument,
} from "@/features/knowledge-base/model/types";

const PAGE_SIZE = 20;

type TabOption = "chapters" | "chunks";

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as KnowledgeBaseError).message;
  }
  return "Unable to load data.";
}

function formatSize(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function DocumentDetailPage({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [chapters, setChapters] = useState<DocumentChapter[]>([]);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);
  const [chunkQuery, setChunkQuery] = useState("");
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [activeTab, setActiveTab] = useState<TabOption>("chapters");
  const [docError, setDocError] = useState<string | null>(null);
  const [chunkError, setChunkError] = useState<string | null>(null);

  // ─── Load document + chapters on mount ───────────────────────────
  useEffect(() => {
    let ignore = false;

    startTransition(async () => {
      try {
        setDocError(null);
        const [nextDocument, nextChapters] = await Promise.all([
          fetchDocument(documentId),
          fetchDocumentChapters(documentId),
        ]);

        if (!ignore) {
          setDocument(nextDocument);
          setChapters(nextChapters);
        }
      } catch (caught) {
        if (!ignore) setDocError(toMessage(caught));
      } finally {
        if (!ignore) setLoadingDoc(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [documentId]);

  // ─── Load chunks (paginated) ──────────────────────────────────────
  const loadChunks = useCallback(
    (page: number) => {
      setLoadingChunks(true);
      setChunkError(null);

      startTransition(async () => {
        try {
          const result = await fetchDocumentChunks(documentId, page, PAGE_SIZE);
          setChunks(result.content);
          setTotalPages(result.totalPages);
          setTotalElements(result.totalElements);
          setCurrentPage(result.number);
        } catch (caught) {
          console.error("Failed to load chunks:", caught);
          setChunkError(toMessage(caught));
        } finally {
          setLoadingChunks(false);
        }
      });
    },
    [documentId],
  );

  useEffect(() => {
    if (!loadingDoc && document?.status === "INDEXED") {
      startTransition(() => {
        loadChunks(0);
      });
    }
  }, [loadingDoc, document?.status, loadChunks]);

  // ─── Auto-select the first chunk when chunks list changes ────────
  useEffect(() => {
    if (chunks.length > 0 && !selectedChunk) {
      startTransition(() => {
        setSelectedChunk(chunks[0]);
      });
    }
  }, [chunks, selectedChunk]);

  // ─── Filter chunks client-side by query ──────────────────────────
  const filteredChunks = useMemo(() => {
    if (!chunkQuery.trim()) return chunks;
    const q = chunkQuery.trim().toLowerCase();
    return chunks.filter((c) => c.content.toLowerCase().includes(q));
  }, [chunks, chunkQuery]);

  // ─── PDF target page from selected chunk metadata ─────────────────
  const targetPage = useMemo<number | null>(() => {
    if (!selectedChunk) return null;
    const p = selectedChunk.metadata?.page ?? selectedChunk.metadata?.page_num ?? selectedChunk.metadata?.pageNum;
    return typeof p === "number" ? p : null;
  }, [selectedChunk]);

  const [pdfPageTrigger, setPdfPageTrigger] = useState<{ page: number; timestamp: number } | null>(null);

  const handleLocateInPdf = useCallback((page: number) => {
    setPdfPageTrigger({ page, timestamp: Date.now() });
  }, []);

  const pdfUrl = getDocumentPdfUrl(documentId);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col gap-0 overflow-hidden bg-background">
      {/* ── Top bar ── */}
      <div className="shrink-0 border-b border-border bg-card/65 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/teacher/knowledge-base"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex min-w-0 items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-primary" />
              <h1 className="truncate text-sm font-black text-foreground">
                {loadingDoc ? "Loading…" : (document?.originalFilename ?? "Document")}
              </h1>
              {document && <DocumentStatusBadge status={document.status} />}
            </div>
          </div>

          {document && (
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground">
              <span>{document.fileType}</span>
              <span>{formatSize(document.fileSizeBytes)}</span>
              <span>
                {document.chunkCount ?? 0}{" "}
                chunk{(document.chunkCount ?? 0) !== 1 ? "s" : ""}
              </span>
              {document.indexedAt && (
                <span>Indexed {new Date(document.indexedAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      {document && (
        <div className="shrink-0 border-b border-border bg-card/45 px-6 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("chapters")}
            className={[
              "border-b-2 px-4 py-2.5 text-xs font-black transition-all flex items-center gap-2",
              activeTab === "chapters"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <BookMarked className="h-3.5 w-3.5" />
            Chapters ({chapters.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chunks")}
            className={[
              "border-b-2 px-4 py-2.5 text-xs font-black transition-all flex items-center gap-2",
              activeTab === "chunks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <Layers className="h-3.5 w-3.5" />
            Chunks ({document.chunkCount ?? 0})
          </button>
        </div>
      )}

      {/* ── Document General Error ── */}
      {docError && (
        <div className="shrink-0 border-b border-destructive/20 bg-destructive/10 px-6 py-2 text-sm font-semibold text-destructive">
          {docError}
        </div>
      )}

      {/* ── Tab Content Panel ── */}
      <div className="flex-1 overflow-hidden">
        {loadingDoc ? (
          <div className="flex items-center gap-3 p-6 text-sm font-semibold text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            Loading document…
          </div>
        ) : (
          document && (
            <>
              {/* ── CHAPTERS TAB ── */}
              {activeTab === "chapters" && (
                <div className="h-full overflow-y-auto p-6">
                  <div className="mx-auto max-w-4xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-foreground">Document Chapters</h2>
                      <span className="text-xs font-bold text-muted-foreground">
                        {chapters.length} chapters identified
                      </span>
                    </div>

                    {chapters.length > 0 ? (
                      <div className="grid gap-3">
                        {chapters.map((chapter) => (
                          <div
                            key={chapter.id}
                            className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition duration-200"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                                {chapter.orderIndex}
                              </span>
                              <div className="space-y-1">
                                <p className="text-sm font-black text-foreground">
                                  {chapter.title}
                                </p>
                                <p className="text-xs font-semibold text-muted-foreground">
                                  {chapter.description || "No description available."}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                        <BookMarked className="mx-auto mb-3 h-10 w-10 text-muted-foreground/45" />
                        <p className="text-sm font-bold text-muted-foreground">No chapters available</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                          {document.status === "INDEXED"
                            ? "This document was indexed but no chapters were identified."
                            : "Chapters will appear once the document is successfully indexed."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── CHUNKS TAB ── */}
              {activeTab === "chunks" && (
                <div className="h-full relative">
                  {document.status === "INDEXED" ? (
                    <div className="flex h-full w-full gap-3 overflow-hidden p-4">
                      {/* Left: Chunk list (fixed width) */}
                      <div className="w-80 shrink-0 overflow-hidden">
                        <ChunkListPanel
                          chunks={filteredChunks}
                          selectedChunkId={selectedChunk?.id ?? null}
                          onSelectChunk={setSelectedChunk}
                          totalPages={totalPages}
                          currentPage={currentPage}
                          totalElements={totalElements}
                          onPageChange={loadChunks}
                          loading={loadingChunks}
                          query={chunkQuery}
                          onQueryChange={setChunkQuery}
                        />
                      </div>

                      {/* Center: Chunk detail (expandable, w-[40%]) */}
                      <div className="w-[40%] shrink-0 overflow-hidden">
                        <ChunkDetailPanel chunk={selectedChunk} onLocateInPdf={handleLocateInPdf} />
                      </div>

                      {/* Right: PDF Viewer (flexible, flex-1) */}
                      <div className="flex-1 overflow-hidden">
                        <PdfViewerPanel
                          pdfUrl={pdfUrl}
                          targetPage={targetPage}
                          pageTrigger={pdfPageTrigger}
                          filename={document.originalFilename}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Non-indexed or failed document state */
                    <div className="p-6">
                      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card/60 p-6 text-center backdrop-blur-sm">
                        {document.status === "FAILED" ? (
                          <>
                            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive/70" />
                            <h3 className="text-sm font-black text-foreground">Indexing Failed</h3>
                            <p className="mt-2 text-xs font-semibold text-muted-foreground">
                              {document.failureReason || "An error occurred during indexing. Chunks cannot be viewed."}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
                            <h3 className="text-sm font-black text-foreground">Indexing in Progress</h3>
                            <p className="mt-2 text-xs font-semibold text-muted-foreground">
                              Document status is currently {document.status}. Chunks will be loaded as soon as indexing is completed.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Chunk-specific loading error banner */}
                  {chunkError && (
                    <div className="absolute bottom-4 left-4 z-50 max-w-md rounded-lg border border-destructive/20 bg-destructive/95 px-4 py-3 text-xs font-black text-destructive-foreground shadow-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <div>
                        <p>Error loading chunks</p>
                        <p className="font-semibold opacity-85 mt-0.5">{chunkError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
