"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function AdminDashboardError({
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
    <ErrorState
      title="We couldn't load the dashboard."
      message="Something went wrong while loading this data. Please try again."
      onRetry={reset}
      homeHref="/admin"
    />
  );
}
