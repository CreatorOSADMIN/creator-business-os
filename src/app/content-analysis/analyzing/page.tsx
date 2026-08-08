"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Eyebrow } from "@/components/landing/eyebrow";

const POLL_INTERVAL_MS = 2500;

interface StatusResponse {
  status: string;
  reportAvailable: boolean;
}

type ViewState = "queued" | "processing" | "failed" | "not-found";

const VIEW_COPY: Record<ViewState, { heading: string; body: string }> = {
  queued: {
    heading: "Queued",
    body: "Your analysis is in the queue and will start shortly.",
  },
  processing: {
    heading: "Analyzing…",
    body: "We're working through your submitted videos. This can take a few minutes.",
  },
  failed: {
    heading: "Analysis failed",
    body: "Something went wrong while processing this analysis. Please start a new one.",
  },
  "not-found": {
    heading: "Analysis not found",
    body: "We couldn't find that analysis for this browser. Please start a new one.",
  },
};

function viewStateFor(status: string): ViewState {
  if (status === "processing") return "processing";
  if (status === "failed") return "failed";
  return "queued";
}

/**
 * Polls the persisted analysis (created by POST /api/content-analysis) for
 * its real status. There is no scraper/worker yet, so this page is expected
 * to sit in "queued"/"processing" indefinitely until a later patch adds one
 * — it never fabricates progress or a completed result to move itself
 * along. Only a genuinely COMPLETED record navigates to the report; a
 * genuinely FAILED one shows an error state instead.
 */
function AnalyzingStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [view, setView] = useState<ViewState>(id ? "queued" : "not-found");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // No id at all is handled by the initial state above — nothing to poll.
    if (!id) return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/content-analysis/${encodeURIComponent(id as string)}`, {
          method: "GET",
        });

        if (cancelled) return;

        if (res.status === 404) {
          setView("not-found");
          return;
        }
        if (!res.ok) {
          // Transient/server error — keep the current view and retry on
          // the next tick rather than surfacing a hard failure state.
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }

        const data: StatusResponse = await res.json();

        if (data.status === "completed") {
          router.push(`/content-analysis/report?id=${encodeURIComponent(id as string)}`);
          return;
        }
        if (data.status === "failed") {
          setView("failed");
          return;
        }

        setView(viewStateFor(data.status));
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, router]);

  const copy = VIEW_COPY[view];
  const isTerminal = view === "failed" || view === "not-found";

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[80vh] flex-1 items-center bg-bg px-6 sm:px-10">
        <div className="mx-auto w-full max-w-xl text-center">
          <Eyebrow>Analyzing</Eyebrow>
          <p
            aria-live="polite"
            className="mt-6 text-balance font-display text-2xl font-bold tracking-[-0.02em] text-text sm:text-4xl"
          >
            {copy.heading}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
            {copy.body}
          </p>

          {!isTerminal && (
            <div
              role="progressbar"
              aria-label="Analysis in progress"
              className="mt-10 h-px w-full overflow-hidden bg-border"
            >
              <div className="h-full w-1/3 animate-pulse bg-accent" />
            </div>
          )}

          {isTerminal && (
            <a
              href="/content-analysis"
              className="mt-10 inline-block rounded-full border border-border-strong px-6 py-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              Start a new analysis
            </a>
          )}
        </div>
      </main>
    </>
  );
}

export default function ContentAnalysisAnalyzingPage() {
  return (
    <Suspense>
      <AnalyzingStatus />
    </Suspense>
  );
}
