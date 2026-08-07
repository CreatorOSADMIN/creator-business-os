"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Eyebrow } from "@/components/landing/eyebrow";

const STEPS = [
  "Loading videos...",
  "Extracting metadata...",
  "Analyzing hooks...",
  "Detecting subtitles...",
  "Analyzing speech...",
  "Detecting colors...",
  "Comparing engagement...",
  "Building content profile...",
  "Generating recommendations...",
];

// Entirely simulated — no API call, no real analysis. Purely a timed
// sequence through STEPS before redirecting to the static report page.
export default function ContentAnalysisAnalyzingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepDuration = reduced ? 150 : 850;

    if (stepIndex >= STEPS.length - 1) {
      const finish = setTimeout(
        () => router.push("/content-analysis/report"),
        stepDuration
      );
      return () => clearTimeout(finish);
    }

    const advance = setTimeout(() => setStepIndex((i) => i + 1), stepDuration);
    return () => clearTimeout(advance);
  }, [stepIndex, router]);

  const progressPct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

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
            {STEPS[stepIndex]}
          </p>

          <div
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-10 h-px w-full overflow-hidden bg-border"
          >
            <div
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-4 font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
            {progressPct}% complete
          </p>

          <ul className="mt-14 flex flex-col gap-2 text-left">
            {STEPS.map((step, i) => (
              <li
                key={step}
                className={`flex items-center gap-3 font-mono-ui text-xs uppercase tracking-[0.1em] transition-colors ${
                  i <= stepIndex ? "text-text-muted" : "text-text-faint/50"
                }`}
              >
                <span className={i <= stepIndex ? "text-accent" : "text-text-faint/50"}>
                  {i < stepIndex ? "✓" : i === stepIndex ? "→" : "·"}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
