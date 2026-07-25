"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function AdminCreatorsError({
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
      title="We couldn't load creators."
      message="Something went wrong while loading this data. Please try again."
      onRetry={reset}
      homeHref="/admin/creators"
    />
  );
}
