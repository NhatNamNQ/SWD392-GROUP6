"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, Search, Copy, Check, Hash } from "lucide-react";
import { startTransition, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DocumentStatusBadge } from "@/features/knowledge-base/components/status-badge";
import {
  fetchDocument,
  fetchDocumentChapters,
  fetchDocumentChunks,
} from "@/features/knowledge-base/api/document-client";
import type {
  DocumentChapter,
  DocumentChunk,
  KnowledgeDocument,
  KnowledgeBaseError,
} from "@/features/knowledge-base/model/types";

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as KnowledgeBaseError).message;
  }

  return "Unable to load document detail.";
}

export function DocumentDetailPage({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [chapters, setChapters] = useState<DocumentChapter[]>([]);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChunks, setExpandedChunks] = useState<Record<string, boolean>>({});
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    startTransition(async () => {
      try {
        const [nextDocument, nextChapters, nextChunks] = await Promise.all([
          fetchDocument(documentId),
          fetchDocumentChapters(documentId),
          fetchDocumentChunks(documentId),
        ]);

        if (!ignore) {
          setDocument(nextDocument);
          setChapters(nextChapters);
          setChunks(nextChunks);
        }
      } catch (caught) {
        if (!ignore) {
          setError(toMessage(caught));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    });

    return () => {
      ignore = true;
    };
  }, [documentId]);

  const toggleExpand = (id: string) => {
    setExpandedChunks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(id);
    setTimeout(() => {
      setCopiedChunkId(null);
    }, 2000);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-amber-100 dark:bg-amber-900/40 text-foreground rounded-sm px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const getPageNumber = (metadata: Record<string, unknown>): number | null => {
    if (!metadata) return null;
    const pageVal = metadata.page_num ?? metadata.page ?? metadata.page_number ?? metadata.pageIndex ?? metadata.pageNum;
    if (pageVal !== undefined && pageVal !== null) {
      const num = Number(pageVal);
      return isNaN(num) ? null : num;
    }
    return null;
  };

  const filteredChunks = chunks.filter((chunk) => {
    const query = searchQuery.toLowerCase();
    return (
      chunk.content.toLowerCase().includes(query) ||
      (chunk.metadata && JSON.stringify(chunk.metadata).toLowerCase().includes(query))
    );
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-6 md:p-8 animate-in fade-in duration-500">
      <Link
        href="/teacher/knowledge-base"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to knowledge base
      </Link>

      {loading ? <p className="text-sm font-semibold text-muted-foreground">Loading document...</p> : null}
      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      {document ? (
        <Card className="border border-border/60 shadow-lg">
          <CardHeader className="space-y-3 pb-6 border-b border-border/40 bg-muted/10">
            <div className="flex flex-wrap items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-black tracking-tight">{document.originalFilename}</CardTitle>
              <DocumentStatusBadge status={document.status} />
            </div>
            {document.status === "FAILED" ? (
              <p className="text-sm font-semibold text-destructive">Failure reason unavailable.</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 text-sm font-semibold text-muted-foreground sm:grid-cols-3 border-b border-border/40 pb-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-bold">Type</span>
                <span className="text-foreground font-black text-base">{document.fileType}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-bold">Chunks</span>
                <span className="text-foreground font-black text-base">{document.chunkCount ?? chunks.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-bold">Indexed At</span>
                <span className="text-foreground font-black text-base">
                  {document.indexedAt ? new Date(document.indexedAt).toLocaleString() : "Not indexed yet"}
                </span>
              </div>
            </div>

            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
                <TabsTrigger value="chapters" className="flex items-center gap-2 justify-center py-2.5">
                  <BookOpen className="h-4 w-4" />
                  <span>Chapters ({chapters.length})</span>
                </TabsTrigger>
                <TabsTrigger value="chunks" className="flex items-center gap-2 justify-center py-2.5">
                  <FileText className="h-4 w-4" />
                  <span>Chunks ({chunks.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chapters" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-foreground">Document Chapters</h2>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {chapters.length} structural chapters
                    </span>
                  </div>
                  {chapters.length ? (
                    <div className="grid gap-3">
                      {chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="rounded-xl border border-border bg-secondary/20 p-4 transition-all hover:bg-secondary/30 hover:border-border/80"
                        >
                          <p className="text-base font-black text-foreground">
                            {chapter.orderIndex}. {chapter.title}
                          </p>
                          <p className="mt-1 text-sm font-medium text-muted-foreground leading-relaxed">
                            {chapter.description || "No description available."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/5">
                      <p className="text-sm font-semibold text-muted-foreground">No chapters returned yet.</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Chapters will appear here once the document indexing processes structural chapters.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chunks" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h2 className="text-lg font-black text-foreground">Document Chunks</h2>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Text segmentation parsed by Python RAG service for semantic vector indexing.
                      </p>
                    </div>
                    
                    {chunks.length > 0 && (
                      <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                          placeholder="Search chunks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-9 text-sm focus-visible:ring-primary/20 border-border/80"
                        />
                      </div>
                    )}
                  </div>

                  {chunks.length ? (
                    <>
                      <div className="text-xs font-bold text-muted-foreground px-1">
                        {searchQuery ? (
                          <span>Found {filteredChunks.length} matching chunks (out of {chunks.length})</span>
                        ) : (
                          <span>Showing all {chunks.length} chunks</span>
                        )}
                      </div>

                      <div className="grid gap-3">
                        {filteredChunks.map((chunk) => {
                          const pageNum = getPageNumber(chunk.metadata);
                          const isExpanded = expandedChunks[chunk.id] || false;
                          const needsTruncation = chunk.content.length > 300;
                          const showContent = isExpanded ? chunk.content : (needsTruncation ? chunk.content.substring(0, 300) + "..." : chunk.content);

                          return (
                            <div
                              key={chunk.id}
                              className="rounded-xl border border-border bg-card p-5 transition-all shadow-sm hover:shadow-md border-border/60 flex flex-col justify-between"
                            >
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                                  <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-primary/80" />
                                    <span className="font-extrabold text-sm text-foreground">
                                      Chunk Index {chunk.chunkIndex + 1}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {pageNum !== null && (
                                      <Badge variant="blue" className="text-[10px] font-black">
                                        Page {pageNum}
                                      </Badge>
                                    )}
                                    {chunk.tokenCount !== null && (
                                      <Badge variant="default" className="text-[10px] font-black">
                                        {chunk.tokenCount} Tokens
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono bg-muted/10 p-3.5 rounded-lg border border-border/30">
                                  {highlightText(showContent, searchQuery)}
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                                {needsTruncation ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpand(chunk.id)}
                                    className="text-xs font-bold text-primary hover:text-primary/80 px-2 h-8"
                                  >
                                    {isExpanded ? "Show Less" : "Read More"}
                                  </Button>
                                ) : (
                                  <div />
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(chunk.id, chunk.content)}
                                  className="text-xs font-bold gap-1.5 text-muted-foreground hover:text-foreground px-2 h-8"
                                >
                                  {copiedChunkId === chunk.id ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                                      <span className="text-emerald-500 font-extrabold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                        {filteredChunks.length === 0 && (
                          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/5">
                            <p className="text-sm font-semibold text-muted-foreground">No chunks match your search query.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Try typing a different keyword or part of the text.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/5">
                      <p className="text-sm font-semibold text-muted-foreground">No chunks returned yet.</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Chunks will appear here once the document indexing processes text segments.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4 border-t border-border/40">
              <Button type="button" variant="secondary" disabled>
                Reindex unavailable
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

