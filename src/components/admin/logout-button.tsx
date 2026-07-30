"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="mt-3 flex w-full items-center justify-center rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--ink-muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
