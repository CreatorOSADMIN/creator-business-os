"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { ContentAnalysisFinalCta } from "@/components/content-analysis/final-cta";
import { ContentAnalysisRealReport } from "@/components/content-analysis/real-report";
import {
  CA_GOALS,
  CA_PLATFORMS,
  CA_DEMO_STORAGE_KEY,
  type CaGoal,
  type CaPlatform,
  type ContentAnalysisSession,
} from "@/lib/content-analysis";
import {
  generateContentAnalysisReport,
  type ContentAnalysisReport,
} from "@/lib/content-analysis-engine";
import type { ContentAnalysisReportResult } from "@/lib/content-analysis-report";

// Static placeholder shown before hydration and whenever no valid demo
// session is found in sessionStorage — this is the "safe fallback" copy.
const FALLBACK_REPORT: ContentAnalysisReport = {
  contentScore: 82,
  scoreSummary:
    "This sample scores above average on hooks and visual consistency, with the clearest upside in mid-video pacing.",
  featureScores: [
    { key: "hook", label: "Hook strength", score: 88, explanation: "", confidence: 92 },
    { key: "pacing", label: "Pacing", score: 74, explanation: "", confidence: 0 },
    { key: "audio", label: "Audio clarity", score: 91, explanation: "", confidence: 0 },
    { key: "visualConsistency", label: "Visual consistency", score: 82, explanation: "", confidence: 0 },
    { key: "captionQuality", label: "Caption quality", score: 79, explanation: "", confidence: 0 },
  ],
  patterns: [
    {
      title: "Sub-3-second hook",
      body: "Your top videos open on a question or a visual surprise before any branding appears.",
    },
    {
      title: "Face-forward first frame",
      body: "Thumbnails and opening frames with a clear face outperform text-only or product-only opens.",
    },
    {
      title: "Mid-roll pattern break",
      body: "A cut, caption change, or camera-angle shift around the 40% mark correlates with retention spikes.",
    },
  ],
  blueprint: [
    { label: "Length", value: "38–52 seconds" },
    { label: "Hook", value: "Direct question in the first 2 seconds" },
    { label: "Pacing", value: "Cut or angle change every 4–6 seconds" },
    { label: "Captions", value: "On-screen text, high-contrast, bottom third" },
    { label: "CTA placement", value: "Spoken + on-screen in the final 3 seconds" },
  ],
  strengths: [
    "Strong opening hooks across most videos",
    "Consistent visual style and color palette",
    "Clear, legible on-screen captions",
  ],
  opportunities: [
    "Retention drops after the 20-second mark on longer videos",
    "Calls-to-action are inconsistent between videos",
    "Posting times vary widely across the sample",
  ],
  confidence: [
    { label: "Hook detection", value: "High", pct: 92 },
    { label: "Engagement comparison", value: "High", pct: 87 },
    { label: "Speech analysis", value: "Medium", pct: 68 },
    { label: "Color profiling", value: "Medium", pct: 71 },
  ],
};

function isCaPlatform(value: unknown): value is CaPlatform {
  return typeof value === "string" && (CA_PLATFORMS as readonly string[]).includes(value);
}

function isCaGoal(value: unknown): value is CaGoal {
  return typeof value === "string" && (CA_GOALS as readonly string[]).includes(value);
}

