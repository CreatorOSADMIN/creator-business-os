"use client";

import { useEffect, useState } from "react";
import { CONTENT_ANALYSIS_STATUSES } from "@/lib/constants";

interface HistoryItem {
  id: string;
  platform: string;
  goal: string;
  videoCount: number;
  status: string;
  createdAt: string;
  reportAvailable: boolean;
}

type LoadState = "loading" | "ready" | "error";

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

function statusLabel(status: string): string {
  return (CONTENT_ANALYSIS_STATUSES as readonly string[]).includes(status)
    ? STATUS_LABELS[status]
    : status;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Compact, read-only list of the current anonymous visitor's previously
 * submitted analyses, sourced from GET /api/content-analysis (the
 * database, not sessionStorage). Items are informational only: the
 * simulated report flow still hands off via sessionStorage (see
 * content-analysis.ts / analysis-form.tsx), so a persisted history row
 * has no session payload to open and isn't rendered as a link.
 */
export function AnalysisHistory() {
  const [state, setState] = useState<LoadState>("loading");
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/content-analysis", { method: "GET" });
        if (!res.ok) throw new Error("request failed");
        const data = await res.json();
        if (cancelled) return;
        setItems(Array.isArray(data.analyses) ? data.analyses : []);
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-bg-elevated p-6">
        <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
          Loading history…
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-bg-elevated p-6">
        <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
          Analysis history
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Couldn&apos;t load your previous analyses right now. You can still start a new one
          above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-bg-elevated p-6">
      <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
        Analysis history
      </p>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">No analyses yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono-ui text-xs uppercase tracking-[0.1em] text-text">
                  {item.platform}
                </span>
                <span className="text-xs text-text-faint">{item.goal}</span>
                <span className="text-xs text-text-faint">
                  {item.videoCount} {item.videoCount === 1 ? "video" : "videos"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-ui text-xs uppercase tracking-[0.1em] text-text-muted">
                  {statusLabel(item.status)}
                </span>
                <span className="text-xs text-text-faint">{formatDate(item.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
