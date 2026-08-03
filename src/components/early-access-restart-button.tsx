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
      className="rounded-full border border-border-strong px-7 py-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Resetting…" : "Use a different email"}
    </button>
  );
}
