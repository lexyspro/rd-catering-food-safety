"use client";

import { useState, useTransition, useRef } from "react";
import { createSupplier, createPurchase } from "@/app/actions";
import { PhotoUpload, Toast } from "@/components/PhotoUpload";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  location: string | null;
}

export default function SupplierForm({ suppliers }: { suppliers: Supplier[] }) {
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const newSupRef = useRef<HTMLFormElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  function handlePurchase(fd: FormData) {
    startTransition(async () => {
      try {
        await createPurchase(fd);
        formRef.current?.reset();
        setToast({ msg: "Purchase logged successfully.", type: "success" });
      } catch {
        setToast({ msg: "Failed to log purchase. Please try again.", type: "error" });
      }
    });
  }

  function handleNewSupplier(fd: FormData) {
    startTransition(async () => {
      try {
        await createSupplier(fd);
        newSupRef.current?.reset();
        setShowNewSupplier(false);
        setToast({ msg: "Supplier added to directory.", type: "success" });
      } catch {
        setToast({ msg: "Failed to add supplier.", type: "error" });
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* New Purchase Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Log Purchase</div>
        </div>
        <form ref={formRef} action={handlePurchase}>
          <div className="form-grid form-grid-1" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="purchase-date">Date of Purchase</label>
              <input id="purchase-date" name="date" type="date" className="form-input" defaultValue={today} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="purchase-item">Item Purchased</label>
              <input id="purchase-item" name="itemPurchased" type="text" className="form-input" placeholder="e.g. Chicken breast (10kg)" required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="purchase-supplier">Supplier</label>
              <select id="purchase-supplier" name="supplierId" className="form-select" required>
                <option value="">— Select supplier —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              <PhotoUpload name="photoUrl" />
            </div>

            <button id="btn-log-purchase" type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Saving…" : <><Plus size={14} /> Log Purchase</>}
            </button>
          </div>
        </form>
      </div>

      {/* Add Supplier */}
      <div className="card">
        <button
          type="button"
          className="card-header"
          style={{ width: "100%", cursor: "pointer", background: "none", border: "none", color: "inherit", textAlign: "left" }}
          onClick={() => setShowNewSupplier(!showNewSupplier)}
          id="btn-toggle-new-supplier"
        >
          <div className="card-title">Add New Supplier</div>
          {showNewSupplier ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showNewSupplier && (
          <form ref={newSupRef} action={handleNewSupplier} style={{ marginTop: 16 }}>
            <div className="form-grid form-grid-1" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="sup-name">Company Name</label>
                <input id="sup-name" name="name" type="text" className="form-input" placeholder="e.g. Fresh Farms Ltd" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="sup-contact">Contact</label>
                <input id="sup-contact" name="contact" type="text" className="form-input" placeholder="Phone or email" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="sup-location">Location</label>
                <input id="sup-location" name="location" type="text" className="form-input" placeholder="City or address" />
              </div>
              <button id="btn-add-supplier" type="submit" className="btn btn-ghost" disabled={pending}>
                {pending ? "Saving…" : <><Plus size={14} /> Add Supplier</>}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
