"use client";

import { useState, useTransition, useRef } from "react";
import { Toast } from "@/components/PhotoUpload";
import { Plus } from "lucide-react";

export default function DeviceConfigForm() {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleRegister(fd: FormData) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/devices", {
          method: "POST",
          body: JSON.stringify({
            name: fd.get("name"),
            type: fd.get("type"),
            minTemp: fd.get("minTemp"),
            maxTemp: fd.get("maxTemp"),
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed");

        formRef.current?.reset();
        setToast({ msg: "Device and thresholds saved.", type: "success" });
      } catch {
        setToast({ msg: "Failed to save device.", type: "error" });
      }
    });
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Add Device / Limits</div>
      </div>
      <form ref={formRef} action={handleRegister}>
        <div className="form-grid form-grid-1" style={{ gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="dev-name">Device Name</label>
            <input id="dev-name" name="name" type="text" className="form-input" placeholder="e.g. Under-counter Fridge" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dev-type">Device Type</label>
            <select id="dev-type" name="type" className="form-select" required>
              <option value="FRIDGE">Fridge (Cold holding)</option>
              <option value="FREEZER">Freezer</option>
              <option value="HOT_HOLDING">Hot Holding Unit</option>
            </select>
          </div>

          <div className="form-grid" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="dev-min">Min Temp (°C)</label>
              <input id="dev-min" name="minTemp" type="number" step="0.1" className="form-input" placeholder="e.g. 1.6" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="dev-max">Max Temp (°C)</label>
              <input id="dev-max" name="maxTemp" type="number" step="0.1" className="form-input" placeholder="e.g. 3.3" required />
            </div>
          </div>

          <button id="btn-submit-dev" type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Adding…" : <><Plus size={14} /> Add Device</>}
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
