import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { GOFUNDME_URL } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Updates & Roadmap",
  description:
    "CreatorOS updates, product development, feature releases and roadmap — built in the open, and dependent on community support to keep going.",
  alternates: { canonical: "/updates" },
};

const ROADMAP = [
  { phase: "Phase 1", status: "In progress", title: "Foundation & early access" },
  { phase: "Phase 2", status: "Planned", title: "Unified analytics" },
  { phase: "Phase 3", status: "Planned", title: "Insight & recommendations" },
  { phase: "Phase 4", status: "Future", title: "Brand discovery" },
] as const;

export default function UpdatesPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Updates", item: `${siteUrl}/updates` },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        <section className="px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>Roadmap</Eyebrow>
              <h1 className="mt-6 max-w-2xl text-balance font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
                What&apos;s coming to CreatorOS.
              </h1>
              <p className="mt-8 max-w-xl text-balance border-t border-border pt-8 text-lg leading-relaxed text-text-muted">
                CreatorOS updates, product development, feature releases and roadmap — built in
                the open. Here&apos;s where things stand today, and what&apos;s next.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="border-t border-border">
              {ROADMAP.map((item, i) => (
                <Reveal key={item.phase} delay={i * 90}>
                  <div className="grid grid-cols-1 gap-4 border-b border-border py-8 sm:grid-cols-12 sm:gap-8 sm:py-10">
                    <span className="font-mono-ui text-sm text-text-faint sm:col-span-2">
                      {item.phase}
                    </span>
                    <h3 className="font-display text-xl font-bold text-text sm:col-span-6">
                      {item.title}
                    </h3>
                    <span className="font-mono-ui text-xs uppercase tracking-[0.15em] text-accent sm:col-span-4 sm:text-right">
                      {item.status}
                    </span>
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
                Help CreatorOS keep building.
              </h2>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                {GOFUNDME_URL ? (
                  <a
                    href={GOFUNDME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
                  >
                    Support on GoFundMe
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="rounded-full bg-accent px-7 py-3 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.03]"
                  >
                    Get in touch to support us
                  </Link>
                )}
                <TrackedLink
                  href="/early-access"
                  event="early_access_click"
                  eventProps={{ location: "updates_cta" }}
                  className="rounded-full border border-border-strong px-7 py-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent"
                >
                  Join Early Access
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
