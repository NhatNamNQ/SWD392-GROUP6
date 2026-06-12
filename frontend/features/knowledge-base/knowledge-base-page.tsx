"use client";

import Link from "next/link";
import { BookOpen, FileUp, RefreshCcw, Search, Trash2 } from "lucide-react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DocumentStatusBadge } from "@/features/knowledge-base/components/status-badge";
import {
  deleteDocument,
  fetchCourseDocuments,
  fetchKnowledgeCourses,
  uploadDocument,
} from "@/features/knowledge-base/api/document-client";
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
  const { toast } = useToast();

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
    if (!selectedCourseId) {
      return;
    }

    let ignore = false;

    startTransition(async () => {
      try {
        const nextDocuments = await fetchCourseDocuments(selectedCourseId);

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
  }, [selectedCourseId, toast]);

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

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesQuery = document.originalFilename.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "ALL" || document.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [documents, query, statusFilter]);

  async function refreshDocuments() {
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
  }

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
      await uploadDocument(resolvedCourseId, file);
      await refreshDocuments();
      toast({ title: "Success", description: "Document uploaded and indexing was triggered." });
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
      toast({ title: "Success", description: "Document deleted." });
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Teacher workspace
          </p>
          <h1 className="text-4xl font-black text-slate-800">Knowledge base</h1>
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
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Course
            <select
              className="h-11 rounded-sm border-2 border-slate-300 bg-white px-3 font-bold text-slate-700 shadow-chip"
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
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Search filename
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by title"
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Status
            <select
              className="h-11 rounded-sm border-2 border-slate-300 bg-white px-3 font-bold text-slate-700 shadow-chip"
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
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
            {ownedCourses.length
              ? "Upload only appears for courses assigned to your lecturer account."
              : "No assigned course is available yet. Ask an admin to assign a course before uploading."}
          </div>
          {loading ? (
            <p className="text-sm font-bold text-slate-500">Loading documents...</p>
          ) : resolvedCourseId && filteredDocuments.length ? (
            <div className="grid gap-3">
              {filteredDocuments.map((document) => (
                <article
                  key={document.id}
                  className="grid gap-3 rounded-md border-2 border-slate-200 bg-white p-4 shadow-chip md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      <Link
                        href={`/teacher/knowledge-base/${document.id}`}
                        className="text-sm font-black text-slate-800 hover:text-sky-700"
                      >
                        {document.originalFilename}
                      </Link>
                      <DocumentStatusBadge status={document.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                      <span>{formatSize(document.fileSizeBytes)}</span>
                      <span>{document.chunkCount ?? 0} chunks</span>
                      {document.status === "FAILED" ? (
                        <span>Failure reason unavailable.</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">{document.fileType}</Badge>
                    <Button type="button" variant="ghost" onClick={() => handleDelete(document.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : ownedCourses.length ? (
            <p className="text-sm font-bold text-slate-500">No documents match this view.</p>
          ) : (
            <p className="text-sm font-bold text-slate-500">
              No assigned course is available yet. Ask an admin to assign a course before uploading.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
