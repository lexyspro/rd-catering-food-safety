"use client";

import { useState, useTransition, useRef } from "react";
import { Toast } from "@/components/PhotoUpload";
import { Plus } from "lucide-react";

export default function UserForm() {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleRegister(fd: FormData) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          body: JSON.stringify({
            name: fd.get("name"),
            email: fd.get("email"),
            password: fd.get("password"),
            role: fd.get("role"),
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed");
        }

        formRef.current?.reset();
        setToast({ msg: "User account created.", type: "success" });
      } catch (err: any) {
        setToast({ msg: err.message || "Failed to create user.", type: "error" });
      }
    });
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Create Account</div>
      </div>
      <form ref={formRef} action={handleRegister}>
        <div className="form-grid form-grid-1" style={{ gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="user-name">Full Name</label>
            <input id="user-name" name="name" type="text" className="form-input" placeholder="e.g. John Doe" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-email">Email Address</label>
            <input id="user-email" name="email" type="email" className="form-input" placeholder="e.g. john@rdcatering.com" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-pass">Password</label>
            <input id="user-pass" name="password" type="password" className="form-input" placeholder="••••••••" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-role">Role</label>
            <select id="user-role" name="role" className="form-select" required>
              <option value="STAFF">Staff</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button id="btn-submit-user" type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Creating…" : <><Plus size={14} /> Create User</>}
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
