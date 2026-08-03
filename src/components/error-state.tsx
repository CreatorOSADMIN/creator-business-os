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
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
      <div>
        {onRetry && <button onClick={onRetry}>Try again</button>}
        <Link href={homeHref}>Back to homepage</Link>
      </div>
    </div>
  );
}
