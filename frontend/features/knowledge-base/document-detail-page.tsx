"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { startTransition, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentStatusBadge } from "@/features/knowledge-base/components/status-badge";
import {
  fetchDocument,
  fetchDocumentChapters,
} from "@/features/knowledge-base/api/document-client";
import type {
  DocumentChapter,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    startTransition(async () => {
      try {
        const [nextDocument, nextChapters] = await Promise.all([
          fetchDocument(documentId),
          fetchDocumentChapters(documentId),
        ]);

        if (!ignore) {
          setDocument(nextDocument);
          setChapters(nextChapters);
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
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>{document.originalFilename}</CardTitle>
              <DocumentStatusBadge status={document.status} />
            </div>
            {document.status === "FAILED" ? (
              <p className="text-sm font-semibold text-destructive">Failure reason unavailable.</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm font-bold text-muted-foreground sm:grid-cols-3">
              <span>Type: {document.fileType}</span>
              <span>Chunks: {document.chunkCount ?? 0}</span>
              <span>Indexed: {document.indexedAt ?? "Not indexed yet"}</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-black text-foreground">Chapters</h2>
              {chapters.length ? (
                <div className="grid gap-2">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="rounded-xl border border-border bg-secondary/40 p-3"
                    >
                      <p className="text-sm font-black text-foreground">
                        {chapter.orderIndex}. {chapter.title}
                      </p>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {chapter.description || "No description available."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground">No chapters returned yet.</p>
              )}
            </div>
            <Button type="button" variant="secondary" disabled>
              Reindex unavailable
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
