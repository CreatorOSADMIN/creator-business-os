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
        <DevelopmentStatus />
        <EarlyAccessBand progress={progress} goal={goal} />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-[var(--border-subtle)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-mono-label text-xs uppercase text-[var(--accent)]">
            Now building — early access open
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Build smarter.
            <br />
            Grow with data.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-[var(--ink-muted)]">
            CreatorOS is a platform in development that will help creators understand their
            audience, their content, and their growth — across every platform they publish on.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <TrackedLink
              href="/early-access"
              event="cta_click"
              eventProps={{ location: "hero" }}
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
            >
              Join Early Access
            </TrackedLink>
            <Link
              href="#problem"
              className="text-sm font-medium text-[var(--foreground)] underline decoration-[var(--border-subtle)] underline-offset-4 hover:decoration-[var(--accent)]"
            >
              Learn more
            </Link>
          </div>
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
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
      <p className="font-mono-label text-[11px] uppercase text-[var(--ink-muted)]">
        A preview of what we&apos;re building
      </p>
      <div className="mt-4 space-y-4">
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
    },
    {
      title: "No clear signal",
      body: "It's hard to tell why one video takes off and another doesn't, when the data lives in five different places.",
    },
    {
      title: "Growth by guesswork",
      body: "Without a unified view, improving as a creator often comes down to trial and error rather than evidence.",
    },
  ];
  return (
    <section id="problem" className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono-label text-xs uppercase text-[var(--accent)]">The problem</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
          Creating today means managing chaos, not just content.
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {points.map((point) => (
            <div key={point.title}>
              <h3 className="font-medium">{point.title}</h3>
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
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono-label text-xs uppercase text-[var(--accent)]">What we&apos;re building</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
          One system, built with creators from day one.
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
          CreatorOS is early — we&apos;re transparent about that. Today, we&apos;re assembling the
          foundation: bringing together data, analysis, insight, and growth tools into a single
          product, shaped directly by the first creators who join us.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={item.title} className="rounded-xl border border-[var(--border-subtle)] p-5">
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

function DevelopmentStatus() {
  const stages = [
    { label: "Foundation & early access", state: "In progress" },
    { label: "Unified analytics", state: "Planned" },
    { label: "Insight & recommendations", state: "Planned" },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono-label text-xs uppercase text-[var(--accent)]">Project status</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
          CreatorOS is currently in development.
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
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
          className="mt-6 inline-block text-sm font-medium text-[var(--foreground)] underline decoration-[var(--border-subtle)] underline-offset-4 hover:decoration-[var(--accent)]"
        >
          See the full roadmap →
        </Link>
      </div>
    </section>
  );
}

function EarlyAccessBand({ progress, goal }: { progress: number; goal: number }) {
  return (
    <section className="bg-[var(--surface-dark)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono-label text-xs uppercase text-white/50">Early access</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
              CreatorOS is currently inviting a limited number of creators to join its early
              access program.
            </h2>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li>— Early access to the platform as it&apos;s built</li>
              <li>— A direct line to influence what we build next</li>
              <li>
                — 50% off your first three months once paid plans launch, subject to final
                program terms
              </li>
            </ul>
            <EarlyAccessProgress progress={progress} goal={goal} />
          </div>
          <Link
            href="/early-access"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[var(--surface-dark)] transition hover:bg-white/90"
          >
            Join the Early Access Program
          </Link>
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
