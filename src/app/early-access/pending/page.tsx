import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow } from "@/components/landing/eyebrow";
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
      <main className="flex-1 bg-bg">
        <section className="px-6 py-28 sm:px-10 sm:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{emailSent ? "Almost there" : "Registration saved"}</Eyebrow>
            {emailSent ? (
              <>
                <h1 className="mt-6 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-text sm:text-5xl">
                  Check your email to confirm your registration.
                </h1>
                <p className="mx-auto mt-5 max-w-md text-text-muted">
                  We&apos;ve sent a confirmation link{email ? <> to {email}</> : null}. The link
                  expires in 24 hours.
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-6 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-text sm:text-5xl">
                  Your registration was saved, but we couldn&apos;t send the confirmation email.
                </h1>
                <p className="mx-auto mt-5 max-w-md text-text-muted">
                  We weren&apos;t able to deliver a confirmation link
                  {email ? <> to {email}</> : null} right now. Please submit the form again with
                  the same email, or try a different email below.
                </p>
              </>
            )}

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <EarlyAccessRestartButton />
              <Link
                href="/"
                className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text"
              >
                Back to homepage
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
