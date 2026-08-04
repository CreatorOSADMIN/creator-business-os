import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { SocialLinks } from "@/components/contact/social-links";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the CreatorOS team for Early Access questions, privacy requests, or press inquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Contact", item: `${siteUrl}/contact` },
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
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <Eyebrow>Get in touch</Eyebrow>
              <h1 className="mt-6 text-balance font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
                Contact
              </h1>
              <p className="mt-8 max-w-xl text-balance border-t border-border pt-8 text-lg leading-relaxed text-text-muted">
                Questions about Early Access, privacy requests, or press inquiries — we read every
                message.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-14 rounded-2xl border border-border bg-bg-elevated p-8 sm:p-10">
                <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                  Email
                </p>
                <a
                  href="mailto:creator.os.communications@gmail.com"
                  className="mt-3 inline-block font-display text-xl font-bold text-text transition-colors hover:text-accent sm:text-2xl"
                >
                  creator.os.communications@gmail.com
                </a>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 rounded-2xl border border-border bg-bg-elevated p-8 sm:p-10">
                <p className="text-center font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                  Follow CreatorOS
                </p>
                <SocialLinks />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
