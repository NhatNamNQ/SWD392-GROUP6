"use client";

import Link from "next/link";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { startTransition, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  assignLecturer,
  fetchCourse,
  updateCourse,
} from "@/features/course-management/api/course-client";
import type { CoursePayload, CourseRecord } from "@/features/course-management/model/types";
import { fetchUsers } from "@/features/admin-governance/api/admin-client";
import type { UserRecord } from "@/features/admin-governance/model/types";

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Course request failed.";
}

export function CourseDetailPage({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [form, setForm] = useState<CoursePayload>({ code: "", name: "", description: "" });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [lecturerId, setLecturerId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const [nextCourse, nextUsers] = await Promise.all([fetchCourse(courseId), fetchUsers()]);
        setCourse(nextCourse);
        setForm({
          code: nextCourse.code,
          name: nextCourse.name,
          description: nextCourse.description ?? "",
        });
        setUsers(nextUsers);
      } catch (error) {
        setNotice(toMessage(error));
      }
    });
  }, [courseId]);

  const lecturers = useMemo(
    () => users.filter((user) => user.roleResponse?.name === "LECTURER"),
    [users],
  );

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const updated = await updateCourse(courseId, form);
      setCourse(updated);
      setNotice("Course updated.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  async function handleAssign() {
    if (!lecturerId) {
      setNotice("Select a lecturer first.");
      return;
    }

    try {
      await assignLecturer(courseId, lecturerId);
      setNotice("Lecturer assigned. Unassign is not exposed by the current Java API.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>

        {notice ? (
          <div className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
            {notice}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{course ? `${course.code} - ${course.name}` : "Course detail"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <form className="space-y-3" onSubmit={handleSave}>
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
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </form>

            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-black text-slate-800">Lecturer assignment</h2>
              <select
                className="h-11 w-full rounded-sm border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-chip"
                value={lecturerId}
                onChange={(event) => setLecturerId(event.target.value)}
              >
                <option value="">Select lecturer</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.fullName || lecturer.email}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={handleAssign}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign lecturer
              </Button>
              <p className="text-xs font-bold text-slate-500">
                Course access policy management is limited to lecturer assignment in the current
                Java API.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

