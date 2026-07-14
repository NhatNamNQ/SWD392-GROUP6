"use client";

import { useState } from "react";
import { FileText, ExternalLink, AlertCircle } from "lucide-react";

type PdfViewerPanelProps = {
  /** URL to stream the PDF (e.g. /api/teacher/documents/{id}/file) */
  pdfUrl: string;
  /** When set, the viewer will scroll/navigate to this page (1-based) */
  targetPage: number | null;
  /** Optional trigger to force scroll update even if the page number did not change */
  pageTrigger?: { page: number; timestamp: number } | null;
  /** Original filename for display */
  filename: string;
};

export function PdfViewerPanel({ pdfUrl, targetPage, pageTrigger, filename }: PdfViewerPanelProps) {
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-black text-foreground" title={filename}>
            {filename}
          </p>
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>
      </div>

      {/* PDF iframe */}
      <div className="relative flex-1 bg-muted/20">
        {!loaded && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-xs font-semibold text-muted-foreground">Loading PDF…</p>
          </div>
        )}
        {loadError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive/60" />
            <p className="text-sm font-bold text-destructive">Could not load PDF</p>
            <p className="text-xs text-muted-foreground">
              The file may not be available yet. Try re-indexing or check that the file exists.
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary/40"
            >
              Try opening directly
            </a>
          </div>
        ) : (
          <iframe
            key={pageTrigger?.timestamp ?? "initial"}
            src={
              pageTrigger
                ? `${pdfUrl}#page=${pageTrigger.page}`
                : `${pdfUrl}#page=${targetPage ?? 1}`
            }
            title={filename}
            className="h-full w-full border-0 transition-opacity duration-300"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
            onError={() => setLoadError(true)}
          />
        )}
      </div>
    </div>
  );
}
