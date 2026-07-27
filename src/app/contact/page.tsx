import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="font-mono-label text-xs uppercase text-[var(--accent)]">
            Contact
          </p>

          <h1 className="mt-3 font-display text-4xl tracking-tight">
            Get in touch
          </h1>

          <p className="mt-6 text-[var(--ink-muted)]">
            For questions about the CreatorOS Early Access program, privacy
            requests, or press inquiries, reach us at:
          </p>

          <div className="mt-8 space-y-4">
            <p className="text-lg font-medium">
              <span className="block text-sm text-[var(--ink-muted)]">
                Name
              </span>
              Ferretti William
            </p>

            <p className="text-lg font-medium">
              <span className="block text-sm text-[var(--ink-muted)]">
                Email
              </span>
              <a
                href="mailto:ferrettiwilliam68@gmail.com"
                className="text-[var(--accent)] hover:underline"
              >
                ferrettiwilliam68@gmail.com
              </a>
            </p>

            <p className="text-lg font-medium">
              <span className="block text-sm text-[var(--ink-muted)]">
                Phone
              </span>
              <a
                href="tel:+393923502977"
                className="text-[var(--accent)] hover:underline"
              >
                +39 392 350 2977
              </a>
            </p>

            <p className="text-lg font-medium">
              <span className="block text-sm text-[var(--ink-muted)]">
                LinkedIn
              </span>
              <a
                href="https://www.linkedin.com/in/william-ferretti-97b326385/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                William Ferretti
              </a>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}