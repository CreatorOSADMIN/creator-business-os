"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QUESTION_CATEGORIES } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { AskQuestionModal } from "./ask-question-modal";

export interface QuestionListItem {
  id: string;
  username: string;
  question: string;
  slug: string;
  category: string | null;
  publishedAt: string | null;
  excerpt: string;
}

const TABS = [
  { value: "latest", label: "Latest Questions" },
  { value: "recently_answered", label: "Most Recent Answers" },
] as const;

export function QuestionsExplorer({ initialQuestions }: { initialQuestions: QuestionListItem[] }) {
  const [questions, setQuestions] = useState<QuestionListItem[]>(initialQuestions);
  const [total, setTotal] = useState(initialQuestions.length);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("latest");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const pageSize = 12;
  // The server component already fetched the default (unfiltered, page 1)
  // list for this render. Re-issuing that same request on mount served no
  // purpose other than briefly replacing correct SSR data with itself —
  // and, worse, racing it against a stale response if the admin API cache
  // hadn't caught up yet. Only fetch once the user actually changes a filter.
  const isFirstRun = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      category,
      sort: tab,
      page: String(page),
      pageSize: String(pageSize),
    });
    try {
      const res = await fetch(`/api/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(
          data.questions.map((q: { id: string; username: string; question: string; slug: string; category: string | null; publishedAt: string | null; answer: string | null }) => ({
            id: q.id,
            username: q.username,
            question: q.question,
            slug: q.slug,
            category: q.category,
            publishedAt: q.publishedAt,
            excerpt: q.answer ? q.answer.slice(0, 160) : "",
          }))
        );
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [search, category, tab, page]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      load();
      if (search) trackEvent("questions_search", { query: search });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, tab, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search questions…"
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            trackEvent("question_ask_open", { location: "questions_page" });
            setModalKey((k) => k + 1);
            setModalOpen(true);
          }}
          className="shrink-0 rounded-full bg-accent px-6 py-2.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
        >
          Ask a Question
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setCategory("");
            setPage(1);
          }}
          className={`rounded-full border px-3.5 py-1.5 font-mono-ui text-[11px] uppercase tracking-[0.1em] transition-colors ${
            category === ""
              ? "border-accent text-accent"
              : "border-border text-text-muted hover:border-border-strong hover:text-text"
          }`}
        >
          All
        </button>
        {QUESTION_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 font-mono-ui text-[11px] uppercase tracking-[0.1em] transition-colors ${
              category === c
                ? "border-accent text-accent"
                : "border-border text-text-muted hover:border-border-strong hover:text-text"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setTab(t.value);
              setPage(1);
            }}
            className={`-mb-px border-b-2 px-1 pb-3 font-mono-ui text-xs uppercase tracking-[0.15em] transition-colors ${
              tab === t.value ? "border-accent text-text" : "border-transparent text-text-faint hover:text-text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading && questions.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-muted">Loading…</p>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-text-muted">No questions found yet.</p>
            <button
              type="button"
              onClick={() => {
                setModalKey((k) => k + 1);
                setModalOpen(true);
              }}
              className="mt-4 rounded-full border border-border-strong px-5 py-2 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent"
            >
              Be the first to ask
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/questions/${q.slug}`}
                className="group rounded-xl border border-border bg-bg-elevated p-5 transition-colors hover:border-border-strong"
              >
                {q.category && (
                  <span className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-accent">
                    {q.category}
                  </span>
                )}
                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-text group-hover:text-accent">
                  {q.question}
                </h3>
                {q.excerpt && <p className="mt-2 line-clamp-2 text-sm text-text-muted">{q.excerpt}</p>}
                <div className="mt-4 flex items-center justify-between font-mono-ui text-[11px] uppercase tracking-[0.1em] text-text-faint">
                  <span>Asked by {q.username}</span>
                  {q.publishedAt && <span>{new Date(q.publishedAt).toLocaleDateString()}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-border px-4 py-2 font-mono-ui text-xs uppercase tracking-[0.1em] text-text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-mono-ui text-xs text-text-faint">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full border border-border px-4 py-2 font-mono-ui text-xs uppercase tracking-[0.1em] text-text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <AskQuestionModal
        key={modalKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={() => {
          setPage(1);
        }}
      />
    </div>
  );
}
