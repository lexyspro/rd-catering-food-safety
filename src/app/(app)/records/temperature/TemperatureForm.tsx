"use client";

import { useState, useTransition, useRef } from "react";
import { createTemperatureReading } from "@/app/actions";
import { PhotoUpload, Toast } from "@/components/PhotoUpload";
import { Plus, Info } from "lucide-react";

interface Device {
  id: string;
  name: string;
  type: string;
  minTemp: number;
  maxTemp: number;
}

export default function TemperatureForm({ devices }: { devices: Device[] }) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "warning" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleDeviceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const dev = devices.find((d) => d.id === e.target.value);
    setSelectedDevice(dev || null);
  }

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      try {
        const res = await createTemperatureReading(fd);
        formRef.current?.reset();
        setSelectedDevice(null);
        if (res.isFlagged) {
          setToast({ msg: "Temperature recorded but was FLAGGED as out of range!", type: "warning" });
        } else {
          setToast({ msg: "Temperature reading logged successfully.", type: "success" });
        }
      } catch {
        setToast({ msg: "Failed to log reading.", type: "error" });
      }
    });
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Record Temperature</div>
      </div>
      <form ref={formRef} action={handleSubmit}>
        <div className="form-grid form-grid-1" style={{ gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="temp-date">Date</label>
            <input id="temp-date" name="date" type="date" className="form-input" defaultValue={today} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="temp-device">Device Name</label>
            <select id="temp-device" name="deviceId" className="form-select" onChange={handleDeviceChange} required>
              <option value="">— Select device —</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.type.replace("_", " ")})</option>
              ))}
            </select>
          </div>

          {selectedDevice && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--color-surface-2)",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              <Info size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
              <span>
                Acceptable limits: <strong>{selectedDevice.minTemp}°C to {selectedDevice.maxTemp}°C</strong>
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="temp-time">Time</label>
            <select id="temp-time" name="time" className="form-select" required>
              <option value="AM">AM Check</option>
              <option value="PM">PM Check</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="temp-val">Temperature Reading (°C)</label>
            <input id="temp-val" name="tempCelsius" type="number" step="0.1" className="form-input" placeholder="e.g. 2.4" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="temp-remarks">Remarks (optional)</label>
            <textarea id="temp-remarks" name="remarks" className="form-textarea" placeholder="If flagged out of range, note corrective actions here…" />
          </div>

          <div className="form-group">
            <label className="form-label">Photo Evidence (optional)</label>
            <PhotoUpload name="photoUrl" />
          </div>

          <button id="btn-submit-temp" type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : <><Plus size={14} /> Log Temperature</>}
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
