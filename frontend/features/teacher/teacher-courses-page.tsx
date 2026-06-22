"use client";

import Link from "next/link";
import { BookOpen, RefreshCcw, Search } from "lucide-react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchCourses } from "@/features/course-management/api/course-client";
import type { CourseRecord } from "@/features/course-management/model/types";
import type { AuthUser } from "@/features/auth/model/contracts";
import {
  buildTeacherDashboardData,
  type TeacherDashboardData,
} from "@/features/teacher/teacher-dashboard-data";

type TeacherCoursesPageProps = {
  user: AuthUser;
};

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: string }).message ?? "");
  }

  return "Unable to load course data.";
}

export function TeacherCoursesPage({ user }: TeacherCoursesPageProps) {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextCourses = await fetchCourses();
      setCourses(nextCourses);
    } catch (caught) {
      const message = toMessage(caught);
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    startTransition(() => {
      void loadCourses();
    });
  }, [loadCourses]);

  const lecturerCourses = useMemo(
    () => courses.filter((course) => course.lecturerId === user.id),
    [courses, user.id],
  );

  const dashboard = useMemo<TeacherDashboardData>(
    () => buildTeacherDashboardData({ courses, lecturerId: user.id, documentsByCourse: {} }),
    [courses, user.id],
  );

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return lecturerCourses;
    }

    return lecturerCourses.filter((course) =>
      `${course.code} ${course.name}`.toLowerCase().includes(normalizedQuery),
    );
  }, [lecturerCourses, query]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground">
            Lecturer workspace
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-foreground">Courses</h1>
          <p className="text-sm font-semibold text-muted-foreground">
            Read the course records assigned to your account and use them when creating documents.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadCourses()}
          disabled={loading}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-muted-foreground">Assigned</p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black tracking-tighter text-foreground">
              {dashboard.summary.totalCourses}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-muted-foreground">
              Chat ready
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black tracking-tighter text-foreground">
              {dashboard.summary.chatReadyCourses}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-muted-foreground">
              Documents
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black tracking-tighter text-foreground">
              {dashboard.summary.totalDocuments}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-muted-foreground">Indexed</p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black tracking-tighter text-foreground">
              {dashboard.summary.indexedDocuments}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-semibold text-muted-foreground">
            Search course
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by code or name"
              />
            </span>
          </label>
          <Badge>{visibleCourses.length} courses</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm font-semibold text-muted-foreground">Loading courses...</p> : null}
          {visibleCourses.length ? (
            visibleCourses.map((course) => {
              const documentCount =
                dashboard.courseDocuments.find((entry) => entry.course.id === course.id)?.documents
                  .length ?? 0;
              const indexedCount =
                dashboard.courseDocuments
                  .find((entry) => entry.course.id === course.id)
                  ?.documents.filter((document) => document.status === "INDEXED").length ?? 0;

              return (
                <div
                  key={course.id}
                  className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition duration-200 lg:grid-cols-[1fr_auto]"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <p className="text-sm font-black text-foreground">
                        {course.code} - {course.name}
                      </p>
                      {course.active ? (
                        <Badge variant="mint">Active</Badge>
                      ) : (
                        <Badge>Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {course.description || "No description provided."}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Lecturer:{" "}
                      <span className="text-foreground">{course.lecturerName || "Unassigned"}</span>
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {documentCount} document(s), {indexedCount} indexed
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href="/teacher/knowledge-base">
                      <Button variant="secondary" type="button">
                        Manage documents
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : loading ? null : (
            <div className="rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-5 text-sm font-semibold text-muted-foreground">
              No courses are assigned to this lecturer yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-black text-foreground">What you can do with these courses</h2>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-semibold text-muted-foreground">
            Use the assigned course to upload documents in Knowledge Base.
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-semibold text-muted-foreground">
            Only indexed documents are considered chat-ready.
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-semibold text-muted-foreground">
            Lecturer FE uses real course APIs already exposed by the frontend.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
