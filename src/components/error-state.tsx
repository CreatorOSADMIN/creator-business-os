"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/landing/eyebrow";

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
    <section className="px-6 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Error</Eyebrow>
        <h1 className="mt-6 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-text sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-text-muted">{message}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
            >
              Try again
            </button>
          )}
          <Link
            href={homeHref}
            className="rounded-full border border-border-strong px-7 py-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
