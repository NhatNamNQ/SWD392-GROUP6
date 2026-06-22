import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatCourseOption } from "@/features/student/model/chat-types";

type ChatScopePickerProps = {
  chapterValue: string[];
  courseValue: string;
  documentValue: string;
  courses: ChatCourseOption[];
  onChapterChange: (value: string[]) => void;
  onCourseChange: (value: string) => void;
  onDocumentChange: (value: string) => void;
};

export function ChatScopePicker({
  chapterValue,
  courseValue,
  documentValue,
  courses,
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

      <div className={labelClass}>
        Chapter
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              disabled={!chapterOptions.length}
              className={cn(selectClass, "justify-between font-normal h-9 px-3 py-2")}
            >
              <span className="truncate">
                {chapterValue.includes("all") || chapterValue.length === 0
                  ? "All chapters"
                  : `${chapterValue.length} chapter(s) selected`}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[15rem] max-h-[300px] overflow-y-auto">
            <DropdownMenuCheckboxItem
              onSelect={(e) => e.preventDefault()}
              checked={chapterValue.includes("all") || chapterValue.length === 0}
              onCheckedChange={(checked) => {
                if (checked) onChapterChange(["all"]);
              }}
            >
              All chapters
            </DropdownMenuCheckboxItem>
            {chapterOptions.map((chapter) => {
              const isChecked = chapterValue.includes(chapter.id);
              return (
                <DropdownMenuCheckboxItem
                  key={chapter.id}
                  onSelect={(e) => e.preventDefault()}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const newVals = chapterValue.filter((v) => v !== "all");
                      onChapterChange([...newVals, chapter.id]);
                    } else {
                      const newVals = chapterValue.filter((v) => v !== chapter.id);
                      onChapterChange(newVals.length ? newVals : ["all"]);
                    }
                  }}
                >
                  <span className="truncate">
                    {chapter.orderIndex}. {chapter.title}
                  </span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