function readDemoSession(): ContentAnalysisSession | null {
  try {
    const raw = sessionStorage.getItem(CA_DEMO_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const candidate = parsed as Partial<ContentAnalysisSession>;
    if (!isCaPlatform(candidate.platform) || !isCaGoal(candidate.goal)) return null;
    if (!Array.isArray(candidate.videos) || candidate.videos.length === 0) return null;
    if (!candidate.videos.every((v) => typeof v === "string")) return null;

    return {
      platform: candidate.platform,
      goal: candidate.goal,
      videos: candidate.videos,
      createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString(),
    };
  } catch {
    // sessionStorage unavailable or malformed payload — fall back safely.
    return null;
  }
}

type ReportGateState =
  | { kind: "checking" }
  | { kind: "demo" }
  | { kind: "real"; result: ContentAnalysisReportResult; platform: string }
  | { kind: "unavailable" };

function isReportResultShape(value: unknown): value is ContentAnalysisReportResult {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.fetchedAt === "string" && Array.isArray(o.videos) && Array.isArray(o.failedUrls);
}

// When the URL carries a persisted analysis id (from the real
// submit → queued → analyzing flow), this page must render that
// analysis's real, persisted result — never the static/demo report —
// once it's genuinely COMPLETED. No id in the URL (e.g. a direct visit)
// keeps the previous demo-only behavior.
function useReportGate(): ReportGateState {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [state, setState] = useState<ReportGateState>(id ? { kind: "checking" } : { kind: "demo" });

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/content-analysis/${encodeURIComponent(id)}`);
        if (cancelled) return;
        if (!res.ok) {
          // Unknown/foreign id — fall back to the static demo copy rather
          // than blocking the page.
          setState({ kind: "demo" });
          return;
        }
        const data = await res.json();
        if (data.status !== "completed") {
          // Includes "failed": the analyzing page already renders a clear
          // failure state, so route there instead of showing anything
          // report-shaped here.
          router.replace(`/content-analysis/analyzing?id=${encodeURIComponent(id)}`);
          return;
        }
        if (isReportResultShape(data.result)) {
          const platform = typeof data.platform === "string" ? data.platform : "";
          setState({ kind: "real", result: data.result, platform });
        } else {
          // Completed but no usable result (missing/invalid JSON) — never
          // silently fall back to demo data for a real analysis id.
          setState({ kind: "unavailable" });
        }
      } catch {
        if (!cancelled) setState({ kind: "demo" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  return state;
}

function DemoReportBody() {
  const [report, setReport] = useState<ContentAnalysisReport>(FALLBACK_REPORT);

  useEffect(() => {
    const session = readDemoSession();
    if (!session) return;

    try {
      const generated = generateContentAnalysisReport(session);
      // One-time hydration of the real session's report, not a cascading
      // update — mirrors the reduced-motion opt-out in the analyzing page.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReport(generated);
    } catch {
      // Any unexpected shape falls back to the static placeholder already set.
    }
  }, []);

  return (
    <main className="flex-1 bg-bg">
      {/* Content Score */}
      <section className="px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>Demo Report</Eyebrow>
            <h1 className="mt-6 text-balance font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
              Your content, scored.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 flex flex-col gap-10 border-t border-border pt-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                  Content Score
                </p>
                <p className="mt-2 font-display text-7xl font-bold tracking-[-0.03em] text-text sm:text-8xl">
                  {report.contentScore}
                  <span className="text-3xl text-text-faint sm:text-4xl">/100</span>
                </p>
              </div>
              <p className="max-w-sm text-balance text-sm leading-relaxed text-text-muted">
                {report.scoreSummary}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Top Performing Patterns */}
      <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>Top Performing Patterns</Eyebrow>
            <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-text sm:text-5xl">
              What your best videos have in common.
            </h2>
          </Reveal>

          <div className="mt-16 border-t border-border">
            {report.patterns.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <div className="grid grid-cols-1 gap-4 border-b border-border py-8 sm:grid-cols-12 sm:gap-8 sm:py-10">
                  <span className="font-mono-ui text-sm text-text-faint sm:col-span-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl font-bold text-text sm:col-span-4">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-muted sm:col-span-6">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Video Blueprint */}
      <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>Ideal Video Blueprint</Eyebrow>
            <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-text sm:text-5xl">
              What your next video should look like.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-3 sm:grid-cols-2">
            {report.blueprint.map((item, i) => (
              <Reveal key={item.label} delay={i * 70}>
                <div className="h-full rounded-2xl border border-border bg-bg-elevated p-6">
                  <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold text-text">{item.value}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Strengths & Opportunities */}
      <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>Strengths &amp; Opportunities</Eyebrow>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal delay={80}>
              <div className="h-full rounded-2xl border border-border bg-bg-elevated p-8">
                <h3 className="font-display text-lg font-bold text-text">Strengths</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {report.strengths.map((s) => (
                    <li key={s} className="flex gap-3 text-sm leading-relaxed text-text-muted">
                      <span className="text-accent">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="h-full rounded-2xl border border-border bg-bg-elevated p-8">
                <h3 className="font-display text-lg font-bold text-text">Opportunities</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {report.opportunities.map((o) => (
                    <li key={o} className="flex gap-3 text-sm leading-relaxed text-text-muted">
                      <span className="text-text-faint">–</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Feature Scores */}
      <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Eyebrow>Feature Scores</Eyebrow>
            <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-text sm:text-5xl">
              Signals we measured across your videos.
            </h2>
          </Reveal>

          <div className="mt-14 flex flex-col gap-6">
            {report.featureScores.map((f, i) => (
              <Reveal key={f.key} delay={i * 60}>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text">{f.label}</p>
                    <p className="font-mono-ui text-xs text-text-faint">{f.score}/100</p>
                  </div>
                  <div className="mt-2 h-px w-full overflow-hidden bg-border">
                    <div className="h-full bg-accent" style={{ width: `${f.score}%` }} />
                  </div>
                  {f.explanation && (
                    <p className="mt-2 text-xs leading-relaxed text-text-faint">{f.explanation}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Confidence Indicators */}
      <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>Confidence Indicators</Eyebrow>
            <p className="mt-5 max-w-xl text-balance text-sm leading-relaxed text-text-muted">
              How confident this demo&apos;s model is in each part of the analysis above.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-12 md:grid-cols-4">
            {report.confidence.map((c, i) => (
              <Reveal key={c.label} delay={i * 80}>
                <p className="font-display text-4xl font-bold tracking-[-0.02em] text-text">
                  {c.pct}%
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.1em] text-accent">{c.value}</p>
                <p className="mt-1 text-sm text-text-muted">{c.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContentAnalysisFinalCta location="content_analysis_report_final_cta" />
    </main>
  );
}

function UnavailableReportBody() {
  return (
    <main className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <Eyebrow>Content Analysis</Eyebrow>
      <p className="max-w-md text-balance text-sm leading-relaxed text-text-muted">
        We couldn&apos;t load this report right now. Please start a new analysis.
      </p>
      <a
        href="/content-analysis"
        className="inline-block rounded-full border border-border-strong px-6 py-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:border-accent hover:text-accent"
      >
        Start a new analysis
      </a>
    </main>
  );
}

function ReportBody() {
  const gate = useReportGate();

  if (gate.kind === "checking") {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center bg-bg px-6">
        <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
          Loading…
        </p>
      </main>
    );
  }

  if (gate.kind === "real") {
    return <ContentAnalysisRealReport result={gate.result} platform={gate.platform} />;
  }

  if (gate.kind === "unavailable") {
    return <UnavailableReportBody />;
  }

  return <DemoReportBody />;
}

export function ContentAnalysisReportContent() {
  return (
    <Suspense>
      <ReportBody />
    </Suspense>
  );
}
