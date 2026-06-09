import { Badge } from "@/components/ui/badge";
import type { ChatCourseOption } from "@/features/student/model/chat-types";

type ChatScopePickerProps = {
  activeScopeLabel: string | null;
  chapterValue: string;
  courseValue: string;
  courses: ChatCourseOption[];
  draftScopeLabel: string | null;
  onChapterChange: (value: string) => void;
  onCourseChange: (value: string) => void;
};

export function ChatScopePicker({
  activeScopeLabel,
  chapterValue,
  courseValue,
  courses,
  draftScopeLabel,
  onChapterChange,
  onCourseChange,
}: ChatScopePickerProps) {
  const selectedCourse = courses.find((course) => course.id === courseValue) ?? null;
  const chapterOptions = selectedCourse?.chapters ?? [];

  return (
    <div className="grid gap-3 rounded-md border-2 border-slate-300 bg-white/80 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <label className="grid gap-2 text-sm font-extrabold text-slate-700">
        Course
        <select
          aria-label="Course"
          className="h-11 rounded-sm border-2 border-slate-300 bg-white px-3 font-bold text-slate-700 shadow-chip outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
          value={courseValue}
          onChange={(event) => onCourseChange(event.target.value)}
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-extrabold text-slate-700">
        Chapter scope
        <select
          aria-label="Chapter scope"
          className="h-11 rounded-sm border-2 border-slate-300 bg-white px-3 font-bold text-slate-700 shadow-chip outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
          value={chapterValue}
          onChange={(event) => onChapterChange(event.target.value)}
        >
          <option value="all">All chapters</option>
          {chapterOptions.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.label}
            </option>
          ))}
        </select>
      </label>

      <div className="md:col-span-2 flex flex-wrap gap-2">
        {activeScopeLabel ? <Badge variant="mint">Active scope: {activeScopeLabel}</Badge> : null}
        {draftScopeLabel ? <Badge variant="blue">Next new chat: {draftScopeLabel}</Badge> : null}
      </div>
    </div>
  );
}
