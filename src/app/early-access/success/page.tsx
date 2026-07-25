import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "You're on the list" };

export default async function EarlyAccessSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ref?: string }>;
}) {
  const { id, ref } = await searchParams;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const referralLink = ref ? `${siteUrl}/early-access?ref=${ref}` : null;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            ✓
          </div>
          <h1 className="mt-6 font-display text-4xl tracking-tight">You&apos;re on the list.</h1>
          <p className="mt-4 text-[var(--ink-muted)]">
            Thank you for joining the CreatorOS Early Access Program. We are building the
            platform and will keep you updated about the next steps.
          </p>

          {id && (
            <div className="mt-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 text-left text-sm">
              <p className="font-mono-label text-xs uppercase text-[var(--ink-muted)]">
                Reference
              </p>
              <p className="mt-1 font-mono text-[var(--foreground)]">{id}</p>
              {referralLink && (
                <>
                  <p className="mt-4 font-mono-label text-xs uppercase text-[var(--ink-muted)]">
                    Your referral link
                  </p>
                  <p className="mt-1 break-all font-mono text-[var(--accent)]">{referralLink}</p>
                  <p className="mt-2 text-xs text-[var(--ink-muted)]">
                    Share it with other creators — referral benefits will be confirmed as the
                    program develops.
                  </p>
                </>
              )}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
            <Link href="/" className="text-[var(--accent)] hover:underline">
              ← Back to homepage
            </Link>
            <Link href="/updates" className="text-[var(--accent)] hover:underline">
              See what&apos;s next →
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
