import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getEarlyAccessProgress } from "@/lib/early-access-progress";
import { TrackEventOnMount } from "@/components/analytics/track-event-on-mount";
import { TrackedLink } from "@/components/analytics/tracked-link";

// Keeps the Early Access progress bar fresh without a client-side fetch or
// polling: the homepage revalidates on this cadence and re-reads the real
// verified-creator count from the database.
export const revalidate = 60;

export default async function HomePage() {
  const { progress, goal } = await getEarlyAccessProgress();
  return (
    <>
      <SiteHeader />
      <TrackEventOnMount event="homepage_view" />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Solution />
        <Audience />
        <DevelopmentStatus />
        <Faq />
        <EarlyAccessBand progress={progress} goal={goal} />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-grid-fade">
      <div
        aria-hidden
        className="glow-orb pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full"
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-24 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="badge badge-accent eyebrow">Now building — early access open</span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            The operating system for creators who grow on data,
            <span className="text-[var(--ink-muted)]"> not guesswork.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--ink-muted)]">
            CreatorOS brings every platform&apos;s numbers — YouTube, TikTok, Instagram, and
            more — into one clear system, built for full-time creators who are done stitching
            together five dashboards to understand what&apos;s actually working.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <TrackedLink
              href="/early-access"
              event="early_access_click"
              eventProps={{ location: "hero" }}
              className="btn btn-primary rounded-full px-6 py-3 text-sm"
            >
              Join Early Access
            </TrackedLink>
            <Link
              href="#problem"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] transition hover:text-[var(--accent)]"
            >
              See how it works
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <p className="mt-8 text-xs text-[var(--ink-muted)]">
            No credit card required · Shaped directly by the first creators who join
          </p>
        </div>
        <SignalCard />
      </div>
    </section>
  );
}

function SignalCard() {
  const rows = [
    { label: "YouTube", value: 62, note: "watch-time trending up" },
    { label: "TikTok", value: 84, note: "best performing this week" },
    { label: "Instagram", value: 41, note: "needs a closer look" },
  ];
  return (
    <div className="card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono-label text-[11px] uppercase text-[var(--ink-muted)]">
          A preview of what we&apos;re building
        </p>
        <span className="badge badge-neutral">Concept</span>
      </div>
      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{row.label}</span>
              <span className="text-[var(--ink-muted)]">{row.note}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--accent-soft)]">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${row.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--ink-muted)]">
        Illustrative preview — cross-platform insights are on our roadmap, not yet live.
      </p>
    </div>
  );
}

