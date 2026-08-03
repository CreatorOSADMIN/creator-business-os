import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Marquee } from "@/components/landing/marquee";
import { getEarlyAccessProgress } from "@/lib/early-access-progress";
import { TrackEventOnMount } from "@/components/analytics/track-event-on-mount";
import { TrackedLink } from "@/components/analytics/tracked-link";

// Keeps the Early Access progress bar fresh without a client-side fetch or
// polling: the homepage revalidates on this cadence and re-reads the real
// verified-creator count from the database.
export const revalidate = 60;

const PLATFORMS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "Twitch",
  "X",
  "LinkedIn",
  "Facebook",
  "Patreon",
  "Substack",
];

const PROBLEMS = [
  {
    n: "01",
    title: "Data lives in a dozen tabs",
    body: "YouTube Studio, Instagram Insights, TikTok Analytics, Patreon, Substack — none of them talk to each other, and none of them talk to your revenue.",
  },
  {
    n: "02",
    title: "Growth decisions made on gut feel",
    body: "Without a unified view, it's guesswork which platform, format, or post is actually moving your creator business forward.",
  },
  {
    n: "03",
    title: "Revenue and content are disconnected",
    body: "Views and follower counts don't tell you what's paying the bills. CreatorOS connects performance to income — and brand deals to real ROI.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your platforms",
    body: "Link YouTube, Instagram, TikTok, Twitch, X, and more in a couple of minutes. Read-only, revocable anytime.",
  },
  {
    n: "02",
    title: "See it in one dashboard",
    body: "Analytics, audience growth, and brand deals normalized across every platform you publish to — no more tab-switching.",
  },
  {
    n: "03",
    title: "Grow on evidence",
    body: "Spot what's actually working and put your time into the content, platforms, and deals that compound.",
  },
];

export default async function HomePage() {
  const { progress, goal } = await getEarlyAccessProgress();
  const progressPct = Math.round(progress);

  const STATS = [
    { value: `${progressPct}%`, label: "Early access spots filled" },
    { value: goal.toLocaleString(), label: "Spots in the first cohort" },
    { value: String(PLATFORMS.length), label: "Platforms unified into one view" },
    { value: "1", label: "Dashboard for the whole business" },
  ];

  return (
    <>
      <SiteHeader />
      <TrackEventOnMount event="homepage_view" />
      <main className="flex-1 bg-bg">
        {/* Hero */}
        <section className="px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>Coming soon — free early access</Eyebrow>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-balance font-display text-[clamp(2.75rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.04em] text-text">
                The business OS
                <br />
                for <span className="text-accent">creators.</span>
              </h1>
            </Reveal>

            <div className="mt-10 flex flex-col gap-10 border-t border-border pt-10 lg:flex-row lg:items-end lg:justify-between">
              <Reveal delay={160} className="max-w-md">
                <p className="text-balance text-lg leading-relaxed text-text-muted">
                  CreatorOS is an upcoming creator business dashboard for anyone building an
                  audience across YouTube, Instagram, TikTok, Twitch, X, and beyond — analytics,
                  brand deals, and revenue in one place, so you grow on evidence, not guesswork.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <TrackedLink
                    href="/early-access"
                    event="early_access_click"
                    eventProps={{ location: "hero" }}
                    className="rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
                  >
                    Join Free Early Access
                  </TrackedLink>
                  <TrackedLink
                    href="/updates"
                    event="cta_click"
                    eventProps={{ location: "hero_secondary" }}
                    className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text"
                  >
                    See what&apos;s coming →
                  </TrackedLink>
                </div>
              </Reveal>
            </div>

            <Reveal delay={320}>
              <div className="mx-auto mt-16 max-w-sm">
                <div className="flex items-center justify-between font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                  <span>Free Early Access</span>
                  <span>
                    {progressPct}% of {goal.toLocaleString()} spots filled
                  </span>
                </div>
                <div className="mt-3 h-px w-full overflow-hidden bg-border">
                  <div
                    className="h-full bg-accent transition-[width] duration-1000 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                  />
                </div>
                <p className="mt-4 text-center text-xs leading-relaxed text-text-faint">
                  No cost to join. CreatorOS will launch on a freemium model — early members lock
                  in founding-member benefits before it opens to everyone.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <Marquee items={PLATFORMS.map((p) => `Unifying ${p}`)} />

        {/* Why CreatorOS — editorial numbered rows, not cards */}
        <section id="problem" className="px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>Why CreatorOS</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-text sm:text-5xl">
                Growing a creator business shouldn&apos;t mean living in a dozen different apps.
              </h2>
            </Reveal>

            <div className="mt-16 border-t border-border">
              {PROBLEMS.map((item, i) => (
                <Reveal key={item.n} delay={i * 90}>
                  <div className="group grid grid-cols-1 gap-4 border-b border-border py-8 transition-colors sm:grid-cols-12 sm:gap-8 sm:py-10">
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

        {/* How it works */}
        <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-text sm:text-5xl">
                Three steps to a clearer picture of your business.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 90}>
                  <div className="border-t border-border-strong pt-6">
                    <span className="font-display text-sm font-bold text-accent">{step.n}</span>
                    <h3 className="mt-3 font-display text-lg font-bold text-text">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy — editorial pull statement */}
        <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <Eyebrow>The Philosophy</Eyebrow>
              <p className="mt-6 text-balance font-display text-2xl font-medium italic leading-snug tracking-[-0.01em] text-text sm:text-4xl">
                &ldquo;Views and follower counts don&apos;t tell you what&apos;s paying the
                bills. Growth you can&apos;t measure is growth you can&apos;t repeat.&rdquo;
              </p>
              <TrackedLink
                href="/about"
                event="cta_click"
                eventProps={{ location: "philosophy" }}
                className="mt-8 inline-block font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text"
              >
                Read more about CreatorOS →
              </TrackedLink>
            </Reveal>
          </div>
        </section>

        {/* By the numbers */}
        <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>By the numbers</Eyebrow>
            </Reveal>

            <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-border pt-12 md:grid-cols-4">
              {STATS.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 90}>
                  <p className="font-display text-5xl font-bold tracking-[-0.03em] text-text sm:text-6xl">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm leading-snug text-text-muted">{stat.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <h2 className="text-balance font-display text-4xl font-bold tracking-[-0.03em] text-text sm:text-6xl">
                Ready to see your business clearly?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-text-muted">
                CreatorOS is built for creators, streamers, and influencers who treat their
                audience like a business. Join the free waitlist now — early members help shape
                the product and lock in founding-member perks before public launch.
              </p>
              <div className="mt-10">
                <TrackedLink
                  href="/early-access"
                  event="early_access_click"
                  eventProps={{ location: "final_cta" }}
                  className="inline-block rounded-full bg-accent px-8 py-3.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
                >
                  Join Free Early Access
                </TrackedLink>
              </div>
              <p className="mt-8 font-mono-ui text-xs italic tracking-wide text-text-faint">
                Free to join. Every platform. No guesswork.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
