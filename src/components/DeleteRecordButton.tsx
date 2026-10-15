"use client";

import { useState, useTransition } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { deleteRecord, type DeletableRecordType } from "@/app/actions";
import { Toast } from "@/components/PhotoUpload";

interface DeleteRecordButtonProps {
  id: string;
  recordType: DeletableRecordType;
  recordTitle?: string;
  compact?: boolean;
  onDeleted?: () => void;
}

export default function DeleteRecordButton({
  id,
  recordType,
  recordTitle,
  compact = false,
  onDeleted,
}: DeleteRecordButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      try {
        const res = await deleteRecord(recordType, id);
        if (res?.success) {
          setToast({ msg: `${recordTitle || "Record"} deleted successfully.`, type: "success" });
          setConfirming(false);
          onDeleted?.();
        }
      } catch (err: any) {
        setToast({
          msg: err?.message || "Failed to delete record. Only administrators can delete records.",
          type: "error",
        });
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "var(--color-surface)",
          border: "1px solid var(--color-danger)",
          borderRadius: "var(--radius-sm)",
          padding: "3px 6px",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.18)",
          animation: "toastSlideIn 0.15s ease",
          verticalAlign: "middle",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-danger)",
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            whiteSpace: "nowrap",
          }}
        >
          <AlertTriangle size={12} />
          Confirm?
        </span>
        <button
          type="button"
          id={`btn-confirm-delete-${id}`}
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={pending}
          style={{
            padding: "3px 8px",
            fontSize: 11,
            height: 24,
            minHeight: "unset",
            cursor: pending ? "not-allowed" : "pointer",
          }}
          title="Permanently delete this record"
        >
          {pending ? "…" : "Delete"}
        </button>
        <button
          type="button"
          id={`btn-cancel-delete-${id}`}
          className="btn btn-ghost btn-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirming(false);
          }}
          disabled={pending}
          style={{
            padding: "3px 6px",
            fontSize: 11,
            height: 24,
            minHeight: "unset",
            cursor: "pointer",
          }}
          title="Cancel"
        >
          <X size={12} />
        </button>

        {toast && (
          <div className="toast-container">
            <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        id={`btn-delete-${id}`}
        className="btn btn-danger-ghost btn-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(true);
        }}
        title="Delete record (Admin only)"
        style={{
          padding: compact ? "4px 7px" : "4px 10px",
          fontSize: 12,
          gap: 4,
          cursor: "pointer",
        }}
      >
        <Trash2 size={13} />
        {!compact && <span>Delete</span>}
      </button>

      {toast && (
        <div className="toast-container">
          <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </>
  );
}
