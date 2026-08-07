"use client";

import { useState, useTransition, useRef } from "react";
import { createEquipmentCleaning, createGeneralCleaning } from "@/app/actions";
import { PhotoUpload, Toast } from "@/components/PhotoUpload";
import { Plus } from "lucide-react";

interface CleaningFormProps {
  type: "equipment" | "general";
}

export default function CleaningForm({ type }: CleaningFormProps) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const action = type === "equipment" ? createEquipmentCleaning : createGeneralCleaning;
  const targetLabel = type === "equipment" ? "Equipment Cleaned" : "Area Cleaned";
  const targetPlaceholder = type === "equipment" ? "e.g. Industrial oven, prep tables" : "e.g. Kitchen, storage area";

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      try {
        await action(fd);
        formRef.current?.reset();
        setToast({ msg: "Cleaning record saved successfully.", type: "success" });
      } catch {
        setToast({ msg: "Failed to save record.", type: "error" });
      }
    });
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">New Entry</div>
      </div>
      <form ref={formRef} action={handleSubmit}>
        <div className="form-grid form-grid-1" style={{ gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor={`${type}-date`}>Date</label>
            <input id={`${type}-date`} name="date" type="date" className="form-input" defaultValue={today} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor={`${type}-target`}>{targetLabel}</label>
            <input id={`${type}-target`} name={type === "equipment" ? "equipment" : "area"} type="text" className="form-input" placeholder={targetPlaceholder} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor={`${type}-detergent`}>Cleaning Material / Detergent</label>
            <input id={`${type}-detergent`} name="detergent" type="text" className="form-input" placeholder="e.g. Dettol, bleach solution" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor={`${type}-remarks`}>Remarks (optional)</label>
            <textarea id={`${type}-remarks`} name="remarks" className="form-textarea" placeholder="Any additional notes…" />
          </div>

          <div className="form-group">
            <label className="form-label">Photo Evidence (optional)</label>
            <PhotoUpload name="photoUrl" />
          </div>

          <button id={`btn-submit-${type}`} type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : <><Plus size={14} /> Save Record</>}
          </button>
        </div>
      </form>

      {toast && (
        <div className="toast-container">
          <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
