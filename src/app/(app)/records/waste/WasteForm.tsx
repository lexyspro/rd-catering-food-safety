"use client";

import { useState, useTransition, useRef } from "react";
import { createWasteRecord } from "@/app/actions";
import { PhotoUpload, Toast } from "@/components/PhotoUpload";
import { Plus, Trash2 } from "lucide-react";

export default function WasteForm() {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      try {
        await createWasteRecord(fd);
        formRef.current?.reset();
        setToast({ msg: "Waste management record logged successfully.", type: "success" });
      } catch (err) {
        console.error(err);
        setToast({ msg: "Failed to log waste record. Please check all required fields.", type: "error" });
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Trash2 size={16} style={{ color: "var(--color-primary)" }} />
            Log Waste Collection
          </div>
          <div className="card-sub">Record day, time, company, and transfer note number</div>
        </div>

        <form ref={formRef} action={handleSubmit}>
          <div className="form-grid form-grid-1" style={{ gap: 16 }}>
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="waste-date">
                  Day / Date <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  id="waste-date"
                  name="date"
                  type="date"
                  className="form-input"
                  defaultValue={today}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="waste-time">
                  Collection Time <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  id="waste-time"
                  name="time"
                  type="time"
                  className="form-input"
                  defaultValue={currentTime}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="waste-company">
                Waste Management Company <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <input
                id="waste-company"
                name="company"
                type="text"
                className="form-input"
                placeholder="e.g. Biffa, Veolia, Local Council, Olleco"
                list="waste-company-suggestions"
                required
              />
              <datalist id="waste-company-suggestions">
                <option value="Biffa" />
                <option value="Veolia" />
                <option value="Suez" />
                <option value="First Mile" />
                <option value="Olleco (Cooking Oil & Food)" />
                <option value="Cleanaway" />
                <option value="Municipal / Local Council Services" />
                <option value="Commercial Waste Solutions" />
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="waste-number">
                Transfer Note / Docket / Bin Number <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <input
                id="waste-number"
                name="number"
                type="text"
                className="form-input"
                placeholder="e.g. WTN-849201, Docket #1234, or Ticket No."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="waste-type">
                Waste Category (optional)
              </label>
              <select id="waste-type" name="wasteType" className="form-select" defaultValue="General Waste">
                <option value="General Waste">General Waste (Black Bin / Landfill)</option>
                <option value="Food & Organic Waste">Food & Organic Waste</option>
                <option value="Used Cooking Oil (FOG)">Used Cooking Oil / Grease (FOG)</option>
                <option value="Dry Mixed Recycling (DMR)">Dry Mixed Recycling (DMR)</option>
                <option value="Cardboard & Paper">Cardboard & Paper</option>
                <option value="Glass Bottles & Jars">Glass Bottles & Jars</option>
                <option value="Sanitary / Clinical Waste">Sanitary / Clinical Waste</option>
                <option value="Other">Other / Special Disposal</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="waste-remarks">
                Remarks / Notes (optional)
              </label>
              <input
                id="waste-remarks"
                name="remarks"
                type="text"
                className="form-input"
                placeholder="e.g. 2 x 1100L bins collected, oil drum replaced"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Transfer Note / Receipt Photo (optional)
              </label>
              <PhotoUpload name="photoUrl" />
            </div>

            <button
              id="btn-log-waste"
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 4 }}
              disabled={pending}
            >
              {pending ? (
                "Saving…"
              ) : (
                <>
                  <Plus size={14} /> Log Waste Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="toast-container">
          <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
