"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function UpvoteButton({ slug, initialUpvotes }: { slug: string; initialUpvotes: number }) {
  const [totalUpvotes, setTotalUpvotes] = useState(initialUpvotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [pending, setPending] = useState(false);
  // Distinguishes "haven't checked yet" from "checked, not voted" so the
  // button doesn't briefly flash as clickable before the status check lands.
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/questions/${slug}/upvote`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setTotalUpvotes(data.totalUpvotes);
        setHasVoted(data.hasVoted);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleUpvote() {
    if (pending || hasVoted) return;
    setPending(true);
    // Optimistic update, rolled back on failure — the server response
    // (or the 409-as-success already-voted case) is still the source of
    // truth once it lands.
    setTotalUpvotes((n) => n + 1);
    setHasVoted(true);
    try {
      const res = await fetch(`/api/questions/${slug}/upvote`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setTotalUpvotes(data.totalUpvotes);
        setHasVoted(data.hasVoted);
        trackEvent("question_upvote", { slug });
      } else {
        setTotalUpvotes((n) => n - 1);
        setHasVoted(false);
      }
    } catch {
      setTotalUpvotes((n) => n - 1);
      setHasVoted(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleUpvote}
      disabled={pending || hasVoted || !checked}
      aria-pressed={hasVoted}
      title={hasVoted ? "You've upvoted this question" : "Upvote this question"}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono-ui text-xs uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed ${
        hasVoted
          ? "border-accent text-accent"
          : "border-border text-text-muted hover:border-accent hover:text-accent"
      } ${pending ? "opacity-70" : ""}`}
    >
      <span aria-hidden="true">▲</span>
      <span>
        {totalUpvotes} {totalUpvotes === 1 ? "Upvote" : "Upvotes"}
      </span>
    </button>
  );
}