function Problem() {
  const points = [
    {
      title: "Fragmented data",
      body: "Creators publish across YouTube, TikTok, Instagram and more — each with its own dashboard, metrics, and blind spots.",
      icon: (
        <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: "No clear signal",
      body: "It's hard to tell why one video takes off and another doesn't, when the data lives in five different places.",
      icon: <path d="M4 18V9m6 9V4m6 14v-7m6 7V6" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      title: "Growth by guesswork",
      body: "Without a unified view, improving as a creator often comes down to trial and error rather than evidence.",
      icon: (
        <path
          d="M12 3a9 9 0 1 0 9 9M12 3v9l6.5-4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
  ];
  return (
    <section id="problem" className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono-label text-xs uppercase text-[var(--accent)]">The problem</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
          Creating today means managing chaos, not just content.
        </h2>
        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {points.map((point) => (
            <div key={point.title}>
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                {point.icon}
              </svg>
              <h3 className="mt-4 font-medium">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const items = [
    { title: "Data", body: "One place for the numbers that matter, pulled from the platforms you actually use." },
    { title: "Analysis", body: "Clear comparisons across platforms, so you can see what's actually working." },
    { title: "Insight", body: "Understand the why behind your growth, not just the what." },
    { title: "Tools", body: "Practical tools to act on what you learn — in development, built with early creators." },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono-label text-xs uppercase text-[var(--accent)]">What we&apos;re building</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
          One system, built with creators from day one.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--ink-muted)]">
          CreatorOS is early — we&apos;re transparent about that. Today, we&apos;re assembling the
          foundation: bringing together data, analysis, insight, and growth tools into a single
          product, shaped directly by the first creators who join us.
        </p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={item.title} className="card card-interactive rounded-xl p-6">
              <span className="font-mono-label text-xs text-[var(--ink-muted)]">0{i + 1}</span>
              <h3 className="mt-3 font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Audience() {
  const personas = [
    {
      title: "Full-time creators",
      body: "You've turned content into a career and need decisions backed by data, not vibes — across every channel you run.",
    },
    {
      title: "Multi-platform publishers",
      body: "You post to YouTube, TikTok, and Instagram in the same week and need one place to see what's actually moving the needle.",
    },
    {
      title: "Growing creators",
      body: "You're scaling past a few thousand followers and outgrowing spreadsheets, gut feel, and platform-native analytics tabs.",
    },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono-label text-xs uppercase text-[var(--accent)]">Who it&apos;s for</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
          Built for creators who treat this like a business.
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {personas.map((persona) => (
            <div key={persona.title} className="rounded-xl border border-[var(--border-subtle)] p-6">
              <h3 className="font-medium">{persona.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{persona.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DevelopmentStatus() {
  const stages = [
    { label: "Foundation & early access", state: "In progress" },
    { label: "Unified analytics", state: "Planned" },
    { label: "Insight & recommendations", state: "Planned" },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono-label text-xs uppercase text-[var(--accent)]">Project status</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
          CreatorOS is currently in development.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--ink-muted)]">
          We&apos;re building the first version, not maintaining a finished product. Early
          adopters help define what CreatorOS becomes — the project is alive and changes as we
          learn from the creators who join us.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {stages.map((stage) => (
            <div
              key={stage.label}
              className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm"
            >
              <span className="font-medium">{stage.label}</span>
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                {stage.state}
              </span>
            </div>
          ))}
        </div>
        <Link
          href="/updates"
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] transition hover:text-[var(--accent)]"
        >
          See the full roadmap
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

function Faq() {
  const faqs = [
    {
      q: "Is CreatorOS live today?",
      a: "CreatorOS is currently in development. Early access members get access to the platform as it's built, plus a direct line to shape the roadmap.",
    },
    {
      q: "Which platforms will it support?",
      a: "YouTube, TikTok, and Instagram are the initial focus, based on early creator feedback. Support broadens from there as the product matures.",
    },
    {
      q: "What does early access include?",
      a: "Access to the platform as new capabilities ship, direct input into what gets built next, and 50% off your first three months once paid plans launch — subject to final program terms.",
    },
    {
      q: "Do I need a credit card to join?",
      a: "No. Joining the early access list is free and takes about a minute — no payment details required.",
    },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="font-mono-label text-xs uppercase text-[var(--accent)]">FAQ</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
          Questions, answered.
        </h2>
        <div className="mt-10">
          {faqs.map((faq) => (
            <details key={faq.q} className="faq-item group py-5">
              <summary className="flex items-center justify-between gap-4">
                <span className="font-medium">{faq.q}</span>
                <svg
                  viewBox="0 0 24 24"
                  className="faq-chevron h-4 w-4 shrink-0 text-[var(--ink-muted)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)]">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function EarlyAccessBand({ progress, goal }: { progress: number; goal: number }) {
  return (
    <section className="relative overflow-hidden bg-[var(--surface-dark)] text-white">
      <div aria-hidden className="glow-orb pointer-events-none absolute -left-32 -bottom-32 h-96 w-96 rounded-full opacity-60" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono-label text-xs uppercase text-white/50">Early access</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
              CreatorOS is currently inviting a limited number of creators to join its early
              access program.
            </h2>
            <ul className="mt-7 space-y-2.5 text-sm text-white/70">
              <li className="flex gap-2.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                Early access to the platform as it&apos;s built
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                A direct line to influence what we build next
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                50% off your first three months once paid plans launch, subject to final program
                terms
              </li>
            </ul>
            <EarlyAccessProgress progress={progress} goal={goal} />
          </div>
          <TrackedLink
            href="/early-access"
            event="early_access_click"
            eventProps={{ location: "band" }}
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[var(--surface-dark)] transition hover:bg-white/90"
          >
            Join the Early Access Program
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

function EarlyAccessProgress({ progress, goal }: { progress: number; goal: number }) {
  const pct = Math.round(progress * 10) / 10;
  return (
    <div className="mt-8 max-w-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-white/80">Early access is filling up</span>
        <span className="font-mono-label text-white/50">{pct}%</span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Early access spots filled"
      >
        <div
          className="h-full rounded-full bg-[var(--highlight)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-white/50">
        Limited to the first {goal.toLocaleString("en-US")} creators.
      </p>
    </div>
  );
}
