"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { QUESTION_STATUS_LABELS } from "@/lib/constants";
import type { QuestionStatusValue } from "@/lib/constants";

interface QuestionRow {
  id: string;
  username: string;
  question: string;
  slug: string | null;
  status: string;
  category: string | null;
  createdAt: string;
  publishedAt: string | null;
}

const TABS: { value: "" | QuestionStatusValue; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"" | QuestionStatusValue>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status, search, page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`/api/admin/questions?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions);
      setTotal(data.total);
    }
    setLoading(false);
  }, [status, search, page]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleDelete(row: QuestionRow) {
    if (!window.confirm(`Delete this question from ${row.username}? This cannot be undone.`)) return;
    setDeletingId(row.id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/questions/${row.id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage({ type: "success", text: "Question deleted." });
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        setActionMessage({ type: "error", text: data.error || "Unable to delete this question." });
      }
    } catch {
      setActionMessage({ type: "error", text: "Unable to delete this question." });
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl tracking-tight">Questions</h1>
        <p className="text-sm text-[var(--ink-muted)]">{total} total</p>
      </div>

      <div className="mt-5 flex items-center gap-2 border-b border-[var(--border-subtle)]">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              status === tab.value
                ? "border-[var(--accent)] text-[var(--foreground)]"
                : "border-transparent text-[var(--ink-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card mt-5 flex flex-wrap gap-3 p-4">
        <input
          className="input max-w-xs flex-1"
          placeholder="Search username or question…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {actionMessage && (
        <p className={`mt-3 text-sm ${actionMessage.type === "success" ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {actionMessage.text}
        </p>
      )}

      <div className="card-flush mt-5 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="table-head text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--ink-muted)]">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && questions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-0">
                  <div className="empty-state">
                    <p className="text-sm">No questions match these filters.</p>
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              questions.map((row) => (
                <tr key={row.id} className="table-row">
                  <td className="max-w-sm px-4 py-3">
                    <Link href={`/admin/questions/${row.id}`} className="font-medium text-[var(--foreground)] hover:underline">
                      {row.question}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-muted)]">{row.username}</td>
                  <td className="px-4 py-3 text-[var(--ink-muted)]">{row.category || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${row.status === "published" ? "badge-accent" : "badge-neutral"}`}>
                      {QUESTION_STATUS_LABELS[row.status as QuestionStatusValue] ?? row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-muted)]">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 whitespace-nowrap text-sm">
                      <Link href={`/admin/questions/${row.id}`} className="text-[var(--accent)] hover:underline">
                        {row.status === "pending" ? "Answer" : "Edit"}
                      </Link>
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={deletingId === row.id}
                        className="text-[var(--danger)] hover:underline disabled:opacity-50"
                      >
                        {deletingId === row.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 text-sm">
          <button className="btn btn-ghost disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span className="text-[var(--ink-muted)]">
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-ghost disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
