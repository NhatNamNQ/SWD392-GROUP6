"use client";

import Link from "next/link";
import { BookOpen, FileUp, RefreshCcw, Search, Trash2 } from "lucide-react";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DocumentStatusBadge } from "@/features/knowledge-base/components/status-badge";
import { DeleteConfirmModal } from "@/features/knowledge-base/components/delete-confirm-modal";
import {
  deleteDocument,
  fetchCourseDocuments,
  fetchKnowledgeCourses,
} from "@/features/knowledge-base/api/document-client";
import { useUploadProgress } from "@/features/knowledge-base/context/UploadProgressContext";
import type {
  CourseOption,
  DocumentStatus,
  KnowledgeDocument,
  KnowledgeBaseError,
} from "@/features/knowledge-base/model/types";
import type { AuthUser } from "@/features/auth/model/contracts";

const statusOptions: Array<"ALL" | DocumentStatus> = [
  "ALL",
  "UPLOADED",
  "PROCESSING",
  "INDEXED",
  "FAILED",
];

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes)) {
    return "Unknown size";
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as KnowledgeBaseError).message;
  }

  return "Unable to load knowledge base data.";
}

type KnowledgeBasePageProps = {
  user: AuthUser;
};

export function KnowledgeBasePage({ user }: KnowledgeBasePageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | DocumentStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { startUpload, uploads, clearUpload } = useUploadProgress();
  const { toast } = useToast();
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [deletingDocName, setDeletingDocName] = useState<string | null>(null);

  const ownedCourses = useMemo(
    () => courses.filter((course) => course.lecturerId === user.id),
    [courses, user.id],
  );
  const resolvedCourseId = useMemo(() => {
    if (!ownedCourses.length) {
      return "";
    }

    const currentSelection = ownedCourses.find((course) => course.id === selectedCourseId);
    return currentSelection?.id ?? ownedCourses[0].id;
  }, [ownedCourses, selectedCourseId]);

  useEffect(() => {
    let ignore = false;

    startTransition(async () => {
      try {
        const nextCourses = await fetchKnowledgeCourses();

        if (!ignore) {
          setCourses(nextCourses);
        }
      } catch (error) {
        if (!ignore) {
          toast({ title: "Error", description: toMessage(error), variant: "destructive" });
          setLoading(false);
        }
      }
    });

    return () => {
      ignore = true;
    };
  }, [user.id, toast]);

  useEffect(() => {
    if (!resolvedCourseId) {
      return;
    }

    let ignore = false;

    startTransition(async () => {
      try {
        const nextDocuments = await fetchCourseDocuments(resolvedCourseId);

        if (!ignore) {
          setDocuments(nextDocuments);
        }
      } catch (error) {
        if (!ignore) {
          toast({ title: "Error", description: toMessage(error), variant: "destructive" });
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
  }, [resolvedCourseId, toast]);

  const refreshDocuments = useCallback(async () => {
    if (!resolvedCourseId) {
      return;
    }

    setLoading(true);
    try {
      setDocuments(await fetchCourseDocuments(resolvedCourseId));
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [resolvedCourseId, toast]);

  const prevUploadsLength = useRef(uploads.length);
  const prevFinishedCount = useRef(uploads.filter(u => u.status === "SUCCESS" || u.status === "ERROR").length);

  useEffect(() => {
    const currentFinishedCount = uploads.filter(u => u.status === "SUCCESS" || u.status === "ERROR").length;
    if (uploads.length !== prevUploadsLength.current || currentFinishedCount !== prevFinishedCount.current) {
      prevUploadsLength.current = uploads.length;
      prevFinishedCount.current = currentFinishedCount;
      refreshDocuments();
    }
  }, [uploads, refreshDocuments]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesQuery = document.originalFilename.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "ALL" || document.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [documents, query, statusFilter]);

  function handleCourseChange(courseId: string) {
    setLoading(true);
    setSelectedCourseId(courseId);
  }

  async function handleUpload(fileList: FileList | null) {
    const file = fileList?.[0];

    if (!file || !resolvedCourseId) {
      return;
    }

    setUploading(true);
    try {
      await startUpload(resolvedCourseId, file);
      await refreshDocuments();
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(documentId: string) {
    try {
      await deleteDocument(documentId);
      setDocuments((current) => current.filter((document) => document.id !== documentId));
      toast({ title: "Thành công", description: "Tài liệu đã được xóa." });
    } catch (error) {
      toast({ title: "Lỗi", description: toMessage(error), variant: "destructive" });
    } finally {
      setDeletingDocId(null);
      setDeletingDocName(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground">
            Teacher workspace
          </p>
          <h1 className="text-4xl font-black text-foreground">Knowledge base</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={refreshDocuments} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept=".pdf"
            onChange={(event) => handleUpload(event.target.files)}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !resolvedCourseId || !ownedCourses.length}
          >
            <FileUp className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload PDF"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="grid gap-3 lg:grid-cols-[1fr_1fr_180px] lg:items-end">
          <label className="grid gap-2 text-sm font-semibold text-muted-foreground">
            Course
            <select
              className="h-11 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none"
              value={resolvedCourseId}
              onChange={(event) => handleCourseChange(event.target.value)}
              disabled={!ownedCourses.length}
            >
              {ownedCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-muted-foreground">
            Search filename
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by title"
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-muted-foreground">
            Status
            <select
              className="h-11 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3 text-sm font-semibold text-muted-foreground">
            {ownedCourses.length
              ? "Upload only appears for courses assigned to your lecturer account."
              : "No assigned course is available yet. Ask an admin to assign a course before uploading."}
          </div>
          {loading ? (
            <p className="text-sm font-semibold text-muted-foreground">Loading documents...</p>
          ) : resolvedCourseId && (filteredDocuments.length || uploads.some(u => u.status === "UPLOADING")) ? (
            <div className="grid gap-3">
              {/* Render active uploads that are not yet created in the DB (status === "UPLOADING") */}
              {uploads
                .filter((u) => u.status === "UPLOADING")
                .map((upload) => {
                  const displayProgress = Math.round(upload.uploadPercent * 0.3);
                  const uploadedMb = ((upload.fileSize * upload.uploadPercent) / (1024 * 1024 * 100)).toFixed(2);
                  const totalMb = (upload.fileSize / (1024 * 1024)).toFixed(2);
                  const statusText = `Đang tải tài liệu lên máy chủ... (${uploadedMb} MB / ${totalMb} MB)`;

                  return (
                    <article
                      key={upload.id}
                      className="grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm transition duration-200"
                    >
                      <div className="space-y-3 w-full">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="truncate text-foreground max-w-[80%]" title={upload.fileName}>
                            {upload.fileName}
                          </span>
                          <span className="text-primary">{displayProgress}%</span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${displayProgress}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-bold text-primary/80 animate-pulse">
                          {statusText}
                        </p>
                      </div>
                    </article>
                  );
                })}

              {/* Render the standard documents list */}
              {filteredDocuments.map((document) => {
                // Find if there is an active processing, success, or error background task for this document
                const activeUpload = uploads.find(
                  (u) => u.id === document.id || (u.fileName === document.originalFilename && u.status !== "UPLOADING")
                );

                if (activeUpload && (activeUpload.status === "PROCESSING" || activeUpload.status === "SUCCESS" || activeUpload.status === "ERROR")) {
                  let displayProgress = Math.round(activeUpload.processingProgress);
                  let statusText = "";

                  if (activeUpload.status === "PROCESSING") {
                    if (displayProgress < 55) {
                      statusText = "Đang phân tích cấu trúc & bóc tách nội dung PDF...";
                    } else if (displayProgress < 85) {
                      statusText = "Đang phân đoạn văn bản & Tạo vector nhúng (Embedding)...";
                    } else {
                      statusText = "Đang lưu trữ cơ sở dữ liệu vector và tối ưu hóa chỉ mục RAG...";
                    }
                  } else if (activeUpload.status === "SUCCESS") {
                    displayProgress = 100;
                    statusText = `Hoàn thành! Đã bóc tách thành công ${activeUpload.chunkCount ?? 0} phân đoạn.`;
                  } else {
                    displayProgress = Math.max(30, displayProgress);
                    statusText = activeUpload.errorMsg || "Đã xảy ra lỗi trong quá trình xử lý tài liệu.";
                  }

                  const isError = activeUpload.status === "ERROR";
                  const isSuccess = activeUpload.status === "SUCCESS";

                  return (
                    <article
                      key={document.id}
                      className={`grid gap-3 rounded-xl border p-4 shadow-sm transition duration-200 ${
                        isError
                          ? "border-destructive/20 bg-destructive/5"
                          : isSuccess
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-primary/20 bg-primary/5"
                      }`}
                    >
                      <div className="space-y-3 w-full">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="truncate text-foreground max-w-[80%]" title={document.originalFilename}>
                            {document.originalFilename}
                          </span>
                          <span
                            className={
                              isError
                                ? "text-destructive"
                                : isSuccess
                                  ? "text-emerald-500"
                                  : "text-primary"
                            }
                          >
                            {displayProgress}%
                          </span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isError
                                ? "bg-destructive"
                                : isSuccess
                                  ? "bg-emerald-500 animate-in fade-in duration-500"
                                  : "bg-primary"
                            }`}
                            style={{ width: `${displayProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p
                            className={`text-[11px] font-bold ${
                              isError
                                ? "text-destructive"
                                : isSuccess
                                  ? "text-emerald-500"
                                  : "text-primary/80 animate-pulse"
                            }`}
                          >
                            {statusText}
                          </p>
                          {isError && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-7 px-2.5 text-[11px] font-black text-destructive hover:bg-destructive/10"
                              onClick={() => clearUpload(activeUpload.id)}
                            >
                              Đóng
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }

                // If not actively uploading/processing in the background (or if it is SUCCESS which will render normally)
                return (
                  <article
                    key={document.id}
                    className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition duration-200 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <Link
                          href={`/teacher/knowledge-base/${document.id}`}
                          className="text-sm font-black text-foreground hover:text-primary hover:underline"
                        >
                          {document.originalFilename}
                        </Link>
                        <DocumentStatusBadge status={document.status} />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
                        <span>{formatSize(document.fileSizeBytes)}</span>
                        <span>{document.chunkCount ?? 0} chunks</span>
                        {document.status === "FAILED" ? (
                          <span className="text-destructive">
                            {document.failureReason || "Failure reason unavailable."}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">{document.fileType}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setDeletingDocId(document.id);
                          setDeletingDocName(document.originalFilename);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : ownedCourses.length ? (
            <p className="text-sm font-semibold text-muted-foreground">No documents match this view.</p>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">
              No assigned course is available yet. Ask an admin to assign a course before uploading.
            </p>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmModal
        isOpen={deletingDocId !== null}
        documentName={deletingDocName ?? ""}
        onClose={() => {
          setDeletingDocId(null);
          setDeletingDocName(null);
        }}
        onConfirm={() => {
          if (deletingDocId) {
            handleDelete(deletingDocId);
          }
        }}
      />
    </div>
  );
}
