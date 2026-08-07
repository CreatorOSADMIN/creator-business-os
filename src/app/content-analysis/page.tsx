import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalysisForm } from "@/components/content-analysis/analysis-form";
import { ContentAnalysisFinalCta } from "@/components/content-analysis/final-cta";

export const metadata: Metadata = {
  title: "Content Analysis Demo",
  description:
    "Paste up to 10 videos from the same platform and see a preview of how CreatorOS analyzes your best content.",
  alternates: { canonical: "/content-analysis" },
};

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Connect",
    body: "Paste up to 10 links.",
  },
  {
    n: "02",
    title: "Analyze",
    body: "Our AI extracts hundreds of content signals.",
  },
  {
    n: "03",
    title: "Optimize",
    body: "Receive a blueprint of your ideal next video.",
  },
];

export default function ContentAnalysisPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        {/* Hero */}
        <section className="px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>Content Analysis Demo</Eyebrow>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-balance font-display text-[clamp(2.75rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.04em] text-text">
                Analyze Your Content
                <br />
                Like an <span className="text-accent">AI.</span>
              </h1>
            </Reveal>

            <div className="mt-10 flex flex-col gap-10 border-t border-border pt-10 lg:flex-row lg:items-end lg:justify-between">
              <Reveal delay={160} className="max-w-md">
                <p className="text-balance text-lg leading-relaxed text-text-muted">
                  Paste up to 10 videos from the same platform and discover what makes your best
                  content perform.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <TrackedLink
                  href="#analyze"
                  event="cta_click"
                  eventProps={{ location: "content_analysis_hero" }}
                  className="inline-block rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
                >
                  Start Free Analysis
                </TrackedLink>
              </Reveal>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-text sm:text-5xl">
                Three steps to your content blueprint.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {HOW_IT_WORKS.map((step, i) => (
                <Reveal key={step.n} delay={i * 90}>
                  <div className="h-full rounded-2xl border border-border bg-bg-elevated p-8">
                    <span className="font-display text-sm font-bold text-accent">{step.n}</span>
                    <h3 className="mt-4 font-display text-xl font-bold text-text">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Analysis Form */}
        <section id="analyze" className="scroll-mt-24 border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <Eyebrow>Start Free Analysis</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-text sm:text-5xl">
                Tell us where to look.
              </h2>
              <p className="mt-6 max-w-xl text-balance text-sm leading-relaxed text-text-muted">
                This is a demo — nothing is sent anywhere. Pick a platform, a goal, and paste in
                the links you want compared.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-14 rounded-2xl border border-border bg-bg-elevated p-8 sm:p-10">
                <AnalysisForm />
              </div>
            </Reveal>
          </div>
        </section>

        <ContentAnalysisFinalCta location="content_analysis_final_cta" />
      </main>
      <SiteFooter />
    </>
  );
}
