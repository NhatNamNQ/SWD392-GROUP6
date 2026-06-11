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
    <div className="grid gap-3 rounded-md border-2 border-slate-300 bg-white/80 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <label className="grid gap-2 text-sm font-extrabold text-slate-700">
        Course
        <select
          aria-label="Course"
          className="h-11 rounded-sm border-2 border-slate-300 bg-white px-3 font-bold text-slate-700 shadow-chip outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
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

      <label className="grid gap-2 text-sm font-extrabold text-slate-700">
        Document
        <select
          aria-label="Document"
          className="h-11 rounded-sm border-2 border-slate-300 bg-white px-3 font-bold text-slate-700 shadow-chip outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
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

      <label className="grid gap-2 text-sm font-extrabold text-slate-700">
        Chapter
        <select
          aria-label="Chapter"
          className="h-11 rounded-sm border-2 border-slate-300 bg-white px-3 font-bold text-slate-700 shadow-chip outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
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

      <div className="md:col-span-3 flex flex-wrap gap-2">
        {activeScopeLabel ? <Badge variant="mint">Active session: {activeScopeLabel}</Badge> : null}
        {draftScopeLabel ? <Badge variant="blue">New chat: {draftScopeLabel}</Badge> : null}
      </div>
    </div>
  );
}
