"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Only allow redirecting back to a relative, same-app path. Rejects absolute
 * URLs and protocol-relative URLs (e.g. "//evil.com") to prevent an open
 * redirect via a crafted `?from=` query parameter.
 */
function sanitizeRedirectTarget(value: string | null): string {
  if (!value) return "/admin";
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = sanitizeRedirectTarget(searchParams.get("from"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        setSubmitting(false);
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-dark)] px-6">
      <div className="card w-full max-w-sm p-8 shadow-[var(--shadow-lg)]">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent)] font-mono-label text-xs font-semibold text-[#08100e]">
          OS
        </span>
        <h1 className="mt-6 font-display text-2xl tracking-tight">Admin sign in</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">CreatorOS administration panel</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
