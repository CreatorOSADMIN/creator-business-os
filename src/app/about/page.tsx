import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { TrackedLink } from "@/components/analytics/tracked-link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn what CreatorOS is building: a unified analytics and growth platform that helps creators run their content like a business.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    n: "01",
    title: "Evidence over guesswork",
    body: "Creators deserve the same clarity a real business gets — what's working, what isn't, and why.",
  },
  {
    n: "02",
    title: "Every platform, one view",
    body: "YouTube, Instagram, TikTok, Twitch, X, and beyond — unified instead of scattered across a dozen tabs.",
  },
  {
    n: "03",
    title: "Built with creators, not just for them",
    body: "Early access members help shape the roadmap before CreatorOS ever opens to the public.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <section className="px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>About CreatorOS</Eyebrow>
              <h1 className="mt-6 max-w-3xl text-balance font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
                Built for creators who treat their audience like a business.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-8 max-w-2xl text-balance border-t border-border pt-8 text-lg leading-relaxed text-text-muted">
                CreatorOS is an upcoming creator business dashboard that brings analytics, brand
                deals, and revenue into one place — so growth decisions come from evidence, not
                guesswork.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>What we believe</Eyebrow>
            </Reveal>

            <div className="mt-16 border-t border-border">
              {VALUES.map((item, i) => (
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

        <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <h2 className="text-balance font-display text-3xl font-bold tracking-[-0.03em] text-text sm:text-5xl">
                Help shape CreatorOS from day one.
              </h2>
              <div className="mt-10">
                <TrackedLink
                  href="/early-access"
                  event="early_access_click"
                  eventProps={{ location: "about_cta" }}
                  className="inline-block rounded-full bg-accent px-8 py-3.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
                >
                  Join Free Early Access
                </TrackedLink>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
