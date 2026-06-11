"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createCourse,
  fetchCourses,
  searchCourses,
} from "@/features/course-management/api/course-client";
import type { CoursePayload, CourseRecord } from "@/features/course-management/model/types";
import { fetchUsers } from "@/features/admin-governance/api/admin-client";
import type { UserRecord } from "@/features/admin-governance/model/types";

const emptyPayload: CoursePayload = {
  code: "",
  name: "",
  description: "",
  lecturerId: "",
};

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Course request failed.";
}

export function CoursesPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CoursePayload>(emptyPayload);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCourses, nextUsers] = await Promise.all([fetchCourses(), fetchUsers()]);
      setCourses(nextCourses);
      setUsers(nextUsers);
      setNotice(null);
    } catch (error) {
      setNotice(toMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      void loadCourses();
    });
  }, [loadCourses]);

  const lecturers = useMemo(
    () => users.filter((user) => user.roleResponse?.name === "LECTURER"),
    [users],
  );
  const resolvedLecturerId = form.lecturerId || lecturers[0]?.id || "";

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return courses;
    }

    return courses.filter((course) =>
      `${course.code} ${course.name}`.toLowerCase().includes(normalizedQuery),
    );
  }, [courses, query]);

  async function handleSearch() {
    try {
      const result = await searchCourses(query);
      setCourses(result.content ?? []);
      setNotice(null);
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.code.trim() || !form.name.trim() || !resolvedLecturerId) {
      setNotice("Course code, name, and lecturer are required.");
      return;
    }

    try {
      await createCourse({ ...form, lecturerId: resolvedLecturerId });
      setForm(emptyPayload);
      await loadCourses();
      setNotice("Course created.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Admin
          </p>
          <h1 className="text-4xl font-black text-slate-800">Course management</h1>
        </div>

        {notice ? (
          <div className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <label className="grid gap-2 text-sm font-extrabold text-slate-700">
                Search by course code
                <span className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-9"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="SWD392"
                  />
                </span>
              </label>
              <Button type="button" onClick={handleSearch}>
                Search Java
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? <p className="text-sm font-bold text-slate-500">Loading courses...</p> : null}
              {visibleCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/admin/courses/${course.id}`}
                  className="grid gap-1 rounded-md border-2 border-slate-200 bg-white p-4 shadow-chip hover:border-slate-400"
                >
                  <span className="text-sm font-black text-slate-800">
                    {course.code} - {course.name}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    {course.description || "No description"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Lecturer: {course.lecturerName || "Unassigned"}
                  </span>
                </Link>
              ))}
              {!loading && !visibleCourses.length ? (
                <p className="text-sm font-bold text-slate-500">No courses found.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create course</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleCreate}>
                <Input
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                  placeholder="Course code"
                />
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Course name"
                />
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Description"
                />
                <select
                  className="h-11 w-full rounded-sm border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-chip"
                  value={resolvedLecturerId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lecturerId: event.target.value }))
                  }
                  disabled={!lecturers.length}
                >
                  <option value="">Select lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.fullName || lecturer.email}
                    </option>
                  ))}
                </select>
                {!lecturers.length ? (
                  <p className="text-xs font-bold text-slate-500">
                    Create a lecturer account first before creating a course.
                  </p>
                ) : null}
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
