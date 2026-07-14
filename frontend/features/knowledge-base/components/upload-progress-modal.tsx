"use client";

import { AlertCircle, CheckCircle2, FileUp, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadProgressModalProps = {
  isOpen: boolean;
  fileName: string;
  fileSize: number;
  uploadPercent: number; // 0 to 100
  processingProgress: number; // 30 to 99 simulated progress
  status: "UPLOADING" | "PROCESSING" | "SUCCESS" | "ERROR";
  chunkCount: number | null;
  errorMsg: string | null;
  onClose: () => void;
};

export function UploadProgressModal({
  isOpen,
  fileName,
  fileSize,
  uploadPercent,
  processingProgress,
  status,
  chunkCount,
  errorMsg,
  onClose,
}: UploadProgressModalProps) {
  if (!isOpen) return null;

  // Compute composite progress:
  // - Upload represents 0% - 30% of the single progress bar
  // - Processing represents 30% - 99% of the single progress bar
  // - Success represents 100%
  let displayProgress = 0;
  let statusText = "";

  if (status === "UPLOADING") {
    displayProgress = Math.round(uploadPercent * 0.3);
    const uploadedMb = ((fileSize * uploadPercent) / (1024 * 1024 * 100)).toFixed(2);
    const totalMb = (fileSize / (1024 * 1024)).toFixed(2);
    statusText = `Đang tải tài liệu lên máy chủ... (${uploadedMb} MB / ${totalMb} MB)`;
  } else if (status === "PROCESSING") {
    displayProgress = Math.round(processingProgress);
    if (processingProgress < 55) {
      statusText = "Đang phân tích cấu trúc & bóc tách nội dung PDF...";
    } else if (processingProgress < 85) {
      statusText = "Đang phân đoạn văn bản & Tạo vector nhúng (Embedding)...";
    } else {
      statusText = "Đang lưu trữ cơ sở dữ liệu vector và tối ưu hóa chỉ mục RAG...";
    }
  } else if (status === "SUCCESS") {
    displayProgress = 100;
    statusText = `Hoàn thành! Đã bóc tách thành công ${chunkCount ?? 0} phân đoạn.`;
  } else if (status === "ERROR") {
    displayProgress = Math.max(30, processingProgress);
    statusText = errorMsg || "Đã xảy ra lỗi trong quá trình xử lý tài liệu.";
  }

  // Formatting file size for header display
  const fileSizeMb = (fileSize / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Glow Effects */}
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-sky-500/5 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          {/* Status Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-inner">
            {status === "UPLOADING" && (
              <FileUp className="h-8 w-8 animate-bounce text-primary" />
            )}
            {status === "PROCESSING" && (
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            )}
            {status === "SUCCESS" && (
              <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-in zoom-in duration-300" />
            )}
            {status === "ERROR" && (
              <XCircle className="h-8 w-8 text-destructive animate-in duration-300" />
            )}
          </div>

          {/* Title & Filename */}
          <h3 className="text-lg font-black text-foreground">
            {status === "UPLOADING" && "Đang tải lên tài liệu"}
            {status === "PROCESSING" && "Đang xử lý tài liệu"}
            {status === "SUCCESS" && "Tải lên & xử lý hoàn tất"}
            {status === "ERROR" && "Lỗi xử lý tài liệu"}
          </h3>
          <p className="mt-1.5 w-full truncate px-4 text-xs font-bold text-muted-foreground" title={fileName}>
            {fileName} <span className="opacity-60">({fileSizeMb} MB)</span>
          </p>

          {/* Progress Bar */}
          <div className="mt-6 w-full px-2">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  status === "SUCCESS"
                    ? "bg-emerald-500"
                    : status === "ERROR"
                      ? "bg-destructive"
                      : "bg-gradient-to-r from-primary to-sky-500"
                }`}
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-black tracking-wider text-muted-foreground">
              <span>PROGRESS</span>
              <span className={status === "SUCCESS" ? "text-emerald-500" : status === "ERROR" ? "text-destructive" : "text-primary"}>
                {displayProgress}%
              </span>
            </div>
          </div>

          {/* Status Message Log */}
          <div className="mt-4 w-full rounded-2xl bg-muted/30 border border-border/40 p-3.5 min-h-[5rem] flex items-center justify-center text-center">
            {status === "ERROR" ? (
              <div className="flex flex-col items-center gap-1 text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-xs font-semibold leading-relaxed break-words max-h-24 overflow-y-auto">
                  {statusText}
                </p>
              </div>
            ) : (
              <p className="text-xs font-bold leading-relaxed text-muted-foreground animate-pulse">
                {statusText}
              </p>
            )}
          </div>

          {/* Close/Action Button */}
          <div className="mt-6 w-full flex gap-2">
            {(status === "SUCCESS" || status === "ERROR") && (
              <Button
                type="button"
                className="w-full font-black text-sm"
                variant={status === "SUCCESS" ? "default" : "secondary"}
                onClick={onClose}
              >
                Đóng và hoàn tất
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
