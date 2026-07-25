"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EarlyAccessRestartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRestart() {
    setLoading(true);
    try {
      await fetch("/api/early-access/reset", { method: "POST" });
    } catch {
      // Network error — the cookie may still be set, but we still let the
      // user proceed to the form rather than leaving them stuck with no
      // feedback. Worst case, /early-access redirects them back here.
    } finally {
      router.push("/early-access");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRestart}
      disabled={loading}
      className="text-sm font-medium text-[var(--accent)] hover:underline disabled:opacity-60"
    >
      {loading ? "Resetting…" : "Use a different email"}
    </button>
  );
}
