"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ErrorState } from "@/components/error-state";

export default function EarlyAccessPendingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <ErrorState
          title="We couldn't load this page."
          message="Something went wrong while checking your confirmation status. Please try again."
          onRetry={reset}
          homeHref="/early-access"
        />
      </main>
      <SiteFooter />
    </>
  );
}
