"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  documentName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmModal({
  isOpen,
  documentName,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-black text-foreground">Xác nhận xóa tài liệu?</h3>
        <p className="mt-2.5 text-xs font-semibold text-muted-foreground leading-relaxed">
          Bạn có chắc chắn muốn xóa tài liệu <span className="font-extrabold text-foreground">&quot;{documentName}&quot;</span> không?
          Hành động này sẽ xóa vĩnh viễn tệp tin, tất cả các phân đoạn (chunks) và vector nhúng liên quan trong cơ sở dữ liệu. Hành động này **không thể hoàn tác**.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-4 text-xs font-bold text-muted-foreground hover:bg-muted"
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="default"
            className="h-9 px-4 text-xs font-black bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
            onClick={onConfirm}
          >
            Xác nhận xóa
          </Button>
        </div>
      </div>
    </div>
  );
}
