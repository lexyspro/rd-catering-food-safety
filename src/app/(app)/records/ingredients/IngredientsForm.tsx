"use client";

import { useState, useTransition, useRef } from "react";
import { createIngredient } from "@/app/actions";
import { PhotoUpload, Toast } from "@/components/PhotoUpload";
import { Plus } from "lucide-react";

export default function IngredientsForm() {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      try {
        await createIngredient(fd);
        formRef.current?.reset();
        setToast({ msg: "Ingredient checklist entry saved.", type: "success" });
      } catch {
        setToast({ msg: "Failed to save entry.", type: "error" });
      }
    });
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Log Received Goods</div>
      </div>
      <form ref={formRef} action={handleSubmit}>
        <div className="form-grid form-grid-1" style={{ gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="ing-date">Date Received</label>
            <input id="ing-date" name="date" type="date" className="form-input" defaultValue={today} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ing-name">Ingredient Name</label>
            <input id="ing-name" name="ingredient" type="text" className="form-input" placeholder="e.g. Fresh milk (5L)" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ing-expiry">Expiry Date (optional)</label>
            <input id="ing-expiry" name="expiryDate" type="date" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ing-batch">Batch Number (optional)</label>
            <input id="ing-batch" name="batchNo" type="text" className="form-input" placeholder="e.g. Lot #123A" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ing-sealing">Sealing Integrity</label>
            <select id="ing-sealing" name="sealingIntegrity" className="form-select" required>
              <option value="OK">Ok / Intact</option>
              <option value="NOT_OK">Not Ok / Damaged</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ing-temp">Temperature Received (°C) (optional)</label>
            <input id="ing-temp" name="tempReceived" type="number" step="0.1" className="form-input" placeholder="e.g. 3.2" />
            <span className="form-hint">Required for cold & frozen items only</span>
          </div>

          <div className="form-group">
            <label className="form-label">Photo Evidence (optional)</label>
            <PhotoUpload name="photoUrl" />
          </div>

          <button id="btn-submit-ing" type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : <><Plus size={14} /> Log Ingredient</>}
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
