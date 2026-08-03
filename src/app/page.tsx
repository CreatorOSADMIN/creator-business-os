import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { getEarlyAccessProgress } from "@/lib/early-access-progress";
import { TrackEventOnMount } from "@/components/analytics/track-event-on-mount";
import { TrackedLink } from "@/components/analytics/tracked-link";

// Keeps the Early Access progress bar fresh without a client-side fetch or
// polling: the homepage revalidates on this cadence and re-reads the real
// verified-creator count from the database.
export const revalidate = 60;

const PLATFORMS = ["YouTube", "TikTok", "Instagram"];

const PROBLEMS = [
  {
    n: "01",
    title: "Data lives in three apps",
    body: "YouTube Studio, TikTok Analytics, Instagram Insights — none of them talk to each other, and none of them talk to your revenue.",
  },
  {
    n: "02",
    title: "Growth decisions made on gut feel",
    body: "Without a unified view, it's guesswork which platform, format, or post is actually moving your business forward.",
  },
  {
    n: "03",
    title: "Revenue and content are disconnected",
    body: "Views and follower counts don't tell you what's paying the bills. CreatorOS connects performance to income.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your platforms",
    body: "Link YouTube, TikTok, and Instagram in a couple of minutes. Read-only, revocable anytime.",
  },
  {
    n: "02",
    title: "See it in one dashboard",
    body: "Views, engagement, and audience growth normalized across platforms — no more tab-switching.",
  },
  {
    n: "03",
    title: "Grow on evidence",
    body: "Spot what's actually working and put your time into the content and platforms that compound.",
  },
];

export default async function HomePage() {
  const { progress, goal } = await getEarlyAccessProgress();
  const progressPct = Math.round(progress);

  return (
    <>
      <SiteHeader />
      <TrackEventOnMount event="homepage_view" />
      <main className="flex-1 bg-bg">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:pt-28">
          <div
            aria-hidden
            className="animate-glow-pulse pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
          />
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 font-mono-ui text-xs uppercase tracking-widest text-text-muted">
                The Business OS for Creators
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight text-text sm:text-7xl">
                Your growth,
                <br />
                on <span className="text-accent">one dashboard.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-text-muted">
                CreatorOS unifies your YouTube, TikTok, and Instagram data into a single view —
                so you grow your creator business on evidence, not guesswork.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <TrackedLink
                  href="/early-access"
                  event="early_access_click"
                  eventProps={{ location: "hero" }}
                  className="rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-widest text-bg transition-transform hover:scale-[1.03]"
                >
                  Request Early Access
                </TrackedLink>
                <TrackedLink
                  href="/updates"
                  event="cta_click"
                  eventProps={{ location: "hero_secondary" }}
                  className="font-mono-ui text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text"
                >
                  See what&apos;s coming →
                </TrackedLink>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mx-auto mt-16 max-w-md">
                <div className="flex items-center justify-between font-mono-ui text-xs uppercase tracking-widest text-text-faint">
                  <span>Early Access</span>
                  <span>
                    {progressPct}% of {goal.toLocaleString()} spots filled
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated-2">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={380}>
              <p className="mt-10 font-mono-ui text-xs uppercase tracking-widest text-text-faint">
                Unifying data from {PLATFORMS.join(" · ")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Why CreatorOS */}
        <section id="problem" className="border-t border-border px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <span className="font-mono-ui text-xs uppercase tracking-widest text-accent">
                Why CreatorOS
              </span>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Growing a creator business shouldn&apos;t mean living in four different apps.
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
              {PROBLEMS.map((item, i) => (
                <Reveal key={item.n} delay={i * 100}>
                  <div className="h-full bg-bg-elevated p-8 transition-colors hover:bg-bg-elevated-2">
                    <span className="font-mono-ui text-sm text-text-faint">{item.n}</span>
                    <h3 className="mt-4 font-display text-xl font-bold text-text">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <span className="font-mono-ui text-xs uppercase tracking-widest text-accent">
                How it works
              </span>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Three steps to a clearer picture of your business.
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 100}>
                  <div className="relative pl-8">
                    <span className="font-display absolute left-0 top-0 text-sm font-bold text-accent">
                      {step.n}
                    </span>
                    <div className="border-l border-border pl-8">
                      <h3 className="font-display text-lg font-bold text-text">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border px-6 py-24 sm:py-32">
          <Reveal>
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-bg-elevated px-8 py-16 text-center sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
              />
              <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Ready to see your business clearly?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-text-muted">
                Request early access and be one of the first creators building on CreatorOS.
              </p>
              <div className="mt-8">
                <TrackedLink
                  href="/early-access"
                  event="early_access_click"
                  eventProps={{ location: "final_cta" }}
                  className="inline-block rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-widest text-bg transition-transform hover:scale-[1.03]"
                >
                  Request Early Access
                </TrackedLink>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
