import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { ContentAnalysisFinalCta } from "@/components/content-analysis/final-cta";

export const metadata: Metadata = {
  title: "Your Content Analysis",
  description: "A preview of the kind of content report CreatorOS generates from your videos.",
  robots: { index: false, follow: false },
};

// Entirely static demo data — no real analysis was performed.
const PATTERNS = [
  {
    n: "01",
    title: "Sub-3-second hook",
    body: "Your top videos open on a question or a visual surprise before any branding appears.",
  },
  {
    n: "02",
    title: "Face-forward first frame",
    body: "Thumbnails and opening frames with a clear face outperform text-only or product-only opens.",
  },
  {
    n: "03",
    title: "Mid-roll pattern break",
    body: "A cut, caption change, or camera-angle shift around the 40% mark correlates with retention spikes.",
  },
];

const BLUEPRINT = [
  { label: "Length", value: "38–52 seconds" },
  { label: "Hook", value: "Direct question in the first 2 seconds" },
  { label: "Pacing", value: "Cut or angle change every 4–6 seconds" },
  { label: "Captions", value: "On-screen text, high-contrast, bottom third" },
  { label: "CTA placement", value: "Spoken + on-screen in the final 3 seconds" },
];

const STRENGTHS = [
  "Strong opening hooks across most videos",
  "Consistent visual style and color palette",
  "Clear, legible on-screen captions",
];

const OPPORTUNITIES = [
  "Retention drops after the 20-second mark on longer videos",
  "Calls-to-action are inconsistent between videos",
  "Posting times vary widely across the sample",
];

const FEATURE_SCORES = [
  { label: "Hook strength", value: 88 },
  { label: "Pacing", value: 74 },
  { label: "Audio clarity", value: 91 },
  { label: "Visual consistency", value: 82 },
  { label: "Caption quality", value: 79 },
];

const CONFIDENCE = [
  { label: "Hook detection", value: "High", pct: 92 },
  { label: "Engagement comparison", value: "High", pct: 87 },
  { label: "Speech analysis", value: "Medium", pct: 68 },
  { label: "Color profiling", value: "Medium", pct: 71 },
];

export default function ContentAnalysisReportPage() {
  return (
    <>
      <SiteHeader />
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
                    82<span className="text-3xl text-text-faint sm:text-4xl">/100</span>
                  </p>
                </div>
                <p className="max-w-sm text-balance text-sm leading-relaxed text-text-muted">
                  This sample scores above average on hooks and visual consistency, with the
                  clearest upside in mid-video pacing.
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
              {PATTERNS.map((item, i) => (
                <Reveal key={item.n} delay={i * 90}>
                  <div className="grid grid-cols-1 gap-4 border-b border-border py-8 sm:grid-cols-12 sm:gap-8 sm:py-10">
                    <span className="font-mono-ui text-sm text-text-faint sm:col-span-2">
                      {item.n}
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
              {BLUEPRINT.map((item, i) => (
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
                    {STRENGTHS.map((s) => (
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
                    {OPPORTUNITIES.map((o) => (
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
              {FEATURE_SCORES.map((f, i) => (
                <Reveal key={f.label} delay={i * 60}>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text">{f.label}</p>
                      <p className="font-mono-ui text-xs text-text-faint">{f.value}/100</p>
                    </div>
                    <div className="mt-2 h-px w-full overflow-hidden bg-border">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${f.value}%` }}
                      />
                    </div>
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
              {CONFIDENCE.map((c, i) => (
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
      <SiteFooter />
    </>
  );
}
