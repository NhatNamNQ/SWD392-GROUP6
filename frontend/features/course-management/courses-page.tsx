"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Edit2, Plus, Save, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createCourse,
  fetchCourse,
  fetchCourses,
  updateCourse,
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

function CenteredModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b-2 border-slate-200 px-6 py-4">
          <h2 className="text-xl font-black text-slate-800">{title}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CoursesPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  
  // Form states
  const [createForm, setCreateForm] = useState<CoursePayload>(emptyPayload);
  const [editForm, setEditForm] = useState<CoursePayload>(emptyPayload);

  const { toast } = useToast();

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCourses, nextUsers] = await Promise.all([fetchCourses(), fetchUsers()]);
      setCourses(nextCourses);
      setUsers(nextUsers);
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return courses;
    }

    return courses.filter((course) =>
      `${course.code} ${course.name}`.toLowerCase().includes(normalizedQuery),
    );
  }, [courses, query]);

  async function handleSelectCourse(courseId: string) {
    setSelectedCourseId(courseId);
    setIsCreating(false);
    
    // Fetch full course details for editing
    try {
      const course = await fetchCourse(courseId);
      setEditForm({
        code: course.code,
        name: course.name,
        description: course.description ?? "",
        lecturerId: course.lecturerId ?? "",
      });
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
      setSelectedCourseId("");
    }
  }

  function handleCancelEdit() {
    setSelectedCourseId("");
    setEditForm(emptyPayload);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!createForm.code.trim() || !createForm.name.trim() || !createForm.lecturerId) {
      toast({ title: "Error", description: "Course code, name, and lecturer are required.", variant: "destructive" });
      return;
    }

    try {
      await createCourse(createForm);
      setCreateForm(emptyPayload);
      setIsCreating(false);
      await loadCourses();
      toast({ title: "Success", description: "Course created successfully." });
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editForm.code.trim() || !editForm.name.trim() || !editForm.lecturerId) {
      toast({ title: "Error", description: "Course code, name, and lecturer are required.", variant: "destructive" });
      return;
    }

    try {
      await updateCourse(selectedCourseId, editForm);
      await loadCourses();
      setSelectedCourseId("");
      toast({ title: "Success", description: "Course updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    }
  }

  return (
    <div className="p-6 md:p-8 mx-auto max-w-5xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-700 pb-6">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Admin governance
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-800">Course Catalog</h1>
        </div>
        <Button 
          onClick={() => { setIsCreating(true); setSelectedCourseId(""); }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-chip"
        >
          <Plus className="mr-2 h-4 w-4" /> New Course
        </Button>
      </div>

      <Card>
        <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Search courses
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 max-w-md"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by code or name"
              />
            </span>
          </label>
          <Badge>{visibleCourses.length} courses</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm font-bold text-slate-500">Loading courses...</p> : null}
          {visibleCourses.map((course) => (
            <article
              key={course.id}
              className="grid gap-3 rounded-md border-2 border-slate-200 bg-white p-4 shadow-chip lg:grid-cols-[1fr_auto]"
            >
              <div className="text-left flex flex-col justify-center">
                <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  {course.code} - {course.name}
                </p>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  {course.description || "No description provided."}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 mt-2">
                  Lecturer: <span className="text-slate-600">{course.lecturerName || "Unassigned"}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => handleSelectCourse(course.id)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </article>
          ))}
          {!loading && !visibleCourses.length ? (
            <p className="text-sm font-bold text-slate-500">No courses found.</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Creation Modal */}
      {isCreating && (
        <CenteredModal title="Create New Course" onClose={() => setIsCreating(false)}>
          <form className="space-y-5" onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Course Code</label>
                <Input
                  value={createForm.code}
                  onChange={(event) => setCreateForm((current) => ({ ...current, code: event.target.value }))}
                  placeholder="e.g. SWD392"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Course Name</label>
                <Input
                  value={createForm.name}
                  onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Software Architecture"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <Textarea
                value={createForm.description}
                onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Course overview and objectives..."
                className="resize-none h-24"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Assign Lecturer</label>
              <select
                className="h-11 w-full rounded-sm border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-chip"
                value={createForm.lecturerId}
                onChange={(event) => setCreateForm((current) => ({ ...current, lecturerId: event.target.value }))}
                disabled={!lecturers.length}
              >
                <option value="">Select a lecturer...</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.fullName || lecturer.email}
                  </option>
                ))}
              </select>
              {!lecturers.length ? (
                <p className="text-xs font-bold text-rose-500 mt-1">
                  You must create a lecturer account in the Users Directory first.
                </p>
              ) : null}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-chip">
                <Plus className="mr-2 h-4 w-4" />
                Create course
              </Button>
            </div>
          </form>
        </CenteredModal>
      )}

      {/* Edit Modal */}
      {selectedCourseId && (
        <CenteredModal title="Edit Course" onClose={handleCancelEdit}>
          <form className="space-y-5" onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Course Code</label>
                <Input
                  value={editForm.code}
                  onChange={(event) => setEditForm((current) => ({ ...current, code: event.target.value }))}
                  placeholder="e.g. SWD392"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Course Name</label>
                <Input
                  value={editForm.name}
                  onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Software Architecture"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Course overview and objectives..."
                className="resize-none h-24"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Assign Lecturer</label>
              <select
                className="h-11 w-full rounded-sm border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-chip"
                value={editForm.lecturerId}
                onChange={(event) => setEditForm((current) => ({ ...current, lecturerId: event.target.value }))}
                disabled={!lecturers.length}
              >
                <option value="">Select a lecturer...</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.fullName || lecturer.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-chip">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CenteredModal>
      )}
    </div>
  );
}
