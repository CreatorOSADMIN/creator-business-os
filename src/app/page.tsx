import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getEarlyAccessProgress } from "@/lib/early-access-progress";
import { TrackEventOnMount } from "@/components/analytics/track-event-on-mount";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

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
        <HowItWorks />
        <ProductPreview />
        <Audience />
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
        className="glow-orb pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full"
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <span className="badge badge-accent eyebrow animate-fade-up stagger-1">
          Now building — early access open
        </span>
        <h1 className="animate-fade-up stagger-2 mt-9 text-balance font-display text-6xl leading-[0.98] tracking-tight sm:text-8xl">
          Your creator business.
          <br />
          <span className="text-[var(--ink-muted)]">Finally run like a company.</span>
        </h1>
        <p className="animate-fade-up stagger-3 mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink-muted)]">
          CreatorOS is the operating system behind the numbers — one system of record for
          every platform, every metric, every decision. Built for creators who&apos;ve
          outgrown spreadsheets and gut feel.
        </p>
        <div className="animate-fade-up stagger-4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <TrackedLink
            href="/early-access"
            event="early_access_click"
            eventProps={{ location: "hero" }}
            className="btn btn-primary cta-premium rounded-full px-8 py-3.5 text-sm"
          >
            Request Early Access
          </TrackedLink>
          <Link
            href="#problem"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/80 transition hover:text-[var(--foreground)]"
          >
            See how it works
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <p className="mt-8 font-mono-label text-[11px] uppercase text-[var(--ink-muted)]">
          No credit card · Shaped by the first creators who join
        </p>

        <HeroPreview />
      </div>
      <PlatformMarquee />
    </section>
  );
}

function PlatformMarquee() {
  const platforms = ["YouTube", "TikTok", "Instagram", "Twitch", "X"];
  const loop = [...platforms, ...platforms];
  return (
    <div className="marquee-viewport relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--surface)] py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--surface)] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--surface)] to-transparent"
      />
      <p className="sr-only">Built for creators publishing on YouTube, TikTok, Instagram, Twitch, and X.</p>
      <div className="marquee-track" aria-hidden>
        {loop.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="mx-8 shrink-0 font-mono-label text-sm uppercase text-[var(--ink-muted)]"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroPreview() {
  const rows = [
    { label: "YouTube", value: 62, note: "watch-time trending up" },
    { label: "TikTok", value: 84, note: "best performing this week" },
    { label: "Instagram", value: 41, note: "needs a closer look" },
  ];
  return (
    <div className="card-glass animate-hero-float mt-16 w-full max-w-3xl rounded-2xl p-2 text-left">
      <div className="flex items-center gap-1.5 border-b border-[var(--border-subtle)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
        <span className="ml-3 font-mono-label text-[10px] uppercase text-[var(--ink-muted)]">
          CreatorOS — Overview
        </span>
      </div>
      <div className="grid gap-px overflow-hidden rounded-xl sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{row.label}</span>
              <span className="font-mono-label text-[10px] text-[var(--ink-muted)]">{row.value}%</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--accent-soft)]">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${row.value}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-[var(--ink-muted)]">{row.note}</p>
          </div>
        ))}
      </div>
      <p className="px-4 py-3 text-center text-[11px] text-[var(--ink-muted)]">
        Illustrative preview — cross-platform insight is on our roadmap, not yet live.
      </p>
    </div>
  );
}

