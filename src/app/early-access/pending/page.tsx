import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EarlyAccessRestartButton } from "@/components/early-access-restart-button";

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

          <div className="mt-10 border-t border-[var(--border-subtle)] pt-6 text-sm text-[var(--ink-muted)]">
            <p className="font-medium text-[var(--foreground)]">Wrong email?</p>
            <p className="mt-1">
              If you entered the wrong email address, you can start again with a different email.
            </p>
            <div className="mt-3">
              <EarlyAccessRestartButton />
            </div>
          </div>

          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
          >
            ← Back to homepage
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
