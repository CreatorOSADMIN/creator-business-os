import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EarlyAccessRestartButton } from "@/components/early-access-restart-button";
import { EarlyAccessPendingStatus } from "@/components/early-access-pending-status";
import { getRegisteredCreatorIdFromCookie } from "@/lib/creator-session";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export default async function EarlyAccessPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string }>;
}) {
  const { email, sent } = await searchParams;
  const emailSent = sent !== "0";
  // Only worth polling if this browser is the one that registered — a
  // direct visit to this URL with no session cookie has nothing to watch.
  const hasSession = Boolean(await getRegisteredCreatorIdFromCookie());

  return (
    <>
      <SiteHeader />
      <EarlyAccessPendingStatus enabled={hasSession} />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            ✉
          </div>
          {emailSent ? (
            <>
              <h1 className="mt-6 font-display text-4xl tracking-tight">Check your email to confirm your registration.</h1>
              <p className="mt-4 text-[var(--ink-muted)]">
                We&apos;ve sent a confirmation link{email ? <> to <strong>{email}</strong></> : null}. Open it
                to finish joining the CreatorOS Early Access Program. The link expires in 24 hours.
              </p>
              <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 text-left text-sm text-[var(--ink-muted)]">
                <p className="font-medium text-[var(--foreground)]">Don&apos;t see it in your inbox?</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-4">
                  <li>Check your <strong>Spam</strong> or Junk folder — first emails from a new sender sometimes land there.</li>
                  <li>Using Gmail? Check the <strong>Promotions</strong> or <strong>Updates</strong> tab as well as your main inbox.</li>
                  <li>To avoid missing future updates, add us to your contacts once you find the email.</li>
                </ul>
                <p className="mt-3">
                  Still nothing after a few minutes? Submit the form again with the same email to get a new link.
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-4xl tracking-tight">Your registration was saved, but we couldn&apos;t send the confirmation email.</h1>
              <p className="mt-4 text-[var(--ink-muted)]">
                We weren&apos;t able to deliver a confirmation link{email ? <> to <strong>{email}</strong></> : null} right
                now. Your details are safely saved — please submit the form again with the same
                email in a few minutes to get a new link, or try a different email below.
              </p>
            </>
          )}

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
