"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { uploadDocumentWithProgress, fetchDocument } from "../api/document-client";

export type UploadItem = {
  id: string; // Initially temp random string, updated to document ID once uploaded
  fileName: string;
  fileSize: number;
  uploadPercent: number;
  processingProgress: number;
  status: "UPLOADING" | "PROCESSING" | "SUCCESS" | "ERROR";
  chunkCount: number | null;
  errorMsg: string | null;
};

type UploadProgressContextType = {
  uploads: UploadItem[];
  startUpload: (courseId: string, file: File) => Promise<void>;
  clearUpload: (id: string) => void;
};

const UploadProgressContext = createContext<UploadProgressContextType | undefined>(undefined);

export function useUploadProgress() {
  const context = useContext(UploadProgressContext);
  if (!context) {
    throw new Error("useUploadProgress must be used within an UploadProgressProvider");
  }
  return context;
}

export function UploadProgressProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const clearUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const startUpload = useCallback(async (courseId: string, file: File) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: UploadItem = {
      id: tempId,
      fileName: file.name,
      fileSize: file.size,
      uploadPercent: 0,
      processingProgress: 30,
      status: "UPLOADING",
      chunkCount: null,
      errorMsg: null,
    };

    setUploads((prev) => [newItem, ...prev]);

    let progressInterval: NodeJS.Timeout | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;
    let activeId: string | null = null;

    const updateItem = (id: string, updates: Partial<UploadItem>) => {
      setUploads((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    };

    const finishWithSuccess = (id: string, chunkCount: number | null) => {
      if (pollingInterval) clearInterval(pollingInterval);
      if (progressInterval) clearInterval(progressInterval);

      // Start a fast animation to slide to 100%
      const animationInterval = setInterval(() => {
        setUploads((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item;
            const current = item.processingProgress;

            if (current >= 100) {
              clearInterval(animationInterval);
              setTimeout(() => {
                clearUpload(id);
              }, 2000);
              return {
                ...item,
                processingProgress: 100,
                status: "SUCCESS",
                chunkCount: chunkCount,
              };
            }

            const step = Math.max(1, (100 - current) / 4);
            const nextProgress = Math.min(100, current + step);

            if (nextProgress >= 100) {
              clearInterval(animationInterval);
              setTimeout(() => {
                clearUpload(id);
              }, 2000);
              return {
                ...item,
                processingProgress: 100,
                status: "SUCCESS",
                chunkCount: chunkCount,
              };
            }

            return { ...item, processingProgress: nextProgress };
          })
        );
      }, 50);
    };

    try {
      // 1. Upload Phase (0% - 30% total progress)
      const doc = await uploadDocumentWithProgress(courseId, file, (percent) => {
        updateItem(tempId, { uploadPercent: percent });
      });

      // Update ID to the real document ID
      activeId = doc.id;
      setUploads((prev) =>
        prev.map((item) =>
          item.id === tempId ? { ...item, id: activeId!, status: "PROCESSING" } : item
        )
      );

      if (doc.status === "INDEXED") {
        finishWithSuccess(activeId, doc.chunkCount);
        return;
      } else if (doc.status === "FAILED") {
        updateItem(activeId, {
          status: "ERROR",
          processingProgress: 100,
          errorMsg: doc.failureReason || "Bóc tách tài liệu thất bại.",
        });
        return;
      }

      // 2. Processing Phase (30% - 99% total progress)
      progressInterval = setInterval(() => {
        if (!activeId) return;
        setUploads((prev) =>
          prev.map((item) => {
            if (item.id !== activeId) return item;
            if (item.processingProgress >= 99) {
              if (progressInterval) clearInterval(progressInterval);
              return { ...item, processingProgress: 99 };
            }
            let step = 0;
            const current = item.processingProgress;
            if (current < 55) {
              step = Math.random() * 2 + 1; // PDF parsing
            } else if (current < 85) {
              step = Math.random() * 1 + 0.5; // Chunking / Embedding
            } else {
              step = Math.random() * 0.3 + 0.1; // Saving index
            }
            return { ...item, processingProgress: Math.min(99, current + step) };
          })
        );
      }, 400);

      // Start status polling
      pollingInterval = setInterval(async () => {
        if (!activeId) return;
        try {
          const polledDoc = await fetchDocument(activeId);
          if (polledDoc.status === "INDEXED") {
            finishWithSuccess(activeId, polledDoc.chunkCount);
          } else if (polledDoc.status === "FAILED") {
            if (pollingInterval) clearInterval(pollingInterval);
            if (progressInterval) clearInterval(progressInterval);
            updateItem(activeId, {
              status: "ERROR",
              processingProgress: 100,
              errorMsg: polledDoc.failureReason || "Bóc tách tài liệu thất bại.",
            });
          }
        } catch (pollErr) {
          console.error("Error polling document status:", pollErr);
        }
      }, 2000);

    } catch (err: unknown) {
      if (progressInterval) clearInterval(progressInterval);
      if (pollingInterval) clearInterval(pollingInterval);

      const targetId = activeId || tempId;
      const errMsg = err instanceof Error ? err.message : "Tải lên thất bại.";

      updateItem(targetId, {
        status: "ERROR",
        errorMsg: errMsg,
      });
    }
  }, [clearUpload]);

  return (
    <UploadProgressContext.Provider value={{ uploads, startUpload, clearUpload }}>
      {children}
    </UploadProgressContext.Provider>
  );
}
