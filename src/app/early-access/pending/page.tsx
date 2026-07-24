import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function EarlyAccessPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            ✉
          </div>
          <h1 className="mt-6 font-display text-4xl tracking-tight">Check your email to confirm your registration.</h1>
          <p className="mt-4 text-[var(--ink-muted)]">
            We&apos;ve sent a confirmation link{email ? <> to <strong>{email}</strong></> : null}. Open it
            to finish joining the CreatorOS Early Access Program. The link expires in 24 hours.
          </p>
          <p className="mt-4 text-sm text-[var(--ink-muted)]">
            Didn&apos;t get it? Check your spam folder, or submit the form again with the same
            email to receive a new link.
          </p>

          <Link
            href="/"
            className="mt-10 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
          >
            ← Back to homepage
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
