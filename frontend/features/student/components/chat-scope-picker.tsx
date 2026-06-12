import { Badge } from "@/components/ui/badge";
import type { ChatCourseOption } from "@/features/student/model/chat-types";

type ChatScopePickerProps = {
  activeScopeLabel: string | null;
  chapterValue: string;
  courseValue: string;
  documentValue: string;
  courses: ChatCourseOption[];
  draftScopeLabel: string | null;
  onChapterChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onDocumentChange: (value: string) => void;
};

export function ChatScopePicker({
  activeScopeLabel,
  chapterValue,
  courseValue,
  documentValue,
  courses,
  draftScopeLabel,
  onChapterChange,
  onCourseChange,
  onDocumentChange,
}: ChatScopePickerProps) {
  const selectedCourse = courses.find((course) => course.id === courseValue) ?? null;
  const documentOptions = selectedCourse?.documents ?? [];
  const selectedDocument =
    documentOptions.find((document) => document.id === documentValue) ?? null;
  const chapterOptions = selectedDocument?.chapters ?? [];

  return (
    <div className="flex flex-col gap-3">
      <label className="grid gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        Course
        <select
          aria-label="Course"
          className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
          value={courseValue}
          onChange={(event) => onCourseChange(event.target.value)}
          disabled={!courses.length}
        >
          {courses.length ? (
            courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))
          ) : (
            <option value="">No courses available</option>
          )}
        </select>
      </label>

      <label className="grid gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        Document
        <select
          aria-label="Document"
          className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
          value={documentValue}
          onChange={(event) => onDocumentChange(event.target.value)}
          disabled={!documentOptions.length}
        >
          {documentOptions.length ? (
            documentOptions.map((document) => (
              <option key={document.id} value={document.id}>
                {document.originalFilename}
              </option>
            ))
          ) : (
            <option value="">No indexed documents</option>
          )}
        </select>
      </label>

      <label className="grid gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        Chapter
        <select
          aria-label="Chapter"
          className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
          value={chapterValue}
          onChange={(event) => onChapterChange(event.target.value)}
          disabled={!chapterOptions.length}
        >
          <option value="all">All chapters</option>
          {chapterOptions.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.orderIndex}. {chapter.title}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-2 mt-1">
        {activeScopeLabel ? <Badge variant="mint">Active session: {activeScopeLabel}</Badge> : null}
        {draftScopeLabel ? <Badge variant="blue">New chat: {draftScopeLabel}</Badge> : null}
      </div>
    </div>
  );
}
