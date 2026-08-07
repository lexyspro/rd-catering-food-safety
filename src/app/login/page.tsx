"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Lock, Mail, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} id="login-form">
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email address
        </label>
        <div style={{ position: "relative" }}>
          <Mail
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-dim)",
              pointerEvents: "none",
            }}
          />
          <input
            id="email"
            type="email"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="you@rdcatering.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div style={{ position: "relative" }}>
          <Lock
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-dim)",
              pointerEvents: "none",
            }}
          />
          <input
            id="password"
            type="password"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
      </div>

      {error && (
        <div
          className="form-error"
          role="alert"
          style={{ fontSize: 13, gap: 6 }}
        >
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <button
        id="login-btn"
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ marginTop: 4 }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: 14,
                height: 14,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
                display: "inline-block",
              }}
            />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-shell">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img
            src="/logo.svg"
            alt="RD Catering Logo"
            className="login-logo-img"
            style={{ width: 52, height: 52, objectFit: "contain" }}
          />
          <div>
            <div className="login-heading">RD Catering</div>
            <div className="login-sub">Food Safety & Compliance System</div>
          </div>
        </div>

        <Suspense fallback={
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
            <div style={{ width: 24, height: 24, border: "2px solid var(--color-border)", borderTop: "2px solid var(--color-primary)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p
          style={{
            marginTop: 28,
            fontSize: 11,
            color: "var(--color-text-dim)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Internal use only. Unauthorised access is prohibited.
          <br />
          Contact your administrator to reset your password.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
