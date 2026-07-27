import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GOFUNDME_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Development updates and roadmap for CreatorOS — built in the open, and dependent on community support to keep going.",
  alternates: { canonical: "/updates" },
};

const ROADMAP = [
  {
    phase: "Phase 1",
    status: "In progress",
    title: "Foundation & early access",
    body: "Core platform architecture, creator onboarding, and the early access program that shapes what we build next.",
  },
  {
    phase: "Phase 2",
    status: "Planned",
    title: "Unified analytics",
    body: "Pulling data from the platforms creators actually use into a single, coherent view — replacing today's illustrative preview with real numbers.",
  },
  {
    phase: "Phase 3",
    status: "Planned",
    title: "Insight & recommendations",
    body: "Understanding the why behind growth, not just the what — surfacing what's working and what needs attention.",
  },
  {
    phase: "Phase 4",
    status: "Future",
    title: "Brand discovery",
    body: "Helping creators get discovered by the brands and agencies looking for exactly what they do.",
  },
] as const;

export default function UpdatesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-[var(--border-subtle)]">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <p className="font-mono-label text-xs uppercase text-[var(--accent)]">Updates</p>
            <h1 className="mt-3 font-display text-4xl tracking-tight">
              Building CreatorOS in the open.
            </h1>
            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--ink-muted)]">
              <p>
                This page tracks where CreatorOS actually stands — what&apos;s built, what&apos;s
                next, and how the project is funded. No polished announcements, just an honest
                account of progress, updated as the project itself develops.
              </p>
              <p>
                CreatorOS is self-funded and community-supported. Development speed depends
                directly on the resources available to it, so we&apos;d rather be upfront about
                that than imply a bigger team or budget than we have.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="font-mono-label text-xs uppercase text-[var(--accent)]">Roadmap</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
              Where we are, and where we&apos;re headed.
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
              Timelines are intentionally not fixed dates — they depend on funding and creator
              feedback. This roadmap will be updated as phases progress.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ROADMAP.map((item) => (
                <div key={item.phase} className="rounded-xl border border-[var(--border-subtle)] p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-label text-xs text-[var(--ink-muted)]">
                      {item.phase}
                    </span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="mt-3 font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface-dark)] text-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-mono-label text-xs uppercase text-white/50">Support the project</p>
                <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
                  CreatorOS depends on funding to keep moving.
                </h2>
                <ul className="mt-6 space-y-2 text-sm text-white/70">
                  <li>— We&apos;re building without outside investment, on a limited budget</li>
                  <li>— Every contribution goes directly toward development time and infrastructure</li>
                  <li>— Supporters help decide which parts of the roadmap move faster</li>
                </ul>
              </div>
              {GOFUNDME_URL ? (
                <a
                  href={GOFUNDME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[var(--surface-dark)] transition hover:bg-white/90"
                >
                  Support on GoFundMe
                </a>
              ) : (
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[var(--surface-dark)] transition hover:bg-white/90"
                >
                  Get in touch to support us
                </Link>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <p className="text-sm text-[var(--ink-muted)]">
              Want to be part of shaping the product instead?{" "}
              <Link
                href="/early-access"
                className="font-medium text-[var(--foreground)] underline decoration-[var(--border-subtle)] underline-offset-4 hover:decoration-[var(--accent)]"
              >
                Join Early Access
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
