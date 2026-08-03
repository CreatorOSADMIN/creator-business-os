"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ErrorState } from "@/components/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <ErrorState
          title="Something went wrong."
          message="We hit an unexpected error loading this page. Please try again."
          onRetry={reset}
        />
      </main>
      <SiteFooter />
    </>
  );
}
