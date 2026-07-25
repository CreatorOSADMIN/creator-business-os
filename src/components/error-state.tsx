"use client";

import Link from "next/link";

export function ErrorState({
  title = "Something went wrong.",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  homeHref = "/",
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  homeHref?: string;
}) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--danger)]">
        !
      </div>
      <h1 className="mt-6 font-display text-3xl tracking-tight">{title}</h1>
      <p className="mt-4 text-[var(--ink-muted)]">{message}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            Try again
          </button>
        )}
        <Link
          href={homeHref}
          className="text-sm font-medium text-[var(--foreground)] underline decoration-[var(--border-subtle)] underline-offset-4 hover:decoration-[var(--accent)]"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
