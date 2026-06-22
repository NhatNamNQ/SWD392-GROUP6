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

  const selectClass =
    "h-9 w-full rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50";
  const labelClass = "grid gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground";

  return (
    <div className="flex flex-col gap-3">
      <label className={labelClass}>
        Course
        <select
          aria-label="Course"
          className={selectClass}
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

      <label className={labelClass}>
        Document
        <select
          aria-label="Document"
          className={selectClass}
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

      <label className={labelClass}>
        Chapter
        <select
          aria-label="Chapter"
          className={selectClass}
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

      {(activeScopeLabel ?? draftScopeLabel) ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {activeScopeLabel ? <Badge variant="mint">Session: {activeScopeLabel}</Badge> : null}
          {draftScopeLabel ? <Badge variant="blue">New: {draftScopeLabel}</Badge> : null}
        </div>
      ) : null}
    </div>
  );
}