function Problem() {
  const points = [
    {
      title: "Fragmented by design",
      body: "Every platform ships its own dashboard, its own definitions, its own blind spots. None of them talk to each other.",
      icon: (
        <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: "No single source of truth",
      body: "Why one video takes off and another doesn't stays a mystery when the evidence is scattered across five tabs.",
      icon: <path d="M4 18V9m6 9V4m6 14v-7m6 7V6" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      title: "Run like a hobby, not a company",
      body: "Serious creators make six-figure decisions on instinct, because no tool treats their channel like a real business.",
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
      <RevealOnScroll className="mx-auto max-w-6xl px-6 py-32">
        <p className="section-eyebrow font-mono-label text-xs uppercase text-[var(--accent)]">The problem</p>
        <h2 className="mt-5 max-w-2xl text-balance font-display text-4xl tracking-tight sm:text-6xl">
          You&apos;re not an influencer. You&apos;re a founder without an operating system.
        </h2>
        <div className="mt-20 grid gap-x-10 gap-y-14 sm:grid-cols-3">
          {points.map((point, i) => (
            <div key={point.title} className="relative border-t border-[var(--border-subtle)] pt-6">
              <span className="font-mono-label text-[11px] uppercase text-[var(--ink-muted)]">
                0{i + 1}
              </span>
              <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {point.icon}
                </svg>
              </div>
              <h3 className="mt-5 font-medium">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{point.body}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}

function Solution() {
  const items = [
    { title: "Data", body: "Every platform's numbers, pulled into one system of record — not five browser tabs." },
    { title: "Analysis", body: "Direct, apples-to-apples comparison across channels, so patterns stop hiding in the gaps." },
    { title: "Insight", body: "The why behind the growth, not just the what — the layer platform analytics never gives you." },
    { title: "Operations", body: "The tools to act on what you learn, built alongside the first creators using it." },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)]">
      <RevealOnScroll className="mx-auto max-w-6xl px-6 py-32">
        <p className="section-eyebrow font-mono-label text-xs uppercase text-[var(--accent)]">The solution</p>
        <h2 className="mt-5 max-w-2xl text-balance font-display text-4xl tracking-tight sm:text-6xl">
          From content creation to business operations.
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-[var(--ink-muted)]">
          CreatorOS is infrastructure, not another analytics widget. We&apos;re building the
          operating layer underneath your channel — assembled in the open, with the creators
          who&apos;ll depend on it.
        </p>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={item.title} className="card card-interactive rounded-xl p-7">
              <span className="font-mono-label text-xs text-[var(--ink-muted)]">0{i + 1}</span>
              <h3 className="mt-5 font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect your channels",
      body: "Link YouTube, TikTok, and Instagram once. CreatorOS becomes the single place your numbers live.",
    },
    {
      step: "02",
      title: "See one unified picture",
      body: "Every platform, normalized into one dashboard — no more reconciling metrics by hand.",
    },
    {
      step: "03",
      title: "Operate on evidence",
      body: "Make the calls that grow the business — content, timing, focus — backed by data, not gut feel.",
    },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
      <RevealOnScroll className="mx-auto max-w-6xl px-6 py-32">
        <p className="section-eyebrow font-mono-label text-xs uppercase text-[var(--accent)]">How it works</p>
        <h2 className="mt-5 max-w-xl text-balance font-display text-4xl tracking-tight sm:text-6xl">
          Set up once. Operate with clarity every day after.
        </h2>
        <div className="mt-20 grid gap-12 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="relative pl-0">
              <span className="figure-xl block text-6xl text-[var(--border-strong)] sm:text-7xl">{s.step}</span>
              <h3 className="mt-5 font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{s.body}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}

function ProductPreview() {
  const metrics = [
    { label: "Total audience", value: "128.4K", delta: "+4.2%" },
    { label: "Watch-time / week", value: "312 hrs", delta: "+11%" },
    { label: "Cross-platform reach", value: "3 channels", delta: "unified" },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)]">
      <RevealOnScroll className="mx-auto max-w-6xl px-6 py-32">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="section-eyebrow font-mono-label text-xs uppercase text-[var(--accent)]">The dashboard</p>
            <h2 className="mt-5 text-balance font-display text-4xl tracking-tight sm:text-5xl">
              One dashboard. Every channel. No spreadsheets.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-[var(--ink-muted)]">
              This is a concept preview of the CreatorOS workspace — a single view of every
              platform&apos;s performance, built to feel like software you&apos;d run a real
              company on.
            </p>
          </div>
          <div className="card-glass rounded-2xl p-2">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3.5">
              <span className="font-mono-label text-[10px] uppercase text-[var(--ink-muted)]">
                Business overview
              </span>
              <span className="badge badge-neutral">Concept</span>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl sm:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label} className="bg-[var(--surface)] p-5">
                  <p className="text-xs text-[var(--ink-muted)]">{m.label}</p>
                  <p className="figure-xl mt-1.5 text-2xl">{m.value}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--accent)]">{m.delta}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 p-5">
              {["YouTube", "TikTok", "Instagram"].map((platform, i) => (
                <div key={platform} className="flex items-center gap-4">
                  <span className="w-16 shrink-0 text-xs text-[var(--ink-muted)]">{platform}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${[62, 84, 41][i]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}

function Audience() {
  const personas = [
    {
      title: "Full-time creators",
      body: "Content is the job. Decisions deserve better than vibes — across every channel you run.",
    },
    {
      title: "Multi-platform publishers",
      body: "You post to YouTube, TikTok, and Instagram in the same week and need one place that reflects it all.",
    },
    {
      title: "Growing creator businesses",
      body: "You're past the point where spreadsheets and gut feel scale. It's time for real infrastructure.",
    },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
      <RevealOnScroll className="mx-auto max-w-6xl px-6 py-32">
        <p className="section-eyebrow font-mono-label text-xs uppercase text-[var(--accent)]">Who it&apos;s for</p>
        <h2 className="mt-5 max-w-xl text-balance font-display text-4xl tracking-tight sm:text-6xl">
          Built for creators who run content like a company.
        </h2>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {personas.map((persona, i) => (
            <div key={persona.title} className="card card-interactive rounded-xl p-7">
              <span className="font-mono-label text-xs text-[var(--ink-muted)]">0{i + 1} /</span>
              <h3 className="mt-4 font-medium">{persona.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{persona.body}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}

function Faq() {
  const faqs = [
    {
      q: "What is CreatorOS?",
      a: "CreatorOS is the operating system for creator businesses: it unifies your YouTube, TikTok, and Instagram data into one system of record, so decisions run on evidence instead of five separate dashboards.",
    },
    {
      q: "Is CreatorOS live today?",
      a: "CreatorOS is in active development. Early access members get the platform as it ships, plus a direct line to shape what we build next.",
    },
    {
      q: "Which platforms will it support?",
      a: "YouTube, TikTok, and Instagram first, based on early creator feedback. Coverage expands from there as the product matures.",
    },
    {
      q: "What does early access include?",
      a: "Access to the platform as new capability ships, direct input into the roadmap, and 50% off your first three months once paid plans launch — subject to final program terms.",
    },
    {
      q: "Do I need a credit card to join?",
      a: "No. Joining the early access list is free and takes about a minute — no payment details required.",
    },
  ];
  return (
    <section className="border-b border-[var(--border-subtle)]">
      <RevealOnScroll className="mx-auto max-w-3xl px-6 py-32">
        <p className="section-eyebrow font-mono-label text-xs uppercase text-[var(--accent)]">FAQ</p>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-6xl">
          Questions, answered.
        </h2>
        <div className="mt-12">
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
      </RevealOnScroll>
    </section>
  );
}

function EarlyAccessBand({ progress, goal }: { progress: number; goal: number }) {
  return (
    <section className="relative overflow-hidden bg-[var(--surface-dark)] text-white">
      <div aria-hidden className="glow-orb pointer-events-none absolute -left-32 -bottom-32 h-96 w-96 rounded-full opacity-60" />
      <RevealOnScroll className="relative mx-auto max-w-6xl px-6 py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="section-eyebrow font-mono-label text-xs uppercase text-white/50">Early access</p>
            <h2 className="mt-5 max-w-xl text-balance font-display text-4xl tracking-tight sm:text-6xl">
              A limited number of creator businesses are being invited in.
            </h2>
            <ul className="mt-8 space-y-2.5 text-sm text-white/70">
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
            className="cta-premium inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[var(--surface-dark)] transition hover:bg-white/90"
          >
            Request Early Access
          </TrackedLink>
        </div>
      </RevealOnScroll>
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
