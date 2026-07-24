"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EarlyAccessRestartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRestart() {
    setLoading(true);
    await fetch("/api/early-access/reset", { method: "POST" });
    router.push("/early-access");
    router.refresh();
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
