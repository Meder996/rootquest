"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  isBusy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isBusy?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            className="text-coral hover:bg-coral/10 hover:text-coral"
            onClick={onConfirm}
            isLoading={isBusy}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="flex items-start gap-3 text-sm text-muted">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-coral"
          aria-hidden="true"
        />
        {message}
      </p>
    </Modal>
  );
}
