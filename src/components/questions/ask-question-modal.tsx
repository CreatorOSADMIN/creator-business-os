"use client";

import { useEffect, useState } from "react";
import { askQuestionSchema } from "@/lib/validation";
import { QUESTION_CATEGORIES } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-accent focus:outline-none focus-visible:outline-none";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const initialState = { username: "", question: "", category: "", website: "" };

export function AskQuestionModal({ open, onClose, onSubmitted }: Props) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Captured once per mount. The parent remounts this component (via a
  // changing `key`) each time the modal opens, so this timestamp — and all
  // the state above — is naturally fresh without an effect-driven reset.
  const [renderedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = askQuestionSchema.safeParse({
      username: form.username,
      question: form.question,
      category: form.category || undefined,
      website: form.website,
      formRenderedAt: renderedAt ?? undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.ok) {
        trackEvent("question_ask_submit", { category: form.category || "none" });
        setSuccess(true);
        onSubmitted?.();
      } else {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-question-title"
        className="relative w-full max-w-lg rounded-2xl border border-border bg-bg-elevated p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-elevated-2 hover:text-text"
        >
          ✕
        </button>

        {success ? (
          <div className="py-6 text-center">
            <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-accent">Thanks!</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-text">Your question is in.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
              We review every question before it goes live. Once it&apos;s answered, it&apos;ll be
              published on the Questions page.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-accent px-6 py-2.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 id="ask-question-title" className="font-display text-2xl font-bold text-text">
              Ask a question.
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              No account needed — just a username. We&apos;ll review it before it&apos;s published.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
              {/* Honeypot — hidden from real users via CSS, bots often fill every field. */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="website">Leave this field empty</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="username" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-faint">
                  Username
                </label>
                <input
                  id="username"
                  className={inputClass}
                  placeholder="e.g. creatorjane"
                  maxLength={40}
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                />
                {errors.username && <p className="mt-1 text-xs text-accent">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="category" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-faint">
                  Category (optional)
                </label>
                <select
                  id="category"
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option value="">Select a category</option>
                  {QUESTION_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="question" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-faint">
                  Your question
                </label>
                <textarea
                  id="question"
                  rows={4}
                  className={inputClass}
                  placeholder="What do you want to know?"
                  maxLength={1000}
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                />
                {errors.question && <p className="mt-1 text-xs text-accent">{errors.question}</p>}
              </div>

              {serverError && <p className="text-sm text-accent">{serverError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-full bg-accent px-6 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit question"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
