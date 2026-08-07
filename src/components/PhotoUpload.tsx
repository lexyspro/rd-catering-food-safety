"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  name?: string;
  onUpload?: (url: string) => void;
  onClear?: () => void;
  value?: string;
}

export function PhotoUpload({ name = "photoUrl", onUpload, onClear, value }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setPreview(url);
      onUpload?.(url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function clearPhoto() {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Hidden value field for server actions */}
      <input type="hidden" name={name} value={preview || ""} />

      {preview ? (
        <div className="photo-preview" style={{ maxHeight: 160 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Uploaded photo" style={{ width: "100%", height: 160, objectFit: "cover" }} />
          <button
            type="button"
            onClick={clearPhoto}
            style={{
              position: "absolute",
              top: 8, right: 8,
              background: "rgba(0,0,0,0.6)",
              border: "none",
              borderRadius: "50%",
              padding: 4,
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className={`photo-upload-zone ${uploading ? "drag-over" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, border: "2px solid var(--color-border)", borderTop: "2px solid var(--color-primary)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              <span style={{ fontSize: 12 }}>Uploading…</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Upload size={20} />
              <span>Drop photo here or <strong>click to browse</strong></span>
              <span style={{ fontSize: 11 }}>PNG, JPG, WEBP · Max 5 MB</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <div className="form-error" style={{ marginTop: 6 }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className={`toast ${type}`}>
      {type === "success" ? <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> : <AlertCircle size={16} style={{ color: type === "error" ? "var(--color-danger)" : "var(--color-warning)" }} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-text-dim)", cursor: "pointer" }}>
        <X size={14} />
      </button>
    </div>
  );
}
