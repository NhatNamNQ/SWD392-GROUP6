import type { RefObject } from "react";
import { BookOpen, Search, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { statusVariant } from "@/features/student/model/reply";
import type { DocumentRecord } from "@/features/student/model/types";

type DocumentLibraryProps = {
  docQuery: string;
  fileInputId: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  filteredDocuments: DocumentRecord[];
  onAddFiles: (fileList: FileList | null) => void;
  onDocQueryChange: (value: string) => void;
};

export function DocumentLibrary({
  docQuery,
  fileInputId,
  fileInputRef,
  filteredDocuments,
  onAddFiles,
  onDocQueryChange,
}: DocumentLibraryProps) {
  return (
    <div className="orbit-frame min-h-[720px] overflow-hidden">
      <div className="grid gap-4 p-4 md:p-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden">
          <div className="orbit-panel-head bg-emerald-50 text-slate-700">Knowledge Base</div>
          <CardContent className="space-y-4 p-5">
            <div>
              <CardTitle className="text-3xl md:text-4xl">
                Teach the AI with clean course materials.
              </CardTitle>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 md:text-base">
                Teachers can add lecture slides, PDFs, and handouts here without crowding the
                student chat. Students only see cited answers from approved files.
              </p>
            </div>
            <div className="rounded-md border-2 border-dashed border-slate-400 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-sm border-2 border-slate-700 bg-white p-2 shadow-chip">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800">
                    Drop lecture slides or PDFs here
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    PDF, DOCX, PPTX, or Markdown. New files appear as processing cards below.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => onAddFiles(event.target.files)}
                />
                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                  Choose files
                </Button>
                <Badge variant="mint">Prototype upload flow</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="orbit-panel-head bg-sky-50 text-slate-700">Document Library</div>
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xl font-black text-slate-800">Teacher files</p>
                <p className="text-sm font-semibold text-slate-500">Filter by document or tag</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  type="search"
                  value={docQuery}
                  onChange={(event) => onDocQueryChange(event.target.value)}
                  placeholder="Filter documents"
                  aria-label="Filter documents"
                />
              </div>
            </div>

            <ScrollArea className="h-[470px] rounded-md">
              <div className="grid gap-3 pr-3">
                {filteredDocuments.map((document) => (
                  <Card key={document.id} className="shadow-chip">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-sm border-2 border-slate-700 bg-slate-50 p-2">
                          <BookOpen className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-800">{document.title}</p>
                          <p className="text-xs font-bold text-slate-500">{document.size}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={statusVariant(document.status)}>{document.status}</Badge>
                        <Badge variant="blue">{document.tag}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="border-t-2 border-slate-700 bg-emerald-50 px-5 py-4 text-sm font-bold text-slate-600">
        Knowledge Base is a teacher workspace. The student chat stays focused on questions, answers,
        and citations.
      </div>
    </div>
  );
}
