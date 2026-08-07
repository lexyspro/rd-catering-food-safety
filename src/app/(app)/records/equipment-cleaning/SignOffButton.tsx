"use client";

import { useTransition, useState } from "react";
import { approveEquipmentCleaning, approveGeneralCleaning } from "@/app/actions";
import { CheckCircle2 } from "lucide-react";
import { Toast } from "@/components/PhotoUpload";

interface SignOffButtonProps {
  id: string;
  type: "equipment" | "general";
}

export default function SignOffButton({ id, type }: SignOffButtonProps) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function handleSignOff() {
    startTransition(async () => {
      try {
        if (type === "equipment") await approveEquipmentCleaning(id);
        else await approveGeneralCleaning(id);
        setToast({ msg: "Record signed off.", type: "success" });
      } catch {
        setToast({ msg: "Sign-off failed.", type: "error" });
      }
    });
  }

  return (
    <>
      <button
        id={`btn-signoff-${id}`}
        className="btn btn-success btn-sm"
        onClick={handleSignOff}
        disabled={pending}
      >
        <CheckCircle2 size={13} />
        {pending ? "…" : "Sign Off"}
      </button>
      {toast && (
        <div className="toast-container">
          <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </>
  );
}
