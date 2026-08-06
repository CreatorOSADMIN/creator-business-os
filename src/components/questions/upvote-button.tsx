"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { getCachedVote, setCachedVote } from "@/lib/voted-questions-cache";

export function UpvoteButton({
  slug,
  initialUpvotes,
  size = "md",
  onVoteChange,
}: {
  slug: string;
  initialUpvotes: number;
  // "sm" is used on the /questions list cards, which are tighter on space
  // than the full question page — same styling language, smaller footprint.
  size?: "sm" | "md";
  // Lets a parent list (QuestionsExplorer) react to this card's own vote —
  // e.g. re-rank the list — without owning the vote state itself.
  onVoteChange?: (data: { totalUpvotes: number; hasVoted: boolean }) => void;
}) {
  const [totalUpvotes, setTotalUpvotes] = useState(initialUpvotes);
  // Lazy-initialized from the cache so a returning visitor's vote renders
  // correctly on the very first frame instead of flashing unvoted first.
  // The background fetch below is still the actual source of truth.
  const [hasVoted, setHasVoted] = useState(() => getCachedVote(slug) ?? false);
  const [pending, setPending] = useState(false);
  // Distinguishes "haven't checked yet" from "checked, not voted" so the
  // button doesn't briefly flash as clickable before the status check lands.
  const [checked, setChecked] = useState(() => getCachedVote(slug) !== null);

  // Re-derive the cached-vote state when `slug` changes (e.g. this instance
  // is reused across questions) without an extra effect + re-render commit —
  // this is React's documented "adjusting state when a prop changes"
  // pattern, and it keeps the sync work out of an Effect entirely.
  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    const cached = getCachedVote(slug);
    setHasVoted(cached ?? false);
    setChecked(cached !== null);
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/questions/${slug}/upvote`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setTotalUpvotes(data.totalUpvotes);
        setHasVoted(data.hasVoted);
        setCachedVote(slug, data.hasVoted);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleUpvote(event: MouseEvent<HTMLButtonElement>) {
    // Cards on /questions wrap this button inside a <Link> to the question
    // page — stop the click from also triggering that navigation.
    event.preventDefault();
    event.stopPropagation();
    if (pending || !checked) return;

    const wasVoted = hasVoted;
    const method = wasVoted ? "DELETE" : "POST";

    setPending(true);
    // Optimistic update, rolled back on failure — the server response
    // (or the already-voted/already-removed idempotent case) is still the
    // source of truth once it lands.
    setTotalUpvotes((n) => (wasVoted ? n - 1 : n + 1));
    setHasVoted(!wasVoted);
    try {
      const res = await fetch(`/api/questions/${slug}/upvote`, { method });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setTotalUpvotes(data.totalUpvotes);
        setHasVoted(data.hasVoted);
        setCachedVote(slug, data.hasVoted);
        onVoteChange?.(data);
        if (!wasVoted) trackEvent("question_upvote", { slug });
      } else {
        setTotalUpvotes((n) => (wasVoted ? n + 1 : n - 1));
        setHasVoted(wasVoted);
      }
    } catch {
      setTotalUpvotes((n) => (wasVoted ? n + 1 : n - 1));
      setHasVoted(wasVoted);
    } finally {
      setPending(false);
    }
  }

  const sizeClasses = size === "sm" ? "gap-1.5 px-3 py-1.5 text-[11px]" : "gap-2 px-4 py-2 text-xs";

  return (
    <button
      type="button"
      onClick={handleUpvote}
      disabled={pending || !checked}
      aria-pressed={hasVoted}
      title={hasVoted ? "Remove your upvote" : "Upvote this question"}
      className={`inline-flex items-center rounded-full border font-mono-ui uppercase tracking-[0.1em] transition-colors transition-transform duration-150 active:scale-95 disabled:cursor-not-allowed ${sizeClasses} ${
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
