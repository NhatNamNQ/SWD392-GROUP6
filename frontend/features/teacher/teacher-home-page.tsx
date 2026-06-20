"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookCopy,
  BookOpen,
  FileUp,
  Files,
  Loader2,
  MessageSquareText,
  RefreshCcw,
} from "lucide-react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/features/auth/model/contracts";
import { fetchCourses } from "@/features/course-management/api/course-client";
import type { CourseRecord } from "@/features/course-management/model/types";
import { fetchCourseDocuments } from "@/features/knowledge-base/api/document-client";
import { DocumentStatusBadge } from "@/features/knowledge-base/components/status-badge";
import type { KnowledgeBaseError, KnowledgeDocument } from "@/features/knowledge-base/model/types";
import {
  buildTeacherDashboardData,
  type TeacherDashboardData,
} from "@/features/teacher/teacher-dashboard-data";

type TeacherHomePageProps = {
  user: AuthUser;
};

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as KnowledgeBaseError).message;
  }

  return "Unable to load lecturer workspace data.";
}

export function TeacherHomePage({ user }: TeacherHomePageProps) {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [documentsByCourse, setDocumentsByCourse] = useState<Record<string, KnowledgeDocument[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allCourses = await fetchCourses();
      const ownedCourses = allCourses.filter((course) => course.lecturerId === user.id);
      const entries = await Promise.all(
        ownedCourses.map(
          async (course) => [course.id, await fetchCourseDocuments(course.id)] as const,
        ),
      );

      setCourses(allCourses);
      setDocumentsByCourse(Object.fromEntries(entries));
    } catch (caught) {
      const message = toMessage(caught);
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, user.id]);

  useEffect(() => {
    startTransition(() => {
      void loadWorkspace();
    });
  }, [loadWorkspace]);

  const dashboard = useMemo<TeacherDashboardData>(
    () => buildTeacherDashboardData({ courses, lecturerId: user.id, documentsByCourse }),
    [courses, documentsByCourse, user.id],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col justify-between gap-4 border-b-2 border-slate-700 pb-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Lecturer workspace
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-800">
            Real API overview
          </h1>
          <p className="max-w-2xl text-base font-semibold text-slate-600">
            Welcome back, {user.fullName}. Manage your assigned courses, documents, and chat-ready
            material from the same workspace.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadWorkspace()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}
          Refresh workspace
        </Button>
      </section>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-500">Courses</p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black tracking-tighter text-slate-800">
              {dashboard.summary.totalCourses}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Assigned to your lecturer account.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-500">
              Documents
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black tracking-tighter text-slate-800">
              {dashboard.summary.totalDocuments}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {dashboard.summary.indexedDocuments} indexed, {dashboard.summary.processingDocuments}{" "}
              processing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-500">Failures</p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black tracking-tighter text-slate-800">
              {dashboard.summary.failedDocuments}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Documents that need re-upload or recheck.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-500">
              Chat-ready
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black tracking-tighter text-slate-800">
              {dashboard.summary.chatReadyCourses}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Courses with indexed documents ready for `/student`.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800">Workspace modules</h2>
              <p className="text-sm font-semibold text-slate-500">
                Jump into the lecturer tasks backed by real APIs.
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Link
              href="/teacher/courses"
              className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-chip transition hover:-translate-y-0.5"
            >
              <BookOpen className="h-5 w-5 text-sky-600" />
              <h3 className="mt-4 text-base font-black text-slate-800">Courses</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                View the real course records assigned to you.
              </p>
            </Link>
            <Link
              href="/teacher/knowledge-base"
              className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-chip transition hover:-translate-y-0.5"
            >
              <Files className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-4 text-base font-black text-slate-800">Knowledge base</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Upload, review, and clean up course documents.
              </p>
            </Link>
            <Link
              href="/student"
              className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-chip transition hover:-translate-y-0.5"
            >
              <MessageSquareText className="h-5 w-5 text-violet-600" />
              <h3 className="mt-4 text-base font-black text-slate-800">Student chat</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Launch the existing chat flow with your lecturer account.
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-black text-slate-800">Chat readiness</h2>
            <p className="text-sm font-semibold text-slate-500">
              Only courses with indexed documents should be launched into chat.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.chatReadyCourses.length ? (
              dashboard.chatReadyCourses.map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {course.courseCode} - {course.courseName}
                    </p>
                    <p className="text-sm font-semibold text-slate-500">
                      {course.indexedDocuments} indexed document(s)
                    </p>
                  </div>
                  <Badge variant="mint">Ready</Badge>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">
                No course is chat-ready yet. Upload PDFs and wait until they are indexed.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800">Recent documents</h2>
              <p className="text-sm font-semibold text-slate-500">
                Latest document activity across your assigned courses.
              </p>
            </div>
            <Link href="/teacher/knowledge-base" className="text-sm font-bold text-slate-700">
              Manage all <ArrowRight className="ml-1 inline h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.recentDocuments.length ? (
              dashboard.recentDocuments.slice(0, 6).map((entry) => (
                <Link
                  key={entry.document.id}
                  href={`/teacher/knowledge-base/${entry.document.id}`}
                  className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-chip transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-800">
                      {entry.document.originalFilename}
                    </p>
                    <p className="text-sm font-semibold text-slate-500">
                      {entry.course.code} - {entry.course.name}
                    </p>
                  </div>
                  <DocumentStatusBadge status={entry.document.status} />
                </Link>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">
                No document activity yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-black text-slate-800">Assigned courses</h2>
            <p className="text-sm font-semibold text-slate-500">
              Your current lecturer-owned course list from the real course API.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.ownedCourses.length ? (
              dashboard.ownedCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-black text-slate-800">
                    {course.code} - {course.name}
                  </p>
                  <p className="text-sm font-semibold text-slate-500">
                    {documentsByCourse[course.id]?.length ?? 0} document(s)
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">
                No course is assigned to this lecturer yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/teacher/knowledge-base">
          <Button>
            <FileUp className="mr-2 h-4 w-4" />
            Upload documents
          </Button>
        </Link>
        <Link href="/student">
          <Button variant="secondary">
            <BookCopy className="mr-2 h-4 w-4" />
            Open chat workspace
          </Button>
        </Link>
      </section>
    </div>
  );
}
