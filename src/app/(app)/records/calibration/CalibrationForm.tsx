"use client";

import { useState, useTransition, useRef } from "react";
import { createCalibration } from "@/app/actions";
import { Toast } from "@/components/PhotoUpload";
import { Plus } from "lucide-react";

interface Device {
  id: string;
  name: string;
}

export default function CalibrationForm({ devices }: { devices: Device[] }) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      try {
        await createCalibration(fd);
        formRef.current?.reset();
        setToast({ msg: "Calibration log saved.", type: "success" });
      } catch {
        setToast({ msg: "Failed to save calibration entry.", type: "error" });
      }
    });
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Log Calibration Check</div>
      </div>
      <form ref={formRef} action={handleSubmit}>
        <div className="form-grid form-grid-1" style={{ gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="cal-date">Calibration Date</label>
            <input id="cal-date" name="date" type="date" className="form-input" defaultValue={today} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cal-device">Device Calibrated</label>
            <select id="cal-device" name="deviceId" className="form-select" required>
              <option value="">— Select device —</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cal-next">Next Calibration Due Date</label>
            <input id="cal-next" name="nextCalibrationDate" type="date" className="form-input" required />
          </div>

          <button id="btn-submit-cal" type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : <><Plus size={14} /> Save Log</>}
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
