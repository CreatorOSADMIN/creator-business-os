"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ErrorState } from "@/components/error-state";

export default function EarlyAccessError({
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
      <main className="flex-1">
        <ErrorState
          title="We couldn't load Early Access."
          message="Something went wrong while checking your registration. Please try again."
          onRetry={reset}
        />
      </main>
      <SiteFooter />
    </>
  );
}
